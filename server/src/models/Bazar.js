const mongoose = require('mongoose');

// 1. Bazar Requisition (Daily Next-Day or Monthly Big Bazar applied by Dining Staff to Hostel Super)
const bazarRequisitionSchema = new mongoose.Schema(
  {
    requisitionId: {
      type: String,
      required: true,
      unique: true, // e.g. 'BZR-2026-0309-01'
    },
    requisitionType: {
      type: String,
      enum: ['Daily Next-Day Bazar', 'Monthly Big Bazar'],
      default: 'Daily Next-Day Bazar',
    },
    targetDate: {
      type: String,
      required: true, // YYYY-MM-DD
    },
    title: {
      type: String,
      required: true,
    },
    hall: {
      type: String,
      default: 'Padma Residential Hall (Male)',
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, default: 'kg' }, // kg, Liters, Pcs, Bags
        category: { type: String, default: 'General' },
        estimatedRate: { type: Number, default: 0 },
        estimatedTotal: { type: Number, default: 0 },
        actualTotal: { type: Number, default: 0 },
      },
    ],
    totalEstimatedCost: {
      type: Number,
      required: true,
    },
    totalActualCost: {
      type: Number,
      default: 0,
    },
    submittedBy: {
      type: String,
      default: 'Md. Kalam Hossain (Dining Staff In-Charge)',
    },
    status: {
      type: String,
      enum: ['Pending Super Approval', 'Approved by Hostel Super', 'Purchased & Stocked', 'Rejected'],
      default: 'Pending Super Approval',
    },
    approvedBy: {
      type: String,
      default: '',
    },
    approvedBudget: {
      type: Number,
      default: 0,
    },
    approvalRemarks: {
      type: String,
      default: '',
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    voucherNo: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// 2. Kitchen Grocery & Pantry Stock (Tracked by Dining Staff, Hostel Super, Admin)
const bazarStockSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      default: 'Grains & Staple',
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      default: 'kg', // kg, Liters, Pcs, Bags
    },
    minThreshold: {
      type: Number,
      default: 20, // Alert threshold
    },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Critical Empty'],
      default: 'In Stock',
    },
    lastRestockedDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    hall: {
      type: String,
      default: 'Padma Residential Hall (Male)',
    },
  },
  { timestamps: true }
);

const BazarRequisition = mongoose.model('BazarRequisition', bazarRequisitionSchema);
const BazarStock = mongoose.model('BazarStock', bazarStockSchema);

module.exports = {
  BazarRequisition,
  BazarStock,
};
