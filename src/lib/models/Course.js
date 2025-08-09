import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CourseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, limit: 1024 },
    description: { type: String, limit: 10240 },
    slug: { type: String, required: true, unique: true },
    course_type: { 
      type: String, 
      default: "standard",
      enum: ['standard', 'workshop', 'certification', 'mini_course', 'bootcamp']
    },
    image: { type: String },
    thumb: { type: String },
    tags: { type: [String] },
    category: { type: String, limit: 255 },
    icon: { type: String },
    difficulty: { 
      type: String, 
      limit: 255,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    duration: { type: Number, default: 60 }, // in hours
    total_lessons: { type: Number, default: 0 },
    total_duration: { type: Number, default: 0 }, // in minutes
    
    // Course structure
    lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    lesson_order: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }], // Explicit ordering
    
    // Course sections/modules (optional)
    sections: [{
      name: { type: String, required: true },
      description: { type: String },
      order: { type: Number, default: 0 },
      lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }]
    }],
    
    // Prerequisites
    prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    required_skills: [{ type: String }],
    
    // Learning objectives
    learning_objectives: [{ type: String }],
    skills_covered: [{ type: String }],
    
    // Completion criteria
    completion_criteria: {
      type: String,
      enum: ['all_lessons', 'minimum_percentage', 'assessment_passed'],
      default: 'all_lessons'
    },
    minimum_completion_percentage: { type: Number, default: 100 },
    
    // Certification
    offers_certificate: { type: Boolean, default: false },
    certificate_template: { type: String },
    certificate_validity_days: { type: Number },
    
    // Pricing and enrollment
    is_free: { type: Boolean, default: true },
    price: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    enrollment_limit: { type: Number },
    enrollment_deadline: { type: Date },
    
    // Metadata
    valid_from: { type: Date },
    valid_to: { type: Date },
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
    
    // SEO and accessibility
    meta_title: { type: String, limit: 255 },
    meta_description: { type: String, limit: 500 },
    accessibility_notes: { type: String },
    
    // Analytics
    enrollment_count: { type: Number, default: 0 },
    completion_count: { type: Number, default: 0 },
    average_rating: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
    average_completion_time: { type: Number }, // in days
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Indexes for better performance
CourseSchema.index({ category: 1 });
CourseSchema.index({ tags: 1 });
CourseSchema.index({ name: 1 });
CourseSchema.index({ state: 1 });
CourseSchema.index({ difficulty: 1 });
CourseSchema.index({ course_type: 1 });
CourseSchema.index({ is_free: 1 });
CourseSchema.index({ 'created_at': -1 });

// Virtual for full course URL
CourseSchema.virtual('url').get(function() {
  return `/courses/${this.slug}`;
});

// Virtual for course duration in human readable format
CourseSchema.virtual('durationText').get(function() {
  if (!this.duration) return 'Duration not specified';
  
  const hours = Math.floor(this.duration);
  const minutes = Math.round((this.duration - hours) * 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
  }
  return `${minutes}m`;
});

// Method to check if course is accessible
CourseSchema.methods.isAccessible = function() {
  const now = new Date();
  return this.state === 'released' && 
         (!this.valid_from || this.valid_from <= now) &&
         (!this.valid_to || this.valid_to >= now);
};

// Method to get ordered lessons
CourseSchema.methods.getOrderedLessons = function() {
  if (this.lesson_order && this.lesson_order.length > 0) {
    return this.lesson_order;
  }
  return this.lessons;
};

// Method to calculate course statistics
CourseSchema.methods.calculateStats = async function() {
  const Lesson = mongoose.model('Lesson');
  
  const lessons = await Lesson.find({ _id: { $in: this.lessons } });
  
  this.total_lessons = lessons.length;
  this.total_duration = lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
  
  return this.save();
};

// Static method to get courses by difficulty
CourseSchema.statics.getByDifficulty = function(difficulty) {
  return this.find({ difficulty, state: 'released' });
};

// Static method to get free courses
CourseSchema.statics.getFreeCourses = function() {
  return this.find({ is_free: true, state: 'released' });
};

// Static method to get courses with certificates
CourseSchema.statics.getCertificationCourses = function() {
  return this.find({ offers_certificate: true, state: 'released' });
};

// Pre-save middleware to update total lessons and duration
CourseSchema.pre('save', async function(next) {
  if (this.isModified('lessons')) {
    const Lesson = mongoose.model('Lesson');
    const lessons = await Lesson.find({ _id: { $in: this.lessons } });
    
    this.total_lessons = lessons.length;
    this.total_duration = lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
  }
  next();
});

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);