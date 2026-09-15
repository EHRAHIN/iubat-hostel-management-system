const Complaint = require('../models/Complaint');

// @desc    Get all complaints
// @route   GET /api/complaints
exports.getComplaints = async (req, res) => {
  try {
    const { hall, floor, room, category, priority, status, studentId, targetStudentId, isTeacherComplaint, assignedStaffId, tutorStatus, search } = req.query;
    const query = {};

    if (hall && hall !== 'all') query.hall = hall;
    if (floor && floor !== 'all') query.floor = floor;
    if (room && room !== 'all') query.room = room;
    if (isTeacherComplaint !== undefined && isTeacherComplaint !== 'all') {
      query.isTeacherComplaint = isTeacherComplaint === 'true';
    }

    if (category && category !== 'all') {
      const catLower = category.toLowerCase();
      if (catLower.includes('electr')) {
        query.category = { $in: ['Electrical', 'Electricity'] };
      } else if (catLower.includes('net') || catLower.includes('wi-fi') || catLower.includes('internet')) {
        query.category = { $in: ['Network', 'Wi-Fi & LAN', 'Internet & Network', 'Internet / Wi-Fi & LAN'] };
      } else if (catLower.includes('plumb') || catLower.includes('water')) {
        query.category = { $in: ['Plumbing', 'Water Pump & Plumbing', 'Water & Plumbing', 'Plumbing & Water'] };
      } else if (catLower.includes('furn') || catLower.includes('lock') || catLower.includes('bed')) {
        query.category = { $in: ['Furniture', 'Furniture & Hardware', 'Furniture & Locks'] };
      } else {
        query.category = category;
      }
    }
    if (priority && priority !== 'all') query.priority = priority;
    if (status && status !== 'all') query.status = status;
    if (tutorStatus && tutorStatus !== 'all') query.tutorStatus = tutorStatus;
    if (assignedStaffId) query.assignedStaffId = assignedStaffId;

    // If querying for a specific student's record / history: match reports filed by student OR teacher complaints against the student / room
    if (studentId) {
      query.$or = [
        { studentId: studentId },
        { targetStudentId: studentId },
        ...(room ? [{ room: room, isTeacherComplaint: true }] : []),
      ];
    } else if (targetStudentId) {
      query.targetStudentId = targetStudentId;
    }

    if (search) {
      const sOr = [
        { ticketId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { room: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { targetStudentName: { $regex: search, $options: 'i' } },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: sOr }];
        delete query.$or;
      } else {
        query.$or = sOr;
      }
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    STEP 1: Student submits a maintenance problem OR Floor Teacher logs a conduct/disciplinary report
// @route   POST /api/complaints
exports.createComplaint = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      hall,
      floor,
      room,
      category,
      priority,
      title,
      description,
      isTeacherComplaint,
      incidentType,
      reportedByRole,
      reportedByName,
      targetStudentId,
      targetStudentName,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and Description are required' });
    }

    const isTeacher = Boolean(isTeacherComplaint || reportedByRole === 'Floor Teacher');
    const ticketPrefix = isTeacher ? 'INC' : 'WRK';
    const ticketId = `${ticketPrefix}-2026-${Math.floor(100 + Math.random() * 900)}`;

    // Normalize category
    let cleanCategory = category || (isTeacher ? 'General' : 'Electrical');
    const catLower = cleanCategory.toLowerCase();
    if (catLower.includes('electr')) cleanCategory = 'Electrical';
    else if (catLower.includes('net') || catLower.includes('wi-fi') || catLower.includes('internet')) cleanCategory = 'Network';
    else if (catLower.includes('plumb') || catLower.includes('water')) cleanCategory = 'Plumbing';
    else if (catLower.includes('furn') || catLower.includes('lock') || catLower.includes('bed')) cleanCategory = 'Furniture';

    const complaint = await Complaint.create({
      ticketId,
      studentId: targetStudentId || studentId || '221004128',
      studentName: targetStudentName || studentName || 'Resident Student',
      hall: hall || 'Padma Residential Hall (Male)',
      floor: floor || 'Floor 1',
      room: room || 'Room 104',
      category: cleanCategory,
      priority: priority || (isTeacher ? 'High' : 'Normal'),
      title: title.trim(),
      description: description.trim(),
      status: isTeacher ? 'Incident Logged by Floor Teacher • Active Conduct Demerit' : 'Pending Floor Teacher Verification',
      tutorStatus: isTeacher ? 'Verified Conduct Incident' : 'Pending Verification',
      assignedStaff: isTeacher ? 'Provost Disciplinary Board' : 'Pending Provost Assignment',
      isTeacherComplaint: isTeacher,
      incidentType: incidentType || (isTeacher ? 'Disciplinary Incident' : 'Maintenance Issue'),
      reportedByRole: reportedByRole || (isTeacher ? 'Floor Teacher' : 'Student'),
      reportedByName: reportedByName || (isTeacher ? 'House Tutor' : studentName || 'Student Resident'),
      targetStudentId: targetStudentId || studentId || '',
      targetStudentName: targetStudentName || studentName || '',
    });

    res.status(201).json({
      success: true,
      message: isTeacher
        ? `Disciplinary Incident Report #${complaint.ticketId} logged against ${room || 'Room'} / ${targetStudentName || studentName || 'Student'}!`
        : `Maintenance ticket #${complaint.ticketId} submitted. Dispatched to Floor Teacher for inspection.`,
      data: complaint,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    STEP 2: Floor Teacher verifies problem and recommends to Provost
// @route   PUT /api/complaints/:id/verify
exports.verifyComplaintByTutor = async (req, res) => {
  try {
    const { tutorName, tutorNotes, action } = req.body; // action: 'verify' | 'reject'
    const isApproved = action !== 'reject';

    const complaint = await Complaint.findOneAndUpdate(
      { $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { ticketId: req.params.id }] },
      {
        tutorStatus: isApproved ? 'Verified & Recommended to Provost' : 'Rejected by Floor Teacher',
        tutorName: tutorName || 'House Tutor',
        tutorNotes: tutorNotes || 'Room physical condition inspected and verified.',
        status: isApproved ? 'Verified by House Tutor • Awaiting Provost Staff Delegation' : 'Rejected by Floor Teacher',
      },
      { new: true }
    );

    if (!complaint) return res.status(404).json({ success: false, message: 'Ticket not found' });

    res.status(200).json({
      success: true,
      message: isApproved 
        ? `Ticket #${complaint.ticketId} verified by House Tutor ${tutorName || ''} and dispatched to Provost!`
        : `Ticket #${complaint.ticketId} rejected.`,
      data: complaint,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    STEP 3: Hostel Super / Provost assigns Maintenance Staff to work order
// @route   PUT /api/complaints/:id/assign
exports.assignComplaintByProvost = async (req, res) => {
  try {
    const { staffName, staffId, staffPhone, materialsNeeded } = req.body;

    if (!staffName) {
      return res.status(400).json({ success: false, message: 'Assigned Staff Name is required' });
    }

    const complaint = await Complaint.findOneAndUpdate(
      { $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { ticketId: req.params.id }] },
      {
        assignedStaff: staffName,
        assignedStaffId: staffId || 'STF-ENG-042',
        staffPhone: staffPhone || '+880 1711 554433',
        materialsNeeded: materialsNeeded || 'Standard spare parts',
        status: `Assigned to ${staffName} • Dispatched for Repair`,
      },
      { new: true }
    );

    if (!complaint) return res.status(404).json({ success: false, message: 'Ticket not found' });

    res.status(200).json({
      success: true,
      message: `Work Order #${complaint.ticketId} assigned to ${staffName} by Provost Office!`,
      data: complaint,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    STEP 4: Staff updates work order status (In Progress / Resolved)
// @route   PUT /api/complaints/:id/status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, resolutionNotes, progressPercent, staffNotes, estimatedCompletion } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
    if (staffNotes !== undefined) updateData.staffNotes = staffNotes;
    if (estimatedCompletion !== undefined) updateData.estimatedCompletion = estimatedCompletion;
    if (progressPercent !== undefined) {
      updateData.progressPercent = Math.min(100, Math.max(0, Number(progressPercent)));
    }

    if (status === 'Resolved and Verified' || status === 'Resolved' || Number(progressPercent) === 100) {
      updateData.resolvedAt = new Date();
      updateData.status = 'Resolved and Verified';
      updateData.progressPercent = 100;
    } else if (Number(progressPercent) > 0 && !updateData.workStartedAt) {
      updateData.workStartedAt = new Date();
    }

    const complaint = await Complaint.findOneAndUpdate(
      { $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { ticketId: req.params.id }] },
      updateData,
      { new: true }
    );

    if (!complaint) return res.status(404).json({ success: false, message: 'Ticket not found' });

    res.status(200).json({
      success: true,
      message: `Ticket #${complaint.ticketId} status updated to: ${complaint.status} (${complaint.progressPercent || 0}%)`,
      data: complaint,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    STEP 5: Maintenance Staff updates live progress (% completion, crew notes, ETA)
// @route   PUT /api/complaints/:id/progress
exports.updateComplaintProgress = async (req, res) => {
  try {
    const { progressPercent, status, staffNotes, estimatedCompletion, resolutionNotes } = req.body;

    const updateData = {};
    if (progressPercent !== undefined) {
      updateData.progressPercent = Math.min(100, Math.max(0, Number(progressPercent)));
    }
    if (staffNotes !== undefined) updateData.staffNotes = staffNotes;
    if (estimatedCompletion !== undefined) updateData.estimatedCompletion = estimatedCompletion;
    if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;

    const pct = Number(progressPercent);
    if (pct >= 100 || status === 'Resolved and Verified' || status === 'Resolved') {
      updateData.status = 'Resolved and Verified';
      updateData.progressPercent = 100;
      updateData.resolvedAt = new Date();
    } else if (pct > 0) {
      updateData.status = status || `In Progress (${pct}% Complete)`;
      if (!updateData.workStartedAt) updateData.workStartedAt = new Date();
    } else if (status) {
      updateData.status = status;
    }

    const complaint = await Complaint.findOneAndUpdate(
      { $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { ticketId: req.params.id }] },
      updateData,
      { new: true }
    );

    if (!complaint) return res.status(404).json({ success: false, message: 'Ticket not found' });

    res.status(200).json({
      success: true,
      message: `Work progress for Ticket #${complaint.ticketId} updated to ${complaint.progressPercent}% (${complaint.status})!`,
      data: complaint,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete complaint ticket
// @route   DELETE /api/complaints/:id
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.status(200).json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
