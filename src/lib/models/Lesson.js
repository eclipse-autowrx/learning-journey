// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import mongoose from "mongoose";
const Schema = mongoose.Schema;

const LessonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, limit: 1024 },
    description: { type: String, limit: 4096 },
    lesson_type: { 
      type: String, 
      required: true,
      enum: ['video', 'text', 'text-markdown', 'quiz', 'interactive', 'assignment', 'workshop'],
      default: 'text-markdown'
    },
    slug: { type: String, required: true, unique: true },
    image: { type: String },
    thumb: { type: String },
    tags: { type: [String] },
    owner_id: { type: String, required: true },
    
    // Lesson ordering within a course
    order: { type: Number, default: 0 },
    duration: { type: Number, default: 0 }, // in minutes
    
    // Content based on lesson type
    content: { type: Schema.Types.Mixed },
    // Text-Markdown lesson specific
    markdown_content: { type: String },
    
    // Video lesson specific fields
    video_url: { type: String },
    video_duration: { type: Number }, // in seconds
    video_provider: { type: String }, // youtube, vimeo, etc.
    
    // Quiz lesson specific fields
    quiz_questions: { type: [Schema.Types.Mixed], default: [] },
    passing_score: { type: Number, default: 70 },
    max_attempts: { type: Number, default: 3 },
    
    // Interactive lesson specific fields
    interactive_config: { type: Schema.Types.Mixed },
    sequence: { type: Schema.Types.Mixed },
    
    // Assignment lesson specific fields
    assignment_instructions: { type: String },
    submission_deadline: { type: Date },
    max_points: { type: Number, default: 100 },
    
    // Workshop lesson specific fields
    workshop_materials: [{ type: String }],
    workshop_duration: { type: Number }, // in minutes
    
    // Prerequisites
    prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    
    // Completion criteria
    completion_criteria: {
      type: String,
      enum: ['view', 'complete', 'pass_quiz', 'submit_assignment'],
      default: 'view'
    },
    
    // Metadata
    state: { 
      type: String, 
      limit: 255, 
      default: 'draft',
      enum: ['draft', 'reviewed', 'released', 'archived']
    },
    
    // Configuration and extensions
    configs: { type: Schema.Types.Mixed },
    extends: { type: Schema.Types.Mixed },
    hiddenContent: { type: Schema.Types.Mixed },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Indexes for better performance
LessonSchema.index({ name: 1 });
LessonSchema.index({ state: 1 });
LessonSchema.index({ lesson_type: 1 });
LessonSchema.index({ order: 1 });
LessonSchema.index({ tags: 1 });
LessonSchema.index({ 'created_at': -1 });

// Virtual for full lesson URL
LessonSchema.virtual('url').get(function() {
  return `/lessons/${this.slug}`;
});

// Method to check if lesson is accessible
LessonSchema.methods.isAccessible = function() {
  return this.state === 'released';
};

// Method to get lesson duration in human readable format
LessonSchema.methods.getDurationText = function() {
  if (!this.duration) return 'Duration not specified';
  
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
  }
  return `${minutes}m`;
};

// Static method to get lessons by type
LessonSchema.statics.getByType = function(type) {
  return this.find({ lesson_type: type, state: 'released' });
};

// Static method to get lessons with prerequisites
LessonSchema.statics.getWithPrerequisites = function() {
  return this.find({ prerequisites: { $exists: true, $ne: [] } });
};

export default mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);