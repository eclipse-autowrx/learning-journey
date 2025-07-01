// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from "@/lib/mongodb";
import CourseProgress from "@/lib/models/CourseProgress";
import { check_auth } from "@/lib/backend/check_auth";
export default async function handler(req, res) {
  const { method } = req;
  const { course_id } = req.query;

  const { user_id, token } = check_auth(req, res);

  switch (method) {
    case "GET":
      try {
        await connectToDatabase();

        const dbProgress = await CourseProgress.findOne({ user_id: user_id, course_id: course_id });

        if (!dbProgress) {
          return res.status(404).json({ success: false, error: "Progress not found" });
        }

        res.status(200).json({ success: true, data: dbProgress });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "PUT":
      try {
        await connectToDatabase();
        
        const updateData = req.body;

        const updatedProgress = await CourseProgress.findOneAndUpdate(
          { user_id: user_id, course_id: course_id },
          updateData,
          { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: updatedProgress });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: "Method not allowed" });
      break;
  }
}
