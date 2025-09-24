// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { check_auth } from '@/lib/backend/check_auth';
import connectToDatabase from '@/lib/mongodb';
import Path from '@/lib/models/Path';
import PathProgress from '@/lib/models/PathProgress';
import CourseProgress from '@/lib/models/CourseProgress';
import { STATE_COMPLETED, STATE_IN_PROGRESS, STATE_NOT_STARTED } from '@/lib/const';

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
  try {
    await connectToDatabase();

    // Get all paths
    const paths = await Path.find({}).lean();
    let totalChecked = 0;
    let totalUpdated = 0;
    let totalErrors = 0;

    for (const path of paths) {
      try {
        // Get all users who have progress for this path
        const pathProgresses = await PathProgress.find({ path_id: path._id }).lean();

        for (const pathProgress of pathProgresses) {
          try {
            totalChecked++;
            
            // Skip users with null user_id
            if (!pathProgress.user_id) {
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
                totalUpdated++;
              }
            }
          } catch (userError) {
            console.error(`Error checking user ${pathProgress.user_id}:`, userError.message);
            totalErrors++;
          }
        }
      } catch (pathError) {
        console.error(`Error checking path ${path.name}:`, pathError.message);
        totalErrors++;
      }
    }

    return {
      totalChecked,
      totalUpdated,
      totalErrors,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Path progress update failed:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const { user_id, token } = check_auth(req, res);
    if (!user_id || !token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Perform the path progress update
    const result = await updatePathProgress();

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Path progress updated successfully'
    });

  } catch (error) {
    console.error('API Error updating path progress:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}
