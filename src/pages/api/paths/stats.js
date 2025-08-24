// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from '@/lib/mongodb';
import PathProgress from '@/lib/models/PathProgress';
import Path from '@/lib/models/Path';
import CourseProgress from '@/lib/models/CourseProgress';
import { STATE_COMPLETED } from '@/lib/const';
import { Types } from 'mongoose';

/**
 * Calculate path statistics based on user progress
 * GET /api/paths/stats?path_id=<path_id>
 * 
 * Returns:
 * - num_learners: Total number of users who have started this path (any progress state)
 * - num_certified_learners: Number of users who have completed this path (state: 'completed')
 */
export default async function handler(req, res) {
    const { path_id } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    if (!path_id) {
        return res.status(400).json({ success: false, error: 'Path ID is required' });
    }

    try {
        await connectToDatabase();

        // Convert path_id string to ObjectId for MongoDB queries
        const pathObjectId = new Types.ObjectId(path_id);
        
        // Get the path to find all required courses
        
        const pathDoc = await Path.findById(pathObjectId).lean();
        if (!pathDoc) {
            return res.status(404).json({ success: false, error: 'Path not found' });
        }
        
        // Get all PathProgress records for this path to count learners
        const pathProgresses = await PathProgress.find({ path_id: pathObjectId }).lean();
        const totalLearners = pathProgresses.length;
        
        // For certified learners, we need to validate actual completion
        // A user should only be considered certified if they completed ALL required courses
        let trueCertifiedLearners = 0;
        
        for (const pathProgress of pathProgresses) {
            if (pathProgress.state === STATE_COMPLETED) {
                // Verify this user actually completed all required courses
                const userCourseProgresses = await CourseProgress.find({
                    user_id: pathProgress.user_id,
                    course_id: { $in: pathDoc.courses }
                }).lean();
                
                const completedCourses = userCourseProgresses.filter(cp => cp.state === STATE_COMPLETED);
                
                // Only count as certified if ALL path courses are completed
                if (completedCourses.length === pathDoc.courses.length) {
                    trueCertifiedLearners++;
                } else {
                    console.log(`[WARNING] User ${pathProgress.user_id} marked as path completed but only finished ${completedCourses.length}/${pathDoc.courses.length} courses`);
                }
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                num_learners: totalLearners,
                num_certified_learners: trueCertifiedLearners
            }
        });

    } catch (error) {
        console.error('Error fetching path statistics:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
