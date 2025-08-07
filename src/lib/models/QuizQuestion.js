import mongoose from "mongoose";
const Schema = mongoose.Schema;

const QuizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    question_type: { 
      type: String, 
      required: true,
      enum: ['multiple_choice', 'single_choice', 'true_false', 'fill_blank', 'essay'],
      default: 'multiple_choice'
    },
    
    // Options for multiple choice/single choice questions
    options: [{
      text: { type: String, required: true },
      is_correct: { type: Boolean, default: false },
      explanation: { type: String } // Why this option is correct/incorrect
    }],
    
    // For true/false questions
    correct_answer: { type: Boolean }, // true or false
    
    // For fill in the blank questions
    correct_answers: [{ type: String }], // Multiple possible correct answers
    case_sensitive: { type: Boolean, default: false },
    
    // For essay questions
    essay_guidelines: { type: String },
    min_words: { type: Number },
    max_words: { type: Number },
    
    // Scoring
    points: { type: Number, default: 1 },
    partial_credit: { type: Boolean, default: false },
    
    // Question metadata
    difficulty: { 
      type: String, 
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    tags: [{ type: String }],
    category: { type: String },
    
    // Question behavior
    shuffle_options: { type: Boolean, default: true },
    show_explanation: { type: Boolean, default: true },
    allow_multiple_attempts: { type: Boolean, default: true },
    
    // Media attachments
    image: { type: String },
    audio: { type: String },
    video: { type: String },
    
    // Accessibility
    accessibility_notes: { type: String },
    
    // Analytics
    times_answered: { type: Number, default: 0 },
    times_correct: { type: Number, default: 0 },
    average_time_to_answer: { type: Number }, // in seconds
    
    // Metadata
    state: { 
      type: String, 
      enum: ['draft', 'reviewed', 'active', 'archived'],
      default: 'draft'
    },
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewed_by: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewed_at: { type: Date },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Indexes for better performance
QuizQuestionSchema.index({ question_type: 1 });
QuizQuestionSchema.index({ difficulty: 1 });
QuizQuestionSchema.index({ category: 1 });
QuizQuestionSchema.index({ tags: 1 });
QuizQuestionSchema.index({ state: 1 });
QuizQuestionSchema.index({ 'created_at': -1 });

// Method to check if answer is correct
QuizQuestionSchema.methods.isCorrectAnswer = function(userAnswer) {
  switch (this.question_type) {
    case 'multiple_choice':
    case 'single_choice':
      if (Array.isArray(userAnswer)) {
        return userAnswer.every(answer => 
          this.options.find(opt => opt.text === answer && opt.is_correct)
        );
      }
      return this.options.find(opt => opt.text === userAnswer && opt.is_correct);
      
    case 'true_false':
      return userAnswer === this.correct_answer;
      
    case 'fill_blank':
      if (Array.isArray(userAnswer)) {
        return userAnswer.every(answer => 
          this.correct_answers.some(correct => 
            this.case_sensitive ? answer === correct : answer.toLowerCase() === correct.toLowerCase()
          )
        );
      }
      return this.correct_answers.some(correct => 
        this.case_sensitive ? userAnswer === correct : userAnswer.toLowerCase() === correct.toLowerCase()
      );
      
    case 'essay':
      // Essay questions typically need manual grading
      return null;
      
    default:
      return false;
  }
};

// Method to calculate success rate
QuizQuestionSchema.methods.getSuccessRate = function() {
  if (this.times_answered === 0) return 0;
  return (this.times_correct / this.times_answered) * 100;
};

// Method to get correct answers (for display purposes)
QuizQuestionSchema.methods.getCorrectAnswers = function() {
  switch (this.question_type) {
    case 'multiple_choice':
    case 'single_choice':
      return this.options.filter(opt => opt.is_correct).map(opt => opt.text);
      
    case 'true_false':
      return [this.correct_answer];
      
    case 'fill_blank':
      return this.correct_answers;
      
    case 'essay':
      return ['Manual grading required'];
      
    default:
      return [];
  }
};

// Static method to get questions by difficulty
QuizQuestionSchema.statics.getByDifficulty = function(difficulty) {
  return this.find({ difficulty, state: 'active' });
};

// Static method to get questions by type
QuizQuestionSchema.statics.getByType = function(type) {
  return this.find({ question_type: type, state: 'active' });
};

// Static method to get random questions
QuizQuestionSchema.statics.getRandomQuestions = function(count = 10, filters = {}) {
  return this.aggregate([
    { $match: { ...filters, state: 'active' } },
    { $sample: { size: count } }
  ]);
};

export default mongoose.models.QuizQuestion || mongoose.model("QuizQuestion", QuizQuestionSchema);
