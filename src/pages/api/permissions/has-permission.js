// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { check_auth } from '@/lib/backend/check_auth';
import { ExternalUserService } from '@/lib/backend/user_service';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  const { token } = check_auth(req, res);
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const raw = (req.query?.permissions || '').toString().trim();
  if (!raw) {
    return res.status(400).json({ success: false, error: 'Missing permissions query' });
  }

  const permissions = raw.split(',').map((p) => p.trim()).filter(Boolean);
  try {
    const result = await ExternalUserService.hasPermissions(permissions, token);
    // Return bare array as specified by external API contract
    return res.status(200).json(result);
  } catch (e) {
    const message = e?.message || 'Permission check failed';
    return res.status(400).json({ success: false, error: message });
  }
}
