import connectToDatabase from '../../../lib/mongodb';
import Path from '../../../lib/models/Path';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const paths = await Path.find({});
      res.status(200).json({ success: true, data: paths });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
