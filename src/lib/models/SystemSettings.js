// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import mongoose from "mongoose";
const Schema = mongoose.Schema;

const SystemSettingsSchema = new mongoose.Schema(
  {
    key: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      maxlength: 255
    },
    value: { 
      type: Schema.Types.Mixed, 
      required: true 
    },
    secret: { 
      type: Boolean, 
      default: false 
    },
    description: { 
      type: String, 
      maxlength: 1000 
    },
    category: { 
      type: String, 
      maxlength: 100,
      default: 'general'
    },
    updated_by: { 
      type: String, 
      required: true 
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Indexes for better performance
SystemSettingsSchema.index({ key: 1 });
SystemSettingsSchema.index({ category: 1 });
SystemSettingsSchema.index({ secret: 1 });

const SystemSettings = mongoose.models.SystemSettings || mongoose.model('SystemSettings', SystemSettingsSchema);

export default SystemSettings;
