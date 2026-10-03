const mongoose = require('mongoose');

const questionResultSchema = new mongoose.Schema({
  questionId: { type: String, default: () => 'q_' + Math.random().toString(36).substring(2, 9) },
  question: { type: String, required: true },
  category: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  userAnswer: { type: String, default: '' },
  candidateAnswer: { type: String, default: '' },
  expectedAnswer: { type: String, default: '' },
  keyPoints: [{ type: String }],
  skipped: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  correctness: { type: Number, default: 0 },
  relevance: { type: Number, default: 0 },
  completeness: { type: Number, default: 0 },
  clarity: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
  strengths: [{ type: String }],
  missingPoints: [{ type: String }],
  improvedAnswer: { type: String, default: '' }
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  interviewId: {
    type: String,
    default: () => 'int_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    index: true
  },
  role: {
    type: String,
    default: ''
  },
  jobRole: {
    type: String,
    required: true
  },
  experienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  interviewType: {
    type: String,
    enum: ['Technical', 'Behavioral', 'Mixed'],
    required: true
  },
  technicalTopic: {
    type: String,
    default: ''
  },
  questionCount: {
    type: Number,
    required: true,
    enum: [5, 10, 15]
  },
  answeredCount: {
    type: Number,
    default: 0
  },
  skippedCount: {
    type: Number,
    default: 0
  },
  overallScore: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String,
    default: ''
  },
  criterionScores: {
    correctness: { type: Number, default: 0 },
    relevance: { type: Number, default: 0 },
    completeness: { type: Number, default: 0 },
    clarity: { type: Number, default: 0 }
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  report: {
    strengths: [{ type: String }],
    areasToImprove: [{ type: String }],
    recommendations: [
      {
        topic: { type: String },
        action: { type: String },
        resources: { type: String }
      }
    ]
  },
  questions: [questionResultSchema],
  dateTime: {
    type: Date,
    default: Date.now
  },
  date: {
    type: String,
    default: () => new Date().toISOString()
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Interview || mongoose.model('Interview', interviewSchema);

