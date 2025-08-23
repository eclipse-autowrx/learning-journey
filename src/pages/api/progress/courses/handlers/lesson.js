// Testable handler for lesson progress endpoints with dependency injection
import { buildNextLessonProgress, isAllRequiredLessonsCompleted, nextCourseStateAfterActivity } from "../helpers.js";

export async function handleLessonProgress({ method, user_id, course_id, lesson_slug, body }, res, deps) {
  const {
    connectToDatabase,
    CourseProgress,
    Course,
    Lesson,
    STATE_NOT_STARTED,
    STATE_IN_PROGRESS,
    STATE_COMPLETED
  } = deps;

  if (!user_id) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  if (!course_id || !course_id.match?.(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, error: "Invalid course ID format" });
  }

  switch (method) {
    case 'GET':
      try {
        await connectToDatabase();
        const dbProgress = await CourseProgress.findOne({ user_id, course_id });
        if (!dbProgress || !dbProgress.lessons) {
          return res.status(404).json({ success: false, error: "Lesson progress not found" });
        }
        const lessons = dbProgress.lessons;
        const lessonProgress = lessons[lesson_slug] || (typeof lessons.get === 'function' ? lessons.get(lesson_slug) : undefined);
        if (!lessonProgress) {
          return res.status(404).json({ success: false, error: "Lesson progress not found" });
        }
        return res.status(200).json({ success: true, data: lessonProgress });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    case 'PUT':
      try {
        const updateData = body;
        if (!updateData || !updateData.state) {
          return res.status(400).json({ success: false, error: "Invalid request body, incorrect lesson state" });
        }

        await connectToDatabase();

        const existingProgress = await CourseProgress.findOne({ user_id, course_id });
        const now = new Date();
        const currentLesson = (existingProgress && existingProgress.lessons && (existingProgress.lessons[lesson_slug] || (typeof existingProgress.lessons.get === 'function' ? existingProgress.lessons.get(lesson_slug) : undefined))) || {
          state: STATE_NOT_STARTED,
          started_at: null,
          finished_at: null,
          data: {},
          records: []
        };

        const nextLesson = buildNextLessonProgress(currentLesson, updateData.state, updateData.record, now);

        if (currentLesson.state === STATE_COMPLETED && updateData.state === STATE_IN_PROGRESS) {
          const action = updateData.record?.action || '';
          if (action.toLowerCase() !== 'reopen_lesson') {
            return res.status(400).json({ success: false, error: "Cannot regress a completed lesson without 'reopen_lesson' action" });
          }
        }

        const setFields = {};
        setFields[`lessons.${lesson_slug}`] = nextLesson;

        let nextCourseState = nextCourseStateAfterActivity(existingProgress?.state, updateData.state);
        let setStartedAt;
        if (existingProgress?.state === STATE_NOT_STARTED && [STATE_IN_PROGRESS, STATE_COMPLETED].includes(updateData.state)) {
          setStartedAt = now;
        }

        try {
          const course = await Course.findById(course_id);
          if (course && Array.isArray(course.lessons) && course.lessons.length > 0) {
            const lessonsDocs = await Lesson.find({ _id: { $in: course.lessons } });
            const requiredSlugs = lessonsDocs.map(l => l.slug).filter(Boolean);

            const allCompleted = isAllRequiredLessonsCompleted(requiredSlugs, existingProgress?.lessons, lesson_slug, nextLesson);
            if (allCompleted) {
              nextCourseState = STATE_COMPLETED;
              setFields['finished_at'] = now;
            }
          }
        } catch (_) { }

        if (nextCourseState !== (existingProgress?.state || STATE_NOT_STARTED)) {
          setFields['state'] = nextCourseState;
        }
        if (setStartedAt) {
          setFields['started_at'] = setStartedAt;
        }

        const updatedProgress = await CourseProgress.findOneAndUpdate(
          { user_id, course_id },
          { $set: setFields, $setOnInsert: { user_id, course_id } },
          { new: true, upsert: true }
        );

        if (!updatedProgress) {
          return res.status(404).json({ success: false, error: "Lesson progress not found" });
        }
        return res.status(200).json({ success: true, data: updatedProgress });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    default:
      return res.status(405).json({ success: false, error: "Method not allowed" });
  }
}
