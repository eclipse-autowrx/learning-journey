// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import connectToDatabase from "@/lib/mongodb";
import { PathProgress } from "@/lib/models/index.js";
import { check_auth } from "@/lib/backend/check_auth";

export default async function handler(req, res) {
  const { method } = req;
  const { user_id } = check_auth(req, res);
  // TODO: ensure only admins can access; for now, reuse auth presence
  if (!user_id) return res.status(401).json({ success: false, error: 'Unauthorized' });

  switch (method) {
    case 'GET':
      try {
        await connectToDatabase();
        const pipeline = [
          { $group: { _id: { path_id: "$path_id", state: "$state" }, count: { $sum: 1 } } },
          { $group: { _id: "$_id.path_id", total: { $sum: "$count" }, states: { $push: { k: "$_id.state", v: "$count" } } } },
          { $project: { _id: 0, path_id: "$_id", total: 1, counts: { $arrayToObject: "$states" } } }
        ];
        const rows = await PathProgress.aggregate(pipeline);
        return res.status(200).json({ success: true, data: rows });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
