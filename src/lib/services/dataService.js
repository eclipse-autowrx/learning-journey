// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT
import connectToDatabase from '../mongodb.js';
import { Path, Course, Lesson, CourseProgress, Collection } from '../models/index.js';

// Utility function to generate a unique slug
async function generateUniqueSlug(name, Model) {
  if (!name) return '';
  
  // Convert name to slug format
  let baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // Check if slug already exists
  let slug = baseSlug;
  let counter = 1;
  
  while (await Model.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

// Collection Service
export const CollectionService = {
  async getAll(filter = {}) {
    await connectToDatabase();
    return await Collection.find(filter)
      .populate({
        path: 'paths',
        select: 'name slug description image thumb tags level path_type state created_at courses course_ids',
        populate: {
          path: 'courses',
          select: 'name slug description state'
        }
      })
      .sort({ created_at: -1 });
  },

  async getById(id) {
    await connectToDatabase();
    return await Collection.findById(id).populate('paths', 'name slug description image thumb tags level path_type state created_at');
  },

  async getBySlug(slug) {
    await connectToDatabase();
    return await Collection.findOne({ slug }).populate('paths', 'name slug description image thumb tags level path_type state created_at');
  },

  async create(data) {
    await connectToDatabase();
    
    // Generate slug if not provided
    if (!data.slug && data.name) {
      data.slug = await generateUniqueSlug(data.name, Collection);
    }
    
    const collection = new Collection(data);
    return await collection.save();
  },

  async update(id, data) {
    await connectToDatabase();
    return await Collection.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    await connectToDatabase();
    return await Collection.findByIdAndDelete(id);
  },

  async addPath(collectionId, pathId) {
    await connectToDatabase();
    const collection = await Collection.findById(collectionId);
    if (collection) {
      return await collection.addPath(pathId);
    }
    throw new Error('Collection not found');
  },

  async removePath(collectionId, pathId) {
    await connectToDatabase();
    const collection = await Collection.findById(collectionId);
    if (collection) {
      return await collection.removePath(pathId);
    }
    throw new Error('Collection not found');
  },

  async reorderPaths(collectionId, newOrder) {
    await connectToDatabase();
    const collection = await Collection.findById(collectionId);
    if (collection) {
      return await collection.reorderPaths(newOrder);
    }
    throw new Error('Collection not found');
  },

  async getByCategory(category) {
    return await Collection.findByCategory(category);
  },

  async getByTags(tags) {
    return await Collection.findByTags(tags);
  },

  async getActive() {
    return await Collection.getActive();
  }
};

// Path Service
export const PathService = {
  async getAll(filter = {}) {
    await connectToDatabase();
    return await Path.find(filter || {})
      .populate('courses', 'name slug description category state total_lessons duration created_at')
      .sort({ created_at: -1 })
      .lean();
  },

  async getById(id) {
    return await Path.findById(id)
      .populate('courses', 'name slug description category state total_lessons duration created_at')
      .lean();
  },

  async getBySlug(slug) {
    await connectToDatabase();
    return await Path.findOne({ slug })
      .populate('courses', 'name slug description category state total_lessons duration created_at')
      .lean();
  },

  async create(data) {
    await connectToDatabase();
    
    // Generate slug if not provided
    if (!data.slug && data.name) {
      data.slug = await generateUniqueSlug(data.name, Path);
    }
    
    const path = new Path(data);
    return await path.save();
  },

  async update(id, data) {
    return await Path.findByIdAndUpdate(id, data, { new: true });
  },

  async updatePath(slug, data) {
    await connectToDatabase();
    return await Path.findOneAndUpdate({ slug }, data, { new: true })
      .populate('courses', 'name slug description category state total_lessons duration created_at')
      .lean();
  },

  async delete(id) {
    return await Path.findByIdAndDelete(id);
  },

  async deletePath(slug) {
    await connectToDatabase();
    return await Path.findOneAndDelete({ slug });
  },

  async addCourse(pathId, courseId) {
    const path = await Path.findById(pathId);
    if (path) {
      return await path.addCourse(courseId);
    }
    throw new Error('Path not found');
  },

  async removeCourse(pathId, courseId) {
    const path = await Path.findById(pathId);
    if (path) {
      return await path.removeCourse(courseId);
    }
    throw new Error('Path not found');
  },

  async reorderCourses(pathId, newOrder) {
    const path = await Path.findById(pathId);
    if (path) {
      return await path.reorderCourses(newOrder);
    }
    throw new Error('Path not found');
  },

  async getByCategory(category) {
    return await Path.findByCategory(category);
  },

  async getByTags(tags) {
    return await Path.findByTags(tags);
  },

  async getActive() {
    return await Path.getActive();
  }
};

// Course Service
export const CourseService = {
  async getAll(filter = {}) {
    await connectToDatabase();
    return await Course.find(filter || {})
      .populate('lessons', 'name slug')
      .sort({ created_at: -1 });
  },

  async getById(id) {
    await connectToDatabase();
    return await Course.findById(id)
      .populate('lessons', 'name slug description lesson_type state duration created_at markdown_content content quiz_questions passing_score max_attempts video_url video_duration video_provider interactive_config sequence');
  },

  async getBySlug(slug) {
    await connectToDatabase();
    const course = await Course.findOne({ slug })
      .populate('lessons', 'name slug description lesson_type state duration created_at markdown_content content quiz_questions passing_score max_attempts video_url video_duration video_provider interactive_config sequence')
      .lean();
    if (course && course.lessons) {
      const lessonIds = course.lessons.map(lesson => lesson._id || lesson);
      const populatedLessons = await Lesson.find({ '_id': { $in: lessonIds } }).lean();
      const lessonMap = new Map(populatedLessons.map(lesson => [lesson._id.toString(), lesson]));
      course.lessons = course.lessons.map(lesson => lessonMap.get((lesson._id || lesson).toString())).filter(Boolean);
    }
    return course;
  },

  async create(data) {
    await connectToDatabase();
    
    // Generate slug if not provided
    if (!data.slug && data.name) {
      data.slug = await generateUniqueSlug(data.name, Course);
    }
    
    const course = new Course(data);
    return await course.save();
  },

  async update(id, data) {
    return await Course.findByIdAndUpdate(id, data, { new: true });
  },

  async updateCourse(slug, data) {
    await connectToDatabase();
    return await Course.findOneAndUpdate({ slug }, data, { new: true })
      .populate('lessons', 'name slug description lesson_type state duration created_at markdown_content content quiz_questions passing_score max_attempts video_url video_duration video_provider interactive_config sequence');
  },

  async delete(id) {
    return await Course.findByIdAndDelete(id);
  },

  async deleteCourse(slug) {
    await connectToDatabase();
    return await Course.findOneAndDelete({ slug });
  },

  async addLesson(courseId, lessonId) {
    const course = await Course.findById(courseId);
    if (course) {
      return await course.addLesson(lessonId);
    }
    throw new Error('Course not found');
  },

  async removeLesson(courseId, lessonId) {
    const course = await Course.findById(courseId);
    if (course) {
      return await course.removeLesson(lessonId);
    }
    throw new Error('Course not found');
  },

  async reorderLessons(courseId, newOrder) {
    const course = await Course.findById(courseId);
    if (course) {
      return await course.reorderLessons(newOrder);
    }
    throw new Error('Course not found');
  },

  async getByCategory(category) {
    return await Course.findByCategory(category);
  },

  async getByTags(tags) {
    return await Course.findByTags(tags);
  },

  async getActive() {
    return await Course.getActive();
  },

  async bulkUpdateState(ids, state) {
    await connectToDatabase();
    return await Course.updateMany(
      { _id: { $in: ids } },
      { $set: { state } }
    );
  },

  async bulkDelete(ids) {
    await connectToDatabase();
    return await Course.deleteMany({ _id: { $in: ids } });
  }
};

// Helper to fetch courses by a list of IDs (preserving order)
CourseService.getCoursesByPath = async function({ courses }) {
  const courseIds = (courses || []).map((c) => (typeof c === 'string' ? c : c?._id?.toString?.() || c?.toString?.()));
  if (courseIds.length === 0) return [];
  await connectToDatabase();
  const docs = await Course.find({ _id: { $in: courseIds } })
    .select('name slug description category state total_lessons duration created_at')
    .lean();
  const byId = new Map(docs.map((d) => [d._id.toString(), d]));
  return courseIds.map((id) => byId.get(id)).filter(Boolean);
};

// Lesson Service
export const LessonService = {
  async getAll() {
    await connectToDatabase();
    return await Lesson.find({}).sort({ created_at: -1 });
  },

  async getById(id) {
    await connectToDatabase();
    return await Lesson.findById(id).lean();
  },

  async getBySlug(slug) {
    await connectToDatabase();
    return await Lesson.findOne({ slug });
  },

  async create(data) {
    await connectToDatabase();
    
    // Generate slug if not provided
    if (!data.slug && data.name) {
      data.slug = await generateUniqueSlug(data.name, Lesson);
    }
    
    const lesson = new Lesson(data);
    return await lesson.save();
  },

  async update(id, data) {
    await connectToDatabase();
    return await Lesson.findByIdAndUpdate(id, data, { new: true });
  },

  async updateLesson(slug, data) {
    await connectToDatabase();
    return await Lesson.findOneAndUpdate({ slug }, data, { new: true });
  },

  async delete(id) {
    await connectToDatabase();
    return await Lesson.findByIdAndDelete(id);
  },

  async deleteLesson(slug) {
    await connectToDatabase();
    return await Lesson.findOneAndDelete({ slug });
  },

  async getByType(lessonType) {
    await connectToDatabase();
    return await Lesson.find({ lesson_type: lessonType });
  },

  async getWithPrerequisites() {
    await connectToDatabase();
    return await Lesson.find({ 'prerequisites.0': { $exists: true } });
  },

  async reorderLessons(lessonIds) {
    await connectToDatabase();
    const updates = lessonIds.map((id, index) => 
      Lesson.findByIdAndUpdate(id, { order: index + 1 })
    );
    return await Promise.all(updates);
  }
};



// Course Progress Service
export const CourseProgressService = {
  async getByUser(userId) {
    return await CourseProgress.find({ user_id: userId }).populate('course_id', 'name slug');
  },

  async getByCourse(courseId) {
    return await CourseProgress.find({ course_id: courseId });
  },

  async getByUserAndCourse(userId, courseId) {
    return await CourseProgress.findOne({ user_id: userId, course_id: courseId });
  },

  async create(data) {
    const progress = new CourseProgress(data);
    return await progress.save();
  },

  async update(id, data) {
    return await CourseProgress.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    return await CourseProgress.findByIdAndDelete(id);
  },

  async updateProgress(userId, courseId, lessonId, status) {
    let progress = await CourseProgress.findOne({ user_id: userId, course_id: courseId });
    
    if (!progress) {
      progress = new CourseProgress({
        user_id: userId,
        course_id: courseId,
        lessons: []
      });
    }

    const lessonIndex = progress.lessons.findIndex(l => l.lesson_id.toString() === lessonId);
    
    if (lessonIndex >= 0) {
      progress.lessons[lessonIndex].status = status;
      progress.lessons[lessonIndex].completed_at = status === 'completed' ? new Date() : null;
    } else {
      progress.lessons.push({
        lesson_id: lessonId,
        status: status,
        completed_at: status === 'completed' ? new Date() : null
      });
    }

    return await progress.save();
  }
};

// Mock Data Service (fallback)
export const MockDataService = {
  async getPaths() {
    // Import mock data if needed
    const { PATHS } = await import('../mock_data/paths.js');
    return PATHS;
  },

  async getCourses() {
    const { ALL_COURSES } = await import('../mock_data/all_courses.js');
    return ALL_COURSES;
  },

  async getCollections() {
    // Return empty array for collections as they're new
    return [];
  }
};
