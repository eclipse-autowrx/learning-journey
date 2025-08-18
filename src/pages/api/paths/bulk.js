// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { PathService } from '../../../lib/services/dataService.js';
import { check_auth } from '../../../lib/backend/check_auth.js';

export default async function handler(req, res) {
  const { method } = req;
  const { user_id, token } = check_auth(req, res);

  // For now, we'll allow bulk operations without authentication
  // In production, you should enforce authentication
  // if (!user_id) {
  //   return res.status(401).json({ success: false, error: 'Unauthorized' });
  // }

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

        if (!state || !['published', 'draft', 'archived', 'locked'].includes(state)) {
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid state. Must be one of: published, draft, archived, locked' 
          });
        }

        const results = [];
        const errors = [];

        for (const id of ids) {
          try {
            const updated = await PathService.update(id, { state });
            if (updated) {
              results.push({ id, success: true });
            } else {
              errors.push({ id, error: 'Path not found' });
            }
          } catch (error) {
            errors.push({ id, error: error.message });
          }
        }

        res.status(200).json({ 
          success: true, 
          results,
          errors,
          message: `Updated ${results.length} paths${errors.length > 0 ? `, ${errors.length} failed` : ''}` 
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

        const results = [];
        const errors = [];

        for (const id of ids) {
          try {
            const deleted = await PathService.delete(id);
            if (deleted) {
              results.push({ id, success: true });
            } else {
              errors.push({ id, error: 'Path not found' });
            }
          } catch (error) {
            errors.push({ id, error: error.message });
          }
        }

        res.status(200).json({ 
          success: true, 
          results,
          errors,
          message: `Deleted ${results.length} paths${errors.length > 0 ? `, ${errors.length} failed` : ''}` 
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
