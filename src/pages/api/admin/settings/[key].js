// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from '../../../../lib/mongodb';
import SystemSettings from '../../../../lib/models/SystemSettings';
import { check_auth } from '../../../../lib/backend/check_auth';
import { ExternalUserService } from '../../../../lib/backend/user_service';

export default async function handler(req, res) {
  const { key } = req.query;
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

  if (!key) {
    return res.status(400).json({ success: false, error: 'Setting key is required' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const setting = await SystemSettings.findOne({ key });
        if (!setting) {
          return res.status(404).json({ success: false, error: 'Setting not found' });
        }
        res.status(200).json({ success: true, data: setting });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { value, secret, description, category } = req.body;
        
        if (value === undefined) {
          return res.status(400).json({ 
            success: false, 
            error: 'Value is required' 
          });
        }

        const updateData = {
          value,
          updated_by: user_id
        };

        if (secret !== undefined) updateData.secret = Boolean(secret);
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;

        const setting = await SystemSettings.findOneAndUpdate(
          { key },
          updateData,
          { new: true, upsert: true }
        );

        if (!setting) {
          return res.status(404).json({ success: false, error: 'Setting not found' });
        }

        res.status(200).json({ success: true, data: setting });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const deletedSetting = await SystemSettings.findOneAndDelete({ key });
        if (!deletedSetting) {
          return res.status(404).json({ success: false, error: 'Setting not found' });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}
