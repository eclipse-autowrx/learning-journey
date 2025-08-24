// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { PathService, CourseService } from '@/lib/services/dataService.js';
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
        const dbPath = await PathService.getBySlug(slug);
        if (!dbPath) return res.status(404).json({ success: false, error: 'Path not found' });
        if (dbPath.owner_id !== user_id) return res.status(403).json({ success: false, error: 'Forbidden' });

        // Ensure courses are populated (management needs full details)
        const hasCoursesArray = Array.isArray(dbPath.courses) && dbPath.courses.length > 0;
        if (hasCoursesArray) {
          const first = dbPath.courses[0];
          const looksPopulated = first && typeof first === 'object' && !!first.name;
          if (!looksPopulated) {
            const ids = dbPath.courses;
            dbPath.courses = await CourseService.getCoursesByPath({ courses: ids });
          }
        }
        if (!dbPath.courses) dbPath.courses = [];

        return res.status(200).json({ success: true, data: dbPath });
      } catch (error) {
        console.error('Error fetching creator path:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
    case 'PUT': {
      try {
        const existing = await PathService.getBySlug(slug);
        if (!existing) return res.status(404).json({ success: false, error: 'Path not found' });
        if (existing.owner_id !== user_id) return res.status(403).json({ success: false, error: 'Forbidden' });
        
        const updated = await PathService.updatePath(slug, req.body || {});
        return res.status(200).json({ success: true, data: updated });
      } catch (error) {
        console.error('Error updating creator path:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
    case 'DELETE': {
      try {
        const existing = await PathService.getBySlug(slug);
        if (!existing) return res.status(404).json({ success: false, error: 'Path not found' });
        if (existing.owner_id !== user_id) return res.status(403).json({ success: false, error: 'Forbidden' });
        await PathService.deletePath(slug);
        return res.status(200).json({ success: true, message: 'Path deleted successfully' });
      } catch (error) {
        console.error('Error deleting creator path:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
    default: {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
  }
}
