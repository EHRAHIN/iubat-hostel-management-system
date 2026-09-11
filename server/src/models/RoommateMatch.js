const mongoose = require('mongoose');

const roommateMatchSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: 'CSE',
    },
    sleepHabit: {
      type: String,
      enum: ['early-bird', 'night-owl', 'flexible'],
      default: 'night-owl',
    },
    studyEnvironment: {
      type: String,
      enum: ['silent', 'background-music', 'group-study'],
      default: 'silent',
    },
    cleanlinessScore: {
      type: Number,
      min: 1,
      max: 10,
      default: 8,
    },
    acPreference: {
      type: String,
      enum: ['yes', 'no', 'moderate'],
      default: 'yes',
    },
    smokingStatus: {
      type: String,
      enum: ['non-smoker', 'smoker'],
      default: 'non-smoker',
    },
    departmentPreference: {
      type: String,
      default: 'any',
    },
    matchedWith: {
      studentId: { type: String, default: null },
      studentName: { type: String, default: null },
      department: { type: String, default: null },
      matchScore: { type: Number, default: 0 },
      compatibilityStatus: { type: String, default: '' },
      reasons: [String],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RoommateMatch', roommateMatchSchema);
