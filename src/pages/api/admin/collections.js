import connectToDatabase from '../../../lib/mongodb';
import Collection from '../../../lib/models/Collection';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const collections = await Collection.find({}).populate({
        path: 'paths',
        populate: {
          path: 'courses'
        }
      });
      res.status(200).json({ success: true, data: collections });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
