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
      try {
        const existing = await Collection.findOne({ slug }).lean();
        if (!existing) {
          return res.status(404).json({ success: false, error: 'Collection not found' });
        }
        if (existing.owner_id !== user_id) {
          return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        const updateData = req.body || {};
        const updated = await Collection.findOneAndUpdate({ slug }, updateData, { new: true, runValidators: true });
        return res.status(200).json({ success: true, data: updated });
      } catch (error) {
        console.error('Error updating creator collection:', error);
        if (error.code === 11000) {
          return res.status(400).json({ success: false, error: 'Duplicate slug' });
        }
        return res.status(500).json({ success: false, error: 'Failed to update collection' });
      }
    }
    case 'DELETE': {
      try {
        const existing = await Collection.findOne({ slug }).lean();
        if (!existing) {
          return res.status(404).json({ success: false, error: 'Collection not found' });
        }
        if (existing.owner_id !== user_id) {
          return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        await Collection.findOneAndDelete({ slug });
        return res.status(200).json({ success: true, message: 'Collection deleted successfully' });
      } catch (error) {
        console.error('Error deleting creator collection:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete collection' });
      }
    }
    default: {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
  }
}
