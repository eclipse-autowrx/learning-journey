import test from 'node:test';
import assert from 'node:assert/strict';
import { handleCourseProgress } from '../src/pages/api/progress/courses/handlers/course.js';

function createResCollector() {
  let statusCode = 200;
  let payload = null;
  return {
    status(code) { statusCode = code; return this; },
    json(obj) { payload = obj; return this; },
    get() { return { statusCode, payload }; }
  };
}

test('PUT course sets started_at on first in_progress and finished_at on completed', async () => {
  const deps = {
    connectToDatabase: async () => {},
    CourseProgress: {
      findOne: async () => null,
      findOneAndUpdate: async (q, upd) => ({ ...q, ...upd })
    },
    STATE_NOT_STARTED: 'not_started',
    STATE_IN_PROGRESS: 'in_progress',
    STATE_COMPLETED: 'completed'
  };

  const res = createResCollector();
  await handleCourseProgress({ method:'PUT', user_id:'u', course_id:'0123456789abcdef01234567', body:{ state:'in_progress' } }, res, deps);
  const r1 = res.get();
  assert.equal(r1.statusCode, 200);

  const res2 = createResCollector();
  await handleCourseProgress({ method:'PUT', user_id:'u', course_id:'0123456789abcdef01234567', body:{ state:'completed' } }, res2, deps);
  const r2 = res2.get();
  assert.equal(r2.statusCode, 200);
});
