import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluatePathCompletion } from '../src/pages/api/progress/paths/rules.js';

const mapFrom = (obj) => new Map(Object.entries(obj));

test('path completion: required only', () => {
  const rule = { required: ['c1','c2'] };
  const states = mapFrom({ c1: 'completed', c2: 'completed' });
  assert.equal(evaluatePathCompletion({ rule, courseStatesById: states }), true);

  const states2 = mapFrom({ c1: 'completed', c2: 'in_progress' });
  assert.equal(evaluatePathCompletion({ rule, courseStatesById: states2 }), false);
});

test('path completion: elective group counts', () => {
  const rule = { electiveGroups: [{ course_ids: ['e1','e2','e3'], must_complete: 2 }] };
  const states = mapFrom({ e1: 'completed', e2: 'completed' });
  assert.equal(evaluatePathCompletion({ rule, courseStatesById: states }), true);

  const states2 = mapFrom({ e1: 'completed' });
  assert.equal(evaluatePathCompletion({ rule, courseStatesById: states2 }), false);
});

test('path completion: mix required and electives', () => {
  const rule = { required: ['r1'], electiveGroups: [{ course_ids: ['e1','e2'], must_complete: 1 }] };
  const states = mapFrom({ r1: 'completed', e2: 'completed' });
  assert.equal(evaluatePathCompletion({ rule, courseStatesById: states }), true);

  const states2 = mapFrom({ r1: 'in_progress', e2: 'completed' });
  assert.equal(evaluatePathCompletion({ rule, courseStatesById: states2 }), false);
});

test('path completion: min courses fallback', () => {
  const rule = { minCourses: 2 };
  const states = mapFrom({ a: 'completed', b: 'completed', c: 'in_progress' });
  assert.equal(evaluatePathCompletion({ rule, courseStatesById: states }), true);

  const states2 = mapFrom({ a: 'completed' });
  assert.equal(evaluatePathCompletion({ rule, courseStatesById: states2 }), false);
});
