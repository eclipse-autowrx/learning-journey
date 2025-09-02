import connectToDatabase from '../../../lib/mongodb';
import Course from '../../../lib/models/Course';
import { check_auth } from '../../../lib/backend/check_auth';
import { ExternalUserService } from '../../../lib/backend/user_service';

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

  if (req.method === 'GET') {
    try {
      const courses = await Course.find({});
      res.status(200).json({ success: true, data: courses });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
