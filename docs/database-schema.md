# Database Schema Documentation

## Overview

The Learning Journey application uses a MongoDB database with a well-structured schema designed to support various types of learning content and user interactions. The database follows a hierarchical structure: **Paths** → **Courses** → **Lessons** → **Quiz Questions**.

## Database Collections

### 1. Paths Collection

**Purpose**: Learning paths that group related courses together.

**Key Fields**:
- `name` (String, required): Path name
- `slug` (String, required, unique): URL-friendly identifier
- `description` (String): Path description
- `courses` (Array of ObjectIds): References to courses in this path
- `category` (String): Path category
- `tags` (Array of Strings): Searchable tags
- `state` (String): draft, reviewed, released, archived

**Relationships**:
- Has many → Courses

**Example**:
```json
{
  "_id": ObjectId("..."),
  "name": "Web Development Fundamentals",
  "slug": "web-dev-fundamentals",
  "description": "Learn the basics of web development",
  "courses": [ObjectId("course1"), ObjectId("course2")],
  "category": "programming",
  "tags": ["web", "html", "css", "javascript"],
  "state": "released"
}
```

### 2. Courses Collection

**Purpose**: Individual courses containing multiple lessons.

**Key Fields**:
- `name` (String, required): Course name
- `slug` (String, required, unique): URL-friendly identifier
- `description` (String): Course description
- `lessons` (Array of ObjectIds): References to lessons
- `lesson_order` (Array of ObjectIds): Explicit lesson ordering
- `sections` (Array): Course sections/modules
- `difficulty` (String): beginner, intermediate, advanced, expert
- `duration` (Number): Total course duration in hours
- `total_lessons` (Number): Number of lessons
- `total_duration` (Number): Total duration in minutes
- `course_type` (String): standard, workshop, certification, mini_course, bootcamp
- `is_free` (Boolean): Whether the course is free
- `offers_certificate` (Boolean): Whether course offers certification
- `state` (String): draft, reviewed, released, archived

**Relationships**:
- Belongs to → Paths
- Has many → Lessons
- Has many → Course Progress

**Example**:
```json
{
  "_id": ObjectId("..."),
  "name": "HTML & CSS Basics",
  "slug": "html-css-basics",
  "description": "Learn HTML and CSS fundamentals",
  "lessons": [ObjectId("lesson1"), ObjectId("lesson2")],
  "lesson_order": [ObjectId("lesson1"), ObjectId("lesson2")],
  "difficulty": "beginner",
  "duration": 8,
  "total_lessons": 12,
  "total_duration": 480,
  "course_type": "standard",
  "is_free": true,
  "offers_certificate": true,
  "state": "released"
}
```

### 3. Lessons Collection

**Purpose**: Individual learning units with different content types.

**Key Fields**:
- `name` (String, required): Lesson name
- `slug` (String, required, unique): URL-friendly identifier
- `description` (String): Lesson description
- `lesson_type` (String, required): video, text, quiz, interactive, assignment, workshop
- `order` (Number): Lesson order within course
- `duration` (Number): Lesson duration in minutes
- `content` (Mixed): Lesson content based on type
- `prerequisites` (Array of ObjectIds): Required lessons
- `completion_criteria` (String): view, complete, pass_quiz, submit_assignment
- `state` (String): draft, reviewed, released, archived

**Type-Specific Fields**:
- **Video**: `video_url`, `video_duration`, `video_provider`
- **Quiz**: `quiz_questions`, `passing_score`, `max_attempts`
- **Interactive**: `interactive_config`
- **Assignment**: `assignment_instructions`, `submission_deadline`, `max_points`
- **Workshop**: `workshop_materials`, `workshop_duration`

**Relationships**:
- Belongs to → Courses
- Has many → Quiz Questions (for quiz lessons)
- Has many → Prerequisites (self-referencing)

**Example**:
```json
{
  "_id": ObjectId("..."),
  "name": "Introduction to HTML",
  "slug": "intro-to-html",
  "description": "Learn the basics of HTML markup",
  "lesson_type": "video",
  "order": 1,
  "duration": 45,
  "video_url": "https://youtube.com/watch?v=...",
  "video_duration": 2700,
  "video_provider": "youtube",
  "completion_criteria": "view",
  "state": "released"
}
```

### 4. Quiz Questions Collection

**Purpose**: Assessment questions for quiz lessons.

**Key Fields**:
- `question` (String, required): The question text
- `question_type` (String, required): multiple_choice, single_choice, true_false, fill_blank, essay
- `options` (Array): Answer options for multiple choice questions
- `correct_answer` (Boolean): For true/false questions
- `correct_answers` (Array of Strings): For fill-in-the-blank questions
- `points` (Number): Points for this question
- `difficulty` (String): easy, medium, hard
- `state` (String): draft, reviewed, active, archived

**Relationships**:
- Belongs to → Lessons (for quiz lessons)

**Example**:
```json
{
  "_id": ObjectId("..."),
  "question": "What does HTML stand for?",
  "question_type": "single_choice",
  "options": [
    { "text": "HyperText Markup Language", "is_correct": true },
    { "text": "High Tech Modern Language", "is_correct": false },
    { "text": "Home Tool Markup Language", "is_correct": false }
  ],
  "points": 1,
  "difficulty": "easy",
  "state": "active"
}
```

### 5. Course Progress Collection

**Purpose**: Track user progress through courses.

**Key Fields**:
- `user_id` (ObjectId, required): User identifier
- `course_id` (ObjectId, required): Course reference
- `state` (String): not_started, in_progress, completed
- `progress_percentage` (Number): Completion percentage
- `lessons` (Map): Individual lesson progress
- `started_at` (Date): When user started the course
- `completed_at` (Date): When user completed the course

**Relationships**:
- Belongs to → Users
- Belongs to → Courses

**Example**:
```json
{
  "_id": ObjectId("..."),
  "user_id": ObjectId("user123"),
  "course_id": ObjectId("course456"),
  "state": "in_progress",
  "progress_percentage": 75,
  "lessons": {
    "lesson1": { "completed": true, "completed_at": "2024-01-15" },
    "lesson2": { "completed": false, "started_at": "2024-01-16" }
  },
  "started_at": "2024-01-15T10:00:00Z"
}
```

## Database Relationships

### One-to-Many Relationships
- **Path** → **Courses**: One path contains multiple courses
- **Course** → **Lessons**: One course contains multiple lessons
- **Lesson** → **Quiz Questions**: One quiz lesson contains multiple questions

### Many-to-Many Relationships
- **Courses** ↔ **Prerequisites**: Courses can have prerequisites (other courses)
- **Lessons** ↔ **Prerequisites**: Lessons can have prerequisites (other lessons)

### Self-Referencing Relationships
- **Lessons** can have prerequisites (other lessons)
- **Courses** can have prerequisites (other courses)

## Indexing Strategy

### Performance Indexes
- **Slug indexes**: For fast URL-based lookups
- **State indexes**: For filtering by publication status
- **Type indexes**: For filtering by content type
- **Date indexes**: For chronological ordering
- **Tag indexes**: For search functionality

### Compound Indexes
- `{ user_id: 1, course_id: 1 }` on courseprogresses
- `{ lesson_type: 1, state: 1 }` on lessons
- `{ question_type: 1, difficulty: 1 }` on quizquestions

## Data Integrity

### Validation Rules
- Required fields are enforced at the schema level
- Enum values ensure data consistency
- Unique constraints on slugs prevent duplicates
- ObjectId references maintain referential integrity

### Business Rules
- Lessons must belong to a course
- Quiz questions must belong to a quiz lesson
- Course progress requires both user and course
- Prerequisites must exist before being referenced

## Scalability Considerations

### Horizontal Scaling
- Collections can be sharded by user_id or course_id
- Read replicas for analytics queries
- Separate databases for different environments

### Performance Optimization
- Aggregation pipelines for complex queries
- Caching for frequently accessed data
- Background jobs for analytics calculations

## Migration Strategy

### Schema Evolution
- Backward-compatible field additions
- Gradual migration of existing data
- Version control for schema changes

### Data Migration
- Automated migration scripts
- Rollback procedures
- Data validation checks

## Security Considerations

### Access Control
- User-based data isolation
- Role-based permissions
- API-level authentication

### Data Protection
- Encrypted sensitive fields
- Audit trails for changes
- Regular backups

## Monitoring and Analytics

### Key Metrics
- Course completion rates
- Lesson engagement times
- Quiz performance analytics
- User progression patterns

### Health Checks
- Database connectivity
- Collection sizes
- Index usage statistics
- Query performance metrics
