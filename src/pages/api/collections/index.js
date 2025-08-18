// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { CollectionService } from '../../../lib/services/dataService.js';
import { CourseProgress, Path } from '../../../lib/models/index.js';
import { check_auth } from '../../../lib/backend/check_auth.js';

const getProgressForCourse = async (user_id, course) => {
  try {
    const dbProgress = await CourseProgress.findOne({ user_id: user_id, course_id: course._id });
    course.progress = dbProgress || {}
  } catch(e) { 
    console.log('Error getting progress for course:', e);
    course.progress = {};
  }
}

export default async function handler(req, res) {
  const { method, query } = req;
  const { user_id, token } = check_auth(req, res);

  // Disable caching during development to avoid 304/ETag revalidation
  if (process.env.NODE_ENV !== 'production') {
    res.setHeader('Cache-Control', 'no-store');
  }

  // DB connection is handled in the service

  switch (method) {
    case "GET":
      try {
        // Check if we should filter by state
        const filter = {};
        if (query.state) {
          filter.state = query.state;
        }
        
        // Get collections from database with populated paths and courses
        const dbCollections = await CollectionService.getAll(filter);

        // If user is authenticated, add progress data to courses
        if (user_id) {
          for (let a = 0; a < dbCollections.length; a++) {
            let collection = dbCollections[a];
            if (collection.paths) {
              for (let b = 0; b < collection.paths.length; b++) {
                let path = collection.paths[b];
                if (path.courses) {
                  for (let c = 0; c < path.courses.length; c++) {
                    let course = path.courses[c];
                    await getProgressForCourse(user_id, course);
                  }
                }
              }
            }
          }
        }

        // Transform to match the expected format
        const transformedCollections = [];
        for (const collection of dbCollections) {
          let effectivePaths = collection.paths || [];
          // If paths were not populated (or are empty) but we have an order list, fetch by IDs and preserve order
          if ((!effectivePaths || effectivePaths.length === 0) && Array.isArray(collection.path_order) && collection.path_order.length > 0) {
            const ids = collection.path_order;
            const docs = await Path.find({ _id: { $in: ids } })
              .select('name slug description image thumb tags level path_type state created_at time_to_complete background_img category updated_at')
              .lean();
            const byId = new Map(docs.map(d => [d._id.toString(), d]));
            effectivePaths = ids.map(id => byId.get(id.toString())).filter(Boolean);
          }

          transformedCollections.push({
            _id: collection._id,
            name: collection.name,
            slug: collection.slug,
            description: collection.description,
            category: collection.category,
            tags: collection.tags,
            paths: (effectivePaths || []).map(p => ({
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
              time_to_complete: p.time_to_complete,
              background_img: p.background_img,
              category: p.category,
              created_at: p.created_at,
              updated_at: p.updated_at,
            })),
            path_order: collection.path_order || [],
            total_paths: effectivePaths ? effectivePaths.length : 0,
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
            updated_at: collection.updatedAt
          });
        }

        res.status(200).json({ success: true, data: transformedCollections });
      } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case "POST":
      try {
        const collectionData = req.body;
        
        // Validate required fields
        if (!collectionData.name) {
          return res.status(400).json({
            success: false,
            error: 'Name is required'
          });
        }

        // Generate slug if not provided
        if (!collectionData.slug) {
          collectionData.slug = collectionData.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
        }

        const created = await CollectionService.create(collectionData);
        res.status(201).json({ success: true, data: created });
      } catch (error) {
        console.error('Error creating collection:', error);
        
        if (error.code === 11000) {
          res.status(400).json({
            success: false,
            error: 'A collection with this slug already exists'
          });
        } else {
          res.status(500).json({
            success: false,
            error: 'Failed to create collection'
          });
        }
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed`
      });
  }
}
