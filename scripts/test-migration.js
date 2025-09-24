// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

/**
 * Test script to verify migration scripts work correctly
 * This script runs a quick test to ensure the migration functions are working
 * 
 * Usage:
 * - node scripts/test-migration.js
 */

// Load environment variables
import { config } from 'dotenv';
config();

import connectToDatabase from '../src/lib/mongodb.js';
import Path from '../src/lib/models/Path.js';
import PathProgress from '../src/lib/models/PathProgress.js';
import CourseProgress from '../src/lib/models/CourseProgress.js';
import { STATE_COMPLETED, STATE_IN_PROGRESS, STATE_NOT_STARTED } from '../src/lib/const.js';

async function testMigration() {
  console.log('🧪 Testing migration scripts...');
  
  try {
    await connectToDatabase();
    console.log('✅ Connected to database');

    // Test 1: Check if we can find paths
    const paths = await Path.find({}).limit(1).lean();
    console.log(`📊 Found ${paths.length} path(s) to test with`);

    if (paths.length === 0) {
      console.log('⚠️  No paths found in database, skipping test');
      return;
    }

    const testPath = paths[0];
    console.log(`🔄 Testing with path: ${testPath.name}`);

    // Test 2: Check if we can find path progress records
    const pathProgresses = await PathProgress.find({ path_id: testPath._id }).limit(1).lean();
    console.log(`👥 Found ${pathProgresses.length} path progress record(s) for this path`);

    if (pathProgresses.length === 0) {
      console.log('⚠️  No path progress records found, skipping test');
      return;
    }

    const testPathProgress = pathProgresses[0];
    console.log(`🔄 Testing with user: ${testPathProgress.user_id}`);

    // Test 3: Check if we can find course progress records
    const courseIds = testPath.course_ids || (testPath.courses || []).map(c => c.toString());
    console.log(`📚 Path has ${courseIds.length} course(s)`);

    if (courseIds.length === 0) {
      console.log('⚠️  No courses found for this path, skipping test');
      return;
    }

    const courseProgresses = await CourseProgress.find({
      user_id: testPathProgress.user_id,
      course_id: { $in: courseIds }
    }).lean();

    console.log(`📈 User has ${courseProgresses.length} course progress record(s)`);

    // Test 4: Check current states
    const completedCourses = courseProgresses.filter(cp => cp.state === STATE_COMPLETED);
    console.log(`✅ User has completed ${completedCourses.length}/${courseIds.length} courses`);
    console.log(`🛤️  User's path state: ${testPathProgress.state}`);

    // Test 5: Test the migration logic (without actually updating)
    console.log('\n🔍 Testing migration logic...');
    
    const courseStatesById = new Map(courseIds.map(id => [id, STATE_NOT_STARTED]));
    courseProgresses.forEach(p => {
      const k = String(p.course_id);
      courseStatesById.set(k, p.state);
    });

    console.log('📊 Course states:', Object.fromEntries(courseStatesById));
    
    const allCoursesCompleted = courseIds.every(id => courseStatesById.get(id) === STATE_COMPLETED);
    console.log(`🎯 All courses completed: ${allCoursesCompleted}`);
    
    const shouldBeCompleted = allCoursesCompleted && courseIds.length > 0;
    console.log(`🏁 Path should be completed: ${shouldBeCompleted}`);

    if (shouldBeCompleted && testPathProgress.state !== STATE_COMPLETED) {
      console.log('🔧 ISSUE FOUND: User has completed all courses but path is not marked as completed!');
      console.log('   This is exactly what the migration script will fix.');
    } else if (testPathProgress.state === STATE_COMPLETED) {
      console.log('✅ Path progress is already correct');
    } else {
      console.log('ℹ️  Path progress is correct (user has not completed all courses yet)');
    }

    console.log('\n🎉 Test completed successfully!');
    console.log('💡 You can now run the migration scripts:');
    console.log('   - node scripts/migrate-path-progress.js (full migration)');
    console.log('   - node scripts/fix-incomplete-path-progress.js (targeted fix)');
    console.log('   - node scripts/check-path-progress.js (background check)');

  } catch (error) {
    console.error('💥 Test failed:', error);
    throw error;
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testMigration()
    .then(() => {
      console.log('✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

export default testMigration;
