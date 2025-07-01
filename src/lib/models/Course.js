// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CourseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, limit: 1024 },
    description: { type: String, limit: 10240 },
    slug: { type: String, required: true, unique: true },
    course_type: { type: String, default: "standard" },
    image: { type: String },
    thumb: { type: String },
    tags: { type: [String] },
    category: { type: String, limit: 255 },
    icon: { type: String },
    difficulty: { type: String, limit: 255 },  // beginner, intermediate, advanced
    duration: { type: Number, default: 60 }, // in hours
    valid_from: { type: Date },
    valid_to: { type: Date },
    state: { type: String, limit: 255, default: 'draft' },   // draft, reviewed, released
    configs: { type: Schema.Types.Mixed },
    extends: { type: Schema.Types.Mixed },
    hiddenContent: { type: Schema.Types.Mixed },
    lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

CourseSchema.index({ category: 1 });
CourseSchema.index({ slug: 1 });
CourseSchema.index({ tags: 1 });
CourseSchema.index({ name: 1 });
CourseSchema.index({ state: 1 });


export default mongoose.models.Course || mongoose.model("Course", CourseSchema);