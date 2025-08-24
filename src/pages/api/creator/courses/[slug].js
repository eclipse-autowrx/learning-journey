// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { CourseService } from '@/lib/services/dataService.js';
import { check_auth } from '@/lib/backend/check_auth.js';

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;
  const { user_id } = check_auth(req, res);

  if (!user_id) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  switch (method) {
    case 'GET': {
      try {
        const dbCourse = await CourseService.getBySlug(slug);
        if (!dbCourse) return res.status(404).json({ success: false, error: 'Course not found' });
        if (dbCourse.owner_id !== user_id) return res.status(403).json({ success: false, error: 'Forbidden' });
        return res.status(200).json({ success: true, data: dbCourse });
      } catch (error) {
        console.error('Error fetching creator course:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
    case 'PUT': {
      try {
        const existing = await CourseService.getBySlug(slug);
        if (!existing) return res.status(404).json({ success: false, error: 'Course not found' });
        if (existing.owner_id !== user_id) return res.status(403).json({ success: false, error: 'Forbidden' });
        const updateData = req.body || {};
        // Allow creators to publish their courses; locked remains admin-only
        if (updateData.state === 'locked') {
          return res.status(403).json({ success: false, error: 'Only admin may set locked for courses' });
        }
        const updated = await CourseService.updateCourse(slug, updateData);
        return res.status(200).json({ success: true, data: updated });
      } catch (error) {
        console.error('Error updating creator course:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
    case 'DELETE': {
      try {
        const existing = await CourseService.getBySlug(slug);
        if (!existing) return res.status(404).json({ success: false, error: 'Course not found' });
        if (existing.owner_id !== user_id) return res.status(403).json({ success: false, error: 'Forbidden' });
        await CourseService.deleteCourse(slug);
        return res.status(200).json({ success: true, message: 'Course deleted successfully' });
      } catch (error) {
        console.error('Error deleting creator course:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
    default: {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
  }
}
