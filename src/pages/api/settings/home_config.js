// Copyright (c) 2025 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from '../../../lib/mongodb';
import SystemSettings from '../../../lib/models/SystemSettings';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const setting = await SystemSettings.findOne({ key: 'home_config' });

    if (setting?.value) {
      return res.status(200).json(setting.value);
    }

    // Return default configuration if setting doesn't exist
    const defaultConfig = {
      title: 'Your SDV journey starts here.',
      bulletPoints: [
        'From zero to hero',
        'Practice in our virtual lab and seamlessly transition to physical kit',
        'Track your progress and get certificates',
        'Stay in the loop with our community'
      ],
      imageUrl: '/imgs/sdv.png'
    };

    return res.status(200).json(defaultConfig);
  } catch (error) {
    console.error('Error fetching home config:', error);

    // Return default configuration on error
    const defaultConfig = {
      title: 'Your SDV journey starts here.',
      bulletPoints: [
        'From zero to hero',
        'Practice in our virtual lab and seamlessly transition to physical kit',
        'Track your progress and get certificates',
        'Stay in the loop with our community'
      ],
      imageUrl: '/imgs/sdv.png'
    };

    return res.status(200).json(defaultConfig);
  }
}