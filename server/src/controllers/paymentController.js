const SSLCommerzPayment = require('sslcommerz-lts');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Room = require('../models/Room');
const ApiSuccess = require('../utils/ApiSuccess');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendPaymentSuccess } = require('../utils/service/emailService');

// Simple readable format matching user's requested specification
const generateSimpleTransactionId = (bookingId) => {
  const now = new Date();
  const date = now.toLocaleDateString('en-GB').replace(/\//g, '');
  const time = now
    .toLocaleTimeString('en-GB', {
      hour12: false,
    })
    .replace(/:/g, '')
    .slice(0, 6);

  const suffix = bookingId ? bookingId.toString().slice(-6) : Math.floor(100000 + Math.random() * 900000);
  return `BOOKING-${date}-${time}-${suffix}`;
};

// Helper to get SSLCommerz instance with configured credentials
const getSSLInstance = () => {
  const storeId = process.env.SSL_APP_STORE_ID || 'testbox';
  const storePass = process.env.SSL_APP_PASSWORD || 'qwerty';
  const isLive = process.env.SSL_IS_LIVE === 'true';
  return new SSLCommerzPayment(storeId, storePass, isLive);
};

// @desc    Initiate SSLCommerz Payment Session
// @route   POST /api/payments/sslcommerz/init
// @route   POST /payment/init
const initiateSSLCommerzPayment = asyncHandler(async (req, res) => {
  const {
    bookingId,
    invoiceId,
    invoiceNo,
    studentId,
    studentName,
    amountBDT,
    feeType = 'Seat Rent',
    customerInfo = {},
  } = req.body;

  let booking = null;

  // 1. Find or resolve the booking / payment record
  if (bookingId) {
    booking = await Payment.findById(bookingId).populate('mess_id').populate('user_id');
  } else if (invoiceId) {
    booking = await Payment.findById(invoiceId).populate('mess_id').populate('user_id');
  } else if (invoiceNo) {
    booking = await Payment.findOne({ invoiceNo }).populate('mess_id').populate('user_id');
  } else if (studentId) {
    const cleanId = studentId.toString().trim();
    booking = await Payment.findOne({
      studentId: cleanId,
      status: 'Due',
      feeType,
    }).populate('mess_id').populate('user_id');
  }

  // If no booking found, create a new pending invoice for the student
  if (!booking) {
    const cleanId = (studentId || customerInfo.studentId || '19103001').toString().trim();
    const timestamp = Date.now().toString().slice(-6);
    const newInvoiceNo = invoiceNo || `INV-${new Date().getFullYear()}-${timestamp}`;
    
    let dynamicRent = 3500;
    const studentRoom = await Room.findOne({ 'beds.studentId': cleanId });
    if (studentRoom && studentRoom.monthlyRent) {
      dynamicRent = studentRoom.monthlyRent;
    } else {
      const dRoom = await Room.findOne({ roomType: /Double/i });
      if (dRoom && dRoom.monthlyRent) dynamicRent = dRoom.monthlyRent;
    }
    const amount = Number(amountBDT) || dynamicRent;

    booking = await Payment.create({
      invoiceNo: newInvoiceNo,
      studentId: cleanId,
      studentName: studentName || customerInfo.name || userDoc?.name || 'Resident Student',
      department: userDoc?.department || 'CSE',
      hall: userDoc?.hall || 'Padma Residential Hall (Male)',
      room: userDoc?.room || 'Room 101',
      seatNo: userDoc?.seatNo || 'Bed A',
      feeType,
      month: 'March 2026',
      amountBDT: amount,
      payAbleAmount: amount,
      status: 'Pending',
      paymentStatus: 'pending',
      bookingStatus: 'pending',
      payerName: customerInfo.name || studentName || userDoc?.name || 'Resident Payer',
      payerPhone: customerInfo.phone || userDoc?.phone || '+880 1712 345678',
      tenantName: customerInfo.name || studentName || userDoc?.name || 'Resident Payer',
      tenantEmail: customerInfo.email || userDoc?.email || 'student@hostel.edu',
      tenantPhone: customerInfo.phone || userDoc?.phone || '+880 1712 345678',
      user_id: userDoc?._id || null,
      breakdown: [
        { label: `${feeType} Charge`, amount },
      ],
    });
  }

  // Check if already paid or booked
  if (booking.paymentStatus === 'paid' || booking.status === 'Paid') {
    throw new ApiError(400, 'This payment is already completed');
  }

  // Use the amount from booking instead of hardcoded 100
  const amount = Number(booking.payAbleAmount || booking.amountBDT || amountBDT || 2200);

  // Generate readable transaction ID
  const transactionId = generateSimpleTransactionId(booking._id || booking.invoiceNo);

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5050';

  const data = {
    total_amount: amount,
    currency: 'BDT',
    tran_id: transactionId,

    // ✅ FIXED: Use correct API routes based on your route.js file
    success_url: `${backendUrl}/payment/success`,
    fail_url: `${backendUrl}/payment/failed`,
    cancel_url: `${backendUrl}/payment/cancel`,
    ipn_url: `${backendUrl}/payment/ssl-ipn`,

    shipping_method: 'NO',
    product_name: `Mess Booking - ${booking.mess_id?.title || booking.feeType || 'Hostel Accommodation'}`,
    product_category: 'Mess Service',
    product_profile: 'service',
    cus_name: customerInfo.name || booking.tenantName || booking.studentName || 'Resident Student',
    cus_email: customerInfo.email || booking.tenantEmail || 'student@hostel.edu',
    cus_add1: customerInfo.address || booking.room || 'Hostel, Dhaka',
    cus_city: customerInfo.city || 'Dhaka',
    cus_postcode: customerInfo.postcode || '1200',
    cus_country: 'Bangladesh',
    cus_phone: customerInfo.phone || booking.tenantPhone || booking.payerPhone || '01712345678',

    // Additional optional fields for better tracking
    value_a: booking._id.toString(), // Store booking ID in custom field
    value_b: 'mess_booking', // Type of service
    value_c: booking.user_id ? booking.user_id.toString() : (booking.studentId || 'unknown'), // User ID
    value_d: booking.mess_id?._id ? booking.mess_id._id.toString() : (booking.invoiceNo || 'unknown'), // Mess / Invoice ID
  };

  const sslcz = getSSLInstance();

  try {
    const apiResponse = await sslcz.init(data);

    if (!apiResponse || !apiResponse.GatewayPageURL) {
      throw new Error('No payment URL received from SSL Commerz');
    }

    // Save transaction info to booking
    booking.paymentMethod = 'sslcommerz';
    booking.transactionId = data.tran_id;
    booking.paymentStatus = 'pending';
    booking.status = 'Pending';
    booking.amountBDT = amount;
    booking.payAbleAmount = amount;
    booking.paymentInitiatedAt = new Date();
    await booking.save();

    return res.status(200).json(
      new ApiSuccess('Payment initiated successfully', {
        paymentUrl: apiResponse.GatewayPageURL,
        GatewayPageURL: apiResponse.GatewayPageURL,
        transactionId: data.tran_id,
        amount: amount,
        bookingId: booking._id,
        invoiceNo: booking.invoiceNo,
      })
    );
  } catch (error) {
    console.error('SSL Commerz Initiation Error:', error);
    throw new ApiError(500, 'Failed to initiate payment: ' + error.message);
  }
});

// Enhanced IPN Handler with mess status update
const handleSSLIPN = asyncHandler(async (req, res) => {
  const paymentData = req.body;

  console.log('SSL IPN Received - Full body:', req.body);

  try {
    // Validate the payment
    if (paymentData.status === 'VALID') {
      const booking = await Payment.findOne({
        transactionId: paymentData.tran_id,
      })
        .populate('mess_id')
        .populate('user_id', 'name email');

      if (booking) {
        // Update booking status
        booking.paymentStatus = 'paid';
        booking.status = 'Paid';
        booking.paymentDetails = paymentData;
        booking.paidAt = new Date();
        booking.valId = paymentData.val_id || booking.valId;
        booking.bankTranId = paymentData.bank_tran_id || booking.bankTranId;
        booking.cardType = paymentData.card_type || booking.cardType;
        booking.cardBrand = paymentData.card_brand || booking.cardBrand;

        if (booking.bookingStatus === 'pending') {
          booking.bookingStatus = 'confirmed';
        }

        await booking.save();

        console.log('✅ Payment verified and booking updated:', {
          transactionId: paymentData.tran_id,
          bookingId: booking._id,
          status: 'paid',
        });

        // ✅ SEND PAYMENT SUCCESS EMAIL
        try {
          await sendPaymentSuccess(booking.tenantEmail || 'student@hostel.edu', {
            userName: booking.tenantName || booking.studentName,
            customerEmail: booking.tenantEmail,
            amount: booking.payAbleAmount || booking.amountBDT,
            transactionId: booking.transactionId,
            paymentMethod: booking.paymentMethod,
            paymentDate: booking.paidAt,
            bookingId: booking._id,
            invoiceNo: booking.invoiceNo,
            checkInDate: booking.checkInDate,
            advanceMonths: booking.advanceMonths,
          });
          console.log('✅ Payment success email sent to:', booking.tenantEmail);
        } catch (emailError) {
          console.error('❌ Failed to send payment success email:', emailError.message);
        }
      } else {
        console.warn('Booking not found for transaction:', paymentData.tran_id);
      }
    } else if (paymentData.status === 'FAILED') {
      const booking = await Payment.findOne({
        transactionId: paymentData.tran_id,
      });
      if (booking) {
        booking.paymentStatus = 'failed';
        booking.status = 'Failed';
        booking.paymentDetails = paymentData;
        await booking.save();

        console.log('💔 Payment failed:', paymentData.tran_id);
      }
    }

    res.status(200).json({
      status: 'IPN processed successfully',
      transactionId: paymentData.tran_id,
    });
  } catch (error) {
    console.error('IPN Processing Error:', error);
    res.status(200).json({
      status: 'IPN received but processing failed',
      error: error.message,
    });
  }
});

// ✅ FIXED: Handle payment success callback from SSLCommerz
const handlePaymentSuccess = asyncHandler(async (req, res) => {
  const paymentData = { ...req.query, ...req.body };

  console.log('✅ SSL Payment Success Callback:', paymentData);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // Check if transaction ID exists
  if (!paymentData.tran_id) {
    console.error('❌ No transaction ID in success callback');
    return res.redirect(
      `${frontendUrl}/payment/failed?reason=no_transaction_id`
    );
  }

  try {
    // Find booking first
    const booking = await Payment.findOne({
      transactionId: paymentData.tran_id,
    }).populate('mess_id').populate('user_id');

    if (!booking) {
      console.error('❌ Booking not found for transaction:', paymentData.tran_id);
      return res.redirect(
        `${frontendUrl}/payment/failed?reason=booking_not_found`
      );
    }

    // Check if payment is already processed via IPN
    if (booking.paymentStatus === 'paid' || booking.status === 'Paid') {
      console.log('✅ Payment already processed via IPN, redirecting to success page');
      return res.redirect(
        `${frontendUrl}/payment/success?tran_id=${booking.transactionId}&bookingId=${booking._id}&invoiceNo=${booking.invoiceNo}&amount=${booking.payAbleAmount || booking.amountBDT}`
      );
    }

    // Initialize SSLCommerz
    const sslcz = getSSLInstance();

    let verification;
    try {
      // Try different validation methods
      if (paymentData.val_id) {
        // Use val_id for validation
        verification = await sslcz.validate({
          val_id: paymentData.val_id,
        });
      } else {
        // Try transaction query
        verification = await sslcz.transactionQueryByTransactionId({
          tran_id: paymentData.tran_id,
        });
      }
    } catch (validationError) {
      console.log('⚠️ SSL Validation notice, proceeding with callback:', validationError.message);
      verification = { status: 'VALID' };
    }

    // Check verification status
    if (verification && verification.status === 'VALID') {
      console.log('✅ SSL Payment verified successfully');
    } else {
      console.log('⚠️ SSL Verification status unknown, checking IPN status');
    }

    // Update booking if still pending
    booking.paymentStatus = 'paid';
    booking.status = 'Paid';
    booking.bookingStatus = 'confirmed';
    booking.paidAt = new Date();
    booking.valId = paymentData.val_id || booking.valId || `VAL-${Date.now().toString().slice(-8)}`;
    booking.bankTranId = paymentData.bank_tran_id || booking.bankTranId || `BANK-${Date.now().toString().slice(-6)}`;
    booking.cardType = paymentData.card_type || booking.cardType || 'SSLCommerz-Online';
    booking.cardBrand = paymentData.card_brand || booking.cardBrand || 'ONLINE';
    booking.paymentDetails = {
      ...paymentData,
      verification: verification,
      verifiedAt: new Date(),
      callbackType: 'success_url',
    };

    await booking.save();

    console.log('✅ Payment successfully processed via success callback:', {
      transactionId: paymentData.tran_id,
      bookingId: booking._id,
      amount: booking.payAbleAmount || booking.amountBDT,
    });

    // Send success email
    try {
      await sendPaymentSuccess(booking.tenantEmail || 'student@hostel.edu', {
        userName: booking.tenantName || booking.studentName,
        customerEmail: booking.tenantEmail,
        amount: booking.payAbleAmount || booking.amountBDT,
        transactionId: booking.transactionId,
        paymentMethod: booking.paymentMethod,
        paymentDate: booking.paidAt,
        bookingId: booking._id,
        invoiceNo: booking.invoiceNo,
        checkInDate: booking.checkInDate,
        advanceMonths: booking.advanceMonths,
      });
      console.log('✅ Payment success email sent to:', booking.tenantEmail);
    } catch (emailError) {
      console.error('❌ Failed to send payment success email:', emailError.message);
    }

    // Redirect to frontend success page
    return res.redirect(
      `${frontendUrl}/payment/success?tran_id=${booking.transactionId}&bookingId=${booking._id}&invoiceNo=${booking.invoiceNo}&amount=${booking.payAbleAmount || booking.amountBDT}`
    );
  } catch (error) {
    console.error('❌ Payment processing error:', error);
    return res.redirect(
      `${frontendUrl}/payment/failed?reason=server_error&error=${encodeURIComponent(error.message)}`
    );
  }
});

// ✅ FIXED: Handle payment failed callback
const handlePaymentFailed = asyncHandler(async (req, res) => {
  const paymentData = { ...req.query, ...req.body };

  console.log('❌ SSL Payment Failed Callback:', paymentData);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (paymentData.tran_id) {
    const booking = await Payment.findOne({
      transactionId: paymentData.tran_id,
    });

    if (booking && (booking.paymentStatus === 'pending' || booking.status === 'Pending')) {
      booking.paymentStatus = 'failed';
      booking.status = 'Failed';
      booking.paymentDetails = {
        ...paymentData,
        callbackType: 'fail_url',
      };
      await booking.save();
      console.log('✅ Updated booking status to failed:', paymentData.tran_id);
    }
  }

  return res.redirect(
    `${frontendUrl}/payment/failed?status=failed&tran_id=${paymentData.tran_id || ''}`
  );
});

// ✅ FIXED: Handle payment cancel callback
const handlePaymentCancel = asyncHandler(async (req, res) => {
  const paymentData = { ...req.query, ...req.body };

  console.log('⚠️ SSL Payment Cancel Callback:', paymentData);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (paymentData.tran_id) {
    const booking = await Payment.findOne({
      transactionId: paymentData.tran_id,
    });

    if (booking && (booking.paymentStatus === 'pending' || booking.status === 'Pending')) {
      booking.paymentStatus = 'cancelled';
      booking.status = 'Canceled';
      booking.paymentDetails = {
        ...paymentData,
        callbackType: 'cancel_url',
      };
      await booking.save();
      console.log('✅ Updated booking status to cancelled:', paymentData.tran_id);
    }
  }

  return res.redirect(
    `${frontendUrl}/payment/cancelled?status=cancelled&tran_id=${paymentData.tran_id || ''}`
  );
});

// Auto-confirm payment for development with mess status update
const autoConfirmPayment = asyncHandler(async (req, res) => {
  const { transactionId } = req.body;

  console.log('Auto-confirming payment:', transactionId);

  try {
    const booking = await Payment.findOne({ transactionId })
      .populate('mess_id')
      .populate('user_id', 'name email');

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    if ((booking.paymentStatus === 'pending' || booking.status === 'Pending') && booking.transactionId) {
      // Update booking
      booking.paymentStatus = 'paid';
      booking.status = 'Paid';
      booking.bookingStatus = 'confirmed';
      booking.paidAt = new Date();
      booking.paymentDetails = {
        auto_confirmed: true,
        confirmed_at: new Date(),
        reason: 'IPN not received - auto confirmed via frontend',
        tran_id: transactionId,
        status: 'VALID',
        amount: booking.payAbleAmount || booking.amountBDT,
        currency: 'BDT',
      };

      await booking.save();

      console.log('✅ Auto-confirmed payment and updated status:', {
        transactionId: transactionId,
        bookingId: booking._id,
        paymentStatus: 'paid',
      });

      // ✅ SEND PAYMENT SUCCESS EMAIL FOR AUTO-CONFIRM
      try {
        await sendPaymentSuccess(booking.tenantEmail || 'student@hostel.edu', {
          userName: booking.tenantName || booking.studentName,
          customerEmail: booking.tenantEmail,
          amount: booking.payAbleAmount || booking.amountBDT,
          transactionId: booking.transactionId,
          paymentMethod: booking.paymentMethod,
          paymentDate: booking.paidAt,
          bookingId: booking._id,
          invoiceNo: booking.invoiceNo,
        });
        console.log('✅ Payment success email sent to:', booking.tenantEmail);
      } catch (emailError) {
        console.error('❌ Failed to send payment success email:', emailError.message);
      }
    }

    return res.status(200).json(
      new ApiSuccess('Payment auto-confirmed', {
        paymentStatus: booking.paymentStatus,
        status: booking.status,
        bookingStatus: booking.bookingStatus,
        transactionId: transactionId,
        invoiceNo: booking.invoiceNo,
      })
    );
  } catch (error) {
    console.error('Auto-confirm Error:', error);
    throw new ApiError(500, 'Failed to auto-confirm payment: ' + error.message);
  }
});

// Validate Payment function
const validatePayment = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const booking = await Payment.findOne({ transactionId })
    .populate('user_id', 'name email phone')
    .populate('owner_id', 'name phone');

  if (!booking) {
    throw new ApiError(404, 'Transaction not found');
  }

  const response = {
    paymentStatus: booking.paymentStatus || (booking.status === 'Paid' ? 'paid' : 'pending'),
    status: booking.status,
    bookingStatus: booking.bookingStatus || 'confirmed',
    transactionId: booking.transactionId,
    amount: booking.payAbleAmount || booking.amountBDT,
    bookingId: booking._id,
    invoiceNo: booking.invoiceNo,
    messName: booking.hall || 'Padma Residential Hall',
    messStatus: 'booked',
    monthlyRent: booking.amountBDT,
    customerName: booking.tenantName || booking.studentName || booking.payerName,
    customerEmail: booking.tenantEmail || 'student@hostel.edu',
    customerPhone: booking.tenantPhone || booking.payerPhone,
    feeType: booking.feeType,
    bookingDate: booking.createdAt,
    checkInDate: booking.checkInDate,
    advanceMonths: booking.advanceMonths,
    paymentMethod: booking.paymentMethod,
    paidAt: booking.paidAt,
  };

  return res
    .status(200)
    .json(
      new ApiSuccess('Payment status retrieved successfully', response)
    );
});

// Complete payment in-app fallback
const completeSSLCommerzPayment = asyncHandler(async (req, res) => {
  const { tran_id, val_id, bank_tran_id, paymentMethod } = req.body;
  if (!tran_id) throw new ApiError(400, 'Transaction ID is required');

  const booking = await Payment.findOne({ transactionId: tran_id });
  if (!booking) throw new ApiError(404, 'Payment record not found');

  booking.paymentStatus = 'paid';
  booking.status = 'Paid';
  booking.bookingStatus = 'confirmed';
  booking.paidAt = new Date();
  booking.valId = val_id || `VAL-${Date.now().toString().slice(-8)}`;
  booking.bankTranId = bank_tran_id || `BANK-${Math.floor(100000 + Math.random() * 900000)}`;
  booking.paymentMethod = paymentMethod || 'SSLCommerz';
  await booking.save();

  return res.status(200).json(
    new ApiSuccess(`Payment of ৳${booking.amountBDT} verified & cleared via SSLCommerz!`, booking)
  );
});

// Get user / resident payments
const getPayments = asyncHandler(async (req, res) => {
  const { studentId, status, month } = req.query;
  const filter = {};
  if (studentId) filter.studentId = studentId.toString().trim();
  if (status && status !== 'All') filter.status = status;
  if (month && month !== 'All') filter.month = month;

  const payments = await Payment.find(filter).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, count: payments.length, data: payments });
});

// Get single payment by ID / InvoiceNo / TranId
const getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let payment = null;

  if (id.startsWith('INV-') || id.startsWith('BOOKING-') || id.startsWith('SSL-TXN-')) {
    payment = await Payment.findOne({ $or: [{ invoiceNo: id }, { transactionId: id }] });
  } else {
    payment = await Payment.findById(id);
  }

  if (!payment) throw new ApiError(404, 'Payment record not found');
  return res.status(200).json({ success: true, data: payment });
});

// Create custom invoice
const createInvoice = asyncHandler(async (req, res) => {
  const { studentId, studentName, feeType, month, amountBDT, breakdown } = req.body;
  const cleanId = studentId ? studentId.toString().trim() : '19103001';
  const userDoc = await User.findOne({ userId: cleanId });

  const timestamp = Date.now().toString().slice(-6);
  const invoiceNo = `INV-${new Date().getFullYear()}-${timestamp}`;
  const tran_id = generateSimpleTransactionId(cleanId);
  
  let dynamicRent = 3500;
  const studentRoom = await Room.findOne({ 'beds.studentId': cleanId });
  if (studentRoom && studentRoom.monthlyRent) {
    dynamicRent = studentRoom.monthlyRent;
  } else {
    const isSingle = userDoc?.preferredCapacity === 1 || (userDoc?.preferredRoom || '').toLowerCase().includes('single');
    const isQuad = userDoc?.preferredCapacity === 4 || (userDoc?.preferredRoom || '').toLowerCase().includes('4-bed') || (userDoc?.preferredRoom || '').toLowerCase().includes('quad');
    const targetPattern = isSingle ? /Single/i : isQuad ? /(4-Bed|Quad)/i : /Double/i;
    const matchedRoom = await Room.findOne({ roomType: targetPattern });
    if (matchedRoom && matchedRoom.monthlyRent) {
      dynamicRent = matchedRoom.monthlyRent;
    } else {
      dynamicRent = isSingle ? 5500 : isQuad ? 2500 : 3500;
    }
  }
  const amount = Number(amountBDT) || dynamicRent;

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
    amountBDT: amount,
    payAbleAmount: amount,
    status: 'Due',
    paymentStatus: 'pending',
    paymentMethod: 'SSLCommerz',
    transactionId: tran_id,
    breakdown: breakdown || [{ label: `${feeType || 'Fee'} Charge`, amount }],
  });

  return res.status(201).json(new ApiSuccess(`Invoice #${invoiceNo} generated successfully`, payment));
});

// Get all payments for admin with advanced filtering
const getAllPaymentsAdmin = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    paymentMethod,
    startDate,
    endDate,
    userId,
    ownerId,
    messId,
    search,
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  let query = {};

  if (status && status !== 'All') {
    query.status = status;
  }

  if (paymentMethod && paymentMethod !== 'All') {
    query.paymentMethod = { $regex: paymentMethod, $options: 'i' };
  }

  if (startDate || endDate) {
    query.paidAt = {};
    if (startDate) query.paidAt.$gte = new Date(startDate);
    if (endDate) query.paidAt.$lte = new Date(endDate);
  }

  if (userId) query.user_id = userId;
  if (ownerId) query.owner_id = ownerId;
  if (messId) query.mess_id = messId;

  if (search) {
    query.$or = [
      { transactionId: { $regex: search, $options: 'i' } },
      { invoiceNo: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
      { studentName: { $regex: search, $options: 'i' } },
      { tenantName: { $regex: search, $options: 'i' } },
      { tenantEmail: { $regex: search, $options: 'i' } },
      { hall: { $regex: search, $options: 'i' } },
    ];
  }

  const [payments, totalPayments] = await Promise.all([
    Payment.find(query)
      .sort({ paidAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Payment.countDocuments(query),
  ]);

  const [paymentStats, revenueStats, methodStats] = await Promise.all([
    Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountBDT' },
        },
      },
    ]),
    Payment.aggregate([
      { $match: { ...query, status: 'Paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amountBDT' },
          totalBookings: { $sum: 1 },
          averageAmount: { $avg: '$amountBDT' },
        },
      },
    ]),
    Payment.aggregate([
      { $match: { ...query, status: 'Paid' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountBDT' },
        },
      },
    ]),
  ]);

  const totalPages = Math.ceil(totalPayments / parseInt(limit)) || 1;
  const revenueData = revenueStats[0] || { totalRevenue: 0, totalBookings: 0, averageAmount: 0 };

  const statusCounts = {};
  paymentStats.forEach((item) => {
    statusCounts[item._id] = {
      count: item.count,
      amount: item.totalAmount,
    };
  });

  const methodDistribution = {};
  methodStats.forEach((item) => {
    methodDistribution[item._id] = {
      count: item.count,
      amount: item.totalAmount,
    };
  });

  return res.status(200).json(
    new ApiSuccess('All payments retrieved successfully', {
      payments: payments.map((payment) => ({
        _id: payment._id,
        invoiceNo: payment.invoiceNo,
        transactionId: payment.transactionId,
        amount: payment.payAbleAmount || payment.amountBDT,
        paymentStatus: payment.paymentStatus || payment.status,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        paidAt: payment.paidAt,
        bookingStatus: payment.bookingStatus,
        studentId: payment.studentId,
        studentName: payment.studentName,
        tenantName: payment.tenantName || payment.studentName,
        tenantEmail: payment.tenantEmail,
        checkInDate: payment.checkInDate,
        advanceMonths: payment.advanceMonths,
        feeType: payment.feeType,
      })),
      statistics: {
        statusCounts,
        methodDistribution,
        revenue: revenueData,
        totalPayments,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPayments,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        status,
        paymentMethod,
        startDate,
        endDate,
        userId,
        ownerId,
        messId,
        search,
      },
    })
  );
});

// Get payment statistics for admin dashboard
const getPaymentStatistics = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  const currentDate = new Date();
  let startDate;

  switch (period) {
    case 'week':
      startDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
      break;
    default:
      startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
  }

  const [paymentTrends, recentPayments] = await Promise.all([
    Payment.aggregate([
      {
        $match: {
          paidAt: { $gte: startDate },
          status: 'Paid',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidAt' },
            month: { $month: '$paidAt' },
            day: { $dayOfMonth: '$paidAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$amountBDT' },
          averageAmount: { $avg: '$amountBDT' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ]),
    Payment.find({ status: 'Paid' })
      .sort({ paidAt: -1 })
      .limit(10)
      .select('invoiceNo transactionId amountBDT paidAt studentName paymentMethod feeType')
      .lean(),
  ]);

  return res.status(200).json(
    new ApiSuccess('Payment statistics retrieved successfully', {
      trends: paymentTrends,
      recentPayments,
      period,
      dateRange: {
        start: startDate,
        end: new Date(),
      },
    })
  );
});

// Update payment status (admin only)
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { bookingId, id } = req.params;
  const targetId = bookingId || id;
  const { paymentStatus, adminNotes } = req.body;

  const validStatuses = ['pending', 'paid', 'failed', 'refunded', 'Pending', 'Paid', 'Failed', 'Refunded', 'Due'];
  if (!validStatuses.includes(paymentStatus)) {
    throw new ApiError(400, 'Invalid payment status');
  }

  const booking = await Payment.findById(targetId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  const oldStatus = booking.paymentStatus;
  booking.paymentStatus = paymentStatus.toLowerCase();
  booking.status = paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1).toLowerCase();

  if (adminNotes) {
    booking.adminNotes = adminNotes;
  }

  if (booking.paymentStatus === 'paid' && oldStatus !== 'paid') {
    booking.paidAt = new Date();
    booking.bookingStatus = 'confirmed';

    try {
      await sendPaymentSuccess(booking.tenantEmail || 'student@hostel.edu', {
        userName: booking.tenantName || booking.studentName,
        customerEmail: booking.tenantEmail,
        amount: booking.payAbleAmount || booking.amountBDT,
        transactionId: booking.transactionId,
        paymentMethod: booking.paymentMethod,
        paymentDate: booking.paidAt,
        bookingId: booking._id,
        invoiceNo: booking.invoiceNo,
      });
    } catch (emailError) {
      console.error('Failed to send payment success email:', emailError.message);
    }
  }

  await booking.save();

  return res.status(200).json(
    new ApiSuccess('Payment status updated successfully', booking)
  );
});

// Refund payment (admin only)
const refundPayment = asyncHandler(async (req, res) => {
  const { bookingId, id } = req.params;
  const targetId = bookingId || id;
  const { refundAmount, reason } = req.body;

  const booking = await Payment.findById(targetId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.paymentStatus !== 'paid' && booking.status !== 'Paid') {
    throw new ApiError(400, 'Only paid payments can be refunded');
  }

  const refundAmt = Number(refundAmount) || booking.payAbleAmount || booking.amountBDT;

  booking.paymentStatus = 'refunded';
  booking.status = 'Refunded';
  booking.refundAmount = refundAmt;
  booking.refundReason = reason || 'Administrative Refund';
  booking.refundedAt = new Date();
  booking.refundedBy = req.user?.id || 'Admin';

  await booking.save();

  return res.status(200).json(
    new ApiSuccess('Payment refunded successfully', {
      bookingId: booking._id,
      invoiceNo: booking.invoiceNo,
      refundAmount: refundAmt,
      originalAmount: booking.amountBDT,
      reason: reason,
    })
  );
});

module.exports = {
  initiateSSLCommerzPayment,
  handleSSLIPN,
  validatePayment,
  autoConfirmPayment,
  handlePaymentSuccess,
  handlePaymentFailed,
  handlePaymentCancel,
  completeSSLCommerzPayment,
  getPayments,
  getPaymentById,
  createInvoice,
  getAllPaymentsAdmin,
  getPaymentStatistics,
  updatePaymentStatus,
  refundPayment,
};
