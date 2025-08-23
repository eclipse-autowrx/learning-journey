// Testable handler for course-level progress with DI matching live logic
export async function handleCourseProgress({ method, user_id, course_id, body }, res, deps) {
  const {
    connectToDatabase,
    CourseProgress,
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
        if (!dbProgress) {
          return res.status(404).json({ success: false, error: 'Progress not found' });
        }
        return res.status(200).json({ success: true, data: dbProgress });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    case 'PUT':
      try {
        await connectToDatabase();
        const now = new Date();
        const allowed = new Set([STATE_NOT_STARTED, STATE_IN_PROGRESS, STATE_COMPLETED]);
        const existing = await CourseProgress.findOne({ user_id, course_id });
        const setFields = {};
        const nextState = body?.state;
        const nextData = body?.data;

        if (nextState && allowed.has(nextState)) {
          setFields['state'] = nextState;
          if (nextState === STATE_IN_PROGRESS && (!existing || existing.state === STATE_NOT_STARTED)) {
            setFields['started_at'] = now;
          }
          if (nextState === STATE_COMPLETED) {
            if (!existing || !existing.started_at) setFields['started_at'] = setFields['started_at'] || now;
            if (!existing || !existing.finished_at) setFields['finished_at'] = now;
          }
        }
        if (nextData && typeof nextData === 'object') setFields['data'] = nextData;

        const updated = await CourseProgress.findOneAndUpdate(
          { user_id, course_id },
          { $set: setFields, $setOnInsert: { user_id, course_id } },
          { new: true, upsert: true }
        );
        return res.status(200).json({ success: true, data: updated });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
