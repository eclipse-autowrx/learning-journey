import connectToDatabase from '../../../lib/mongodb';
import Admin from '../../../lib/models/Admin';

export default async function handler(req, res) {
  await connectToDatabase();

  switch (req.method) {
    case 'GET':
      try {
        const admins = await Admin.find({});
        res.status(200).json({ success: true, data: admins });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case 'POST':
      try {
        const admin = await Admin.create(req.body);
        res.status(201).json({ success: true, data: admin });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}
