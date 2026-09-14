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
      enum: ['Paid', 'Pending', 'Due', 'Failed', 'Canceled', 'Refunded'],
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
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // SSLCommerz & Tenant Booking Compatibility Fields
    paymentStatus: {
      type: String,
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      default: 'confirmed',
    },
    payAbleAmount: {
      type: Number,
    },
    tenantName: {
      type: String,
      default: '',
    },
    tenantEmail: {
      type: String,
      default: '',
    },
    tenantPhone: {
      type: String,
      default: '',
    },
    bookingId: {
      type: String,
      default: '',
    },
    checkInDate: {
      type: Date,
      default: null,
    },
    advanceMonths: {
      type: Number,
      default: 1,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    mess_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: {
      type: String,
      default: '',
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    refundedBy: {
      type: String,
      default: '',
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Synchronize status and paymentStatus before validation
paymentSchema.pre('save', function (next) {
  if (this.paymentStatus === 'paid' && this.status !== 'Paid') {
    this.status = 'Paid';
  } else if (this.status === 'Paid' && this.paymentStatus !== 'paid') {
    this.paymentStatus = 'paid';
  } else if (this.paymentStatus === 'failed' && this.status !== 'Failed') {
    this.status = 'Failed';
  } else if (this.paymentStatus === 'cancelled' && this.status !== 'Canceled') {
    this.status = 'Canceled';
  }

  if (this.amountBDT && !this.payAbleAmount) {
    this.payAbleAmount = this.amountBDT;
  }
  if (!this.amountBDT && this.payAbleAmount) {
    this.amountBDT = this.payAbleAmount;
  }
  if (!this.tenantName && this.studentName) {
    this.tenantName = this.studentName;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);

