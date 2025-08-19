import connectToDatabase from '../../../../lib/mongodb';
import Collection from '../../../../lib/models/Collection';

export default async function handler(req, res) {
  const { id } = req.query;
  await connectToDatabase();

  if (req.method === 'PUT') {
    try {
      const collection = await Collection.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!collection) {
        return res.status(404).json({ success: false, error: 'Collection not found' });
      }
      res.status(200).json({ success: true, data: collection });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
