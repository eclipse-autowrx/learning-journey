// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

/**
 * Path Progress Update Script
 * 
 * This script ensures all path progress is up to date by recalculating
 * completion status based on actual course completion data.
 * 
 * Features:
 * - Handles both .env file and direct environment variable setting
 * - Prioritizes required_course_ids for certification
 * - Updates all paths and users in the system
 * - Can be run manually or via cron job
 * 
 * Usage:
 * - node scripts/update-path-progress.js
 * - Add to cron: 0 0 * * * (every day at midnight)
 */

// Try to load .env file first, fallback to direct environment variable
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (two levels up from scripts/)
config({ path: join(__dirname, '..', '.env') });

// Fallback to direct environment variable if .env loading fails
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = "mongodb://admin:password123@localhost:27000/learning_journey?authSource=admin";
}

// Now import the database connection
import connectToDatabase from '../src/lib/mongodb.js';
import Path from '../src/lib/models/Path.js';
import PathProgress from '../src/lib/models/PathProgress.js';
import CourseProgress from '../src/lib/models/CourseProgress.js';
import { STATE_COMPLETED, STATE_IN_PROGRESS, STATE_NOT_STARTED } from '../src/lib/const.js';

// Helper function to evaluate path completion rules
function evaluatePathCompletion({ rule, courseStatesById }) {
  const { required, electiveGroups, minCourses } = rule;
  
  // Check required courses
  for (const courseId of required) {
    if (courseStatesById.get(courseId) !== STATE_COMPLETED) {
      return false;
    }
  }
  
  // Check elective groups
  for (const group of electiveGroups) {
    const completedInGroup = group.course_ids.filter(
      courseId => courseStatesById.get(courseId) === STATE_COMPLETED
    ).length;
    
    if (completedInGroup < group.must_complete) {
      return false;
    }
  }
  
  // Check minimum courses if specified
  if (minCourses) {
    const totalCompleted = Array.from(courseStatesById.values())
      .filter(state => state === STATE_COMPLETED).length;
    
    if (totalCompleted < minCourses) {
      return false;
    }
  }
  
  return true;
}

// Helper function to get path rule configuration
function getPathRuleConfig(path) {
  const required = path.required_course_ids || [];
  const electiveGroups = path.extends?.elective_groups || [];
  const minCourses = path.extends?.min_courses_to_complete;
  
  return { required, electiveGroups, minCourses };
}

// Helper function to upsert path progress for a user
async function upsertPathProgressForUser({ user_id, path_id }) {
  await connectToDatabase();
  const path = await Path.findById(path_id).select('course_ids extends required_course_ids courses').lean();
  if (!path) return null;
  const rule = getPathRuleConfig(path);

  // Build course state map from CourseProgress (prioritize required_course_ids for certification)
  let courseIds = [];
  if (path.required_course_ids && path.required_course_ids.length > 0) {
    // Use required courses for certification
    courseIds = path.required_course_ids;
  } else if (path.course_ids && path.course_ids.length > 0) {
    // Fallback to course_ids
    courseIds = path.course_ids;
  } else if (path.courses && path.courses.length > 0) {
    // Fallback to courses
    courseIds = path.courses.map(c => String(c));
  }
  
  const progresses = await CourseProgress.find({ user_id, course_id: { $in: courseIds } }).lean();
  const courseStatesById = new Map(courseIds.map(id => [id, STATE_NOT_STARTED]));
  const courseFinishedById = new Map();
  progresses.forEach(p => {
    const k = String(p.course_id);
    courseStatesById.set(k, p.state);
    if (p.finished_at) courseFinishedById.set(k, p.finished_at);
  });

  // Prepare courses object for persistence
  const coursesObj = {};
  courseStatesById.forEach((state, id) => {
    coursesObj[id] = { state, finished_at: courseFinishedById.get(id) };
  });

  let state = STATE_NOT_STARTED;
  // state becomes in_progress if any course completed or in_progress
  for (const s of courseStatesById.values()) {
    if (s === STATE_IN_PROGRESS || s === STATE_COMPLETED) { state = STATE_IN_PROGRESS; break; }
  }

  const completed = evaluatePathCompletion({ rule, courseStatesById });
  if (completed) state = STATE_COMPLETED;

  const now = new Date();
  const existing = await PathProgress.findOne({ user_id, path_id }).lean();
  const setFields = { state, courses: coursesObj };
  if (state === STATE_IN_PROGRESS) setFields['started_at'] = existing?.started_at || now;
  if (state === STATE_COMPLETED) setFields['finished_at'] = existing?.finished_at || now;

  const updated = await PathProgress.findOneAndUpdate(
    { user_id, path_id },
    { $set: setFields, $setOnInsert: { user_id, path_id } },
    { new: true, upsert: true }
  );

  return updated;
}

async function updatePathProgress() {
  console.log('🔍 Starting path progress update...');
  console.log('🔗 Using MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Not found');
  
  try {
    console.log('🔄 Attempting to connect to database...');
    await connectToDatabase();
    console.log('✅ Connected to database');

    // Get all paths
    const paths = await Path.find({}).lean();
    console.log(`📊 Found ${paths.length} paths to check`);

    let totalChecked = 0;
    let totalUpdated = 0;
    let totalErrors = 0;

    for (const path of paths) {
      console.log(`\n🔄 Checking path: ${path.name} (${path._id})`);
      
      try {
        // Get all users who have progress for this path
        const pathProgresses = await PathProgress.find({ path_id: path._id }).lean();
        console.log(`   👥 Found ${pathProgresses.length} users with path progress`);

        for (const pathProgress of pathProgresses) {
          try {
            totalChecked++;
            
            // Skip users with null user_id
            if (!pathProgress.user_id) {
              console.log(`   ⚠️  Skipping user with null user_id`);
              continue;
            }
            
            // Recalculate path progress for this user
            const updatedProgress = await upsertPathProgressForUser({
              user_id: pathProgress.user_id,
              path_id: path._id
            });

            if (updatedProgress) {
              const oldState = pathProgress.state;
              const newState = updatedProgress.state;
              
              if (oldState !== newState) {
                console.log(`   ✅ Updated user ${pathProgress.user_id}: ${oldState} → ${newState}`);
                totalUpdated++;
              }
            }
          } catch (userError) {
            console.error(`   ❌ Error checking user ${pathProgress.user_id}:`, userError.message);
            totalErrors++;
          }
        }
      } catch (pathError) {
        console.error(`❌ Error checking path ${path.name}:`, pathError.message);
        totalErrors++;
      }
    }

    console.log(`\n🎉 Path progress update completed!`);
    console.log(`   🔍 Total users checked: ${totalChecked}`);
    console.log(`   ✅ Total users updated: ${totalUpdated}`);
    console.log(`   ❌ Total errors: ${totalErrors}`);

    // Return summary for potential monitoring
    return {
      totalChecked,
      totalUpdated,
      totalErrors,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('💥 Path progress update failed:', error);
    throw error;
  }
}

// Run update if called directly
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  // Add timeout to prevent hanging
  const timeout = setTimeout(() => {
    console.error('⏰ Script timed out after 60 seconds');
    process.exit(1);
  }, 60000);

  updatePathProgress()
    .then((summary) => {
      clearTimeout(timeout);
      console.log('✅ Path progress update completed successfully');
      console.log('📊 Summary:', summary);
      process.exit(0);
    })
    .catch((error) => {
      clearTimeout(timeout);
      console.error('❌ Path progress update failed:', error);
      process.exit(1);
    });
}

export default updatePathProgress;
