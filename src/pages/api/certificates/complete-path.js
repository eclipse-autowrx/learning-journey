// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { check_auth } from '@/lib/backend/check_auth';
import { ExternalUserService } from '@/lib/backend/user_service';
import { CertificateService } from '@/lib/certificate-service';
import { CertificateDBService } from '@/lib/certificate-db-service';
import { PathService } from '@/lib/services/dataService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { user_id, token } = check_auth(req, res);
    const { pathId, pathName } = req.body;

    if (!user_id || !token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!pathId || !pathName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: pathId, pathName' 
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

    // Initialize database service
    const dbService = new CertificateDBService();
    
    // Get path data to check required courses
    const pathData = await PathService.getById(pathId);
    
    if (pathData) {
      console.log('Path data:', {
        name: pathData.name,
        required_course_ids: pathData.required_course_ids,
        courses: pathData.courses?.map(c => ({ id: c._id, name: c.name }))
      });
    }
    
    // Check if path is actually completed
    const requiredCourseIds = pathData ? pathData.required_course_ids : [];
    const pathCompleted = await dbService.checkPathCompletion(user_id, pathId, requiredCourseIds);
    
    console.log('Path completion check in complete-path API:', pathCompleted);
    
    if (!pathCompleted) {
      console.log('Path not completed, returning error');
      return res.status(400).json({ 
        success: false, 
        error: 'Path not completed yet' 
      });
    }
    
    console.log('Path is completed, proceeding with certificate generation');

    // Check if certificate already exists
    const existingCertificate = await dbService.getExistingCertificate(user_id, pathId);
    
    if (existingCertificate) {
      return res.status(200).json({
        success: true,
        message: 'Certificate already exists',
        certificate: existingCertificate
      });
    }

    // Generate certificate
    console.log('Generating certificate for:', { user_id, userName, pathId, pathName });
    
    try {
      console.log('Creating CertificateService instance...');
      const certificateService = new CertificateService();
      console.log('CertificateService created successfully');
      
      console.log('About to call generatePathCertificate...');
      const certificate = await certificateService.generatePathCertificate(
        user_id,
        userName,
        pathId,
        pathName
      );
      
      console.log('Generated certificate:', certificate);
      console.log('Certificate type:', typeof certificate);
      console.log('Certificate keys:', Object.keys(certificate || {}));

      // Save certificate links to database
      const saved = await dbService.saveCertificateLinks(user_id, pathId, certificate);
      
      if (!saved) {
        console.log('Failed to save certificate to database');
        return res.status(500).json({
          success: false,
          error: 'Failed to save certificate to database'
        });
      }

      console.log('Certificate saved successfully');
      res.status(200).json({
        success: true,
        message: 'Certificate generated successfully',
        certificate: certificate
      });
    } catch (certError) {
      console.error('Error generating certificate:', certError);
      return res.status(500).json({
        success: false,
        error: `Certificate generation failed: ${certError.message}`
      });
    }

  } catch (error) {
    console.error('Error completing path and generating certificate:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate certificate' 
    });
  }
}

