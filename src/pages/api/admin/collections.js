import connectToDatabase from '../../../lib/mongodb';
import Collection from '../../../lib/models/Collection';
import Admin from '../../../lib/models/Admin';
import { check_auth } from '../../../lib/backend/check_auth';
import { CollectionService } from '../../../lib/services/dataService';

export default async function handler(req, res) {
  await connectToDatabase();

  // Simple admin guard
  const { user_id } = check_auth(req, res);
  if (!user_id) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  // Ensure admin: if no admins exist, bootstrap current user as admin
  const adminCount = await Admin.countDocuments({});
  if (adminCount === 0) {
    try { await Admin.create({ user_id }); } catch (_) {}
  }
  const isAdmin = await Admin.findOne({ user_id }).lean();
  if (!isAdmin) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  switch (req.method) {
    case 'GET': {
      try {
        const collections = await Collection.find({}).populate({
          path: 'paths',
          populate: {
            path: 'courses'
          }
        });
        return res.status(200).json({ success: true, data: collections });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    }
    case 'POST': {
      try {
        const { name, description = '', category = '', tags = [], state = 'draft' } = req.body || {};
        if (!name) {
          return res.status(400).json({ success: false, error: 'Name is required' });
        }
        const created = await CollectionService.create({
          name,
          description,
          category,
          tags,
          state,
          owner_id: user_id,
        });
        return res.status(201).json({ success: true, data: created });
      } catch (error) {
        if (error.code === 11000) {
          return res.status(400).json({ success: false, error: 'A collection with this slug already exists' });
        }
        return res.status(400).json({ success: false, error: error.message });
      }
    }
    default: {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  }
}
