## REST API Summary

- This document summarizes Next.js API routes under `src/pages/api`.
- Many list endpoints accept `?manage=true` to show owner-managed content and avoid public sanitization.

### Collections
- GET `/api/collections` — List collections (supports `?manage=true`, `?state=`)
- POST `/api/collections` — Create collection
- GET `/api/collections/[slug]` — Get a collection (deep-populated)
- PUT `/api/collections/[slug]` — Update by slug (partial updates supported)
- DELETE `/api/collections/[slug]` — Delete by slug
- PUT `/api/collections/bulk` — Bulk update state (published|draft|archived)
- DELETE `/api/collections/bulk` — Bulk delete by IDs

### Paths
- GET `/api/paths` — List paths (supports `?manage=true`)
- POST `/api/paths` — Create path
- GET `/api/paths/[slug]` — Get a path (courses normalized and icons assigned)
- PUT `/api/paths/[slug]` — Update by slug
- DELETE `/api/paths/[slug]` — Delete by slug
- PUT `/api/paths/bulk` — Bulk update state (published|draft|archived|locked)
- DELETE `/api/paths/bulk` — Bulk delete by IDs
- POST `/api/paths/import` — Import paths/courses/lessons (multipart; stores images under `/public/images`)
- POST `/api/paths/export` — Export selected paths as ZIP (includes images)

### Courses
- GET `/api/courses` — List courses (supports `?manage=true`)
- POST `/api/courses` — Create course
- GET `/api/courses/[slug]` — Get a course (includes user progress context when authenticated)
- PUT `/api/courses/[slug]` — Update by slug
- DELETE `/api/courses/[slug]` — Delete by slug
- GET `/api/courses/[slug]/lessons` — List course lessons (sanitizes quiz answers unless `?manage=true`)
- PUT `/api/courses/bulk` — Bulk update state
- DELETE `/api/courses/bulk` — Bulk delete by IDs

### Lessons
- GET `/api/lessons` — List lessons (supports `?manage=true`)
- POST `/api/lessons` — Create lesson
- GET `/api/lessons/[slug]` — Get lesson by slug
- PUT `/api/lessons/[slug]` — Update by slug
- DELETE `/api/lessons/[slug]` — Delete by slug
- POST `/api/lessons/[slug]/check` — Grade quiz answers for a lesson

### Progress
- GET `/api/progress/courses/[course_id]` — Get course progress for current user
- PUT `/api/progress/courses/[course_id]` — Upsert course progress for current user
- GET `/api/progress/courses/bulk/[course_ids]` — Get many course progresses (comma-separated IDs)
- GET `/api/progress/courses/[course_id]/lessons/[lesson_slug]` — Not implemented (501)
- PUT `/api/progress/courses/[course_id]/lessons/[lesson_slug]` — Update per-lesson progress state and records

### Admin
- GET `/api/admin/admins` — List admin users
- POST `/api/admin/admins` — Create admin user
- DELETE `/api/admin/admins/[id]` — Delete admin user by ID
- GET `/api/admin/collections` — List collections (admin view)
- PUT `/api/admin/collections/[id]` — Update collection by ID
- GET `/api/admin/courses` — List courses (admin view)
- PUT `/api/admin/courses/[id]` — Update course by ID
- GET `/api/admin/paths` — List paths (admin view)
- PUT `/api/admin/paths/[id]` — Update path by ID

### User
- POST `/api/user/auth` — Set auth cookies using `?user_id=&token=`
- GET `/api/user/me` — Get current user info

### Media
- POST `/api/medias/upload_image` — Upload image; auto-resizes and creates thumbnail
- GET `/api/medias/list-icon` — Deprecated (410 Gone)

### Health
- GET `/api/health` — Health check (DB connectivity and basic counts)
