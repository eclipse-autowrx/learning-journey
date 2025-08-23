import { STATE_COMPLETED } from "../../../../lib/const.js";

export const evaluatePathCompletion = ({ rule, courseStatesById }) => {
  const { required, electiveGroups, minCourses } = rule || {};
  // All required must be completed
  if (Array.isArray(required) && required.length > 0) {
    const allReqDone = required.every(id => courseStatesById.get(id) === STATE_COMPLETED);
    if (!allReqDone) return false;
  }
  // Each elective group must meet must_complete
  if (Array.isArray(electiveGroups) && electiveGroups.length > 0) {
    const allGroupsPass = electiveGroups.every(group => {
      const courseIds = Array.isArray(group?.course_ids) ? group.course_ids : [];
      const must = Math.max(0, Number(group?.must_complete || 0));
      if (courseIds.length === 0 || must === 0) return true;
      const completedCount = courseIds.filter(id => courseStatesById.get(id) === STATE_COMPLETED).length;
      return completedCount >= must;
    });
    if (!allGroupsPass) return false;
  }
  // Optional min courses fallback
  if (typeof minCourses === 'number' && minCourses > 0) {
    let count = 0;
    courseStatesById.forEach(v => { if (v === STATE_COMPLETED) count++; });
    if (count < minCourses) return false;
  }
  return true;
};
