const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const formDataSchema = new mongoose.Schema({
  // Personal Info
  fullName: { type: String },
  email: { type: String },
  phone: { type: String },
  collegeName: { type: String },
  department: { type: String },
  role: { type: String },
  year: { type: String },
  semester: { type: String },
  // Project Details
  projectTitle: { type: String },
  projectDescription: { type: String },
  websiteUrl: { type: String },
  githubRepo: { type: String },
  // MCQ Answers - stored as object with questionId -> answer
  mcqAnswers: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { _id: false });

const mcqScoreSchema = new mongoose.Schema({
  totalQuestions: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 }
}, { _id: false });

const examSessionSchema = new mongoose.Schema({
  // Unique session identifier
  sessionId: { 
    type: String, 
    default: () => uuidv4(),
    unique: true,
    index: true
  },
  // User identification
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true
  },
  phone: { 
    type: String, 
    required: true,
    trim: true
  },
  // Current step in the exam (1-4)
  currentStep: { 
    type: Number, 
    default: 1,
    min: 1,
    max: 4
  },
  // All form data saved during progress
  formData: { 
    type: formDataSchema, 
    default: () => ({}) 
  },
  // MCQ score (populated on submit)
  mcqScore: { 
    type: mcqScoreSchema, 
    default: () => ({}) 
  },
  // Session status
  status: { 
    type: String, 
    enum: ['in_progress', 'passed', 'failed'], 
    default: 'in_progress' 
  },
  // When the exam was completed
  completedAt: { type: Date },
  // Reference to submission if passed
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }
}, { timestamps: true });

// Unique compound index on email + phone - only one session per user
examSessionSchema.index({ email: 1, phone: 1 }, { unique: true });

// Passing threshold percentage (can be changed)
examSessionSchema.statics.PASSING_PERCENTAGE = 50;

module.exports = mongoose.model('ExamSession', examSessionSchema);
