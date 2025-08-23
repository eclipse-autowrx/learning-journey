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
        const filter = {};
        if (query.manage && user_id) {
          filter.owner_id = user_id;
        } else {
          filter.state = 'published';
        }
        const dbPaths = await PathService.getAll(filter);
        const transformedPaths = [];
        for (const p of dbPaths) {
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
    case "POST":
      try {
        if (!user_id) {
          return res.status(401).json({ success: false, error: "Unauthorized" });
        }
        const DEFAULT_BG = '/imgs/green_bg.png';
        const pathData = { ...req.body, owner_id: user_id };
        if (!pathData.background_img) {
          pathData.background_img = DEFAULT_BG;
        }
        const newPath = await PathService.create(pathData);
        res.status(201).json({ success: true, data: newPath });
      } catch (error) {
        console.error('Error creating path:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}
