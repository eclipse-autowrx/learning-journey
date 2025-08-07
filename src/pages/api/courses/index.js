import { CourseService, MockDataService } from "@/lib/services/dataService";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        let dbCourses;
        
        // Try to get data from database first
        try {
          dbCourses = await CourseService.getAll();
          // If no data in database, fallback to mock data
          if (!dbCourses || dbCourses.length === 0) {
            console.log('No courses found in database, using mock data');
            dbCourses = await MockDataService.getCourses();
          }
        } catch (dbError) {
          console.log('Database error, using mock data:', dbError.message);
          dbCourses = await MockDataService.getCourses();
        }
        
        res.status(200).json({ success: true, data: dbCourses });
      } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "POST":
      try {
        const courseData = req.body;
        const newCourse = await CourseService.create(courseData);
        res.status(201).json({ success: true, data: newCourse });
      } catch (error) {
        console.error('Error creating course:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}
