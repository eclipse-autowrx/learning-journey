// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from '../../../lib/mongodb';
import SystemSettings from '../../../lib/models/SystemSettings';
import { check_auth } from '../../../lib/backend/check_auth';
import { PathService } from '../../../lib/services/dataService.js';
import { ExternalUserService } from '../../../lib/backend/user_service.js';
import { getCachedName, setCachedName } from '../../../lib/backend/user_name_cache.js';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { user_id, token } = check_auth(req, res);
    
    // Get collections from system settings
    const collectionsSetting = await SystemSettings.findOne({ key: 'collections' });
    
    if (!collectionsSetting) {
      return res.status(200).json({ success: true, data: [] });
    }

    const collectionsData = collectionsSetting.value || [];
    
    // Transform the data to match the expected format for the home page
    const transformedCollections = [];
    
    for (let index = 0; index < collectionsData.length; index++) {
      const collection = collectionsData[index];
      const pathIds = collection.path_ids || [];
      
      // Fetch the actual path data from the database, preserving the order
      let paths = [];
      if (pathIds.length > 0) {
        try {
          // Get all paths that match the IDs
          const dbPaths = await PathService.getAll({ 
            _id: { $in: pathIds },
            state: { $in: ['published', 'locked'] }
          });
          
          // Create a map for quick lookup
          const pathMap = new Map(dbPaths.map(path => [path._id.toString(), path]));
          
          // Preserve the order from path_ids array
          paths = pathIds
            .map(id => pathMap.get(id.toString()))
            .filter(Boolean) // Remove any undefined paths
            .map(path => {
              // Resolve owner name for each path
              let owner_name = getCachedName(path.owner_id);
              if (!owner_name && path.owner_id && user_id) {
                // We'll resolve this in a batch later
                return { ...path, owner_name: null };
              }
              return { ...path, owner_name };
            });
        } catch (error) {
          console.error('Error fetching paths for collection:', error);
          paths = [];
        }
      }
      
      transformedCollections.push({
        _id: `collection-${index}`,
        name: collection.name,
        slug: collection.name?.toLowerCase().replace(/\s+/g, '-') || `collection-${index}`,
        description: collection.description,
        owner_id: 'system',
        owner_name: 'System',
        category: 'system',
        tags: [],
        paths: paths,
        path_ids: pathIds, // Keep the original path_ids for reference
        state: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    // Batch resolve owner names for all paths
    if (user_id) {
      const allOwnerIds = new Set();
      transformedCollections.forEach(collection => {
        collection.paths.forEach(path => {
          if (path.owner_id && !path.owner_name) {
            allOwnerIds.add(path.owner_id);
          }
        });
      });
      
      if (allOwnerIds.size > 0) {
        try {
          const nameMap = await ExternalUserService.getNameMap([...allOwnerIds], token);
          transformedCollections.forEach(collection => {
            collection.paths.forEach(path => {
              if (path.owner_id && !path.owner_name) {
                const owner_name = nameMap[path.owner_id];
                if (owner_name) {
                  path.owner_name = owner_name;
                  setCachedName(path.owner_id, owner_name);
                }
              }
            });
          });
        } catch (error) {
          console.error('Error resolving owner names:', error);
        }
      }
    }

    res.status(200).json({ success: true, data: transformedCollections });
  } catch (error) {
    console.error('Error fetching collections from settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
