# Path Progress & Completion Plan

## Goals
- First-class path-level progress computed on backend
- Deterministic completion rules (required/electives)
- Single source of truth for certificate eligibility

## Model: PathProgress (new)
- `user_id: ObjectId`
- `path_id: ObjectId`
- `state: 'not_started' | 'in_progress' | 'completed' | 'locked'`
- `started_at?: Date`
- `finished_at?: Date`
- `data?: Mixed`
- `courses: Map<string /*course_id*/, { state: string, finished_at?: Date }>`
- Timestamps: `created_at`, `updated_at`
- Indexes: `{ user_id: 1, path_id: 1 }` (unique), `{ state: 1 }`

## Completion Rules
Extend `Path` config:
- `required_course_ids: string[]`
- `elective_groups?: Array<{ course_ids: string[], must_complete: number }>`
- Optional fallback: `min_courses_to_complete?: number`

A path is `completed` if:
- every course in `required_course_ids` has course progress `completed`, and
- for each `elective_group`, at least `must_complete` are `completed`.

`in_progress` if any included course is `in_progress` or `completed` while path not yet `completed`.

## APIs (new)
- `GET /api/progress/paths/:path_id` — get current user path progress
- `GET /api/progress/paths/bulk/:path_ids` — bulk
- `PUT /api/progress/paths/:path_id` — upsert (rare; backend should compute)

## Backend orchestration
- When course/lesson progress updates:
  1. Update course completion as today
  2. Find all paths containing `course_id`
  3. Upsert `(user_id, path_id)` PathProgress:
     - `$set`: `courses.<course_id>.state`, `courses.<course_id>.finished_at`
     - If first time, set `started_at`
  4. Evaluate rules → if completed and no `finished_at`, set now
  5. Emit domain event: `path.completed` (used by certificate issuer)

## Frontend
- Fetch `PathProgress` when viewing a path; render percentage and final state
- Remove client-side "award completion" heuristics; use backend-provided states
- Show CTA when `PathProgress.state === 'completed'` (issue certificate)

## Tests
- Rule engine unit tests (required, electives, mixed)
- Integration: completing courses triggers path completion

## Migration
- Backfill PathProgress from existing CourseProgress by evaluating rules per path per user