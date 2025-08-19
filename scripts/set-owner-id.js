// scripts/set-owner-id.js
import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb.js';
import Collection from '../src/lib/models/Collection.js';
import Path from '../src/lib/models/Path.js';
import Course from '../src/lib/models/Course.js';
import Lesson from '../src/lib/models/Lesson.js';

const ownerId = '6699fa83964f3f002f35ea03';

const updateCollection = async (model, modelName) => {
  try {
    const result = await model.updateMany(
      { owner_id: { $exists: false } },
      { $set: { owner_id: ownerId } }
    );
    console.log(`Updated ${result.modifiedCount} documents in the ${modelName} collection.`);
  } catch (error) {
    console.error(`Error updating ${modelName}:`, error);
  }
};

const run = async () => {
  await connectDB();

  console.log('Starting to update owner_id for all documents...');

  await updateCollection(Collection, 'Collection');
  await updateCollection(Path, 'Path');
  await updateCollection(Course, 'Course');
  await updateCollection(Lesson, 'Lesson');

  console.log('Finished updating all collections.');
  await mongoose.connection.close();
};

run();
