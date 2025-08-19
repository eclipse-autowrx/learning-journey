import connectToDatabase from '../../../../lib/mongodb';
import Path from '../../../../lib/models/Path';

export default async function handler(req, res) {
  const { id } = req.query;
  await connectToDatabase();

  if (req.method === 'PUT') {
    try {
      const path = await Path.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!path) {
        return res.status(404).json({ success: false, error: 'Path not found' });
      }
      res.status(200).json({ success: true, data: path });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
