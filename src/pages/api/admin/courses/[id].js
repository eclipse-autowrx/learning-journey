import connectToDatabase from '../../../../lib/mongodb';
import Course from '../../../../lib/models/Course';
import { check_auth } from '../../../../lib/backend/check_auth';
import { ExternalUserService } from '../../../../lib/backend/user_service';

export default async function handler(req, res) {
  const { id } = req.query;
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

  if (req.method === 'PUT') {
    try {
      const course = await Course.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!course) {
        return res.status(404).json({ success: false, error: 'Course not found' });
      }
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
