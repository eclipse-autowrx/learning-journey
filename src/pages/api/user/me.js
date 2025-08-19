// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { check_auth } from '@/lib/backend/check_auth';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  const { user_id, token } = check_auth(req, res);

  if (user_id && token) {
    // In a real application, you might want to add token validation logic here.
    res.status(200).json({ success: true, user: { id: user_id } });
  } else {
    res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}
