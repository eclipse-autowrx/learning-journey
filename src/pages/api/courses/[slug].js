import { CourseService, MockDataService } from "@/lib/services/dataService";
import { getProgressForCourse } from "@/pages/api/progress/courses/utils";
import { check_auth } from "@/lib/backend/check_auth";
import { processCourseContext } from "@/pages/api/progress/courses/utils";


export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;
  const { user_id, token } = check_auth(req, res);

  switch (method) {
    case "GET":
      console.log(`BE get course ${slug}`)
      try {
        let dbCourse;
        
        // Try to get data from database first
        try {
          dbCourse = await CourseService.getCourseBySlug(slug);
          // If no data in database, fallback to mock data
          if (!dbCourse) {
            console.log(`Course ${slug} not found in database, using mock data`);
            dbCourse = await MockDataService.getCourseBySlug(slug);
          }
        } catch (dbError) {
          console.log('Database error, using mock data:', dbError.message);
          dbCourse = await MockDataService.getCourseBySlug(slug);
        }

        if (!dbCourse) {
          return res.status(404).json({ success: false, error: "Course not found" });
        }

        let courseProgress
        if(user_id) {
          courseProgress = await getProgressForCourse(user_id, dbCourse._id)
        }
        dbCourse.progress = courseProgress
        await processCourseContext(dbCourse)
        
        // console.log(`dbCourse`, dbCourse)
        res.status(200).json({ success: true, data: dbCourse });
      } catch (error) {
        console.log(`Error get course ${slug}`, error)
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "PUT":
      try {
        const updateData = req.body;
        const updatedCourse = await CourseService.updateCourse(slug, updateData);
        res.status(200).json({ success: true, data: updatedCourse });
      } catch (error) {
        console.error('Error updating course:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "DELETE":
      try {
        await CourseService.deleteCourse(slug);
        res.status(200).json({ success: true, message: "Course deleted successfully" });
      } catch (error) {
        console.error('Error deleting course:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      break;
  }
}
