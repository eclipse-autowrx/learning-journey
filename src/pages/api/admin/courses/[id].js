import connectToDatabase from '../../../../lib/mongodb';
import Course from '../../../../lib/models/Course';

export default async function handler(req, res) {
  const { id } = req.query;
  await connectToDatabase();

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
