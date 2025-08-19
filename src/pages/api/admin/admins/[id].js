import connectToDatabase from '../../../../lib/mongodb';
import Admin from '../../../../lib/models/Admin';

export default async function handler(req, res) {
  const { id } = req.query;
  await connectToDatabase();

  if (req.method === 'DELETE') {
    try {
      const deletedAdmin = await Admin.findByIdAndDelete(id);
      if (!deletedAdmin) {
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }
      res.status(200).json({ success: true, data: {} });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
