// Lightweight, framework-agnostic helpers for course/lesson progress logic
// Keep state labels in sync with lib/const.js

export const STATE_NOT_STARTED = 'not_started';
export const STATE_IN_PROGRESS = 'in_progress';
export const STATE_COMPLETED = 'completed';

/**
 * Build the next lesson progress snapshot given current snapshot and desired state.
 * Does not perform persistence. Returns a new object.
 */
export function buildNextLessonProgress(currentLesson, nextState, record = {}, now = new Date()) {
  const prev = currentLesson || {
    state: STATE_NOT_STARTED,
    started_at: null,
    finished_at: null,
    data: {},
    records: []
  };

  const next = { ...prev };
  next.state = nextState;
  next.updated_at = now;

  const baseRecord = {
    at: now,
    action: record?.action,
    refId: record?.refId || '',
    refType: record?.refType || '',
    data: record?.data || {}
  };

  switch (nextState) {
    case STATE_NOT_STARTED:
      next.started_at = null;
      next.finished_at = null;
      next.records = [...(next.records || []), { ...baseRecord, action: baseRecord.action || 'reset_lesson' }];
      break;
    case STATE_IN_PROGRESS:
      if (!next.started_at) next.started_at = now;
      next.finished_at = null;
      next.records = [...(next.records || []), { ...baseRecord, action: baseRecord.action || 'start_lesson' }];
      break;
    case STATE_COMPLETED:
      if (!next.started_at) next.started_at = now;
      next.finished_at = now;
      next.records = [...(next.records || []), { ...baseRecord, action: baseRecord.action || 'finish_lesson' }];
      break;
    default:
      break;
  }

  return next;
}

/**
 * Compute whether all required lessons are completed given existing lessons
 * and a pending update to one lesson.
 * - existingLessons can be a plain object or a Map
 */
export function isAllRequiredLessonsCompleted(requiredSlugs, existingLessons, nextSlug, nextLesson) {
  if (!Array.isArray(requiredSlugs) || requiredSlugs.length === 0) return false;

  const view = new Map();
  if (existingLessons) {
    if (typeof existingLessons.forEach === 'function' && typeof existingLessons.get === 'function') {
      existingLessons.forEach((v, k) => view.set(k, v));
    } else if (typeof existingLessons === 'object') {
      Object.keys(existingLessons).forEach(k => view.set(k, existingLessons[k]));
    }
  }
  if (nextSlug) view.set(nextSlug, nextLesson);

  return requiredSlugs.every(slug => {
    const lp = view.get(slug);
    return lp && lp.state === STATE_COMPLETED;
  });
}

/**
 * Determine next course state based on activity/logical transition.
 */
export function nextCourseStateAfterActivity(currentCourseState, activityState) {
  const current = currentCourseState || STATE_NOT_STARTED;
  if ([STATE_IN_PROGRESS, STATE_COMPLETED].includes(activityState)) {
    if (current === STATE_NOT_STARTED) return STATE_IN_PROGRESS;
  }
  return current;
}
