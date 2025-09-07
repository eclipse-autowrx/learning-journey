// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { check_auth } from '@/lib/backend/check_auth';
import { ExternalUserService } from '@/lib/backend/user_service';
import { getCachedName, setCachedName } from '@/lib/backend/user_name_cache';

export default async function handler(req, res) {
  // console.log(`[GET /api/users/names] incoming request. query=${JSON.stringify(req.query)}, headers=${JSON.stringify(req.headers)}`);

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  const { ids } = req.query;
  const { user_id: currentUserId, token } = check_auth(req, res);

  if (!ids) {
    return res.status(400).json({ success: false, error: 'Missing ids' });
  }

  const idList = ids.split(',').map(s => s.trim()).filter(Boolean);
  try {
    const resultMap = {};

    // Seed from cache
    for (const id of idList) {
      const cached = getCachedName(id);
      if (cached) resultMap[id] = cached;
    }

    // If current user is requested, we can always resolve via self
    if (token && currentUserId && idList.includes(currentUserId) && !resultMap[currentUserId]) {
      try {
        const self = await ExternalUserService.getSelf(token);
        const id = self?.id || self?.user?.id || currentUserId;
        const name = self?.name || self?.user?.name || self?.displayName || self?.user?.displayName || null;
        if (name) {
          resultMap[id] = name;
          setCachedName(id, name);
        }
      } catch (_) {}
    }

    // Resolve remaining via batch lookup if token is available
    const remaining = idList.filter(id => !resultMap[id]);
    if (token && remaining.length > 0) {
      try {
        const fetchedMap = await ExternalUserService.getNameMap(remaining, token);
        for (const [id, name] of Object.entries(fetchedMap || {})) {
          if (name) {
            resultMap[id] = name;
            setCachedName(id, name);
          }
        }
      } catch (e) {
        // Ignore, we'll fallback
      }
    }

    // Fallback: ensure every id has at least itself as a value to avoid nulls
    for (const id of idList) {
      if (!resultMap[id]) resultMap[id] = id;
    }

    return res.status(200).json({ success: true, data: resultMap });
  } catch (e) {
    console.error(`[GET /api/users/names] error. ids=${ids}, error=${e}`);
    return res.status(500).json({ success: false, error: 'Failed to fetch user names' });
  }
}
