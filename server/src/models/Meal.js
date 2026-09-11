const mongoose = require('mongoose');

const mealBookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true, // e.g. 'MEL-2026-892'
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
    room: {
      type: String,
      default: 'Room 104',
    },
    date: {
      type: String,
      required: true, // YYYY-MM-DD
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Full Day (3 Meals)'],
      default: 'Lunch',
    },
    diet: {
      type: String,
      default: 'Standard Rice, Dal & Curry',
    },
    tokenCostBDT: {
      type: Number,
      default: 50,
    },
    status: {
      type: String,
      enum: ['Applied & Counted', 'Confirmed & Counted', 'Approved & Served', 'Pending Approval', 'Rejected'],
      default: 'Applied & Counted',
    },
    foodCollected: {
      type: Boolean,
      default: false,
    },
    collectedAt: {
      type: Date,
      default: null,
    },
    collectedByStaff: {
      type: String,
      default: '',
    },
    approvedBy: {
      type: String,
      default: '',
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const menuSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      required: true, // Monday, Tuesday, etc.
    },
    breakfast: {
      items: [String],
      timing: { type: String, default: '07:30 AM - 09:30 AM' },
    },
    lunch: {
      items: [String],
      timing: { type: String, default: '12:45 PM - 02:30 PM' },
    },
    dinner: {
      items: [String],
      timing: { type: String, default: '07:45 PM - 09:45 PM' },
    },
    specialFeast: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const MealBooking = mongoose.model('MealBooking', mealBookingSchema);
const Menu = mongoose.model('Menu', menuSchema);

module.exports = {
  MealBooking,
  Menu,
};
