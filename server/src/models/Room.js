const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedLabel: {
    type: String,
    required: true, // 'Bed A', 'Bed B', etc.
  },
  isOccupied: {
    type: Boolean,
    default: false,
  },
  studentId: {
    type: String,
    default: null,
  },
  studentName: {
    type: String,
    default: null,
  },
  studentDept: {
    type: String,
    default: null,
  },
});

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true, // e.g. '304'
      trim: true,
    },
    hallId: {
      type: String,
      required: true, // e.g. 'padma'
      trim: true,
    },
    hallName: {
      type: String,
      required: true, // e.g. 'Padma Residential Hall'
    },
    floor: {
      type: Number,
      required: true, // e.g. 3
    },
    roomType: {
      type: String,
      enum: ['Single Deluxe Room', 'Double Shared Room', '4-Bed Standard Room'],
      default: 'Double Shared Room',
    },
    capacity: {
      type: Number,
      default: 2,
    },
    occupiedCount: {
      type: Number,
      default: 0,
    },
    hasAC: {
      type: Boolean,
      default: false,
    },
    hasBalcony: {
      type: Boolean,
      default: true,
    },
    monthlyRent: {
      type: Number,
      default: 2200,
    },
    status: {
      type: String,
      enum: ['Available', 'Partially Occupied', 'Fully Occupied', 'Under Maintenance'],
      default: 'Available',
    },
    assignedHouseTutor: {
      type: String,
      default: 'Prof. Anisur Rahman',
    },
    beds: [bedSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Room', roomSchema);
