// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { LessonService } from '@/lib/services/dataService.js';
import { check_auth } from '@/lib/backend/check_auth.js';

export default async function handler(req, res) {
  const { method } = req;
  const { user_id } = check_auth(req, res);

  if (!user_id) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  switch (method) {
    case 'GET': {
      try {
        const lessons = await LessonService.getAll({ owner_id: user_id });
        return res.status(200).json({ success: true, data: lessons });
      } catch (error) {
        console.error('Error fetching creator lessons:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
    case 'POST': {
      try {
        const created = await LessonService.create({ ...req.body, owner_id: user_id });
        return res.status(201).json({ success: true, data: created });
      } catch (error) {
        console.error('Error creating creator lesson:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
    default: {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
  }
}
