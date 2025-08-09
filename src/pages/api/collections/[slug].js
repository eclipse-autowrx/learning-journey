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

        const updatedCollection = await Collection.findOneAndUpdate(
          { slug },
          collectionData,
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