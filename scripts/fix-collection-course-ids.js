import connectToDatabase from '../src/lib/mongodb.js';
import Collection from '../src/lib/models/Collection.js';
import Path from '../src/lib/models/Path.js';

console.log('🔧 Updating collections to use paths instead of course_ids...');

try {
  await connectToDatabase();
  
  // Get all collections
  const collections = await Collection.find({});
  console.log(`Found ${collections.length} collections`);
  
  // Get all paths to map their IDs
  const paths = await Path.find({});
  console.log(`Found ${paths.length} paths`);
  
  // Create a mapping of path slugs to IDs
  const pathSlugToId = {};
  paths.forEach(path => {
    pathSlugToId[path.slug] = path._id.toString();
  });
  
  console.log('Available path slugs:', Object.keys(pathSlugToId));
  
  for (const collection of collections) {
    console.log(`\nProcessing collection: ${collection.name}`);
    
    // If collection has course_ids, remove them and add some paths instead
    if (collection.course_ids && collection.course_ids.length > 0) {
      console.log(`Removing old course_ids:`, collection.course_ids);
      
      // For now, let's assign the first few real path IDs to each collection
      const realPathIds = Object.values(pathSlugToId).slice(0, 2);
      
      if (realPathIds.length > 0) {
        await Collection.findByIdAndUpdate(collection._id, {
          $unset: { course_ids: 1 }, // Remove course_ids field
          $set: { 
            paths: realPathIds,
            path_order: realPathIds
          }
        });
        
        console.log(`✅ Updated collection "${collection.name}" with ${realPathIds.length} paths`);
        console.log(`New paths:`, realPathIds);
      }
    } else if (!collection.paths || collection.paths.length === 0) {
      // If collection has no paths, add some default ones
      const realPathIds = Object.values(pathSlugToId).slice(0, 2);
      
      if (realPathIds.length > 0) {
        await Collection.findByIdAndUpdate(collection._id, {
          paths: realPathIds,
          path_order: realPathIds
        });
        
        console.log(`✅ Added ${realPathIds.length} default paths to collection "${collection.name}"`);
        console.log(`New paths:`, realPathIds);
      }
    }
  }
  
  console.log('\n🎉 All collections have been updated to use paths!');
  
} catch (error) {
  console.error('❌ Error updating collections:', error);
} finally {
  process.exit(0);
} 