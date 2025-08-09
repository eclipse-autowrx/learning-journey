// Import all models to ensure they are registered with Mongoose
import './Collection.js';
import './Course.js';
import './Lesson.js';
import './Path.js';
import './CourseProgress.js';

// Export models for convenience
export { default as Collection } from './Collection.js';
export { default as Course } from './Course.js';
export { default as Lesson } from './Lesson.js';
export { default as Path } from './Path.js';
export { default as CourseProgress } from './CourseProgress.js'; 