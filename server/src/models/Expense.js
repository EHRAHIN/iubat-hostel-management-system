const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    expenseId: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Mess Grocery & Food Supplies', 'Electricity & Utilities', 'Maintenance & Repairs', 'Staff Salaries & Honorarium', 'Sanitation & Cleaning', 'Internet & IT Infrastructure', 'Miscellaneous'],
      default: 'Mess Grocery & Food Supplies',
    },
    hall: {
      type: String,
      default: 'Padma Residential Hall (Male)',
    },
    amountBDT: {
      type: Number,
      required: true,
    },
    vendor: {
      type: String,
      default: 'Campus Procurement / Vendor',
    },
    voucherNo: {
      type: String,
      default: () => `VOUCH-${Math.floor(100000 + Math.random() * 900000)}`,
    },
    approvedBy: {
      type: String,
      default: 'Super Admin (VC / Chief Financial Officer)',
    },
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer', 'Cheque', 'Petty Cash', 'SSLCommerz Corporate'],
      default: 'Bank Transfer',
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    month: {
      type: String,
      default: 'March 2026',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
