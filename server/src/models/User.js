const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      default: '123456',
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'super', 'staff', 'parent', 'admin'],
      required: true,
      default: 'student',
    },
    department: {
      type: String,
      default: 'CSE',
    },
    phone: {
      type: String,
      default: '',
    },
    cgpa: {
      type: Number,
      default: null,
    },
    hall: {
      type: String,
      default: '',
    },
    floor: {
      type: String,
      default: '',
    },
    room: {
      type: String,
      default: '',
    },
    seatNo: {
      type: String,
      default: '',
    },
    preferredCapacity: {
      type: Number,
      enum: [1, 2, 4],
      default: 2,
    },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Suspended', 'Blocked', 'Graduated'],
      default: 'Active',
    },
    guardianName: {
      type: String,
      default: '',
    },
    guardianPhone: {
      type: String,
      default: '',
    },
    floorTeacher: {
      type: String,
      default: '',
    },
    floorTeacherPhone: {
      type: String,
      default: '',
    },
    unit: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    allocationStatus: {
      type: String,
      enum: ['Allocated', 'Pending', 'Pending Provost Approval', 'Waiting List'],
      default: 'Pending Provost Approval',
    },
    preferences: {
      sleepSchedule: { type: String, default: 'night-owl' }, // 'night-owl' | 'early-riser' | 'flexible'
      studyHabit: { type: String, default: 'moderate-study' }, // 'intense-silent' | 'moderate-study' | 'less-study-casual'
      cleanliness: { type: String, default: 'strictly-clean' }, // 'strictly-clean' | 'moderate' | 'flexible'
      religious: { type: String, default: 'regular-practicing' }, // 'regular-practicing' | 'moderate' | 'flexible'
      departmentPreference: { type: String, default: 'same-dept' }, // 'same-dept' | 'any-dept'
      behavior: { type: String, default: 'balanced' }, // 'quiet-introvert' | 'friendly-extrovert' | 'balanced'
      roomTypePreference: { type: String, default: 'Double Shared Room' }, // 'Double Shared Room' | 'Single Deluxe Room' | '4-Bed Standard Room'
      noiseTolerance: { type: String, default: 'Low' },
    },
    roommate: {
      name: { type: String, default: '' },
      userId: { type: String, default: '' },
      department: { type: String, default: '' },
      cgpa: { type: String, default: '' },
      phone: { type: String, default: '' },
      seatNo: { type: String, default: '' },
      matchScore: { type: Number, default: 94 },
      matchReasons: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
