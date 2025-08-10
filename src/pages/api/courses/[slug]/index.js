import { CourseService } from "@/lib/services/dataService";
import { getProgressForCourse } from "@/pages/api/progress/courses/utils";
import { check_auth } from "@/lib/backend/check_auth";
import { processCourseContext } from "@/pages/api/progress/courses/utils";

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;
  const { user_id } = check_auth(req, res);

  switch (method) {
    case "GET":
      console.log(`BE get course ${slug}`)
      try {
        const dbCourse = await CourseService.getBySlug(slug);
        if (!dbCourse) return res.status(404).json({ success: false, error: "Course not found" });

        let courseProgress;
        if (user_id) {
          courseProgress = await getProgressForCourse(user_id, dbCourse._id);
        }
        dbCourse.progress = courseProgress;
        await processCourseContext(dbCourse);

        return res.status(200).json({ success: true, data: dbCourse });
      } catch (error) {
        console.log(`Error get course ${slug}`, error)
        return res.status(400).json({ success: false, error: error.message });
      }
    case "PUT":
      try {
        const updateData = req.body;
        const updatedCourse = await CourseService.updateCourse(slug, updateData);
        if (!updatedCourse) {
          return res.status(404).json({ success: false, error: "Course not found" });
        }
        res.status(200).json({ success: true, data: updatedCourse });
      } catch (error) {
        console.error('Error updating course:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "DELETE":
      try {
        const deletedCourse = await CourseService.deleteCourse(slug);
        if (!deletedCourse) {
          return res.status(404).json({ success: false, error: "Course not found" });
        }
        res.status(200).json({ success: true, message: "Course deleted successfully" });
      } catch (error) {
        console.error('Error deleting course:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}


