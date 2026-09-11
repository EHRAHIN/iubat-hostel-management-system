const mongoose = require('mongoose');

const roomTransferRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      default: 'CSE',
    },
    cgpa: {
      type: Number,
      default: 3.5,
    },
    phone: {
      type: String,
      default: '',
    },
    currentHall: {
      type: String,
      default: 'Padma Residential Hall (Male)',
    },
    currentFloor: {
      type: String,
      default: 'Floor 1',
    },
    currentRoom: {
      type: String,
      required: true,
      trim: true,
    },
    currentBed: {
      type: String,
      required: true,
      trim: true,
    },
    preferredHall: {
      type: String,
      default: '',
    },
    preferredFloor: {
      type: String,
      default: 'Floor 1',
    },
    preferredRoomType: {
      type: String,
      default: 'Double Shared Room',
    },
    preferredRoom: {
      type: String,
      default: '',
    },
    preferredBed: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending Review', 'Approved', 'Rejected'],
      default: 'Pending Review',
    },
    reviewedBy: {
      type: String,
      default: '',
    },
    reviewRemarks: {
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RoomTransferRequest', roomTransferRequestSchema);
