import connectToDatabase from '../../../../lib/mongodb';
import Collection from '../../../../lib/models/Collection';
import Admin from '../../../../lib/models/Admin';
import { check_auth } from '../../../../lib/backend/check_auth';

export default async function handler(req, res) {
  const { id } = req.query;
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
        const collection = await Collection.findById(id)
          .populate({ path: 'paths', populate: { path: 'courses' } });
        if (!collection) {
          return res.status(404).json({ success: false, error: 'Collection not found' });
        }
        return res.status(200).json({ success: true, data: collection });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    }
    case 'PUT': {
      try {
        const collection = await Collection.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!collection) {
          return res.status(404).json({ success: false, error: 'Collection not found' });
        }
        return res.status(200).json({ success: true, data: collection });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    }
    case 'DELETE': {
      try {
        const deleted = await Collection.findByIdAndDelete(id);
        if (!deleted) {
          return res.status(404).json({ success: false, error: 'Collection not found' });
        }
        return res.status(200).json({ success: true, message: 'Collection deleted successfully' });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    }
    default: {
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  }
}
