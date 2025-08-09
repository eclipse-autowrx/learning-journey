import mongoose from "mongoose";
import './models/index.js'; // Import all models to ensure they are registered

const MONGO_URI = process.env.MONGO_URI || "mongodb://admin:password123@localhost:27017/learning_journey?authSource=admin";

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable");
}

/** Cached connection */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
