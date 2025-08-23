// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

// Import all models to ensure they are registered with Mongoose
import './Collection.js';
import './Course.js';
import './Lesson.js';
import './Path.js';
import './CourseProgress.js';
import './PathProgress.js';

// Export models for convenience
export { default as Collection } from './Collection.js';
export { default as Course } from './Course.js';
export { default as Lesson } from './Lesson.js';
export { default as Path } from './Path.js';
export { default as CourseProgress } from './CourseProgress.js'; 
export { default as PathProgress } from './PathProgress.js';