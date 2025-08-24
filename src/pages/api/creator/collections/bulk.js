// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { CollectionService } from '@/lib/services/dataService.js';
import { check_auth } from '@/lib/backend/check_auth.js';
import connectToDatabase from '@/lib/mongodb.js';
import { Collection } from '@/lib/models/index.js';

export default async function handler(req, res) {
  const { method } = req;
  const { user_id } = check_auth(req, res);

  if (!user_id) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  switch (method) {
    case 'PUT': {
      // Disabled for creators: only admins can bulk update collections
      return res.status(403).json({ success: false, error: 'Collections can only be updated by admin' });
    }

    case 'DELETE': {
      // Disabled for creators: only admins can bulk delete collections
      return res.status(403).json({ success: false, error: 'Collections can only be deleted by admin' });
    }

    default: {
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
  }
}
