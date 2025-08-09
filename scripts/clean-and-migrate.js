#!/usr/bin/env node

import connectToDatabase from '../src/lib/mongodb.js';
import Path from '../src/lib/models/Path.js';
import Course from '../src/lib/models/Course.js';
import Lesson from '../src/lib/models/Lesson.js';
import CourseProgress from '../src/lib/models/CourseProgress.js';


console.log('🧹 Cleaning Database and Running Migration');
console.log('==========================================\n');

async function cleanAndMigrate() {
  try {
    await connectToDatabase();
    console.log('✅ Connected to database');

    // Clean up all data (including sample data)
    console.log('🧹 Cleaning all existing data...');
    
    const pathResult = await Path.deleteMany({});
    const courseResult = await Course.deleteMany({});
    const lessonResult = await Lesson.deleteMany({});
    const progressResult = await CourseProgress.deleteMany({});
    
    
    console.log('✅ Cleaned existing data:');
    console.log(`   - Paths: ${pathResult.deletedCount}`);
    console.log(`   - Courses: ${courseResult.deletedCount}`);
    console.log(`   - Lessons: ${lessonResult.deletedCount}`);
    console.log(`   - Course Progress: ${progressResult.deletedCount}`);
    

    // Import and run the migration
    console.log('\n📦 Running data migration...');
    const { default: migrateData } = await import('./migrate-data.js');
    await migrateData();

    console.log('\n🎉 Clean and migrate completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test the API endpoints:');
    console.log('      - http://localhost:3000/api/health');
    console.log('      - http://localhost:3000/api/paths');
    console.log('      - http://localhost:3000/api/courses');
    console.log('      - http://localhost:3000/api/lessons');
    console.log('   2. Start the development server: npm run dev');
    console.log('   3. Access the application at http://localhost:3000');

  } catch (error) {
    console.error('❌ Error during clean and migrate:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanAndMigrate().then(() => {
    console.log('\n✅ Clean and migrate script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Clean and migrate script failed:', error);
    process.exit(1);
  });
}

export default cleanAndMigrate;
