// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { check_auth } from '@/lib/backend/check_auth';
import { ExternalUserService } from '@/lib/backend/user_service';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  // Accept user_id and token via query (from HomeContent) or body
  const q = req.query || {};
  const body = req.body || {};
  const user_id = q.user_id || body.user_id || check_auth(req, res).user_id;
  const token = q.token || body.token || check_auth(req, res).token;

  if (!user_id || !token) {
    return res.status(400).json({ success: false, error: 'Missing user_id or token' });
  }

  try {
    const result = await ExternalUserService.validateUser(user_id, token);
    if (!result.valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    // Set cookies for subsequent requests
    res.setHeader('Set-Cookie', [
      `user_id=${encodeURIComponent(user_id)}; Path=/; HttpOnly; SameSite=Lax`,
      `token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax`,
    ]);
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Auth failed' });
  }
}
