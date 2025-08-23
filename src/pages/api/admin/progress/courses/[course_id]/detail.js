// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import connectToDatabase from "@/lib/mongodb";
import { CourseProgress } from "@/lib/models/index.js";
import { check_auth } from "@/lib/backend/check_auth";

export default async function handler(req, res) {
  const { method } = req;
  const { course_id } = req.query;
  const { user_id } = check_auth(req, res);
  if (!user_id) return res.status(401).json({ success: false, error: 'Unauthorized' });

  switch (method) {
    case 'GET':
      try {
        await connectToDatabase();
        const docs = await CourseProgress.find({ course_id }).lean();
        return res.status(200).json({ success: true, data: docs });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
