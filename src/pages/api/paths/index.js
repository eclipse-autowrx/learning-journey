import { PathService, MockDataService } from "../../../lib/services/dataService.js";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        let dbPaths;
        
        // Try to get data from database first
        try {
          dbPaths = await PathService.getAll();
          // If no data in database, fallback to mock data
          if (!dbPaths || dbPaths.length === 0) {
            console.log('No paths found in database, using mock data');
            dbPaths = await MockDataService.getPaths();
          }
        } catch (dbError) {
          console.log('Database error, using mock data:', dbError.message);
          dbPaths = await MockDataService.getPaths();
        }
        
        res.status(200).json({ success: true, data: dbPaths });
      } catch (error) {
        console.error('Error fetching paths:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "POST":
      try {
        const pathData = req.body;
        const newPath = await PathService.create(pathData);
        res.status(201).json({ success: true, data: newPath });
      } catch (error) {
        console.error('Error creating path:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}
