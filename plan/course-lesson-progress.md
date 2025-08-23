# Course & Lesson Progress Plan

## Goals
- Stabilize and formalize course/lesson progress lifecycle
- Ensure correctness, idempotency, and auditability
- Provide clear APIs used by frontend and automation

## Current State (summary)
- Model: `CourseProgress` (per user+course). Per-lesson progress stored as `Map<lesson_slug, { state, timestamps, records }>`
- APIs:
  - GET `/api/progress/courses/:course_id` (exists)
  - PUT `/api/progress/courses/:course_id` upsert (exists)
  - PUT `/api/progress/courses/:course_id/lessons/:lesson_slug` (exists)
  - GET `/api/progress/courses/bulk/:course_ids` (exists)
  - GET `/api/progress/courses/:course_id/lessons/:lesson_slug` (501)
- UI: calls lesson PUT on submit; uses bulk fetch to render lists

## Improvements
1) API correctness & lifecycle
- Implement GET `/api/progress/courses/:course_id/lessons/:lesson_slug`
- In lesson PUT handler:
  - Persist lesson into `lessons.<slug>` first, then recompute course completion
  - Compute course completion using canonical lesson list from `Course.lessons` slugs
  - Transitions allowed: not_started -> in_progress -> completed; allow completed -> in_progress only with explicit `record.action = reopen_lesson`
  - Auto-set course `started_at` on first in_progress/completed
  - When all lessons completed, set `state=completed`, `finished_at` once (idempotent)
- Use atomic updates:
  - `$set`: `lessons.<slug>`, `state`, `started_at`, `finished_at`
  - `$currentDate`: `lessons.<slug>.updated_at`

2) Validation & security
- Validate `course_id` `ObjectId`, `lesson_slug` string
- Derive `user_id` only from auth; ignore in body
- Schema guard on lesson map keys (string slugs only)

3) Audit trail (records)
- Standardize actions: `start_lesson`, `finish_lesson`, `reopen_lesson`, `start_course`, `finish_course`
- Always append with `{ at, action, refId, refType, data }`

4) Helpers
- `computeCourseCompletion(userId, courseId)`
- `upsertLessonProgress(userId, courseId, lessonSlug, nextState, record)`

5) Frontend UX
- On lesson open: set `in_progress` if not already
- On lesson complete: call PUT as today and update UI from response
- On entering a course: call `saveStateCourseStarted` when progress not started

## Deliverables
- New GET lesson progress endpoint
- Updated lesson PUT logic (ordering + canonical lesson list)
- Unit tests for transitions and completion
- Minimal migration script to normalize `lessons` from Map/Object to object with string keys where needed