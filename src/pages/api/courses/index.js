// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { CourseService } from "@/lib/services/dataService";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const dbCourses = await CourseService.getAll();
        res.status(200).json({ success: true, data: dbCourses });
      } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "POST":
      try {
        const courseData = req.body;
        const newCourse = await CourseService.create(courseData);
        res.status(201).json({ success: true, data: newCourse });
      } catch (error) {
        console.error('Error creating course:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}
