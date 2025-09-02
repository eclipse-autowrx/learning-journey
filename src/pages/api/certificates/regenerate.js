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
    const { pathId, pathName, customUserName } = req.body;

    if (!user_id || !token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!pathId || !pathName || !customUserName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: pathId, pathName, customUserName' 
      });
    }

    // Validate user
    const userResult = await ExternalUserService.validateUser(user_id, token);
    if (!userResult.valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Get user profile
    const userProfile = userResult.user;
    const originalUserName = userProfile?.name || userProfile?.user?.name || user_id;

    // Initialize database service
    const dbService = new CertificateDBService();
    
    // Check if path is completed
    const pathCompleted = await dbService.checkPathCompletion(user_id, pathId);
    
    if (!pathCompleted) {
      return res.status(400).json({ 
        success: false, 
        error: 'Path not completed yet' 
      });
    }

    // Get existing certificate info
    const existingCertificate = await dbService.getExistingCertificate(user_id, pathId);
    
    if (!existingCertificate) {
      return res.status(404).json({ 
        success: false, 
        error: 'No existing certificate found' 
      });
    }

    // Delete old certificate files
    const certificateService = new CertificateService();
    if (existingCertificate.fileName) {
      certificateService.deleteCertificate(existingCertificate.fileName);
    }

    // Generate new certificate with custom name
    const newCertificate = await certificateService.generatePathCertificate(
      user_id,
      originalUserName,
      pathId,
      pathName,
      customUserName
    );

    // Update certificate links in database
    const updated = await dbService.updateCertificateLinks(user_id, pathId, newCertificate, customUserName);
    
    if (!updated) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update certificate in database'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Certificate regenerated successfully',
      certificate: newCertificate
    });

  } catch (error) {
    console.error('Error regenerating certificate:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to regenerate certificate' 
    });
  }
}

