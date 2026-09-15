const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      default: () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    },
    category: {
      type: String,
      enum: ['Allocation', 'Administration', 'Dining', 'Maintenance', 'Academic', 'Discipline'],
      default: 'Administration',
    },
    targetAudience: {
      type: String,
      enum: ['all', 'students', 'teachers', 'staff', 'parents', 'floor-1', 'floor-2'],
      default: 'all',
    },
    targetAudienceLabel: {
      type: String,
      default: 'All Residents & Campus',
    },
    refNo: {
      type: String,
      required: true, // e.g. 'HSTL/PRV/2026/042'
    },
    summary: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    authority: {
      type: String,
      default: 'Office of the Provost',
    },
    publishedBy: {
      type: String,
      default: 'Prof. Dr. Monirul Islam (Hostel Super / Provost)',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notice', noticeSchema);
