// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT
import connectToDatabase from '../../../lib/mongodb.js';
import { Collection } from '../../../lib/models/index.js';
import { check_auth } from '../../../lib/backend/check_auth.js';

export default async function handler(req, res) {
  const { method, query } = req;
  const { slug } = query;
  const { user_id, token } = check_auth(req, res);

  await connectToDatabase();

  switch (method) {
    case "GET":
      try {
        const collection = await Collection.findOne({ slug })
          .populate({
            path: 'paths',
            populate: {
              path: 'courses',
              populate: {
                path: 'lessons'
              }
            }
          });

        if (!collection) {
          return res.status(404).json({ 
            success: false, 
            error: 'Collection not found' 
          });
        }

        const transformedCollection = {
          _id: collection._id,
          name: collection.name,
          slug: collection.slug,
          description: collection.description,
          category: collection.category,
          tags: collection.tags,
          paths: collection.paths || [],
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
          updated_at: collection.updatedAt
        };

        res.status(200).json({ success: true, data: transformedCollection });
      } catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case "PUT":
      try {
        const collectionData = req.body;
        
        // Build update object with only provided fields
        const updateData = {};
        
        // Only validate required fields if they are being updated
        if (collectionData.hasOwnProperty('name')) {
          if (!collectionData.name || collectionData.name.trim() === '') {
            return res.status(400).json({
              success: false,
              error: 'Name cannot be empty'
            });
          }
          updateData.name = collectionData.name;
        }

        // Handle slug logic only if name is being updated or slug is explicitly provided
        if (collectionData.hasOwnProperty('slug')) {
          updateData.slug = collectionData.slug;
        } else if (collectionData.hasOwnProperty('name')) {
          // Generate slug only if name is being updated and slug is not provided
          const existingCollection = await Collection.findOne({ slug });
          if (existingCollection && !collectionData.slug) {
            // For updates without explicit slug, preserve the existing slug
            updateData.slug = existingCollection.slug;
          } else if (!existingCollection) {
            // For new collections, generate slug from name
            updateData.slug = collectionData.name
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim('-');
          }
        }

        // Add other fields if they are provided
        if (collectionData.hasOwnProperty('description')) {
          updateData.description = collectionData.description;
        }
        if (collectionData.hasOwnProperty('category')) {
          updateData.category = collectionData.category;
        }
        if (collectionData.hasOwnProperty('tags')) {
          updateData.tags = collectionData.tags;
        }
        if (collectionData.hasOwnProperty('state')) {
          updateData.state = collectionData.state;
        }
        if (collectionData.hasOwnProperty('paths')) {
          updateData.paths = collectionData.paths;
        }
        if (collectionData.hasOwnProperty('path_order')) {
          updateData.path_order = collectionData.path_order;
        }
        if (collectionData.hasOwnProperty('valid_from')) {
          updateData.valid_from = collectionData.valid_from;
        }
        if (collectionData.hasOwnProperty('valid_to')) {
          updateData.valid_to = collectionData.valid_to;
        }
        if (collectionData.hasOwnProperty('configs')) {
          updateData.configs = collectionData.configs;
        }
        if (collectionData.hasOwnProperty('extends')) {
          updateData.extends = collectionData.extends;
        }
        if (collectionData.hasOwnProperty('hiddenContent')) {
          updateData.hiddenContent = collectionData.hiddenContent;
        }
        if (collectionData.hasOwnProperty('meta_title')) {
          updateData.meta_title = collectionData.meta_title;
        }
        if (collectionData.hasOwnProperty('meta_description')) {
          updateData.meta_description = collectionData.meta_description;
        }
        if (collectionData.hasOwnProperty('accessibility_notes')) {
          updateData.accessibility_notes = collectionData.accessibility_notes;
        }

        const updatedCollection = await Collection.findOneAndUpdate(
          { slug },
          updateData,
          { new: true, runValidators: true }
        );

        if (!updatedCollection) {
          return res.status(404).json({
            success: false,
            error: 'Collection not found'
          });
        }

        res.status(200).json({
          success: true,
          data: updatedCollection
        });
      } catch (error) {
        console.error('Error updating collection:', error);
        
        if (error.code === 11000) {
          res.status(400).json({
            success: false,
            error: 'A collection with this slug already exists'
          });
        } else {
          res.status(500).json({
            success: false,
            error: 'Failed to update collection'
          });
        }
      }
      break;

    case "DELETE":
      try {
        const deletedCollection = await Collection.findOneAndDelete({ slug });

        if (!deletedCollection) {
          return res.status(404).json({
            success: false,
            error: 'Collection not found'
          });
        }

        res.status(200).json({
          success: true,
          message: 'Collection deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to delete collection'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed`
      });
  }
} 