// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PathSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, limit: 1024 },
    description: { type: String, limit: 4096 },
    slug: { type: String, required: true, unique: true },
    path_type: { type: String, default: "standard" },
    level: { type: String },
    time_to_complete: { type: Number },
    background_img: { type: String },
    image: { type: String },
    thumb: { type: String },
    category: { type: String, limit: 255 },
    tags: { type: [String] },
    valid_from: { type: Date },
    valid_to: { type: Date },
    state: { type: String, limit: 255, default: 'draft', enum: ['draft', 'reviewing', 'published', 'locked', 'archived'] },
    configs: { type: Schema.Types.Mixed },
    extends: { type: Schema.Types.Mixed },
    hiddenContent: { type: Schema.Types.Mixed },
    maps: { type: Schema.Types.Mixed },
    course_ids: { type: [String] },  // Array of course ID strings
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    owner_id: { type: String, required: true },
    icon_set: { type: Schema.Types.Mixed },
    created_by: { type: String },
    num_learners: { type: Number },
    num_certified_learners: { type: Number },
    key_points: { type: [Schema.Types.Mixed] },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

PathSchema.index({ category: 1 });
PathSchema.index({ tags: 1 });
PathSchema.index({ name: 1 });
PathSchema.index({ state: 1 });


export default mongoose.models.Path || mongoose.model("Path", PathSchema);