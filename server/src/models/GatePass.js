const mongoose = require('mongoose');

const gatePassSchema = new mongoose.Schema(
  {
    passId: {
      type: String,
      required: true,
      unique: true, // e.g. 'LP-2026-094'
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
    },
    room: {
      type: String,
      required: true,
    },
    passType: {
      type: String,
      enum: ['Weekend Out-Pass', 'Emergency Leave', 'Medical Leave', 'Semester Break Vacation', 'Night Out-Pass'],
      default: 'Weekend Out-Pass',
    },
    fromDate: {
      type: String,
      required: true,
    },
    toDate: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    emergencyContact: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'Pending Guardian Consent',
        'Guardian Approved (Pending Floor Teacher)',
        'Approved',
        'Teacher Approved',
        'Provost Approved',
        'Rejected by Guardian',
        'Rejected by Floor Teacher',
        'Rejected by Provost',
        'Rejected',
        'Completed (Returned)',
        // Legacy support
        'Pending Teacher Review',
      ],
      default: 'Pending Guardian Consent',
    },
    guardianConsent: {
      type: String,
      enum: ['Pending', 'Granted', 'Declined'],
      default: 'Pending',
    },
    guardianName: {
      type: String,
      default: '',
    },
    guardianPhone: {
      type: String,
      default: '',
    },
    guardianConsentAt: {
      type: Date,
      default: null,
    },
    floorTeacherStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    floorTeacherName: {
      type: String,
      default: '',
    },
    floorTeacherApprovedAt: {
      type: Date,
      default: null,
    },
    provostStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    provostApprovedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: String,
      default: '',
    },
    qrPassCode: {
      type: String,
      default: '',
    },
    actionRemarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GatePass', gatePassSchema);
