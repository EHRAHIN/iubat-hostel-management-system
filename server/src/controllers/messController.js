const { MealBooking, Menu } = require('../models/Meal');

// @desc    Get weekly mess menu roster
// @route   GET /api/mess/menu
exports.getMenu = async (req, res) => {
  try {
    const menu = await Menu.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, count: menu.length, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update or create daily menu
// @route   POST /api/mess/menu
exports.updateMenu = async (req, res) => {
  try {
    const { dayOfWeek, breakfast, lunch, dinner, specialFeast } = req.body;
    const menu = await Menu.findOneAndUpdate(
      { dayOfWeek },
      { dayOfWeek, breakfast, lunch, dinner, specialFeast },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, data: menu });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get meal bookings / applications
// @route   GET /api/mess/bookings
exports.getBookings = async (req, res) => {
  try {
    const { studentId, hall, status, date } = req.query;
    const query = {};

    if (studentId) query.studentId = studentId;
    if (hall && hall !== 'all') {
      query.hall = { $regex: 'Padma', $options: 'i' };
    }
    if (status && status !== 'all') query.status = status;
    if (date) query.date = date;

    const bookings = await MealBooking.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    STEP 1: Student applies for a meal (Daily / Tomorrow / Specific Meal)
// @route   POST /api/mess/apply
exports.applyMeal = async (req, res) => {
  try {
    const { studentId, studentName, hall, room, date, mealType, diet, tokenCostBDT } = req.body;

    if (!studentId || !studentName) {
      return res.status(400).json({ success: false, message: 'Student ID and Name are required.' });
    }

    const effectiveDate = date || new Date().toISOString().split('T')[0];
    const studentHall = hall || 'Padma Residential Hall (Male)';
    const studentRoom = room || 'Room 104';

    // When student applies for all 3 meals together, generate 3 distinct tokens
    const is3Meals =
      mealType === 'Full Day (3 Meals)' ||
      mealType === 'All 3 Meals' ||
      (typeof mealType === 'string' && mealType.includes('3 Meals'));

    // =========================================================================
    // RULE ENFORCEMENT:
    // "meal er jonne time er minimum 5hr age apply korte hobe tobe 3 ta eksathe kore felle tahole r lagbe na"
    // "meal khawa hok r na hok apply korar por ta pay kora lagbe"    
    // =========================================================================
    // 5-HOUR CUTOFF VALIDATION
    // If cutoff warning is active for a meal, it cannot be booked for today.
    // For Full Day (3 Meals), Breakfast (07:30 AM) is the first meal:
    // If Breakfast cutoff (02:30 AM) has passed, 3-meals package is locked for today (must book for tomorrow).
    // =========================================================================
    const [year, month, day] = effectiveDate.split('-').map(Number);
    const now = new Date();

    if (is3Meals) {
      const targetBreakfastTime = new Date(year, month - 1, day, 7, 30, 0);
      const diffHours = (targetBreakfastTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffHours < 5) {
        return res.status(400).json({
          success: false,
          cutoffExceeded: true,
          message: `The Full Day (3 Meals) package is unavailable for ${effectiveDate} because the morning cutoff (02:30 AM) has passed. You can book remaining individual meals for today or book the Full Day package for Tomorrow.`,
        });
      }
    } else {
      let mealHour = 13;
      let mealMinute = 0;
      let mealTimeLabel = '01:00 PM';
      let cutoffLabel = '08:00 AM';

      if (mealType === 'Breakfast') {
        mealHour = 7;
        mealMinute = 30;
        mealTimeLabel = '07:30 AM';
        cutoffLabel = '02:30 AM';
      } else if (mealType === 'Lunch') {
        mealHour = 13;
        mealMinute = 0;
        mealTimeLabel = '01:00 PM';
        cutoffLabel = '08:00 AM';
      } else if (mealType === 'Dinner') {
        mealHour = 20;
        mealMinute = 30;
        mealTimeLabel = '08:30 PM';
        cutoffLabel = '03:30 PM';
      }

      const targetMealTime = new Date(year, month - 1, day, mealHour, mealMinute, 0);
      const diffMs = targetMealTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 5) {
        return res.status(400).json({
          success: false,
          cutoffExceeded: true,
          message: `Individual ${mealType} booking is closed for ${effectiveDate} because the 5-hour cutoff (${cutoffLabel}) has passed. You can book remaining open meals for today or book for Tomorrow.`,
        });
      }
    }

    if (is3Meals) {
      const timestamp = Date.now().toString().slice(-4);
      const rand = () => Math.floor(100 + Math.random() * 900);

      // 1. Breakfast (৳30)
      const bBreakfast = await MealBooking.create({
        bookingId: `MEL-${timestamp}-B${rand()}`,
        studentId: studentId.trim(),
        studentName: studentName.trim(),
        hall: studentHall,
        room: studentRoom,
        date: effectiveDate,
        mealType: 'Breakfast',
        diet: 'Breakfast (07:30 AM - 09:30 AM): Egg, Parata / Khichuri, Milk Tea',
        tokenCostBDT: 30,
        status: 'Applied & Counted',
        foodCollected: false,
      });

      // 2. Lunch (৳50)
      const bLunch = await MealBooking.create({
        bookingId: `MEL-${timestamp}-L${rand()}`,
        studentId: studentId.trim(),
        studentName: studentName.trim(),
        hall: studentHall,
        room: studentRoom,
        date: effectiveDate,
        mealType: 'Lunch',
        diet: 'Lunch (01:00 PM - 02:30 PM): Chicken / Fish, Rice, Dal & Sabji',
        tokenCostBDT: 50,
        status: 'Applied & Counted',
        foodCollected: false,
      });

      // 3. Dinner (৳50)
      const bDinner = await MealBooking.create({
        bookingId: `MEL-${timestamp}-D${rand()}`,
        studentId: studentId.trim(),
        studentName: studentName.trim(),
        hall: studentHall,
        room: studentRoom,
        date: effectiveDate,
        mealType: 'Dinner',
        diet: 'Dinner (08:30 PM - 10:00 PM): Egg / Fish Curry, Rice & Dal',
        tokenCostBDT: 50,
        status: 'Applied & Counted',
        foodCollected: false,
      });

      return res.status(201).json({
        success: true,
        message: `All 3 daily meals booked successfully! Token IDs: Breakfast (#${bBreakfast.bookingId}), Lunch (#${bLunch.bookingId}), Dinner (#${bDinner.bookingId}). Dining charges (৳130 BDT) are non-refundable and added to your monthly dues.`,
        data: [bBreakfast, bLunch, bDinner],
        bookings: [bBreakfast, bLunch, bDinner],
      });
    }

    // Single meal booking (Breakfast, Lunch, or Dinner)
    const bookingId = `MEL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = await MealBooking.create({
      bookingId,
      studentId: studentId.trim(),
      studentName: studentName.trim(),
      hall: studentHall,
      room: studentRoom,
      date: effectiveDate,
      mealType: mealType || 'Lunch',
      diet: diet || 'Standard Rice, Dal & Curry',
      tokenCostBDT: tokenCostBDT || (mealType === 'Breakfast' ? 30 : 50),
      status: 'Applied & Counted', // Mandatory billing: Counted immediately upon application!
      foodCollected: false,
    });

    res.status(201).json({
      success: true,
      message: `Meal token #${newBooking.bookingId} for ${newBooking.mealType} booked successfully! Dining charges (৳${newBooking.tokenCostBDT} BDT) are non-refundable and added to your monthly dues.`,
      data: newBooking,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    STEP 2: Dining Staff confirms food handover / collection ("Dining staff approve / collect")
// @route   PUT /api/mess/bookings/:id/approve
exports.approveMealBooking = async (req, res) => {
  try {
    const { staffName } = req.body;

    const booking = await MealBooking.findOneAndUpdate(
      { $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { bookingId: req.params.id }] },
      {
        status: 'Approved & Served',
        foodCollected: true,
        collectedAt: new Date(),
        collectedByStaff: staffName || 'Hall Staff In-Charge',
        approvedBy: staffName || 'Hall Staff In-Charge',
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Meal application not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Meal #${booking.bookingId} for ${booking.studentName} confirmed & food collected!`,
      data: booking,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Staff rejects a meal application
// @route   PUT /api/mess/bookings/:id/reject
exports.rejectMealBooking = async (req, res) => {
  try {
    const { staffName, reason } = req.body;

    const booking = await MealBooking.findOneAndUpdate(
      { $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { bookingId: req.params.id }] },
      {
        status: 'Rejected',
        approvedBy: staffName || 'Hall Staff In-Charge',
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Meal application not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Meal application #${booking.bookingId} rejected.`,
      data: booking,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get live student meal stats (Consumed meals count: "tokn dekhabe meal kotogulo khaise")
// @route   GET /api/mess/student-summary/:studentId
exports.getStudentMealSummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    const allBookings = await MealBooking.find({ studentId }).sort({ createdAt: -1 });
    const countedMeals = allBookings.filter((b) => b.status !== 'Rejected');
    const collectedCount = allBookings.filter((b) => b.foodCollected || b.status === 'Approved & Served').length;
    const uncollectedCount = allBookings.filter((b) => !b.foodCollected && b.status !== 'Rejected').length;

    const totalConsumedCount = countedMeals.length; // Counted once applied!
    const totalCostBDT = countedMeals.reduce((sum, b) => sum + (b.tokenCostBDT || 50), 0);

    res.status(200).json({
      success: true,
      data: {
        studentId,
        totalConsumedMeals: totalConsumedCount,
        foodCollectedMeals: collectedCount,
        uncollectedMeals: uncollectedCount,
        totalAppliedMeals: allBookings.length,
        totalCostBDT: `${totalCostBDT.toLocaleString()} BDT`,
        recentApplications: allBookings.slice(0, 30),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get today's mess operational statistics
// @route   GET /api/mess/stats
exports.getMessStats = async (req, res) => {
  try {
    const totalBookings = await MealBooking.countDocuments();
    const approvedCount = await MealBooking.countDocuments({ status: 'Approved & Served' });
    const pendingCount = await MealBooking.countDocuments({ status: 'Pending Approval' });

    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        approvedMeals: approvedCount,
        pendingApprovals: pendingCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify QR token and confirm handover
// @route   POST /api/mess/verify-qr
exports.verifyMealQr = async (req, res) => {
  try {
    const { tokenCode, bookingId, studentId, staffName } = req.body;
    const query = bookingId || tokenCode;
    if (!query && !studentId) {
      return res.status(400).json({ success: false, message: 'Missing token or booking ID to verify.' });
    }

    let booking = null;
    if (query) {
      booking = await MealBooking.findOne({
        $or: [
          { bookingId: query },
          { _id: query.match(/^[0-9a-fA-F]{24}$/) ? query : null },
        ],
      });
    }

    if (!booking && studentId) {
      booking = await MealBooking.findOne({ studentId, foodCollected: { $ne: true } }).sort({ createdAt: -1 });
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: `No meal token record found matching '${query || studentId}'.` });
    }

    // Check if already collected
    if (booking.foodCollected || booking.status === 'Approved & Served') {
      return res.status(200).json({
        success: false,
        alreadyCollected: true,
        message: `⚠️ ALREADY COLLECTED! Meal #${booking.bookingId} (${booking.mealType}) was already handed over to ${booking.studentName} at ${booking.collectedAt ? new Date(booking.collectedAt).toLocaleTimeString() : 'earlier today'}.`,
        data: booking,
      });
    }

    // Mark food handed over
    booking.status = 'Approved & Served';
    booking.foodCollected = true;
    booking.collectedAt = new Date();
    booking.collectedByStaff = staffName || 'Dining Staff In-Charge';
    booking.approvedBy = staffName || 'Dining Staff In-Charge';
    booking.approvedAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: `✅ Meal Token Verified & Handed Over! ${booking.mealType} meal successfully delivered to ${booking.studentName} (ID: ${booking.studentId}).`,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
