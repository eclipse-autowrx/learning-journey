// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import connectToDatabase from "@/lib/mongodb";
import { PathProgress } from "@/lib/models/index.js";
import { check_auth } from "@/lib/backend/check_auth";

export default async function handler(req, res) {
  const { method } = req;
  const { path_id } = req.query;
  const { user_id } = check_auth(req, res);

  if (!user_id) return res.status(401).json({ success: false, error: 'Unauthorized' });
  if (!path_id || !path_id.match?.(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, error: 'Invalid path ID format' });
  }

  switch (method) {
    case 'GET':
      try {
        await connectToDatabase();
        const doc = await PathProgress.findOne({ user_id, path_id });
        if (!doc) return res.status(404).json({ success: false, error: 'Path progress not found' });
        return res.status(200).json({ success: true, data: doc });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    case 'PUT':
      try {
        await connectToDatabase();
        const update = req.body || {};
        const doc = await PathProgress.findOneAndUpdate(
          { user_id, path_id },
          { $set: update, $setOnInsert: { user_id, path_id } },
          { new: true, upsert: true }
        );
        return res.status(200).json({ success: true, data: doc });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
