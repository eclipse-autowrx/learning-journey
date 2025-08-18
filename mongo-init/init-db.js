// MongoDB initialization script to seed the database with mock data
db = db.getSiblingDB('learning_journey');

// Create collections
db.createCollection('collections');
db.createCollection('paths');
db.createCollection('courses');
db.createCollection('lessons');
db.createCollection('courseprogresses');

// Create indexes
db.collections.createIndex({ "slug": 1 }, { unique: true });
db.collections.createIndex({ "category": 1 });
db.collections.createIndex({ "tags": 1 });
db.collections.createIndex({ "name": 1 });
db.collections.createIndex({ "state": 1 });
db.collections.createIndex({ "created_at": -1 });

db.paths.createIndex({ "slug": 1 }, { unique: true });
db.paths.createIndex({ "category": 1 });
db.paths.createIndex({ "tags": 1 });
db.paths.createIndex({ "name": 1 });
db.createIndex({ "state": 1 });

db.courses.createIndex({ "slug": 1 }, { unique: true });
db.courses.createIndex({ "category": 1 });
db.courses.createIndex({ "tags": 1 });
db.courses.createIndex({ "name": 1 });
db.courses.createIndex({ "state": 1 });

db.lessons.createIndex({ "slug": 1 }, { unique: true });
db.lessons.createIndex({ "name": 1 });
db.lessons.createIndex({ "lesson_type": 1 });
db.lessons.createIndex({ "state": 1 });
db.lessons.createIndex({ "created_at": -1 });

db.courseprogresses.createIndex({ "user_id": 1 });
db.courseprogresses.createIndex({ "course_id": 1 });
db.courseprogresses.createIndex({ "state": 1 });

print('Database initialized successfully!');
