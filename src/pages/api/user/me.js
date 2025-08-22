// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { check_auth } from '@/lib/backend/check_auth';
import { ExternalUserService } from '@/lib/backend/user_service';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  const { user_id, token } = check_auth(req, res);

  if (!user_id || !token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    // Validate token and get profile from external service
    const result = await ExternalUserService.validateUser(user_id, token);
    if (!result.valid) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const profile = result.user;
    const id = profile?.id || profile?.user?.id || user_id;
    const name = profile?.name || profile?.user?.name || null;
    return res.status(200).json({ success: true, user: { id, name, profile } });
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}
