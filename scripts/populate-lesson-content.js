import connectToDatabase from "../src/lib/mongodb.js";
import Lesson from "../src/lib/models/Lesson.js";

// We reuse the mock catalog as a source of truth for lesson content
import { ALL_COURSES } from "../src/lib/mock_data/all_courses.js";

function parseDurationToMinutes(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const h = value.match(/(\d+)\s*h/);
  const m = value.match(/(\d+)\s*m/);
  const hours = h ? parseInt(h[1], 10) : 0;
  const minutes = m ? parseInt(m[1], 10) : 0;
  return hours * 60 + minutes;
}

function normalizeMockLesson(mock, courseSlug) {
  const type = mock.lesson_type || mock.type || "text-markdown";
  const normalized = {
    slug: mock.slug,
    name: mock.name,
    description: mock.description || "",
    lesson_type: type,
    // content fields by type
    markdown_content: mock.markdown_content,
    quiz_questions: mock.quiz_questions || mock.questions,
    passing_score: mock.passing_score,
    max_attempts: mock.max_attempts,
    video_url: mock.video_url,
    video_duration: mock.video_duration,
    video_provider: mock.video_provider,
    interactive_config: mock.interactive_config,
    sequence: mock.sequence,
    // common
    duration: parseDurationToMinutes(mock.duration),
    courseSlug,
  };
  return normalized;
}

function buildLessonBySlugIndex() {
  const index = new Map();
  const duplicates = new Map();
  for (const course of ALL_COURSES) {
    const lessons = Array.isArray(course.lessons) ? course.lessons : [];
    for (const lesson of lessons) {
      if (!lesson || !lesson.slug) continue;
      const key = lesson.slug;
      if (index.has(key)) {
        duplicates.set(key, (duplicates.get(key) || 1) + 1);
      }
      index.set(key, normalizeMockLesson(lesson, course.slug));
    }
  }
  return { index, duplicates };
}

function buildUpdateFromMock(dbLesson, mockLesson) {
  const updates = {};

  // Fill lesson_type if missing
  if ((!dbLesson.lesson_type || dbLesson.lesson_type === "text") && mockLesson.lesson_type) {
    updates.lesson_type = mockLesson.lesson_type;
  }

  // Fill duration if missing
  if (!dbLesson.duration && mockLesson.duration) {
    updates.duration = mockLesson.duration;
  }

  const type = (updates.lesson_type || dbLesson.lesson_type || "text-markdown").toLowerCase();

  if (["text-markdown", "text"].includes(type)) {
    if (!dbLesson.markdown_content && mockLesson.markdown_content) {
      updates.markdown_content = mockLesson.markdown_content;
    }
  }

  if (type === "quiz") {
    if ((!dbLesson.quiz_questions || dbLesson.quiz_questions.length === 0) && Array.isArray(mockLesson.quiz_questions)) {
      updates.quiz_questions = mockLesson.quiz_questions;
    }
    if (mockLesson.passing_score && !dbLesson.passing_score) {
      updates.passing_score = mockLesson.passing_score;
    }
    if (mockLesson.max_attempts && !dbLesson.max_attempts) {
      updates.max_attempts = mockLesson.max_attempts;
    }
  }

  if (type === "video") {
    if (!dbLesson.video_url && mockLesson.video_url) updates.video_url = mockLesson.video_url;
    if (!dbLesson.video_duration && mockLesson.video_duration) updates.video_duration = mockLesson.video_duration;
    if (!dbLesson.video_provider && mockLesson.video_provider) updates.video_provider = mockLesson.video_provider;
  }

  if (type === "interactive") {
    if (!dbLesson.sequence && mockLesson.sequence) updates.sequence = mockLesson.sequence;
    if (!dbLesson.interactive_config && mockLesson.interactive_config) updates.interactive_config = mockLesson.interactive_config;
  }

  return updates;
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run");

  console.log("Connecting to database...");
  await connectToDatabase();
  console.log("Connected.");

  const { index: lessonBySlug, duplicates } = buildLessonBySlugIndex();
  if (duplicates.size > 0) {
    console.log(`Note: Found ${duplicates.size} duplicate lesson slugs in mock data. Latest entry per slug will be used.`);
  }

  const dbLessons = await Lesson.find({}).lean();
  console.log(`Loaded ${dbLessons.length} lessons from database.`);

  const operations = [];
  let matched = 0;
  let updatedCount = 0;
  let skippedNoMock = 0;
  let skippedNoChanges = 0;

  for (const dbLesson of dbLessons) {
    const mockLesson = lessonBySlug.get(dbLesson.slug);
    if (!mockLesson) {
      skippedNoMock++;
      continue;
    }
    matched++;
    const update = buildUpdateFromMock(dbLesson, mockLesson);
    if (Object.keys(update).length === 0) {
      skippedNoChanges++;
      continue;
    }
    updatedCount++;
    operations.push({
      updateOne: {
        filter: { _id: dbLesson._id },
        update: { $set: update },
      }
    });
  }

  console.log(`Matched lessons: ${matched}`);
  console.log(`To update: ${updatedCount}`);
  console.log(`Skipped (no mock): ${skippedNoMock}`);
  console.log(`Skipped (no changes): ${skippedNoChanges}`);

  if (operations.length === 0) {
    console.log("Nothing to update. Exiting.");
    process.exit(0);
  }

  if (isDryRun) {
    console.log(`Dry run: would execute ${operations.length} updates.`);
    process.exit(0);
  }

  const res = await Lesson.bulkWrite(operations, { ordered: false });
  console.log("Bulk update result:", JSON.stringify(res, null, 2));
  console.log("Done.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
}

export default main;


