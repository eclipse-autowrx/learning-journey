// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PostSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, limit: 1024 },
    description: { type: String, limit: 4096 },
    slug: { type: String, required: true, unique: true },
    path_type: { type: String, default: "standard" },
    background_img: { type: String },
    image: { type: String },
    thumb: { type: String },
    category: { type: String, limit: 255 },
    tags: { type: [String] },
    valid_from: { type: Date },
    valid_to: { type: Date },
    state: { type: String, limit: 255, default: 'draft' },   // draft, reviewed, released
    configs: { type: Schema.Types.Mixed },
    extends: { type: Schema.Types.Mixed },
    hiddenContent: { type: Schema.Types.Mixed },
    maps: { type: Schema.Types.Mixed },
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

PostSchema.index({ category: 1 });
PostSchema.index({ slug: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ name: 1 });
PostSchema.index({ state: 1 });


export default mongoose.models.Post || mongoose.model("Path", PostSchema);