// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from '../../lib/mongodb';
import SystemSettings from '../../lib/models/SystemSettings';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { category, key } = req.query;
    
    // Build filter - only non-secret settings
    const filter = { secret: { $ne: true } };
    
    if (category) {
      filter.category = category;
    }
    
    if (key) {
      filter.key = key;
    }

    const settings = await SystemSettings.find(filter).sort({ key: 1 });
    
    // If requesting a specific key, return single value or null
    if (key) {
      const setting = settings[0];
      if (setting) {
        res.status(200).json({ success: true, data: setting });
      } else {
        res.status(404).json({ success: false, error: 'Setting not found' });
      }
    } else {
      res.status(200).json({ success: true, data: settings });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}
