// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import connectToDatabase from "@/lib/mongodb";
import { PathProgress } from "@/lib/models/index.js";
import { check_auth } from "@/lib/backend/check_auth";
import { ExternalUserService } from "@/lib/backend/user_service";

export default async function handler(req, res) {
  const { method } = req;
  const { user_id, token } = check_auth(req, res);
  if (!user_id || !token) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const allowed = await ExternalUserService.hasPermission('manageUsers', token);
    if (!allowed) return res.status(403).json({ success: false, error: 'Forbidden' });
  } catch (e) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

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
