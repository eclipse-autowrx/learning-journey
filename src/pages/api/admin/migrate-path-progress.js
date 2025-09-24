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
import { upsertPathProgressForUser } from '@/pages/api/progress/paths/utils';

/**
 * Admin API endpoint to migrate all existing path progress records
 * This fixes the issue where users who completed courses before the path progress
 * update fix don't have their path progress properly calculated.
 * 
 * POST /api/admin/migrate-path-progress
 * 
 * Headers:
 * - Authorization: Bearer <admin_token> (if required)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "total_paths": 5,
 *     "total_users_updated": 12,
 *     "total_errors": 0,
 *     "migration_time": "2025-01-08T10:30:00.000Z"
 *   }
 * }
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Check authentication (you may want to add admin permission check here)
  const { user_id } = check_auth(req, res);
  if (!user_id) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  // TODO: Add admin permission check here if needed
  // const hasAdminPermission = await checkAdminPermission(user_id);
  // if (!hasAdminPermission) {
  //   return res.status(403).json({ success: false, error: 'Admin permission required' });
  // }

  console.log('🚀 Starting path progress migration via API...');
  
  try {
    await connectToDatabase();
    console.log('✅ Connected to database');

    // Get all paths
    const paths = await Path.find({}).lean();
    console.log(`📊 Found ${paths.length} paths to process`);

    let totalUpdated = 0;
    let totalErrors = 0;
    const migrationStartTime = new Date();

    for (const path of paths) {
      console.log(`🔄 Processing path: ${path.name} (${path._id})`);
      
      try {
        // Get all users who have progress for this path
        const pathProgresses = await PathProgress.find({ path_id: path._id }).lean();
        console.log(`   👥 Found ${pathProgresses.length} users with path progress`);

        for (const pathProgress of pathProgresses) {
          try {
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
              } else {
                console.log(`   ℹ️  User ${pathProgress.user_id}: no change needed (${newState})`);
              }
            }
          } catch (userError) {
            console.error(`   ❌ Error updating user ${pathProgress.user_id}:`, userError.message);
            totalErrors++;
          }
        }
      } catch (pathError) {
        console.error(`❌ Error processing path ${path.name}:`, pathError.message);
        totalErrors++;
      }
    }

    const migrationEndTime = new Date();
    const migrationDuration = migrationEndTime - migrationStartTime;

    console.log(`🎉 Migration completed in ${migrationDuration}ms!`);
    console.log(`   ✅ Total users updated: ${totalUpdated}`);
    console.log(`   ❌ Total errors: ${totalErrors}`);

    return res.status(200).json({
      success: true,
      data: {
        total_paths: paths.length,
        total_users_updated: totalUpdated,
        total_errors: totalErrors,
        migration_time: migrationEndTime.toISOString(),
        duration_ms: migrationDuration
      }
    });

  } catch (error) {
    console.error('💥 Migration failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Migration failed',
      details: error.message
    });
  }
}
