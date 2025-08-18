// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from '../src/lib/mongodb.js';
import Path from '../src/lib/models/Path.js';
import Course from '../src/lib/models/Course.js';
import Lesson from '../src/lib/models/Lesson.js';
import CourseProgress from '../src/lib/models/CourseProgress.js';


// Import mock data
import { PATHS } from '../src/lib/mock_data/paths.js';
import { ALL_COURSES } from '../src/lib/mock_data/all_courses.js';

async function migrateData() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to database successfully!');

    // Clear existing data
    console.log('Clearing existing data...');
    await Path.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await CourseProgress.deleteMany({});

    console.log('Existing data cleared!');

    // Migrate Paths
    console.log('Migrating paths...');
    const pathDocuments = PATHS.map(path => ({
      // do not carry over mock _id to avoid invalid ObjectId errors
      name: path.name,
      slug: path.slug,
      description: path.description,
      path_type: path.path_type,
      level: path.level,
      time_to_complete: path.time_to_complete,
      background_img: path.background_img,
      image: path.image,
      thumb: path.thumb,
      category: path.category,
      tags: path.tags,
      valid_from: path.valid_from,
      valid_to: path.valid_to,
      state: path.state,
      configs: path.configs,
      extends: path.extends,
      hiddenContent: path.hiddenContent,
      maps: path.maps,
      icon_set: path.icon_set,
      created_by: path.created_by,
      num_learners: path.num_learners,
      num_certified_learners: path.num_certified_learners,
      key_points: path.key_points,
      courses: [] // populate later
    }));
    
    const createdPaths = await Path.insertMany(pathDocuments);
    console.log(`Migrated ${createdPaths.length} paths`);

    // Create a map of old path IDs to new MongoDB IDs
    const pathSlugToId = new Map();
    PATHS.forEach((path, index) => {
      pathSlugToId.set(path.slug, createdPaths[index]._id);
    });

    // Migrate Lessons first (if any exist in the mock data)
    console.log('Looking for lessons to migrate...');
    let lessonCount = 0;
    const lessonIdMap = new Map(); // by original _id if present
    const lessonSlugToId = new Map();

    function parseDurationToMinutes(val) {
      if (typeof val === 'number' && Number.isFinite(val)) return val;
      if (typeof val !== 'string') return 0;
      const h = val.match(/(\d+)h/);
      const m = val.match(/(\d+)m/);
      const hours = h ? parseInt(h[1], 10) : 0;
      const minutes = m ? parseInt(m[1], 10) : 0;
      return hours * 60 + minutes;
    }
    
    // Check if there are any lessons in the courses
    for (const course of ALL_COURSES) {
      if (course.lessons && course.lessons.length > 0) {
        console.log(`Found ${course.lessons.length} lessons in course: ${course.name}`);
        
        for (const lesson of course.lessons) {
          // Create lesson document with proper structure
          // Ensure unique slug per lesson
          let baseSlug = lesson.slug || lesson.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `lesson-${Date.now()}`;
          let uniqueSlug = baseSlug;
          let counter = 1;
          while (await Lesson.findOne({ slug: uniqueSlug })) {
            uniqueSlug = `${baseSlug}-${counter++}`;
          }

          const lessonDoc = {
            name: lesson.name || 'Untitled Lesson',
            slug: uniqueSlug,
            description: lesson.description || '',
            lesson_type: lesson.lesson_type || lesson.type || 'text-markdown',
            order: lesson.order || 0,
            duration: parseDurationToMinutes(lesson.duration),
            markdown_content: lesson.markdown_content || '',
            state: lesson.state || 'released',
            tags: lesson.tags || [],
            // Map old lesson fields to new structure
            video_url: lesson.video_url,
            video_duration: lesson.video_duration,
            video_provider: lesson.video_provider,
            quiz_questions: lesson.quiz_questions || lesson.questions || [],
            passing_score: lesson.passing_score,
            max_attempts: lesson.max_attempts,
            interactive_config: lesson.interactive_config,
            sequence: lesson.sequence,
            assignment_instructions: lesson.assignment_instructions,
            submission_deadline: lesson.submission_deadline,
            max_points: lesson.max_points,
            workshop_materials: lesson.workshop_materials,
            workshop_duration: lesson.workshop_duration,
            prerequisites: lesson.prerequisites || [],
            completion_criteria: lesson.completion_criteria || 'view',
            // removed: valid_from, valid_to
            configs: lesson.configs || {},
            extends: lesson.extends || {},
            hiddenContent: lesson.hiddenContent || {},
            // removed: meta_title, meta_description, accessibility_notes
            // removed: view_count, completion_count, average_rating, rating_count
          };
          
          const createdLesson = await Lesson.create(lessonDoc);
          lessonCount++;
          
          // Store mapping of old lesson ID to new MongoDB ID
          if (lesson._id) {
            lessonIdMap.set(lesson._id, createdLesson._id);
          }
          lessonSlugToId.set(lessonDoc.slug, createdLesson._id);
        }
      }
    }
    
    console.log(`Migrated ${lessonCount} lessons`);

    // Migrate Courses
    console.log('Migrating courses...');
    function parseCourseDuration(val) {
      if (typeof val === 'number' && Number.isFinite(val)) return val;
      if (typeof val !== 'string') return 0;
      const h = val.match(/(\d+)\s*h/);
      const m = val.match(/(\d+)\s*m/);
      const hours = h ? parseInt(h[1], 10) : 0;
      const minutes = m ? parseInt(m[1], 10) : 0;
      return hours + (minutes > 0 ? 1 : 0); // store rough hours to satisfy Number
    }

    const usedCourseSlugs = new Set();
    const toSlug = (s) => (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    const courseDocuments = ALL_COURSES.map(course => {
      // Map old course fields to new structure
      let baseSlug = course.slug || toSlug(course.name) || `course-${Date.now()}`;
      let uniqueSlug = baseSlug;
      let i = 1;
      while (usedCourseSlugs.has(uniqueSlug)) uniqueSlug = `${baseSlug}-${i++}`;
      usedCourseSlugs.add(uniqueSlug);

      const courseDoc = {
        name: course.name || 'Untitled Course',
        slug: uniqueSlug,
        description: course.description || course.shortDescription || '',
        course_type: course.course_type || 'standard',
        image: course.image,
        thumb: course.thumb,
        tags: course.tags || [],
        category: course.category,
        icon: course.icon || course.top_icon,
        difficulty: course.difficulty || 'beginner',
        duration: parseCourseDuration(course.duration),
        total_lessons: 0, // Will be calculated
        total_duration: 0, // Will be calculated
        lessons: [], // Will be populated after lessons are created
        lesson_order: [], // Will be populated after lessons are created
        sections: course.sections || [],
        prerequisites: course.prerequisites || [],
        required_skills: course.required_skills || [],
        learning_objectives: course.learning_objectives || [],
        skills_covered: course.skills_covered || [],
        completion_criteria: course.completion_criteria || 'all_lessons',
        minimum_completion_percentage: course.minimum_completion_percentage || 100,
        offers_certificate: course.offers_certificate || false,
        certificate_template: course.certificate_template,
        certificate_validity_days: course.certificate_validity_days,
        is_free: course.is_free !== undefined ? course.is_free : true,
        price: course.price || 0,
        currency: course.currency || 'USD',
        enrollment_limit: course.enrollment_limit,
        enrollment_deadline: course.enrollment_deadline,
        valid_from: course.valid_from,
        valid_to: course.valid_to,
        state: (['draft','reviewed','released','archived'].includes(course.state)) ? course.state : 'released',
        configs: course.configs || {},
        extends: course.extends || {},
        hiddenContent: course.hiddenContent || {},
        meta_title: course.meta_title,
        meta_description: course.meta_description,
        accessibility_notes: course.accessibility_notes,
        enrollment_count: course.enrollment_count || course.num_learners || 0,
        completion_count: course.completion_count || course.num_certified_learners || 0,
        average_rating: course.average_rating || 0,
        rating_count: course.rating_count || 0,
        average_completion_time: course.average_completion_time
      };
      
      return courseDoc;
    });
    
    const createdCourses = await Course.insertMany(courseDocuments);
    console.log(`Migrated ${createdCourses.length} courses`);

    // Create a map of old course IDs to new MongoDB IDs
    const courseIdByOldId = new Map();
    const courseIdBySlug = new Map();
    ALL_COURSES.forEach((course, index) => {
      if (course._id) courseIdByOldId.set(course._id, createdCourses[index]._id);
      courseIdBySlug.set(course.slug, createdCourses[index]._id);
    });

    // Update paths with course references
    console.log('Updating path-course relationships...');
    for (const path of PATHS) {
      const pathId = pathSlugToId.get(path.slug);
      if (!pathId) continue;
      const refs = path.courses || path.course_ids || [];
      if (refs.length > 0) {
        const newCourseIds = refs.map(ref => courseIdByOldId.get(ref) || courseIdBySlug.get(ref)).filter(Boolean);
        await Path.findByIdAndUpdate(pathId, { courses: newCourseIds });
      }
    }

    // Update courses with lesson references
    console.log('Updating course-lesson relationships...');
    for (const course of ALL_COURSES) {
      if (course.lessons && course.lessons.length > 0) {
        const newCourseId = courseIdByOldId.get(course._id) || courseIdBySlug.get(course.slug);
        const newLessonIds = course.lessons
          .map(lesson => (lessonSlugToId.get(lesson.slug) || (lesson._id && lessonIdMap.get(lesson._id))))
          .filter(Boolean);
        
        if (newLessonIds.length > 0) {
          await Course.findByIdAndUpdate(
            newCourseId,
            { 
              lessons: newLessonIds,
              lesson_order: newLessonIds,
              total_lessons: newLessonIds.length
            }
          );
        }
      }
    }

    console.log('Data migration completed successfully!');
    console.log(`Summary:`);
    console.log(`- Paths: ${createdPaths.length}`);
    console.log(`- Courses: ${createdCourses.length}`);
    console.log(`- Lessons: ${lessonCount}`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData().then(() => {
    console.log('Migration script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
}

export default migrateData;
