const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true, // e.g. 'WRK-2026-104'
    },
    studentId: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    hall: {
      type: String,
      required: true,
      default: 'Padma Residential Hall (Male)',
    },
    floor: {
      type: String,
      required: true,
      default: 'Floor 1',
    },
    room: {
      type: String,
      required: true,
      default: 'Room 104',
    },
    category: {
      type: String,
      enum: ['Electrical', 'Water Pump & Plumbing', 'Cleaning & Sanitization', 'Furniture & Hardware', 'Wi-Fi & LAN', 'Internet & Network', 'Other'],
      required: true,
      default: 'Electrical',
    },
    priority: {
      type: String,
      enum: ['Low', 'Normal', 'Medium', 'High', 'Urgent'],
      default: 'Normal',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'Pending Floor Teacher Verification',
    },
    // Step 2: Floor Teacher Verification
    tutorStatus: {
      type: String,
      default: 'Pending Floor Teacher Verification',
    },
    tutorName: {
      type: String,
      default: 'Assigned House Tutor',
    },
    tutorNotes: {
      type: String,
      default: '',
    },
    // Step 3: Provost Assignment
    assignedStaff: {
      type: String,
      default: 'Pending Provost Assignment',
    },
    assignedStaffId: {
      type: String,
      default: '',
    },
    staffPhone: {
      type: String,
      default: '',
    },
    materialsNeeded: {
      type: String,
      default: 'Standard replacement parts',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
