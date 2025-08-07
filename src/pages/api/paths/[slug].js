import { PathService, CourseService, MockDataService } from "@/lib/services/dataService";
import { ICONs } from "@/lib/mock_data/media";
import { check_auth } from "@/lib/backend/check_auth";
import { STATE_NOT_STARTED, STATE_IN_PROGRESS, STATE_COMPLETED, STATE_LOCKED } from "@/lib/const";

const ICON_SET = {
  not_started: 'https://bewebstudio.digitalauto.tech/data/projects/zb1Shh3qkfNG/course-notyet.png',
  in_progress: 'https://bewebstudio.digitalauto.tech/data/projects/zb1Shh3qkfNG/course-learning.png',
  completed: 'https://bewebstudio.digitalauto.tech/data/projects/zb1Shh3qkfNG/course-done.png',
  locked: 'https://bewebstudio.digitalauto.tech/data/projects/zb1Shh3qkfNG/course-notyet.png',
}

function addMediaUrlForCourses(path) {
  if (!path || !path.courses) return
  let ICONS = path.icon_set || ICON_SET

  path.courses.forEach((course) => {
    if (!course.icon) {
      switch (course.context?.state) {
        case STATE_NOT_STARTED:
          course.icon = ICONS.not_started;
          break;
        case STATE_IN_PROGRESS:
          course.icon = ICONS.in_progress;
          break;
        case STATE_COMPLETED:
          course.icon = ICONS.completed;
          break;
        case STATE_LOCKED:
          course.icon = ICONS.locked;
          break;
        default:
          course.icon = ICONS.not_started;
      }
    }
  });
}

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;

  const { user_id, token } = check_auth(req, res);
  
  switch (method) {
    case "GET":
      try {
        let dbPath;
        
        // Try to get data from database first
        try {
          dbPath = await PathService.getPathBySlug(slug);
          // If no data in database, fallback to mock data
          if (!dbPath) {
            console.log(`Path ${slug} not found in database, using mock data`);
            const mockPaths = await MockDataService.getAllPaths();
            dbPath = mockPaths.find((path) => path.slug === slug);
          }
        } catch (dbError) {
          console.log('Database error, using mock data:', dbError.message);
          const mockPaths = await MockDataService.getAllPaths();
          dbPath = mockPaths.find((path) => path.slug === slug);
        }

        if (!dbPath) {
          return res
            .status(404)
            .json({ success: false, error: "Path not found" });
        }

        try {
          // Get courses for this path
          if (dbPath.courses && dbPath.courses.length > 0) {
            // If courses are already populated (from database), use them
            if (typeof dbPath.courses[0] === 'object' && dbPath.courses[0].name) {
              // Courses are already populated
            } else {
              // Need to fetch courses by IDs
              const courseIds = dbPath.courses;
              dbPath.courses = await CourseService.getCoursesByPath({ courses: courseIds });
            }
          } else if (dbPath.course_ids) {
            // Fallback to mock data for courses
            const { ALL_COURSES } = await import("@/lib/mock_data/all_courses");
            dbPath.courses = ALL_COURSES.filter((course) =>
              dbPath.course_ids.includes(course._id)
            );
          }

          addMediaUrlForCourses(dbPath);
        } catch (err) {
          console.log('Error processing courses:', err);
        }

        res.status(200).json({ success: true, data: dbPath });
      } catch (error) {
        console.error('Error fetching path:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "PUT":
      try {
        const updateData = req.body;
        const updatedPath = await PathService.updatePath(slug, updateData);
        res.status(200).json({ success: true, data: updatedPath });
      } catch (error) {
        console.error('Error updating path:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "DELETE":
      try {
        await PathService.deletePath(slug);
        res.status(200).json({ success: true, message: "Path deleted successfully" });
      } catch (error) {
        console.error('Error deleting path:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}
