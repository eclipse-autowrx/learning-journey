// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from '../src/lib/mongodb.js';
import SystemSettings from '../src/lib/models/SystemSettings.js';

async function migrateCollectionsToSettings() {
  try {
    await connectToDatabase();
    console.log('Connected to database');

    // Get all published collections from the collections table
    const collections = await connectToDatabase().then(async () => {
      const { default: Collection } = await import('../src/lib/models/Collection.js');
      return await Collection.find({ state: 'published' }).populate('paths');
    });

    console.log(`Found ${collections.length} published collections to migrate`);

    if (collections.length === 0) {
      console.log('No collections to migrate');
      return;
    }

    // Transform collections to the new format
    const collectionsData = collections.map(collection => {
      // Extract course IDs from paths
      const courseIds = [];
      if (collection.paths && Array.isArray(collection.paths)) {
        collection.paths.forEach(path => {
          if (path.course_ids && Array.isArray(path.course_ids)) {
            courseIds.push(...path.course_ids);
          }
          if (path.courses && Array.isArray(path.courses)) {
            // Convert ObjectIds to strings
            const courseObjectIds = path.courses.map(course => 
              typeof course === 'object' && course._id ? course._id.toString() : course.toString()
            );
            courseIds.push(...courseObjectIds);
          }
        });
      }

      // Remove duplicates
      const uniqueCourseIds = [...new Set(courseIds)];

      return {
        name: collection.name,
        description: collection.description || '',
        course_ids: uniqueCourseIds
      };
    });

    console.log('Transformed collections data:');
    collectionsData.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name} - ${collection.course_ids.length} courses`);
    });

    // Check if collections setting already exists
    const existingSetting = await SystemSettings.findOne({ key: 'collections' });
    
    if (existingSetting) {
      console.log('Collections setting already exists. Updating with migrated data...');
      existingSetting.value = collectionsData;
      existingSetting.updated_by = 'migration-script';
      await existingSetting.save();
      console.log('✅ Updated existing collections setting');
    } else {
      console.log('Creating new collections setting...');
      await SystemSettings.create({
        key: 'collections',
        value: collectionsData,
        secret: false,
        description: 'Collections configuration for home page display (migrated from collections table)',
        category: 'ui',
        updated_by: 'migration-script'
      });
      console.log('✅ Created new collections setting');
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log(`Migrated ${collectionsData.length} collections to System Settings`);
    console.log('\nYou can now:');
    console.log('1. Visit /admin and go to the "Collections" tab to manage collections');
    console.log('2. View collections on the home page');
    console.log('3. The old collections table can be safely removed if no longer needed');

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    process.exit(0);
  }
}

migrateCollectionsToSettings();
