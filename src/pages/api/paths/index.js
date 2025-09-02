// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { PathService } from "../../../lib/services/dataService.js";
import { ExternalUserService } from "../../../lib/backend/user_service.js";
import { getCachedName, setCachedName } from "../../../lib/backend/user_name_cache.js";
import { check_auth } from "../../../lib/backend/check_auth.js";

export default async function handler(req, res) {
  const { method, query } = req;
  const { user_id, token } = check_auth(req, res);

  switch (method) {
    case "GET":
      try {
        let filter = { state: { $in: ['published', 'locked'] } };
        
        // Handle ids query parameter for filtering specific paths
        if (query.ids) {
          const ids = query.ids.split(',').map(id => id.trim()).filter(id => id);
          if (ids.length > 0) {
            filter._id = { $in: ids };
          }
        }
        
        const dbPaths = await PathService.getAll(filter);
        
        // If specific IDs were requested, preserve their order
        let orderedPaths = dbPaths;
        if (query.ids) {
          const ids = query.ids.split(',').map(id => id.trim()).filter(id => id);
          const pathMap = new Map(dbPaths.map(p => [p._id.toString(), p]));
          orderedPaths = ids.map(id => pathMap.get(id)).filter(Boolean);
        }
        
        const transformedPaths = [];
        for (const p of orderedPaths) {
          let owner_name = getCachedName(p.owner_id);
          if (!owner_name && p.owner_id && user_id) {
            try {
              const nameMap = await ExternalUserService.getNameMap([p.owner_id], token);
              owner_name = nameMap[p.owner_id];
              if (owner_name) setCachedName(p.owner_id, owner_name);
            } catch (_) {}
          }
          transformedPaths.push({
            ...p,
            owner_name,
            total_courses: p.courses ? p.courses.length : 0
          });
        }
        res.status(200).json({ success: true, data: transformedPaths });
      } catch (error) {
        console.error('Error fetching paths:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ success: false, error: 'Method not allowed. Use /api/creator/paths for management.' });
      break;
  }
}
