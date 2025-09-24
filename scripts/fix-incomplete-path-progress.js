// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

/**
 * Targeted fix script for users with completed courses but incomplete path progress
 * This script identifies users who have completed all courses in a path but
 * their path progress is not marked as completed.
 * 
 * Usage:
 * - node scripts/fix-incomplete-path-progress.js
 */

// Load environment variables
import { config } from 'dotenv';
config();

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
  const path = await Path.findById(path_id).select('course_ids extends required_course_ids').lean();
  if (!path) return null;
  const rule = getPathRuleConfig(path);

  // Build course state map from CourseProgress
  const courseIds = (path.course_ids || (path.courses || []).map(c => String(c))).map(String);
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

async function fixIncompletePathProgress() {
  console.log('🔧 Starting targeted fix for incomplete path progress...');
  
  try {
    await connectToDatabase();
    console.log('✅ Connected to database');

    // Get all paths
    const paths = await Path.find({}).lean();
    console.log(`📊 Found ${paths.length} paths to check`);

    let totalFixed = 0;
    let totalErrors = 0;
    const issuesFound = [];

    for (const path of paths) {
      console.log(`\n🔄 Checking path: ${path.name} (${path._id})`);
      
      try {
        // Get course IDs for this path
        const courseIds = path.course_ids || (path.courses || []).map(c => c.toString());
        
        if (courseIds.length === 0) {
          console.log(`   ⚠️  No courses found for this path, skipping`);
          continue;
        }

        // Get all users who have progress for this path
        const pathProgresses = await PathProgress.find({ path_id: path._id }).lean();
        console.log(`   👥 Found ${pathProgresses.length} users with path progress`);

        for (const pathProgress of pathProgresses) {
          try {
            // Skip if already completed
            if (pathProgress.state === STATE_COMPLETED) {
              continue;
            }

            // Check if user has completed all courses for this path
            const userCourseProgresses = await CourseProgress.find({
              user_id: pathProgress.user_id,
              course_id: { $in: courseIds }
            }).lean();
            
            const completedCourses = userCourseProgresses.filter(cp => cp.state === STATE_COMPLETED);
            
            // If user has completed all courses but path is not completed, fix it
            if (completedCourses.length === courseIds.length) {
              console.log(`   🔧 Found issue: User ${pathProgress.user_id} completed all courses but path is ${pathProgress.state}`);
              
              // Recalculate path progress
              const updatedProgress = await upsertPathProgressForUser({
                user_id: pathProgress.user_id,
                path_id: path._id
              });

              if (updatedProgress && updatedProgress.state === STATE_COMPLETED) {
                console.log(`   ✅ Fixed: User ${pathProgress.user_id} path progress updated to completed`);
                totalFixed++;
                
                issuesFound.push({
                  path_id: path._id,
                  path_name: path.name,
                  user_id: pathProgress.user_id,
                  old_state: pathProgress.state,
                  new_state: updatedProgress.state,
                  completed_courses: completedCourses.length,
                  total_courses: courseIds.length
                });
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

    console.log(`\n🎉 Targeted fix completed!`);
    console.log(`   🔧 Total issues fixed: ${totalFixed}`);
    console.log(`   ❌ Total errors: ${totalErrors}`);
    
    if (issuesFound.length > 0) {
      console.log(`\n📋 Issues found and fixed:`);
      issuesFound.forEach((issue, index) => {
        console.log(`   ${index + 1}. Path: ${issue.path_name}`);
        console.log(`      User: ${issue.user_id}`);
        console.log(`      State: ${issue.old_state} → ${issue.new_state}`);
        console.log(`      Courses: ${issue.completed_courses}/${issue.total_courses} completed`);
        console.log('');
      });
    }

    return {
      totalFixed,
      totalErrors,
      issuesFound,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('💥 Targeted fix failed:', error);
    throw error;
  }
}

// Run fix if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixIncompletePathProgress()
    .then((summary) => {
      console.log('✅ Targeted fix completed successfully');
      console.log('📊 Summary:', summary);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Targeted fix failed:', error);
      process.exit(1);
    });
}

export default fixIncompletePathProgress;
