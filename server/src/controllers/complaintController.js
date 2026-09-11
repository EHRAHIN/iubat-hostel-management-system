const Complaint = require('../models/Complaint');

// @desc    Get all complaints
// @route   GET /api/complaints
exports.getComplaints = async (req, res) => {
  try {
    const { hall, floor, category, priority, status, studentId, assignedStaffId, tutorStatus, search } = req.query;
    const query = {};

    if (hall && hall !== 'all') query.hall = hall;
    if (floor && floor !== 'all') query.floor = floor;
    if (category && category !== 'all') query.category = category;
    if (priority && priority !== 'all') query.priority = priority;
    if (status && status !== 'all') query.status = status;
    if (tutorStatus && tutorStatus !== 'all') query.tutorStatus = tutorStatus;
    if (studentId) query.studentId = studentId;
    if (assignedStaffId) query.assignedStaffId = assignedStaffId;

    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { room: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
      ];
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    STEP 1: Student submits a maintenance problem
// @route   POST /api/complaints
exports.createComplaint = async (req, res) => {
  try {
    const { studentId, studentName, hall, floor, room, category, priority, title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and Description are required' });
    }

    const ticketId = `WRK-2026-${Math.floor(100 + Math.random() * 900)}`;

    const complaint = await Complaint.create({
      ticketId,
      studentId: studentId || '221004128',
      studentName: studentName || 'Resident Student',
      hall: hall || 'Padma Residential Hall (Male)',
      floor: floor || 'Floor 1',
      room: room || 'Room 104',
      category: category || 'Electrical',
      priority: priority || 'Normal',
      title: title.trim(),
      description: description.trim(),
      status: 'Pending Floor Teacher Verification',
      tutorStatus: 'Pending Verification',
      assignedStaff: 'Pending Provost Assignment',
    });

    res.status(201).json({
      success: true,
      message: `Maintenance ticket #${complaint.ticketId} submitted. Dispatched to Floor Teacher for inspection.`,
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
    const { status, resolutionNotes } = req.body; // 'In Progress' | 'Resolved and Verified'

    const updateData = { status };
    if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
    if (status === 'Resolved and Verified' || status === 'Resolved') {
      updateData.resolvedAt = new Date();
      updateData.status = 'Resolved and Verified';
    }

    const complaint = await Complaint.findOneAndUpdate(
      { $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { ticketId: req.params.id }] },
      updateData,
      { new: true }
    );

    if (!complaint) return res.status(404).json({ success: false, message: 'Ticket not found' });

    res.status(200).json({
      success: true,
      message: `Ticket #${complaint.ticketId} status updated to: ${complaint.status}`,
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
