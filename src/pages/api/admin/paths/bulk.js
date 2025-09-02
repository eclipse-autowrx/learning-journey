import connectToDatabase from '../../../../lib/mongodb';
import Path from '../../../../lib/models/Path';
import { check_auth } from '../../../../lib/backend/check_auth';
import { ExternalUserService } from '../../../../lib/backend/user_service';

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

  if (req.method === 'PUT') {
    // Bulk update state
    try {
      const { ids, state } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid or empty ids array' 
        });
      }

      if (!state || !['published', 'draft', 'archived', 'locked'].includes(state)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid state. Must be one of: published, draft, archived, locked' 
        });
      }

      const results = [];
      const errors = [];

      for (const id of ids) {
        try {
          const updated = await Path.findByIdAndUpdate(id, { state }, {
            new: true,
            runValidators: true,
          });
          if (updated) {
            results.push({ id, success: true });
          } else {
            errors.push({ id, error: 'Path not found' });
          }
        } catch (error) {
          errors.push({ id, error: error.message });
        }
      }

      res.status(200).json({ 
        success: true, 
        results,
        errors,
        message: `Updated ${results.length} paths${errors.length > 0 ? `, ${errors.length} failed` : ''}` 
      });
    } catch (error) {
      console.error('Error in bulk update:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
