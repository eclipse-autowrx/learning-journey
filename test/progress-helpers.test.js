import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildNextLessonProgress,
  isAllRequiredLessonsCompleted,
  nextCourseStateAfterActivity
} from '../src/pages/api/progress/courses/helpers.js';

// Fix test time for determinism
const T0 = new Date('2024-01-01T00:00:00.000Z');
const T1 = new Date('2024-01-02T00:00:00.000Z');

test('buildNextLessonProgress transitions', () => {
  const next = buildNextLessonProgress(undefined, 'in_progress', { action: 'start_lesson' }, T0);
  assert.equal(next.state, 'in_progress');
  assert.equal(next.started_at?.toISOString(), T0.toISOString());
  assert.equal(next.records.at(-1).action, 'start_lesson');

  const done = buildNextLessonProgress(next, 'completed', { action: 'finish_lesson' }, T1);
  assert.equal(done.state, 'completed');
  assert.equal(done.finished_at?.toISOString(), T1.toISOString());
  assert.equal(done.records.at(-1).action, 'finish_lesson');
});

test('isAllRequiredLessonsCompleted true with pending next', () => {
  const existing = {
    a: { state: 'completed' },
    b: { state: 'in_progress' }
  };
  assert.equal(isAllRequiredLessonsCompleted(['a','b'], existing, 'b', { state: 'completed' }), true);
});

test('isAllRequiredLessonsCompleted false when any missing or not completed', () => {
  const existing = { a: { state: 'completed' } };
  assert.equal(isAllRequiredLessonsCompleted(['a','b'], existing, undefined, undefined), false);
});

test('nextCourseStateAfterActivity only bumps from not_started', () => {
  assert.equal(nextCourseStateAfterActivity('not_started', 'in_progress'), 'in_progress');
  assert.equal(nextCourseStateAfterActivity('in_progress', 'completed'), 'in_progress');
  assert.equal(nextCourseStateAfterActivity('completed', 'completed'), 'completed');
});
