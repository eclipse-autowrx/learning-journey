// Utilities for path-level progress computation
import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";
import { Path, PathProgress, CourseProgress } from "@/lib/models/index.js";
import { STATE_NOT_STARTED, STATE_IN_PROGRESS, STATE_COMPLETED } from "@/lib/const";
import { evaluatePathCompletion } from "./rules.js";

export const getPathRuleConfig = (path) => {
  // Prioritize top-level required_course_ids over extends configuration
  const required = Array.isArray(path?.required_course_ids) 
    ? path.required_course_ids 
    : Array.isArray(path?.extends?.required_course_ids) 
      ? path.extends.required_course_ids 
      : [];
  const electiveGroups = Array.isArray(path?.extends?.elective_groups) ? path.extends.elective_groups : [];
  const minCourses = typeof path?.extends?.min_courses_to_complete === 'number' ? path.extends.min_courses_to_complete : undefined;
  return { required, electiveGroups, minCourses };
};


export const upsertPathProgressForUser = async ({ user_id, path_id }) => {
  await connectToDatabase();
  const path = await Path.findById(path_id).select('course_ids extends required_course_ids').lean();
  if (!path) return null;
  const rule = getPathRuleConfig(path);

  // Build course state map from CourseProgress
  const courseIds = (path.course_ids || (path.courses || []).map(c => String(c))).map(String);
  const progresses = await CourseProgress.find({ user_id, course_id: { $in: courseIds } }).lean();
  const courseStatesById = new Map(courseIds.map(id => [id, STATE_NOT_STARTED]));
  const courseFinishedById = new Map();
  progresses.forEach(p => {
    const k = String(p.course_id);
    courseStatesById.set(k, p.state);
    if (p.finished_at) courseFinishedById.set(k, p.finished_at);
  });

  // Prepare courses object for persistence
  const coursesObj = {};
  courseStatesById.forEach((state, id) => {
    coursesObj[id] = { state, finished_at: courseFinishedById.get(id) };
  });

  let state = STATE_NOT_STARTED;
  // state becomes in_progress if any course completed or in_progress
  for (const s of courseStatesById.values()) {
    if (s === STATE_IN_PROGRESS || s === STATE_COMPLETED) { state = STATE_IN_PROGRESS; break; }
  }

  const completed = evaluatePathCompletion({ rule, courseStatesById });
  if (completed) state = STATE_COMPLETED;

  const now = new Date();
  const existing = await PathProgress.findOne({ user_id, path_id }).lean();
  const setFields = { state, courses: coursesObj };
  if (state === STATE_IN_PROGRESS) setFields['started_at'] = existing?.started_at || now;
  if (state === STATE_COMPLETED) setFields['finished_at'] = existing?.finished_at || now;

  const updated = await PathProgress.findOneAndUpdate(
    { user_id, path_id },
    { $set: setFields, $setOnInsert: { user_id, path_id } },
    { new: true, upsert: true }
  );
  return updated;
};

// Fan-out: update all PathProgress docs for paths containing the specified course
export const updatePathsForCourse = async ({ user_id, course_id }) => {
  await connectToDatabase();
  const oid = mongoose.Types.ObjectId.isValid(course_id) ? new mongoose.Types.ObjectId(course_id) : null;
  const paths = await Path.find({
    $or: [
      { course_ids: String(course_id) },
      ...(oid ? [{ courses: { $in: [oid] } }] : [])
    ]
  }).select('_id course_ids courses extends').lean();

  const results = [];
  for (const p of paths) {
    const updated = await upsertPathProgressForUser({ user_id, path_id: p._id });
    if (updated) results.push(updated);
  }
  return results;
};
