// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from '../src/lib/mongodb.js';

async function cleanupOldCollections() {
  try {
    await connectToDatabase();
    console.log('Connected to database');

    // Verify that collections setting exists and has data
    const { default: SystemSettings } = await import('../src/lib/models/SystemSettings.js');
    const collectionsSetting = await SystemSettings.findOne({ key: 'collections' });
    
    if (!collectionsSetting || !collectionsSetting.value || collectionsSetting.value.length === 0) {
      console.log('❌ No collections found in System Settings. Migration may not have completed successfully.');
      console.log('Please run the migration script first: node scripts/migrate-collections-to-settings.js');
      return;
    }

    console.log(`✅ Found ${collectionsSetting.value.length} collections in System Settings`);
    console.log('Collections in System Settings:');
    collectionsSetting.value.forEach((collection, index) => {
      console.log(`  ${index + 1}. ${collection.name} - ${collection.course_ids.length} courses`);
    });

    // Get count of documents in collections table
    const { default: Collection } = await import('../src/lib/models/Collection.js');
    const collectionCount = await Collection.countDocuments();
    
    console.log(`\nFound ${collectionCount} documents in the old collections table`);

    if (collectionCount === 0) {
      console.log('✅ Collections table is already empty. No cleanup needed.');
      return;
    }

    // Show what will be deleted
    const collections = await Collection.find({}).select('name slug state');
    console.log('\nCollections that will be deleted:');
    collections.forEach((collection, index) => {
      console.log(`  ${index + 1}. ${collection.name} (${collection.slug}) - State: ${collection.state}`);
    });

    // Ask for confirmation (in a real scenario, you might want to add a prompt)
    console.log('\n⚠️  WARNING: This will permanently delete all data from the collections table!');
    console.log('Make sure you have verified that the migration was successful.');
    console.log('\nTo proceed with cleanup, uncomment the lines below in this script.');
    
    // Uncomment the following lines to actually perform the cleanup:
    /*
    console.log('\n🗑️  Deleting collections table...');
    await Collection.deleteMany({});
    console.log('✅ Collections table cleaned up successfully!');
    
    // Optionally drop the entire collection
    // await Collection.collection.drop();
    // console.log('✅ Collections collection dropped!');
    */

    console.log('\n📋 Summary:');
    console.log(`- ${collectionsSetting.value.length} collections migrated to System Settings`);
    console.log(`- ${collectionCount} documents remain in old collections table`);
    console.log('- Old collections table can be safely removed when ready');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    process.exit(0);
  }
}

cleanupOldCollections();
