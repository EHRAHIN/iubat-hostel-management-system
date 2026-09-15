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
      enum: [
        'Electrical', 'Electricity',
        'Network', 'Wi-Fi & LAN', 'Internet & Network', 'Internet / Wi-Fi & LAN',
        'Plumbing', 'Water Pump & Plumbing', 'Water & Plumbing', 'Plumbing & Water',
        'Furniture', 'Furniture & Hardware', 'Furniture & Locks',
        'Cleaning & Sanitization', 'Cleaning', 'Carpentry', 'General', 'Other',
        'Discipline', 'Curfew Violation', 'Unauthorized Visitor', 'Noise Disturbance',
        'Cleanliness Issue', 'Floor Inspection', 'Demerit'
      ],
      required: true,
      default: 'Electrical',
    },
    priority: {
      type: String,
      enum: ['Low', 'Normal', 'Medium', 'High', 'Urgent', 'Critical'],
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
    // Maintenance Work Live Progress Tracking (Visible to Student, Teacher, Provost, Admin)
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    workStartedAt: {
      type: Date,
      default: null,
    },
    estimatedCompletion: {
      type: String,
      default: '',
    },
    staffNotes: {
      type: String,
      default: '',
    },
    // Floor Teacher Disciplinary & Room Conduct Reporting
    isTeacherComplaint: {
      type: Boolean,
      default: false,
    },
    incidentType: {
      type: String,
      default: 'Maintenance Issue', // 'Maintenance Issue', 'Disciplinary Incident', 'Room Conduct Demerit', 'Noise Violation', 'Late Night Return'
    },
    reportedByRole: {
      type: String,
      default: 'Student', // 'Student', 'Floor Teacher', 'Staff', 'Hostel Super'
    },
    reportedByName: {
      type: String,
      default: '',
    },
    targetStudentId: {
      type: String,
      default: '',
    },
    targetStudentName: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
