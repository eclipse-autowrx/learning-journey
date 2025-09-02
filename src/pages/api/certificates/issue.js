// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { check_auth } from '@/lib/backend/check_auth';
import { ExternalUserService } from '@/lib/backend/user_service';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { user_id, token } = check_auth(req, res);
    const { courseId, format = 'pdf' } = req.body;

    if (!user_id || !token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!courseId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing courseId' 
      });
    }

    // Validate user
    const userResult = await ExternalUserService.validateUser(user_id, token);
    if (!userResult.valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Get user profile
    const userProfile = userResult.user;
    const userName = userProfile?.name || userProfile?.user?.name || user_id;

    // Check if user has completed the course
    // This would need to be implemented based on your progress tracking system
    const courseCompleted = await checkCourseCompletion(user_id, courseId);
    
    if (!courseCompleted) {
      return res.status(400).json({ 
        success: false, 
        error: 'Course not completed yet' 
      });
    }

    // Get course/path information
    const courseInfo = await getCourseInfo(courseId);
    if (!courseInfo) {
      return res.status(404).json({ 
        success: false, 
        error: 'Course not found' 
      });
    }

    // Generate certificate
    const certificateData = {
      userName: userName,
      pathName: courseInfo.pathName || courseInfo.courseName,
      issueDate: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      format: format
    };

    // Call the certificate generation API
    const generateResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/certificates/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(certificateData),
    });

    if (!generateResponse.ok) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to generate certificate' 
      });
    }

    const certificateBuffer = await generateResponse.arrayBuffer();

    // Set response headers
    res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="certificate_${userName.replace(/\s+/g, '_')}_${courseInfo.courseName.replace(/\s+/g, '_')}.${format}"`);
    
    res.status(200).send(Buffer.from(certificateBuffer));

  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to issue certificate' 
    });
  }
}

// Placeholder function - implement based on your progress tracking system
async function checkCourseCompletion(userId, courseId) {
  try {
    // This should check your database for course completion
    // For now, returning true for testing purposes
    // In real implementation, you would query your progress collection
    
    // Example implementation:
    // const progress = await Progress.findOne({ user_id: userId, course_id: courseId });
    // return progress && progress.completed === true;
    
    console.log(`Checking completion for user ${userId}, course ${courseId}`);
    return true; // Placeholder - always return true for testing
  } catch (error) {
    console.error('Error checking course completion:', error);
    return false;
  }
}

// Placeholder function - implement based on your course data structure
async function getCourseInfo(courseId) {
  try {
    // This should fetch course information from your database
    // For now, returning mock data for testing
    
    // Example implementation:
    // const course = await Course.findById(courseId).populate('path');
    // return {
    //   courseName: course.name,
    //   pathName: course.path?.name || 'General Course'
    // };
    
    console.log(`Getting course info for course ${courseId}`);
    return {
      courseName: 'Sample Course',
      pathName: 'Full Stack Web Development'
    };
  } catch (error) {
    console.error('Error getting course info:', error);
    return null;
  }
}