// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT
import { CourseService } from "@/lib/services/dataService";
import { check_auth } from "@/lib/backend/check_auth";
import connectToDatabase from "@/lib/mongodb";
import { Course } from "@/lib/models";

export default async function handler(req, res) {
  const { method } = req;
  const { user_id } = check_auth(req, res);
  const isAdminApi = req.url?.startsWith('/api/admin/');

  switch (method) {
    case "PUT": {
      // Bulk update state
      const { ids, state } = req.body;
      if (!Array.isArray(ids) || !state) {
        return res.status(400).json({ success: false, error: "Missing ids or state" });
      }
      if (!user_id) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      if (["published", "locked"].includes(state) && !isAdminApi) {
        return res.status(403).json({ success: false, error: "Only admin may set published/locked for courses" });
      }
      try {
        let allowedIds = ids;
        if (!isAdminApi) {
          await connectToDatabase();
          const ownedDocs = await Course.find({ _id: { $in: ids }, owner_id: user_id }).select('_id').lean();
          const ownedIdSet = new Set(ownedDocs.map(d => d._id.toString()));
          allowedIds = ids.filter(id => ownedIdSet.has(id.toString()));
        }
        const result = await CourseService.bulkUpdateState(allowedIds, state);
        return res.status(200).json({ success: true, result });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    }
    case "DELETE": {
      // Bulk delete
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ success: false, error: "Missing ids" });
      }
      if (!user_id) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      try {
        let allowedIds = ids;
        if (!isAdminApi) {
          await connectToDatabase();
          const ownedDocs = await Course.find({ _id: { $in: ids }, owner_id: user_id }).select('_id').lean();
          const ownedIdSet = new Set(ownedDocs.map(d => d._id.toString()));
          allowedIds = ids.filter(id => ownedIdSet.has(id.toString()));
        }
        const result = await CourseService.bulkDelete(allowedIds);
        return res.status(200).json({ success: true, result });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    }
    default:
      res.setHeader("Allow", ["PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
