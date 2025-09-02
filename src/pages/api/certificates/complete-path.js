// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { check_auth } from '@/lib/backend/check_auth';
import { ExternalUserService } from '@/lib/backend/user_service';
import { CertificateService } from '@/lib/certificate-service';
import { CertificateDBService } from '@/lib/certificate-db-service';

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
    
    // Check if path is actually completed
    const pathCompleted = await dbService.checkPathCompletion(user_id, pathId);
    
    if (!pathCompleted) {
      return res.status(400).json({ 
        success: false, 
        error: 'Path not completed yet' 
      });
    }

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
    const certificateService = new CertificateService();
    const certificate = await certificateService.generatePathCertificate(
      user_id,
      userName,
      pathId,
      pathName
    );

    // Save certificate links to database
    const saved = await dbService.saveCertificateLinks(user_id, pathId, certificate);
    
    if (!saved) {
      return res.status(500).json({
        success: false,
        error: 'Failed to save certificate to database'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Certificate generated successfully',
      certificate: certificate
    });

  } catch (error) {
    console.error('Error completing path and generating certificate:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate certificate' 
    });
  }
}

