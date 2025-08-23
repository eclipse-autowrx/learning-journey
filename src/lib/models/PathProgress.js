// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import mongoose from "mongoose";
const Schema = mongoose.Schema;

import { COURSE_PROGRESS_STATES, STATE_NOT_STARTED } from '../const.js';

const PathProgressSchema = new mongoose.Schema(
  {
    user_id: { type: Schema.Types.ObjectId },
    path_id: { type: Schema.Types.ObjectId },
    state: {
      type: String,
      enum: Object.values(COURSE_PROGRESS_STATES),
      default: STATE_NOT_STARTED
    },
    started_at: { type: Date },
    finished_at: { type: Date },
    data: { type: Schema.Types.Mixed },
    courses: {
      type: Map,
      of: {
        state: { type: String, enum: Object.values(COURSE_PROGRESS_STATES), default: STATE_NOT_STARTED },
        finished_at: { type: Date },
      }
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

PathProgressSchema.index({ user_id: 1, path_id: 1 }, { unique: true });
PathProgressSchema.index({ user_id: 1 });
PathProgressSchema.index({ path_id: 1 });
PathProgressSchema.index({ state: 1 });

export default mongoose.models.PathProgress || mongoose.model("PathProgress", PathProgressSchema);
