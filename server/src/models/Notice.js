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
    refNo: {
      type: String,
      required: true, // e.g. 'IUBAT/RO/2026/042'
    },
    summary: {
      type: String,
      required: true,
    },
    authority: {
      type: String,
      default: 'Office of the Provost',
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
