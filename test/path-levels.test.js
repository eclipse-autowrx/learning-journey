import test from 'node:test';
import assert from 'node:assert/strict';

import { PATH_LEVELS } from '../src/lib/const.js';

test('PATH_LEVELS should have correct structure and values', () => {
  // Check that PATH_LEVELS is an array
  assert(Array.isArray(PATH_LEVELS), 'PATH_LEVELS should be an array');
  
  // Check that it has exactly 4 levels
  assert.equal(PATH_LEVELS.length, 4, 'PATH_LEVELS should have exactly 4 levels');
  
  // Check each level has the correct structure
  PATH_LEVELS.forEach((level, index) => {
    assert(typeof level.value === 'string', `Level ${index + 1} should have a string value`);
    assert(typeof level.label === 'string', `Level ${index + 1} should have a string label`);
    assert(level.value === String(index + 1), `Level ${index + 1} should have value "${index + 1}"`);
  });
  
  // Check specific values
  assert.equal(PATH_LEVELS[0].value, '1');
  assert.equal(PATH_LEVELS[0].label, 'Level 1 - Beginner');
  
  assert.equal(PATH_LEVELS[1].value, '2');
  assert.equal(PATH_LEVELS[1].label, 'Level 2 - Intermediate');
  
  assert.equal(PATH_LEVELS[2].value, '3');
  assert.equal(PATH_LEVELS[2].label, 'Level 3 - Advanced');
  
  assert.equal(PATH_LEVELS[3].value, '4');
  assert.equal(PATH_LEVELS[3].label, 'Level 4 - Expert');
});

test('PATH_LEVELS should be mutable (JavaScript array behavior)', () => {
  const originalLength = PATH_LEVELS.length;
  const originalFirstLevel = { ...PATH_LEVELS[0] };
  
  // Try to modify (this will affect the original since arrays are mutable in JavaScript)
  PATH_LEVELS.push({ value: '5', label: 'Level 5 - Master' });
  PATH_LEVELS[0].value = '999';
  
  // Check that the modifications took effect (JavaScript array behavior)
  assert.equal(PATH_LEVELS.length, originalLength + 1, 'PATH_LEVELS length should increase when modified');
  assert.equal(PATH_LEVELS[0].value, '999', 'First level value should be modified');
  
  // Restore the original state for other tests
  PATH_LEVELS.pop();
  PATH_LEVELS[0].value = originalFirstLevel.value;
});
