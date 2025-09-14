// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { check_auth } from '@/lib/backend/check_auth';
import { ExternalUserService } from '@/lib/backend/user_service';
import { CertificateDBService } from '@/lib/certificate-db-service';
import { PathService } from '@/lib/services/dataService';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { user_id, token } = check_auth(req, res);
    const { pathId } = req.query;

    if (!user_id || !token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!pathId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameter: pathId' 
      });
    }

    // Validate user
    const userResult = await ExternalUserService.validateUser(user_id, token);
    if (!userResult.valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Initialize database service
    const dbService = new CertificateDBService();
    
    // Get path data to check required courses
    const pathData = await PathService.getById(pathId);
    
    if (pathData) {
      console.log('Path data for get API:', {
        name: pathData.name,
        required_course_ids: pathData.required_course_ids,
        courses: pathData.courses?.map(c => ({ id: c._id, name: c.name }))
      });
    }
    
    // Check if path is completed
    const requiredCourseIds = pathData ? pathData.required_course_ids : [];
    const pathCompleted = await dbService.checkPathCompletion(user_id, pathId, requiredCourseIds);
    
    console.log('Path completion check - User ID:', user_id, 'Path ID:', pathId, 'Completed:', pathCompleted);
    
    if (!pathCompleted) {
      return res.status(400).json({ 
        success: false, 
        error: 'Path not completed yet' 
      });
    }

    // Get certificate information
    const certificate = await dbService.getExistingCertificate(user_id, pathId);
    
    console.log('Certificate from DB:', certificate);
    console.log('User ID:', user_id, 'Path ID:', pathId);
    
    if (!certificate) {
      return res.status(404).json({ 
        success: false, 
        error: 'No certificate found for this path' 
      });
    }

    // Check if certificate has valid data
    if (!certificate.pdfUrl && !certificate.pngUrl) {
      console.log('Certificate object is empty or invalid:', certificate);
      return res.status(404).json({ 
        success: false, 
        error: 'Certificate data is invalid' 
      });
    }

    res.status(200).json({
      success: true,
      certificate: certificate
    });

  } catch (error) {
    console.error('Error getting certificate:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get certificate' 
    });
  }
}

