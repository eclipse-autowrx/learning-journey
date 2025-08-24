// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT
import connectToDatabase from '@/lib/mongodb.js';
import { Collection } from '@/lib/models/index.js';
import { check_auth } from '@/lib/backend/check_auth.js';

export default async function handler(req, res) {
  const { method, query } = req;
  const { slug } = query;
  const { user_id } = check_auth(req, res);

  if (!user_id) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  await connectToDatabase();

  switch (method) {
    case 'GET': {
      try {
        const collection = await Collection.findOne({ slug })
          .populate({ path: 'paths', populate: { path: 'courses', populate: { path: 'lessons' } } });
        if (!collection) {
          return res.status(404).json({ success: false, error: 'Collection not found' });
        }
        if (collection.owner_id !== user_id) {
          return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        return res.status(200).json({ success: true, data: collection });
      } catch (error) {
        console.error('Error fetching creator collection:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
    case 'PUT': {
      // Disabled: only admins can update collections
      return res.status(403).json({ success: false, error: 'Collections can only be updated by admin' });
    }
    case 'DELETE': {
      // Disabled: only admins can delete collections
      return res.status(403).json({ success: false, error: 'Collections can only be deleted by admin' });
    }
    default: {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
  }
}
