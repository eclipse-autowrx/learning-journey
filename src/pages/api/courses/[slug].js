import { ALL_COURSES } from "@/lib/mock_data/all_courses";
// import { LESSONs } from "@/lib/mock_data/course1_lessons";

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
        let dbCourse = ALL_COURSES.find((course) => course.slug === slug);
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
    default:
      break;
  }
}
