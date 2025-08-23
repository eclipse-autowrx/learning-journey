// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { CourseService } from "@/lib/services/dataService";
import { check_auth } from "@/lib/backend/check_auth";

export default async function handler(req, res) {
  const { method, query } = req;
  const { user_id } = check_auth(req, res);

  switch (method) {
    case "GET":
      try {
        const filter = { state: 'published' };
        const dbCourses = await CourseService.getAll(filter);
        res.status(200).json({ success: true, data: dbCourses });
      } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ success: false, error: 'Method not allowed. Use /api/creator/courses for management.' });
      break;
  }
}
