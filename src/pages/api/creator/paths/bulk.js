// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT
import { PathService } from '@/lib/services/dataService.js';
import { check_auth } from '@/lib/backend/check_auth.js';
import connectToDatabase from '@/lib/mongodb.js';
import { Path } from '@/lib/models/index.js';

export default async function handler(req, res) {
  const { method } = req;
  const { user_id } = check_auth(req, res);

  if (!user_id) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  switch (method) {
    case 'PUT': {
      try {
        const { ids, state } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({ success: false, error: 'Invalid or empty ids array' });
        }
        if (!state || !['draft', 'archived'].includes(state)) {
          return res.status(400).json({ success: false, error: 'Invalid state. Allowed here: draft, archived' });
        }
        await connectToDatabase();
        const ownedDocs = await Path.find({ _id: { $in: ids }, owner_id: user_id }).select('_id').lean();
        const ownedIdSet = new Set(ownedDocs.map(d => d._id.toString()));
        const allowedIds = ids.filter(id => ownedIdSet.has(id.toString()));

        const results = [];
        const errors = [];
        for (const id of allowedIds) {
          try {
            const updated = await PathService.update(id, { state });
            if (updated) results.push({ id, success: true });
            else errors.push({ id, error: 'Path not found' });
          } catch (e) {
            errors.push({ id, error: e.message });
          }
        }
        const forbiddenIds = ids.filter(id => !allowedIds.includes(id));
        forbiddenIds.forEach(id => errors.push({ id, error: 'Forbidden' }));
        return res.status(200).json({ success: true, results, errors });
      } catch (error) {
        console.error('Error in creator paths bulk update:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
    case 'DELETE': {
      try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({ success: false, error: 'Invalid or empty ids array' });
        }
        await connectToDatabase();
        const ownedDocs = await Path.find({ _id: { $in: ids }, owner_id: user_id }).select('_id').lean();
        const ownedIdSet = new Set(ownedDocs.map(d => d._id.toString()));
        const allowedIds = ids.filter(id => ownedIdSet.has(id.toString()));

        const results = [];
        const errors = [];
        for (const id of allowedIds) {
          try {
            const deleted = await PathService.delete(id);
            if (deleted) results.push({ id, success: true });
            else errors.push({ id, error: 'Path not found' });
          } catch (e) {
            errors.push({ id, error: e.message });
          }
        }
        const forbiddenIds = ids.filter(id => !allowedIds.includes(id));
        forbiddenIds.forEach(id => errors.push({ id, error: 'Forbidden' }));
        return res.status(200).json({ success: true, results, errors });
      } catch (error) {
        console.error('Error in creator paths bulk delete:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
    default: {
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
  }
}
