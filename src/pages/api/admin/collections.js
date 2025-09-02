import connectToDatabase from '../../../lib/mongodb';
import Collection from '../../../lib/models/Collection';
import Admin from '../../../lib/models/Admin';
import { check_auth } from '../../../lib/backend/check_auth';
import { ExternalUserService } from '../../../lib/backend/user_service';
import { CollectionService } from '../../../lib/services/dataService';

export default async function handler(req, res) {
  await connectToDatabase();

  // Permission guard: require manageUsers
  const { user_id, token } = check_auth(req, res);
  if (!user_id || !token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  try {
    const allowed = await ExternalUserService.hasPermission('manageUsers', token);
    if (!allowed) return res.status(403).json({ success: false, error: 'Forbidden' });
  } catch (e) {
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
