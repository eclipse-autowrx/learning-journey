// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { CollectionService } from '@/lib/services/dataService.js';
import { ExternalUserService } from '@/lib/backend/user_service.js';
import { getCachedName, setCachedName } from '@/lib/backend/user_name_cache.js';
import { check_auth } from '@/lib/backend/check_auth.js';

export default async function handler(req, res) {
  const { method } = req;
  const { user_id, token } = check_auth(req, res);

  if (!user_id) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  switch (method) {
    case 'GET': {
      try {
        const filter = { owner_id: user_id };
        const dbCollections = await CollectionService.getAll(filter);

        const transformedCollections = [];
        for (const collection of dbCollections) {
          let owner_name = getCachedName(collection.owner_id);
          if (!owner_name && collection.owner_id) {
            try {
              const nameMap = await ExternalUserService.getNameMap([collection.owner_id], token);
              owner_name = nameMap[collection.owner_id];
              if (owner_name) setCachedName(collection.owner_id, owner_name);
            } catch (_) {}
          }

          transformedCollections.push({
            _id: collection._id,
            name: collection.name,
            slug: collection.slug,
            description: collection.description,
            owner_id: collection.owner_id,
            owner_name,
            category: collection.category,
            tags: collection.tags,
            paths: (collection.paths || []).map((p) => ({
              _id: p._id,
              slug: p.slug,
              name: p.name,
              description: p.description,
              image: p.image,
              thumb: p.thumb,
              tags: p.tags,
              level: p.level,
              path_type: p.path_type,
              state: p.state,
              owner_id: p.owner_id,
              time_to_complete: p.time_to_complete,
              background_img: p.background_img,
              category: p.category,
              created_at: p.created_at,
              updated_at: p.updated_at,
            })),
            path_order: collection.path_order || [],
            total_paths: collection.paths ? collection.paths.length : 0,
            state: collection.state,
            valid_from: collection.valid_from,
            valid_to: collection.valid_to,
            configs: collection.configs,
            extends: collection.extends,
            hiddenContent: collection.hiddenContent,
            meta_title: collection.meta_title,
            meta_description: collection.meta_description,
            accessibility_notes: collection.accessibility_notes,
            created_at: collection.createdAt,
            updated_at: collection.updatedAt,
          });
        }

        return res.status(200).json({ success: true, data: transformedCollections });
      } catch (error) {
        console.error('Error fetching creator collections:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
    case 'POST': {
      try {
        const collectionData = { ...req.body, owner_id: user_id };
        if (!collectionData.name) {
          return res.status(400).json({ success: false, error: 'Name is required' });
        }
        const created = await CollectionService.create(collectionData);
        return res.status(201).json({ success: true, data: created });
      } catch (error) {
        console.error('Error creating creator collection:', error);
        if (error.code === 11000) {
          return res.status(400).json({ success: false, error: 'A collection with this slug already exists' });
        }
        return res.status(500).json({ success: false, error: 'Failed to create collection' });
      }
    }
    default: {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
    }
  }
}
