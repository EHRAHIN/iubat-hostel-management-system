const GatePass = require('../models/GatePass');

// @desc    Get all gate pass / leave requests
// @route   GET /api/gatepass
exports.getGatePasses = async (req, res) => {
  try {
    const { studentId, status, hall, passType } = req.query;
    const query = {};

    if (studentId) query.studentId = studentId.toString().trim();
    if (status && status !== 'all') {
      if (status === 'pending_floor_teacher') {
        query.status = { $in: ['Guardian Approved (Pending Floor Teacher)', 'Pending Teacher Review'] };
      } else if (status === 'pending_guardian') {
        query.status = 'Pending Guardian Consent';
      } else {
        query.status = status;
      }
    }
    if (hall && hall !== 'all') query.hall = hall;
    if (passType && passType !== 'all') query.passType = passType;

    const passes = await GatePass.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: passes.length, data: passes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit a new out-pass request (Step 1: Sent to Guardian)
// @route   POST /api/gatepass
exports.createGatePass = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      hall,
      room,
      passType,
      fromDate,
      toDate,
      destination,
      emergencyContact,
      reason,
      guardianName,
      guardianPhone,
    } = req.body;

    if (!fromDate || !toDate || !destination || !emergencyContact || !reason) {
      return res.status(400).json({ success: false, message: 'All leave details are required.' });
    }

    const passId = `LP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const qrPassCode = `IUBAT-QR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const gatePass = await GatePass.create({
      passId,
      studentId: studentId ? studentId.toString().trim() : '221004128',
      studentName: studentName || 'Tanvir Hasan',
      hall: hall || 'Padma Residential Hall (Male)',
      room: room || 'Room 101',
      passType: passType || 'Weekend Out-Pass',
      fromDate,
      toDate,
      destination,
      emergencyContact,
      reason,
      status: 'Pending Guardian Consent',
      guardianConsent: 'Pending',
      guardianName: guardianName || 'Registered Guardian',
      guardianPhone: guardianPhone || emergencyContact,
      qrPassCode,
    });

    res.status(201).json({
      success: true,
      message: `Leave application #${passId} submitted! Dispatched to Guardian for digital authorization.`,
      data: gatePass,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Approve / Reject Out-Pass (Guardian Consent -> Floor Teacher -> Hostel Super)
// @route   PUT /api/gatepass/:id
exports.updateGatePassStatus = async (req, res) => {
  try {
    const { status, approvedBy, action, remarks, guardianName, guardianPhone } = req.body;

    const gatePass = await GatePass.findOne({
      $or: [
        { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
        { passId: req.params.id },
      ],
    });

    if (!gatePass) {
      return res.status(404).json({ success: false, message: 'Gate pass record not found' });
    }

    // Step 1: Guardian Authorization
    if (action === 'grant_guardian_consent' || status === 'Guardian Approved (Pending Floor Teacher)') {
      gatePass.status = 'Guardian Approved (Pending Floor Teacher)';
      gatePass.guardianConsent = 'Granted';
      gatePass.guardianName = guardianName || gatePass.guardianName || 'Guardian';
      if (guardianPhone) gatePass.guardianPhone = guardianPhone;
      gatePass.guardianConsentAt = new Date();
      if (remarks) gatePass.actionRemarks = remarks;
    } else if (action === 'decline_guardian_consent' || status === 'Rejected by Guardian') {
      gatePass.status = 'Rejected by Guardian';
      gatePass.guardianConsent = 'Declined';
      gatePass.guardianConsentAt = new Date();
      if (remarks) gatePass.actionRemarks = remarks;
    }

    // Step 2: Floor Teacher Review
    else if (action === 'floor_teacher_approve' || status === 'Approved' || status === 'Teacher Approved') {
      gatePass.status = 'Approved';
      gatePass.floorTeacherStatus = 'Approved';
      gatePass.floorTeacherName = approvedBy || 'Floor Teacher / House Tutor';
      gatePass.floorTeacherApprovedAt = new Date();
      gatePass.approvedBy = approvedBy || 'Floor Teacher (House Tutor)';
      if (remarks) gatePass.actionRemarks = remarks;
    } else if (action === 'floor_teacher_reject' || status === 'Rejected by Floor Teacher') {
      gatePass.status = 'Rejected by Floor Teacher';
      gatePass.floorTeacherStatus = 'Rejected';
      gatePass.approvedBy = approvedBy || 'Floor Teacher (House Tutor)';
      if (remarks) gatePass.actionRemarks = remarks;
    }

    // Step 3: Hostel Super / Provost Direct Action (Anytime Override)
    else if (action === 'super_direct_approve' || status === 'Provost Approved') {
      gatePass.status = 'Approved';
      gatePass.provostStatus = 'Approved';
      gatePass.approvedBy = approvedBy || 'Hostel Super / Provost Office';
      gatePass.provostApprovedAt = new Date();
      if (remarks) gatePass.actionRemarks = remarks;
    } else if (action === 'super_reject' || status === 'Rejected by Provost') {
      gatePass.status = 'Rejected by Provost';
      gatePass.provostStatus = 'Rejected';
      gatePass.approvedBy = approvedBy || 'Hostel Super / Provost Office';
      if (remarks) gatePass.actionRemarks = remarks;
    }

    // Fallback status setting
    else if (status) {
      gatePass.status = status;
      if (approvedBy) gatePass.approvedBy = approvedBy;
      if (remarks) gatePass.actionRemarks = remarks;
    }

    await gatePass.save();

    res.status(200).json({
      success: true,
      message: `Leave pass #${gatePass.passId} status updated to: ${gatePass.status}`,
      data: gatePass,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Verify Gate Pass QR code (Security Guard / Gate Staff verification)
// @route   POST /api/gatepass/verify-qr
exports.verifyGatePassQr = async (req, res) => {
  try {
    const { qrCode, passId, studentId, guardName } = req.body;
    const searchVal = passId || qrCode;
    if (!searchVal && !studentId) {
      return res.status(400).json({ success: false, message: 'Missing pass ID or QR code to verify.' });
    }

    let gatePass = null;
    if (searchVal) {
      gatePass = await GatePass.findOne({
        $or: [
          { passId: searchVal },
          { qrPassCode: searchVal },
          { _id: searchVal.match(/^[0-9a-fA-F]{24}$/) ? searchVal : null },
        ],
      });
    }

    if (!gatePass && studentId) {
      gatePass = await GatePass.findOne({ studentId }).sort({ createdAt: -1 });
    }

    if (!gatePass) {
      return res.status(404).json({ success: false, message: `No gate pass record found matching '${searchVal || studentId}'.` });
    }

    const isFullyApproved = gatePass.status === 'Approved' || gatePass.status === 'Teacher Approved' || gatePass.status === 'Approved & Checked-Out';
    if (!isFullyApproved) {
      return res.status(200).json({
        success: false,
        notApproved: true,
        message: `⛔ GATE EXIT DENIED: Gate pass #${gatePass.passId} is NOT fully approved yet (Current Status: ${gatePass.status}).`,
        data: gatePass,
      });
    }

    // Check if already checked out
    const alreadyOut = gatePass.status === 'Approved & Checked-Out';
    if (!alreadyOut) {
      gatePass.status = 'Approved & Checked-Out';
      gatePass.checkedOutAt = new Date();
      gatePass.guardVerifiedBy = guardName || 'Main Gate Security Guard';
      await gatePass.save();
    }

    res.status(200).json({
      success: true,
      alreadyCheckedOut: alreadyOut,
      message: alreadyOut
        ? `ℹ️ Student ${gatePass.studentName} was already checked out at ${new Date(gatePass.checkedOutAt).toLocaleTimeString()}.`
        : `✅ Gate Pass Validated! Student ${gatePass.studentName} (ID: ${gatePass.studentId}, Room: ${gatePass.room}) cleared to exit hall.`,
      data: gatePass,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
