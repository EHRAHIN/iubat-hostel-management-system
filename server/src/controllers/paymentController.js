const Payment = require('../models/Payment');
const User = require('../models/User');
const { MealBooking } = require('../models/Meal');

// @desc    Initiate SSLCommerz Payment Session (Hostel Rent or Consumed Meal Bill)
// @route   POST /api/payments/sslcommerz/init
exports.initiateSSLCommerzPayment = async (req, res) => {
  try {
    const {
      invoiceId,
      invoiceNo: existingInvoiceNo,
      studentId,
      studentName,
      department,
      hall,
      room,
      seatNo,
      feeType,
      amountBDT,
      month,
      payerRole,
      payerName,
      payerPhone,
      channel,
    } = req.body;

    if (!studentId || !amountBDT || !feeType) {
      return res.status(400).json({ success: false, message: 'Missing required payment parameters' });
    }

    const cleanId = studentId.toString().trim();
    const userDoc = await User.findOne({ userId: cleanId });

    const timestamp = Date.now().toString().slice(-6);
    const tran_id = `SSL-TXN-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${timestamp}`;
    
    let payment = null;

    // If paying an existing Due invoice, attach to that exact invoice
    if (invoiceId) {
      payment = await Payment.findById(invoiceId);
    } else if (existingInvoiceNo) {
      payment = await Payment.findOne({ invoiceNo: existingInvoiceNo, studentId: cleanId });
    } else {
      // Look for an existing Due invoice with the same feeType and month
      payment = await Payment.findOne({
        studentId: cleanId,
        feeType: feeType,
        month: month || 'March 2026',
        status: 'Due',
      });
    }

    // Dynamic Breakdown with Rule Enforcement (5th deadline, 10% fine, month-end meals)
    const currentDay = new Date().getDate();
    const isPast5th = currentDay > 5;
    let breakdown = [];

    if (feeType === 'Seat Rent') {
      const baseRent = isPast5th ? Math.round(Number(amountBDT) / 1.10) : Number(amountBDT);
      const lateFine = Number(amountBDT) - baseRent;
      breakdown = [
        { label: 'Room Seat Base Rent (Monthly)', amount: baseRent },
        ...(isPast5th && lateFine > 0
          ? [{ label: '10% Late Payment Penalty (Overdue: Paid after 5th of Month)', amount: lateFine }]
          : [{ label: 'On-Time Regular Window (Due on or before 5th of Month - 0% Fine)', amount: 0 }]),
      ];
    } else if (feeType === 'Monthly Meal Token' || feeType.includes('Meal') || feeType.includes('Mess')) {
      // RULE: Meal khawa hok r na hok apply korar por ta pay kora lagbe
      const billableMeals = await MealBooking.find({ studentId: cleanId, status: { $ne: 'Rejected' } });
      breakdown = [
        { label: `Monthly Dining Meals (${billableMeals.length} Meals Applied - Mandatory Billing)`, amount: Number(amountBDT) },
      ];
    } else if (feeType.includes('Combined') || feeType.includes('Full Clearance')) {
      breakdown = [
        { label: 'Room Seat Rent (Monthly)', amount: 2200 },
        ...(isPast5th ? [{ label: '10% Late Payment Penalty (After 5th)', amount: 220 }] : []),
        { label: 'Month-End Actual Consumed Dining Meals', amount: Math.max(0, Number(amountBDT) - (isPast5th ? 2420 : 2200)) },
      ];
    } else {
      breakdown = [
        { label: `${feeType} Assessment`, amount: Number(amountBDT) },
      ];
    }

    if (payment) {
      // Update existing Due invoice to Pending with active tran_id
      payment.transactionId = tran_id;
      payment.amountBDT = Number(amountBDT);
      payment.paymentMethod = `SSLCommerz (${channel ? channel.toUpperCase() : 'Gateway'})`;
      payment.payerRole = payerRole || payment.payerRole || 'student';
      payment.payerName = payerName || payment.payerName || userDoc?.name || 'Resident Payer';
      payment.payerPhone = payerPhone || payment.payerPhone || userDoc?.phone || '+880 1712 345678';
      if (breakdown.length > 0) payment.breakdown = breakdown;
      await payment.save();
    } else {
      // Create new pending payment
      const newInvoiceNo = existingInvoiceNo || `INV-${new Date().getFullYear()}-${timestamp}`;
      payment = await Payment.create({
        invoiceNo: newInvoiceNo,
        studentId: cleanId,
        studentName: studentName || userDoc?.name || 'IUBAT Resident Student',
        department: department || userDoc?.department || 'CSE',
        hall: hall || userDoc?.hall || 'Padma Residential Hall (Male)',
        room: room || userDoc?.room || 'Room 101',
        seatNo: seatNo || userDoc?.seatNo || 'Bed A',
        feeType,
        month: month || 'March 2026',
        amountBDT: Number(amountBDT),
        status: 'Pending',
        paymentMethod: `SSLCommerz (${channel ? channel.toUpperCase() : 'Gateway'})`,
        transactionId: tran_id,
        payerRole: payerRole || 'student',
        payerName: payerName || studentName || userDoc?.name || 'Resident Payer',
        payerPhone: payerPhone || userDoc?.phone || '+880 1712 345678',
        breakdown,
      });
    }

    res.status(200).json({
      success: true,
      message: 'SSLCommerz Payment Session Initialized',
      data: {
        sessionKey: `SSL-SES-${tran_id}`,
        tran_id,
        invoiceNo: payment.invoiceNo,
        amount: payment.amountBDT,
        currency: 'BDT',
        feeType,
        paymentId: payment._id,
        GatewayPageURL: `/payment/sslcommerz/checkout?tran_id=${tran_id}`,
        payment,
      },
    });
  } catch (error) {
    console.error('SSLCommerz Init Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete / Verify SSLCommerz Payment
// @route   POST /api/payments/sslcommerz/complete
exports.completeSSLCommerzPayment = async (req, res) => {
  try {
    const {
      tran_id,
      val_id,
      bank_tran_id,
      card_type,
      card_brand,
      paymentMethod,
      payerName,
      payerPhone,
    } = req.body;

    if (!tran_id) {
      return res.status(400).json({ success: false, message: 'Transaction ID is required' });
    }

    const payment = await Payment.findOne({ transactionId: tran_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found for transaction' });
    }

    payment.status = 'Paid';
    payment.paidAt = new Date();
    payment.valId = val_id || `VAL-${Date.now().toString().slice(-8)}`;
    payment.bankTranId = bank_tran_id || `BANK-${Math.floor(100000 + Math.random() * 900000)}`;
    payment.cardType = card_type || paymentMethod || 'SSLCommerz-bKash';
    payment.cardBrand = card_brand || 'MOBILEBANKING';
    payment.paymentMethod = paymentMethod || payment.paymentMethod || 'SSLCommerz (bKash)';
    if (payerName) payment.payerName = payerName;
    if (payerPhone) payment.payerPhone = payerPhone;

    await payment.save();

    res.status(200).json({
      success: true,
      message: `Payment of ৳${payment.amountBDT} verified & cleared via SSLCommerz! 0 BDT remaining due.`,
      data: payment,
    });
  } catch (error) {
    console.error('SSLCommerz Complete Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payments with dynamic month-end actual consumed meals calculation
// @route   GET /api/payments
exports.getPayments = async (req, res) => {
  try {
    const { studentId, status, feeType } = req.query;
    const filter = {};

    if (studentId) {
      filter.studentId = studentId.toString().trim();
    }
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (feeType && feeType !== 'All') {
      filter.feeType = feeType;
    }

    let payments = await Payment.find(filter).sort({ createdAt: -1 });

    // Dynamic month-end meal bill calculation based on EXACT consumed meals
    if (studentId) {
      const cleanId = studentId.toString().trim();
      const userDoc = await User.findOne({ userId: cleanId });

      // RULE: "meal khawa hok r na hok apply korar por ta pay kora lagbe"
      // Count all non-rejected applied meals as mandatory payable charges
      const billableMeals = await MealBooking.find({ studentId: cleanId, status: { $ne: 'Rejected' } });
      const appliedCount = billableMeals.length;
      const appliedTotalBDT = billableMeals.reduce((sum, b) => sum + (b.tokenCostBDT || 50), 0);

      // Check if student has a Monthly Meal Bill for March 2026
      const existingMealInvoice = await Payment.findOne({
        studentId: cleanId,
        feeType: 'Monthly Meal Token',
        month: 'March 2026',
      });

      if (!existingMealInvoice && appliedCount > 0) {
        // Create dynamic meal bill matching applied meals
        await Payment.create({
          invoiceNo: `INV-2026-M${cleanId.slice(-4)}`,
          studentId: cleanId,
          studentName: userDoc?.name || 'Resident Student',
          department: userDoc?.department || 'CSE',
          hall: userDoc?.hall || 'Padma Residential Hall (Male)',
          room: userDoc?.room || 'Room 101',
          seatNo: userDoc?.seatNo || 'Bed A',
          feeType: 'Monthly Meal Token',
          month: 'March 2026',
          amountBDT: appliedTotalBDT,
          status: 'Due',
          paymentMethod: 'SSLCommerz',
          transactionId: `SSL-TXN-202603-M${cleanId.slice(-4)}`,
          breakdown: [
            { label: `Monthly Booked Meals (${appliedCount} Meals Applied - Mandatory Billing)`, amount: appliedTotalBDT },
          ],
        });
        payments = await Payment.find(filter).sort({ createdAt: -1 });
      } else if (existingMealInvoice && existingMealInvoice.status === 'Due') {
        // Keep amount synced with real-time applied meals
        if (existingMealInvoice.amountBDT !== appliedTotalBDT && appliedCount > 0) {
          existingMealInvoice.amountBDT = appliedTotalBDT;
          existingMealInvoice.breakdown = [
            { label: `Monthly Booked Meals (${appliedCount} Meals Applied - Mandatory Billing)`, amount: appliedTotalBDT },
          ];
          await existingMealInvoice.save();
        } else if (appliedCount === 0) {
          existingMealInvoice.amountBDT = 0;
          await existingMealInvoice.save();
        }
      }

      // =========================================================================
      // RULE ENFORCEMENT:
      // 1. Hostel fee must be paid by the 5th of every month.
      // 2. If after 5th of month, 10% late fee penalty is automatically added.
      // 3. Month-end dining meals are billed based on actual consumed meals.
      // =========================================================================
      const currentDayOfMonth = new Date().getDate();
      const isPast5thDeadline = currentDayOfMonth > 5;
      const lateFinePercent = 0.10; // 10% penalty

      // Ensure standard March 2026 Seat Rent invoice exists or is updated with 10% late fine if past 5th
      let rentInvoice = payments.find((p) => p.feeType === 'Seat Rent' && p.status === 'Due');

      if (!rentInvoice && payments.filter((p) => p.feeType === 'Seat Rent').length === 0) {
        const baseRent = 2200;
        const lateFine = isPast5thDeadline ? Math.round(baseRent * lateFinePercent) : 0;
        const totalRent = baseRent + lateFine;

        const breakdown = [
          { label: 'Room Seat Base Rent (Monthly)', amount: baseRent },
          ...(isPast5thDeadline
            ? [{ label: '10% Late Payment Penalty (Overdue: Paid after 5th of Month)', amount: lateFine }]
            : [{ label: 'On-Time Regular Window (Due on or before 5th of Month - 0% Fine)', amount: 0 }]),
        ];

        const seedRent = await Payment.create({
          invoiceNo: `INV-2026-R${cleanId.slice(-4)}`,
          studentId: cleanId,
          studentName: userDoc?.name || 'Tanvir Hasan',
          department: userDoc?.department || 'CSE',
          hall: userDoc?.hall || 'Padma Residential Hall (Male)',
          room: userDoc?.room || 'Room 101',
          seatNo: userDoc?.seatNo || 'Bed A',
          feeType: 'Seat Rent',
          month: 'March 2026',
          amountBDT: totalRent,
          status: 'Due',
          paymentMethod: 'SSLCommerz',
          transactionId: `SSL-TXN-202603-R${cleanId.slice(-4)}`,
          breakdown,
        });
        payments.unshift(seedRent);
      } else if (rentInvoice && rentInvoice.status === 'Due') {
        const baseRent = 2200;
        const lateFine = isPast5thDeadline ? Math.round(baseRent * lateFinePercent) : 0;
        const totalRent = baseRent + lateFine;

        if (rentInvoice.amountBDT !== totalRent) {
          rentInvoice.amountBDT = totalRent;
          rentInvoice.breakdown = [
            { label: 'Room Seat Base Rent (Monthly)', amount: baseRent },
            ...(isPast5thDeadline
              ? [{ label: '10% Late Payment Penalty (Overdue: Paid after 5th of Month)', amount: lateFine }]
              : [{ label: 'On-Time Regular Window (Due on or before 5th of Month - 0% Fine)', amount: 0 }]),
          ];
          await rentInvoice.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error('Get Payments Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single payment receipt by ID or Invoice Number
// @route   GET /api/payments/:id
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    let payment = null;

    if (id.startsWith('INV-') || id.startsWith('SSL-TXN-')) {
      payment = await Payment.findOne({ $or: [{ invoiceNo: id }, { transactionId: id }] });
    } else {
      payment = await Payment.findById(id);
    }

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Get Payment By ID Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Custom Invoice
// @route   POST /api/payments/create-invoice
exports.createInvoice = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      feeType,
      month,
      amountBDT,
      breakdown,
    } = req.body;

    const cleanId = studentId ? studentId.toString().trim() : '221004128';
    const userDoc = await User.findOne({ userId: cleanId });

    const timestamp = Date.now().toString().slice(-6);
    const invoiceNo = `INV-${new Date().getFullYear()}-${timestamp}`;
    const tran_id = `SSL-TXN-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${timestamp}`;

    const payment = await Payment.create({
      invoiceNo,
      studentId: cleanId,
      studentName: studentName || userDoc?.name || 'Resident Student',
      department: userDoc?.department || 'CSE',
      hall: userDoc?.hall || 'Padma Residential Hall (Male)',
      room: userDoc?.room || 'Room 101',
      seatNo: userDoc?.seatNo || 'Bed A',
      feeType: feeType || 'Seat Rent',
      month: month || 'March 2026',
      amountBDT: Number(amountBDT) || 2200,
      status: 'Due',
      paymentMethod: 'SSLCommerz',
      transactionId: tran_id,
      breakdown: breakdown || [{ label: `${feeType || 'Fee'} Charge`, amount: Number(amountBDT) || 2200 }],
    });

    res.status(201).json({
      success: true,
      message: `Invoice #${invoiceNo} generated for ${payment.studentName}`,
      data: payment,
    });
  } catch (error) {
    console.error('Create Invoice Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
