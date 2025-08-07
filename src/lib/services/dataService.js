import connectToDatabase from '../mongodb.js';
import Path from '../models/Path.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import CourseProgress from '../models/CourseProgress.js';
import Collection from '../models/Collection.js';

// Collection Service
export const CollectionService = {
  async getAll() {
    return await Collection.find({}).populate('paths', 'name slug').sort({ created_at: -1 });
  },

  async getById(id) {
    return await Collection.findById(id).populate('paths', 'name slug description');
  },

  async getBySlug(slug) {
    return await Collection.findOne({ slug }).populate('paths', 'name slug description');
  },

  async create(data) {
    const collection = new Collection(data);
    return await collection.save();
  },

  async update(id, data) {
    return await Collection.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    return await Collection.findByIdAndDelete(id);
  },

  async addPath(collectionId, pathId) {
    const collection = await Collection.findById(collectionId);
    if (collection) {
      return await collection.addPath(pathId);
    }
    throw new Error('Collection not found');
  },

  async removePath(collectionId, pathId) {
    const collection = await Collection.findById(collectionId);
    if (collection) {
      return await collection.removePath(pathId);
    }
    throw new Error('Collection not found');
  },

  async reorderPaths(collectionId, newOrder) {
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
  async getAll() {
    return await Path.find({}).populate('courses', 'name slug').sort({ created_at: -1 });
  },

  async getById(id) {
    return await Path.findById(id).populate('courses', 'name slug description');
  },

  async getBySlug(slug) {
    return await Path.findOne({ slug }).populate('courses', 'name slug description');
  },

  async create(data) {
    const path = new Path(data);
    return await path.save();
  },

  async update(id, data) {
    return await Path.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    return await Path.findByIdAndDelete(id);
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
  async getAll() {
    return await Course.find({}).populate('lessons', 'name slug').sort({ created_at: -1 });
  },

  async getById(id) {
    return await Course.findById(id).populate('lessons', 'name slug description');
  },

  async getBySlug(slug) {
    return await Course.findOne({ slug }).populate('lessons', 'name slug description');
  },

  async create(data) {
    const course = new Course(data);
    return await course.save();
  },

  async update(id, data) {
    return await Course.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    return await Course.findByIdAndDelete(id);
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
  }
};

// Lesson Service
export const LessonService = {
  async getAll() {
    return await Lesson.find({}).sort({ created_at: -1 });
  },

  async getById(id) {
    return await Lesson.findById(id);
  },

  async getBySlug(slug) {
    return await Lesson.findOne({ slug });
  },

  async create(data) {
    const lesson = new Lesson(data);
    return await lesson.save();
  },

  async update(id, data) {
    return await Lesson.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    return await Lesson.findByIdAndDelete(id);
  },

  async getByType(lessonType) {
    return await Lesson.find({ lesson_type: lessonType });
  },

  async getWithPrerequisites() {
    return await Lesson.find({ 'prerequisites.0': { $exists: true } });
  },

  async reorderLessons(lessonIds) {
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
