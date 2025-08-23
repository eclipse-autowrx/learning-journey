import test from 'node:test';
import assert from 'node:assert/strict';
import { handleLessonProgress } from '../src/pages/api/progress/courses/handlers/lesson.js';

function createResCollector() {
  let statusCode = 200;
  let payload = null;
  return {
    status(code) { statusCode = code; return this; },
    json(obj) { payload = obj; return this; },
    get() { return { statusCode, payload }; }
  };
}

test('PUT lesson normal flow to completed returns updated doc', async () => {
  const calls = { findOne: [], findById: [], update: [] };
  const fakeProgressBefore = {
    user_id: 'u1',
    course_id: '0123456789abcdef01234567',
    state: 'not_started',
    lessons: {}
  };
  const fakeProgressAfter = { ...fakeProgressBefore, state: 'completed' };

  const deps = {
    connectToDatabase: async () => {},
    CourseProgress: {
      findOne: async (q) => { calls.findOne.push(q); return JSON.parse(JSON.stringify(fakeProgressBefore)); },
      findOneAndUpdate: async (q, upd, opts) => { calls.update.push({ q, upd, opts }); return fakeProgressAfter; }
    },
    Course: { findById: async (id) => ({ lessons: ['l1','l2'].map((_,i)=>({ toString(){return `id${i}`}})) }) },
    Lesson: { find: async () => ([{ slug: 'a' }, { slug: 'b' }]) },
    STATE_NOT_STARTED: 'not_started',
    STATE_IN_PROGRESS: 'in_progress',
    STATE_COMPLETED: 'completed'
  };

  const req = {
    method: 'PUT',
    user_id: 'u1',
    course_id: '0123456789abcdef01234567',
    lesson_slug: 'a',
    body: { state: 'completed', record: { action: 'finish_lesson' } }
  };
  const res = createResCollector();
  await handleLessonProgress(req, res, deps);
  const { statusCode, payload } = res.get();
  assert.equal(statusCode, 200);
  assert.equal(payload.success, true);
});

test('PUT lesson regression blocked without reopen_lesson', async () => {
  const deps = {
    connectToDatabase: async () => {},
    CourseProgress: {
      findOne: async () => ({ state: 'in_progress', lessons: { a: { state: 'completed', records: [] } } }),
      findOneAndUpdate: async () => ({}),
    },
    Course: { findById: async () => ({ lessons: [] }) },
    Lesson: { find: async () => ([])} ,
    STATE_NOT_STARTED: 'not_started',
    STATE_IN_PROGRESS: 'in_progress',
    STATE_COMPLETED: 'completed'
  };
  const res = createResCollector();
  await handleLessonProgress({ method:'PUT', user_id:'u', course_id:'0123456789abcdef01234567', lesson_slug:'a', body:{ state:'in_progress' } }, res, deps);
  const { statusCode } = res.get();
  assert.equal(statusCode, 400);
});

test('GET lesson 404 when missing', async () => {
  const deps = {
    connectToDatabase: async () => {},
    CourseProgress: { findOne: async () => ({ lessons: {} }) },
    Course: {}, Lesson: {},
    STATE_NOT_STARTED: 'not_started',
    STATE_IN_PROGRESS: 'in_progress',
    STATE_COMPLETED: 'completed'
  };
  const res = createResCollector();
  await handleLessonProgress({ method:'GET', user_id:'u', course_id:'0123456789abcdef01234567', lesson_slug:'x' }, res, deps);
  const { statusCode } = res.get();
  assert.equal(statusCode, 404);
});
