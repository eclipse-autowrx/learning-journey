// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { check_auth } from '@/lib/backend/check_auth';
import { ExternalUserService } from '@/lib/backend/user_service';
import { CertificateDBService } from '@/lib/certificate-db-service';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { user_id, token } = check_auth(req, res);

    if (!user_id || !token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Validate user
    const userResult = await ExternalUserService.validateUser(user_id, token);
    if (!userResult.valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Get all certificates for the user
    const dbService = new CertificateDBService();
    const certificates = await dbService.getUserCertificates(user_id);

    res.status(200).json({
      success: true,
      certificates: certificates
    });

  } catch (error) {
    console.error('Error getting user certificates:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get certificates' 
    });
  }
}