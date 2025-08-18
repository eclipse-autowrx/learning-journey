// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const collectionSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-z0-9-]+$/
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  image: {
    type: String,
    trim: true
  },
  thumb: {
    type: String,
    trim: true
  },
  background_img: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true,
    maxlength: 100
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  paths: [{
    type: Schema.Types.ObjectId,
    ref: 'Path'
  }],
  path_order: [{
    type: Schema.Types.ObjectId,
    ref: 'Path'
  }],
  state: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  valid_from: {
    type: Date,
    default: Date.now
  },
  valid_to: {
    type: Date
  },
  configs: {
    type: Schema.Types.Mixed,
    default: {}
  },
  extends: {
    type: Schema.Types.Mixed,
    default: {}
  },
  hiddenContent: {
    type: Schema.Types.Mixed,
    default: {}
  },
  meta_title: {
    type: String,
    trim: true,
    maxlength: 200
  },
  meta_description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  accessibility_notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
collectionSchema.index({ category: 1 });
collectionSchema.index({ tags: 1 });
collectionSchema.index({ name: 1 });
collectionSchema.index({ state: 1 });
collectionSchema.index({ created_at: -1 });

// Virtuals
collectionSchema.virtual('total_paths').get(function() {
  return this.paths ? this.paths.length : 0;
});

collectionSchema.virtual('is_active').get(function() {
  const now = new Date();
  return this.state === 'published' && 
         this.valid_from <= now && 
         (!this.valid_to || this.valid_to >= now);
});

// Methods
collectionSchema.methods.addPath = function(pathId) {
  if (!this.paths.includes(pathId)) {
    this.paths.push(pathId);
    this.path_order.push(pathId);
  }
  return this.save();
};

collectionSchema.methods.removePath = function(pathId) {
  this.paths = this.paths.filter(id => !id.equals(pathId));
  this.path_order = this.path_order.filter(id => !id.equals(pathId));
  return this.save();
};

collectionSchema.methods.reorderPaths = function(newOrder) {
  this.path_order = newOrder.filter(id => this.paths.includes(id));
  return this.save();
};

// Statics
collectionSchema.statics.findByCategory = function(category) {
  return this.find({ category, state: 'published' });
};

collectionSchema.statics.findByTags = function(tags) {
  return this.find({ 
    tags: { $in: tags }, 
    state: 'published' 
  });
};

collectionSchema.statics.getActive = function() {
  const now = new Date();
  return this.find({
    state: 'published',
    valid_from: { $lte: now },
    $or: [
      { valid_to: { $exists: false } },
      { valid_to: { $gte: now } }
    ]
  });
};

// Pre-save middleware
collectionSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.isModified('slug')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

const Collection = mongoose.models.Collection || mongoose.model('Collection', collectionSchema);

export default Collection;
