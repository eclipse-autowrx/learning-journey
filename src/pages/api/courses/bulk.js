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
      if (["released", "published"].includes(state) && !isAdminApi) {
        return res.status(403).json({ success: false, error: "Only admin may set released/published for courses" });
      }
      try {
        const result = await CourseService.bulkUpdateState(ids, state);
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
      try {
        const result = await CourseService.bulkDelete(ids);
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
