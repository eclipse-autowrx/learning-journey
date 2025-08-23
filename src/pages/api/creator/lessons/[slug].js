// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from '@/lib/mongodb.js';
import { Lesson } from '@/lib/models/index.js';
import { check_auth } from '@/lib/backend/check_auth.js';

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;
  const { user_id } = check_auth(req, res);

  if (!user_id) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  await connectToDatabase();

  switch (method) {
    case 'GET': {
      try {
        const lesson = await Lesson.findOne({ slug }).lean();
        if (!lesson) return res.status(404).json({ success: false, error: 'Lesson not found' });
        if (lesson.owner_id !== user_id) return res.status(403).json({ success: false, error: 'Forbidden' });
        return res.status(200).json({ success: true, data: lesson });
      } catch (error) {
        console.error('Error fetching creator lesson:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
    case 'PUT': {
      try {
        const existing = await Lesson.findOne({ slug }).lean();
        if (!existing) return res.status(404).json({ success: false, error: 'Lesson not found' });
        if (existing.owner_id !== user_id) return res.status(403).json({ success: false, error: 'Forbidden' });
        const updated = await Lesson.findOneAndUpdate({ slug }, req.body || {}, { new: true, runValidators: true });
        return res.status(200).json({ success: true, data: updated });
      } catch (error) {
        console.error('Error updating creator lesson:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
    case 'DELETE': {
      try {
        const existing = await Lesson.findOne({ slug }).lean();
        if (!existing) return res.status(404).json({ success: false, error: 'Lesson not found' });
        if (existing.owner_id !== user_id) return res.status(403).json({ success: false, error: 'Forbidden' });
        await Lesson.findOneAndDelete({ slug });
        return res.status(200).json({ success: true, message: 'Lesson deleted successfully' });
      } catch (error) {
        console.error('Error deleting creator lesson:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
    default: {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
  }
}
