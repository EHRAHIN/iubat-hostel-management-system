const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: true,
      unique: true, // e.g. 'INV-2026-0318'
    },
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: 'CSE',
    },
    hall: {
      type: String,
      default: 'Padma Residential Hall (Male)',
    },
    room: {
      type: String,
      default: 'Room 101',
    },
    seatNo: {
      type: String,
      default: 'Bed A',
    },
    feeType: {
      type: String,
      enum: ['Seat Rent', 'Hall Admission', 'Mess Advance', 'Monthly Meal Token', 'Late Fine', 'Utility & Maintenance'],
      required: true,
    },
    month: {
      type: String,
      default: 'March 2026',
    },
    amountBDT: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Due', 'Failed', 'Canceled'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      default: 'SSLCommerz',
    },
    transactionId: {
      type: String,
      default: '',
    },
    valId: {
      type: String,
      default: '',
    },
    bankTranId: {
      type: String,
      default: '',
    },
    cardType: {
      type: String,
      default: '',
    },
    cardBrand: {
      type: String,
      default: '',
    },
    payerRole: {
      type: String,
      enum: ['student', 'parent', 'admin'],
      default: 'student',
    },
    payerName: {
      type: String,
      default: '',
    },
    payerPhone: {
      type: String,
      default: '',
    },
    breakdown: [
      {
        label: String,
        amount: Number,
      },
    ],
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
