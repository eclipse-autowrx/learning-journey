// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import mongoose from "mongoose";
import './models/index.js'; // Import all models to ensure they are registered

// Get MONGO_URI from environment, but don't throw error immediately
// This allows the environment to be loaded after import
let MONGO_URI = process.env.MONGO_URI;

/** Cached connection */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  // Check for MONGO_URI at connection time, not import time
  if (!MONGO_URI) {
    MONGO_URI = process.env.MONGO_URI;
  }
  
  if (!MONGO_URI) {
    throw new Error("Please define the MONGO_URI environment variable");
  }

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
