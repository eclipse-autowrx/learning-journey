import connectToDatabase from '../src/lib/mongodb.js';
import Path from '../src/lib/models/Path.js';
import Course from '../src/lib/models/Course.js';
import Lesson from '../src/lib/models/Lesson.js';
import CourseProgress from '../src/lib/models/CourseProgress.js';
import QuizQuestion from '../src/lib/models/QuizQuestion.js';

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
    await QuizQuestion.deleteMany({});
    console.log('Existing data cleared!');

    // Migrate Paths
    console.log('Migrating paths...');
    const pathDocuments = PATHS.map(path => ({
      ...path,
      _id: path._id || undefined, // Let MongoDB generate new IDs
      courses: [] // Will be populated after courses are created
    }));
    
    const createdPaths = await Path.insertMany(pathDocuments);
    console.log(`Migrated ${createdPaths.length} paths`);

    // Create a map of old path IDs to new MongoDB IDs
    const pathIdMap = new Map();
    PATHS.forEach((path, index) => {
      pathIdMap.set(path._id, createdPaths[index]._id);
    });

    // Migrate Lessons first (if any exist in the mock data)
    console.log('Looking for lessons to migrate...');
    let lessonCount = 0;
    const lessonIdMap = new Map();
    
    // Check if there are any lessons in the courses
    for (const course of ALL_COURSES) {
      if (course.lessons && course.lessons.length > 0) {
        console.log(`Found ${course.lessons.length} lessons in course: ${course.name}`);
        
        for (const lesson of course.lessons) {
          // Create lesson document with proper structure
          const lessonDoc = {
            name: lesson.name || 'Untitled Lesson',
            slug: lesson.slug || `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            description: lesson.description || '',
            lesson_type: lesson.type || 'text', // Map 'type' to 'lesson_type'
            order: lesson.order || 0,
            duration: lesson.duration || 0,
            content: {
              markdown_content: lesson.markdown_content || '',
              sections: lesson.sections || []
            },
            state: lesson.state || 'released',
            tags: lesson.tags || [],
            // Map old lesson fields to new structure
            video_url: lesson.video_url,
            video_duration: lesson.video_duration,
            video_provider: lesson.video_provider,
            quiz_questions: lesson.quiz_questions || [],
            passing_score: lesson.passing_score,
            max_attempts: lesson.max_attempts,
            interactive_config: lesson.interactive_config,
            assignment_instructions: lesson.assignment_instructions,
            submission_deadline: lesson.submission_deadline,
            max_points: lesson.max_points,
            workshop_materials: lesson.workshop_materials,
            workshop_duration: lesson.workshop_duration,
            prerequisites: lesson.prerequisites || [],
            completion_criteria: lesson.completion_criteria || 'view',
            valid_from: lesson.valid_from,
            valid_to: lesson.valid_to,
            configs: lesson.configs || {},
            extends: lesson.extends || {},
            hiddenContent: lesson.hiddenContent || {},
            meta_title: lesson.meta_title,
            meta_description: lesson.meta_description,
            accessibility_notes: lesson.accessibility_notes,
            view_count: lesson.view_count || 0,
            completion_count: lesson.completion_count || 0,
            average_rating: lesson.average_rating || 0,
            rating_count: lesson.rating_count || 0
          };
          
          const createdLesson = await Lesson.create(lessonDoc);
          lessonCount++;
          
          // Store mapping of old lesson ID to new MongoDB ID
          if (lesson._id) {
            lessonIdMap.set(lesson._id, createdLesson._id);
          }
        }
      }
    }
    
    console.log(`Migrated ${lessonCount} lessons`);

    // Migrate Courses
    console.log('Migrating courses...');
    const courseDocuments = ALL_COURSES.map(course => {
      // Map old course fields to new structure
      const courseDoc = {
        name: course.name || 'Untitled Course',
        slug: course.slug || `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        description: course.description || course.shortDescription || '',
        course_type: course.course_type || 'standard',
        image: course.image,
        thumb: course.thumb,
        tags: course.tags || [],
        category: course.category,
        icon: course.icon || course.top_icon,
        difficulty: course.difficulty || 'beginner',
        duration: course.duration || 0,
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
        state: course.state || 'released',
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
    const courseIdMap = new Map();
    ALL_COURSES.forEach((course, index) => {
      courseIdMap.set(course._id, createdCourses[index]._id);
    });

    // Update paths with course references
    console.log('Updating path-course relationships...');
    for (const path of PATHS) {
      if (path.courses && path.courses.length > 0) {
        const newCourseIds = path.courses.map(courseId => courseIdMap.get(courseId)).filter(Boolean);
        await Path.findByIdAndUpdate(
          pathIdMap.get(path._id),
          { courses: newCourseIds }
        );
      }
    }

    // Update courses with lesson references
    console.log('Updating course-lesson relationships...');
    for (const course of ALL_COURSES) {
      if (course.lessons && course.lessons.length > 0) {
        const newCourseId = courseIdMap.get(course._id);
        const newLessonIds = course.lessons
          .map(lesson => lessonIdMap.get(lesson._id))
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
