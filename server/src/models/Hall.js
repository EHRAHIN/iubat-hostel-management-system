const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema(
  {
    hallId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Grad / Research', 'Co-Ed'],
      required: true,
    },
    floors: {
      type: Number,
      default: 5,
    },
    totalRooms: {
      type: Number,
      default: 80,
    },
    totalBeds: {
      type: Number,
      default: 240,
    },
    occupiedBeds: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Under Renovation', 'Closed'],
      default: 'Active',
    },
    provostName: {
      type: String,
      default: 'Prof. Dr. Monirul Islam',
    },
    tutorsAssigned: {
      type: Number,
      default: 4,
    },
    amenities: {
      type: [String],
      default: ['High-speed Wi-Fi', '24/7 Power Backup', 'Common Reading Room', 'Filtered Water', 'CCTV Security'],
    },
    monthlyBaseRent: {
      single: { type: Number, default: 3500 },
      double: { type: Number, default: 2200 },
      fourBed: { type: Number, default: 1400 },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Hall', hallSchema);
