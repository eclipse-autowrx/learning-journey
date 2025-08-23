// Normalize CourseProgress.lessons to a plain object keyed by lesson slug
// - Converts Map -> plain object
// - Re-keys numeric/ObjectId-like keys to the lesson's slug (via lookup)
// - Merges duplicates (prefer completed > in_progress > not_started)
// Usage:
//   node scripts/normalize-course-progress.js --dry-run
//   node scripts/normalize-course-progress.js

import connectToDatabase from '../src/lib/mongodb.js';
import { CourseProgress, Lesson } from '../src/lib/models/index.js';
import { STATE_NOT_STARTED, STATE_IN_PROGRESS, STATE_COMPLETED } from '../src/lib/const.js';

const DRY_RUN = process.argv.includes('--dry-run');

function stateRank(state) {
  switch (state) {
    case STATE_COMPLETED: return 3;
    case STATE_IN_PROGRESS: return 2;
    case STATE_NOT_STARTED: return 1;
    default: return 0;
  }
}

function mergeLessonProgress(existing, incoming) {
  if (!existing) return incoming;
  if (!incoming) return existing;
  const exRank = stateRank(existing.state);
  const inRank = stateRank(incoming.state);
  // Prefer higher state; if equal, prefer newer updated_at/finished_at
  if (inRank > exRank) return incoming;
  if (inRank < exRank) return existing;
  const exTime = new Date(existing.updated_at || existing.finished_at || 0).getTime();
  const inTime = new Date(incoming.updated_at || incoming.finished_at || 0).getTime();
  if (inTime > exTime) return incoming;
  return existing;
}

function isHex24(str) {
  return typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str);
}

async function normalizeOne(progressDoc) {
  const lessons = progressDoc.lessons;
  if (!lessons) return { updated: false };

  // Build a mutable map of key -> progress
  const entries = [];
  if (typeof lessons?.forEach === 'function' && typeof lessons?.get === 'function') {
    // Map-like
    lessons.forEach((v, k) => entries.push([String(k), v]));
  } else if (typeof lessons === 'object') {
    for (const k of Object.keys(lessons)) entries.push([String(k), lessons[k]]);
  } else {
    return { updated: false };
  }

  // Lookup slugs for ObjectId-like keys
  const idKeys = entries.filter(([k]) => isHex24(k)).map(([k]) => k);
  let idToSlug = new Map();
  if (idKeys.length > 0) {
    const lessonDocs = await Lesson.find({ _id: { $in: idKeys } }).select('slug').lean();
    idToSlug = new Map(lessonDocs.map(ld => [ld._id.toString(), ld.slug]));
  }

  // Build new object keyed by slug
  const next = {};
  let changed = false;
  for (const [k, v] of entries) {
    let key = k;
    if (isHex24(k)) {
      const slug = idToSlug.get(k);
      if (slug) {
        key = slug;
        changed = true;
      }
    }
    // Ensure minimal shape
    const normalized = {
      state: [STATE_NOT_STARTED, STATE_IN_PROGRESS, STATE_COMPLETED].includes(v?.state) ? v.state : STATE_NOT_STARTED,
      updated_at: v?.updated_at || v?.finished_at || new Date(),
      started_at: v?.started_at || null,
      finished_at: v?.finished_at || null,
      data: v?.data || {},
      records: Array.isArray(v?.records) ? v.records : []
    };
    if (next[key]) {
      next[key] = mergeLessonProgress(next[key], normalized);
      changed = true;
    } else {
      next[key] = normalized;
    }
    if (key !== k) changed = true;
  }

  if (!changed) return { updated: false };

  if (!DRY_RUN) {
    // Persist as a plain object
    await CourseProgress.updateOne({ _id: progressDoc._id }, { $set: { lessons: next } });
  }

  return { updated: true };
}

async function main() {
  await connectToDatabase();
  const total = await CourseProgress.countDocuments({});
  const batchSize = 200;
  let processed = 0;
  let updated = 0;

  for (let skip = 0; skip < total; skip += batchSize) {
    const docs = await CourseProgress.find({}).select('lessons').skip(skip).limit(batchSize).lean();
    for (const doc of docs) {
      const res = await normalizeOne(doc);
      processed += 1;
      if (res.updated) updated += 1;
      if (processed % 500 === 0) {
        console.log(`Processed ${processed}/${total}... Updated ${updated}`);
      }
    }
  }

  console.log(`Done. Processed: ${processed}, Updated: ${updated}${DRY_RUN ? ' (dry-run)' : ''}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
