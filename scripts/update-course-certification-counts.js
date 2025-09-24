// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

/**
 * Script to update course-level num_certified_learners field
 * This calculates the actual number of users who completed each course
 * and updates the static field in the Course model.
 * 
 * Usage:
 * - node scripts/update-course-certification-counts.js
 */

// Set environment variable directly
process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://admin:password123@localhost:27000/learning_journey?authSource=admin";

import connectToDatabase from '../src/lib/mongodb.js';
import Course from '../src/lib/models/Course.js';
import CourseProgress from '../src/lib/models/CourseProgress.js';
import { STATE_COMPLETED } from '../src/lib/const.js';

async function updateCourseCertificationCounts() {
  console.log('🔍 Starting course certification count update...');
  
  try {
    await connectToDatabase();
    console.log('✅ Connected to database');

    // Get all courses
    const courses = await Course.find({}).lean();
    console.log(`📊 Found ${courses.length} courses to update`);

    let totalUpdated = 0;
    let totalErrors = 0;

    for (const course of courses) {
      try {
        console.log(`\n🔄 Updating course: ${course.name} (${course._id})`);
        
        // Count users who completed this course
        const completedCount = await CourseProgress.countDocuments({
          course_id: course._id,
          state: STATE_COMPLETED
        });

        console.log(`   👥 Found ${completedCount} users who completed this course`);

        // Update the course with the correct count
        const result = await Course.findByIdAndUpdate(
          course._id,
          { 
            num_certified_learners: completedCount,
            completion_count: completedCount // Also update completion_count for consistency
          },
          { new: true }
        );

        if (result) {
          console.log(`   ✅ Updated: ${course.num_certified_learners || 0} → ${completedCount} certified learners`);
          totalUpdated++;
        } else {
          console.log(`   ⚠️  No changes made for course ${course.name}`);
        }

      } catch (courseError) {
        console.error(`   ❌ Error updating course ${course.name}:`, courseError.message);
        totalErrors++;
      }
    }

    console.log(`\n🎉 Course certification count update completed!`);
    console.log(`   ✅ Total courses updated: ${totalUpdated}`);
    console.log(`   ❌ Total errors: ${totalErrors}`);

    // Return summary for potential monitoring
    return {
      totalUpdated,
      totalErrors,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('💥 Course certification count update failed:', error);
    throw error;
  }
}

// Run update if called directly
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  updateCourseCertificationCounts()
    .then((summary) => {
      console.log('✅ Course certification count update completed successfully');
      console.log('📊 Summary:', summary);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Course certification count update failed:', error);
      process.exit(1);
    });
}

export default updateCourseCertificationCounts;
