import connectToDatabase from '../../../lib/mongodb';
import Course from '../../../lib/models/Course';

export default async function handler(req, res) {
  await connectToDatabase();

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
