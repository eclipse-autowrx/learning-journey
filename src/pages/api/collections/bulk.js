// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { CollectionService } from '../../../lib/services/dataService.js';
import { check_auth } from '../../../lib/backend/check_auth.js';
import connectToDatabase from '../../../lib/mongodb.js';
import { Collection } from '../../../lib/models/index.js';

export default async function handler(req, res) {
  const { method } = req;
  const { user_id, token } = check_auth(req, res);

  // Enforce: Only admin endpoints should change to published
  const isAdminApi = req.url?.startsWith('/api/admin/');

  switch (method) {
    case "PUT":
      // Bulk update state
      try {
        const { ids, state } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid or empty ids array' 
          });
        }

        if (!state || !['published', 'draft', 'archived'].includes(state)) {
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid state. Must be one of: published, draft, archived' 
          });
        }

        // Block elevating to published from non-admin routes
        if (state === 'published' && !isAdminApi) {
          return res.status(403).json({ success: false, error: 'Only admin may publish collections' });
        }

        if (!user_id) {
          return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Only allow updating assets owned by current user for non-admin endpoints
        let allowedIds = ids;
        if (!isAdminApi) {
          await connectToDatabase();
          const ownedDocs = await Collection.find({ _id: { $in: ids }, owner_id: user_id }).select('_id').lean();
          const ownedIdSet = new Set(ownedDocs.map(d => d._id.toString()));
          allowedIds = ids.filter(id => ownedIdSet.has(id.toString()));
        }

        const results = [];
        const errors = [];

        for (const id of allowedIds) {
          try {
            const updated = await CollectionService.update(id, { state });
            if (updated) {
              results.push({ id, success: true });
            } else {
              errors.push({ id, error: 'Collection not found' });
            }
          } catch (error) {
            errors.push({ id, error: error.message });
          }
        }

        // Report forbidden ids
        const forbiddenIds = ids.filter(id => !allowedIds.includes(id));
        forbiddenIds.forEach(id => errors.push({ id, error: 'Forbidden' }));

        res.status(200).json({ 
          success: true, 
          results,
          errors,
          message: `Updated ${results.length} collections${errors.length > 0 ? `, ${errors.length} failed` : ''}` 
        });
      } catch (error) {
        console.error('Error in bulk update:', error);
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case "DELETE":
      // Bulk delete
      try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid or empty ids array' 
          });
        }

        if (!user_id) {
          return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Only allow deleting assets owned by current user for non-admin endpoints
        let allowedIds = ids;
        if (!isAdminApi) {
          await connectToDatabase();
          const ownedDocs = await Collection.find({ _id: { $in: ids }, owner_id: user_id }).select('_id').lean();
          const ownedIdSet = new Set(ownedDocs.map(d => d._id.toString()));
          allowedIds = ids.filter(id => ownedIdSet.has(id.toString()));
        }

        const results = [];
        const errors = [];

        for (const id of allowedIds) {
          try {
            const deleted = await CollectionService.delete(id);
            if (deleted) {
              results.push({ id, success: true });
            } else {
              errors.push({ id, error: 'Collection not found' });
            }
          } catch (error) {
            errors.push({ id, error: error.message });
          }
        }

        // Report forbidden ids
        const forbiddenIds = ids.filter(id => !allowedIds.includes(id));
        forbiddenIds.forEach(id => errors.push({ id, error: 'Forbidden' }));

        res.status(200).json({ 
          success: true, 
          results,
          errors,
          message: `Deleted ${results.length} collections${errors.length > 0 ? `, ${errors.length} failed` : ''}` 
        });
      } catch (error) {
        console.error('Error in bulk delete:', error);
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
  }
}
