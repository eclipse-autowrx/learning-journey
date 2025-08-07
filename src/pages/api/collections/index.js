import connectToDatabase from '../../../lib/mongodb.js';
import Collection from '../../../lib/models/Collection.js';
import CourseProgress from '../../../lib/models/CourseProgress.js';
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
  const { method } = req;
  const { user_id, token } = check_auth(req, res);

  await connectToDatabase();

  switch (method) {
    case "GET":
      try {
        // Get collections from database with populated paths and courses
        let dbCollections = await Collection.find({})
          .populate({
            path: 'paths',
            populate: {
              path: 'courses',
              populate: {
                path: 'lessons'
              }
            }
          })
          .sort({ created_at: -1 });

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
        const transformedCollections = dbCollections.map(collection => ({
          _id: collection._id,
          name: collection.name,
          slug: collection.slug,
          description: collection.description,
          category: collection.category,
          tags: collection.tags,
          paths: collection.paths || [],
          path_order: collection.path_order || [],
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
        }));

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

        const collection = new Collection(collectionData);
        await collection.save();

        res.status(201).json({
          success: true,
          data: collection
        });
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
