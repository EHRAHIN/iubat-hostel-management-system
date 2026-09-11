const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    applicationRef: {
      type: String,
      required: true,
      unique: true,
      trim: true, // e.g. '#IUBAT-APP-8492'
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      default: 'CSE',
    },
    cgpa: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
    preferredHall: {
      type: String,
      required: true,
      default: 'Padma Residential Hall',
    },
    preferredFloor: {
      type: String,
      default: 'Floor 1',
    },
    preferredRoom: {
      type: String,
      required: true,
      default: 'Double Shared Room',
    },
    preferredCapacity: {
      type: Number,
      enum: [1, 2, 4],
      default: 2,
    },
    preferredRoomNo: {
      type: String,
      default: '',
    },
    preferredBed: {
      type: String,
      default: '',
    },
    guardianPhone: {
      type: String,
      default: '',
    },
    homeAddress: {
      type: String,
      default: '',
    },
    session: {
      type: String,
      default: 'Spring 2026',
    },
    status: {
      type: String,
      enum: ['Pending Review', 'Pending Provost Approval', 'Provost Approved', 'Allocated', 'Rejected', 'Waitlisted'],
      default: 'Pending Provost Approval',
    },
    preferences: {
      sleepSchedule: { type: String, default: 'night-owl' },
      studyHabit: { type: String, default: 'moderate-study' },
      cleanliness: { type: String, default: 'strictly-clean' },
      religious: { type: String, default: 'regular-practicing' },
      departmentPreference: { type: String, default: 'same-dept' },
      behavior: { type: String, default: 'balanced' },
      roomTypePreference: { type: String, default: 'Double Shared Room' },
    },
    aiPartner: {
      name: { type: String, default: '' },
      userId: { type: String, default: '' },
      department: { type: String, default: '' },
      cgpa: { type: String, default: '' },
      phone: { type: String, default: '' },
      seatNo: { type: String, default: '' },
      matchScore: { type: Number, default: 95.0 },
      matchReasons: [{ type: String }],
    },
    recommendedHall: {
      type: String,
      default: '',
    },
    recommendedFloor: {
      type: String,
      default: '',
    },
    recommendedRoom: {
      type: String,
      default: '',
    },
    recommendedBed: {
      type: String,
      default: '',
    },
    recommendedTutor: {
      type: String,
      default: '',
    },
    allocatedHall: {
      type: String,
      default: '',
    },
    allocatedFloor: {
      type: String,
      default: '',
    },
    allocatedRoom: {
      type: String,
      default: '',
    },
    allocatedBed: {
      type: String,
      default: '',
    },
    remarks: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Application', applicationSchema);
