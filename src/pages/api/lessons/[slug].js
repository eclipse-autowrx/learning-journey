// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { LessonService } from "@/lib/services/dataService";

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;

  switch (method) {
    case "GET":
      try {
        const lesson = await LessonService.getLessonBySlug(slug);
        if (!lesson) {
          return res.status(404).json({ success: false, error: "Lesson not found" });
        }
        res.status(200).json({ success: true, data: lesson });
      } catch (error) {
        console.error('Error fetching lesson:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "PUT":
      try {
        const updateData = req.body;
        const updatedLesson = await LessonService.updateLesson(slug, updateData);
        res.status(200).json({ success: true, data: updatedLesson });
      } catch (error) {
        console.error('Error updating lesson:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "DELETE":
      try {
        await LessonService.deleteLesson(slug);
        res.status(200).json({ success: true, message: "Lesson deleted successfully" });
      } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}
