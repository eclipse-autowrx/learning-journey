// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from '../../../lib/mongodb';
import SystemSettings from '../../../lib/models/SystemSettings';
import { check_auth } from '../../../lib/backend/check_auth';
import { ExternalUserService } from '../../../lib/backend/user_service';

export default async function handler(req, res) {
  await connectToDatabase();

  // Permission guard: require manageUsers for all operations
  const { user_id, token } = check_auth(req, res);
  if (!user_id || !token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const allowed = await ExternalUserService.hasPermission('manageUsers', token);
    if (!allowed) return res.status(403).json({ success: false, error: 'Forbidden' });
  } catch (e) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const { category, include_secrets } = req.query;
        
        // Build filter
        const filter = {};
        if (category) {
          filter.category = category;
        }
        
        // Only include secrets if explicitly requested and user has admin permissions
        if (include_secrets !== 'true') {
          filter.secret = { $ne: true };
        }

        const settings = await SystemSettings.find(filter).sort({ key: 1 });
        res.status(200).json({ success: true, data: settings });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const { key, value, secret = false, description, category = 'general' } = req.body;
        
        if (!key || value === undefined) {
          return res.status(400).json({ 
            success: false, 
            error: 'Key and value are required' 
          });
        }

        // Check if key already exists
        const existing = await SystemSettings.findOne({ key });
        if (existing) {
          return res.status(409).json({ 
            success: false, 
            error: 'Setting with this key already exists' 
          });
        }

        const setting = await SystemSettings.create({
          key,
          value,
          secret: Boolean(secret),
          description,
          category,
          updated_by: user_id
        });

        res.status(201).json({ success: true, data: setting });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}
