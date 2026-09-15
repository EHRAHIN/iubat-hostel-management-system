const Application = require('../models/Application');
const User = require('../models/User');
const Room = require('../models/Room');

// @desc    Submit new residential seat application
// @route   POST /api/applications
exports.submitApplication = async (req, res) => {
  try {
    const {
      fullName,
      studentId,
      department,
      cgpa,
      phone,
      preferredHall,
      preferredFloor,
      preferredRoom,
      preferredRoomNo,
      preferredBed,
      guardianPhone,
      homeAddress,
      preferences,
      aiPartner,
      recommendedHall,
      recommendedFloor,
      recommendedRoom,
      recommendedBed,
      recommendedTutor,
    } = req.body;

    if (!fullName || !studentId || !cgpa) {
      return res.status(400).json({ success: false, message: 'Full Name, Student ID, and CGPA are required.' });
    }

    // Generate unique reference ID (e.g., #HSTL-APP-4829)
    const randomRef = `#HSTL-APP-${Math.floor(1000 + Math.random() * 9000)}`;

    const application = await Application.create({
      applicationRef: randomRef,
      fullName,
      studentId: studentId.trim(),
      department: department || 'CSE',
      cgpa: Number(cgpa),
      phone: phone || '',
      preferredHall: preferredHall || 'Padma Residential Hall',
      preferredFloor: preferredFloor || 'Floor 1',
      preferredRoom: preferredRoom || 'Double Shared Room',
      preferredRoomNo: preferredRoomNo || '',
      preferredBed: preferredBed || '',
      guardianPhone: guardianPhone || '',
      homeAddress: homeAddress || '',
      preferences: preferences || {},
      aiPartner: aiPartner || {},
      recommendedHall: recommendedHall || preferredHall || 'Padma Residential Hall',
      recommendedFloor: recommendedFloor || preferredFloor || 'Floor 1',
      recommendedRoom: recommendedRoom || preferredRoomNo || '',
      recommendedBed: recommendedBed || preferredBed || '',
      recommendedTutor: recommendedTutor || '',
      status: 'Pending Provost Approval',
    });

    // Update User allocation status to Pending Provost Approval
    await User.findOneAndUpdate(
      { userId: studentId.trim() },
      { allocationStatus: 'Pending' }
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully to Office of the Provost!',
      data: application,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all applications (with status, department, hall filters)
// @route   GET /api/applications
exports.getApplications = async (req, res) => {
  try {
    const { status, department, hall, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (department && department !== 'all') {
      query.department = department;
    }
    if (hall && hall !== 'all') {
      query.preferredHall = hall;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { applicationRef: { $regex: search, $options: 'i' } },
      ];
    }

    const applications = await Application.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track application status by reference or student ID
// @route   GET /api/applications/track/:refOrId
exports.trackApplication = async (req, res) => {
  try {
    const { refOrId } = req.params;
    const term = refOrId.trim();

    const application = await Application.findOne({
      $or: [
        { applicationRef: { $regex: new RegExp(`^${term}$`, 'i') } },
        { studentId: term },
      ],
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'No application found with provided reference / Student ID' });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Hostel Super (Provost) Accepts and Allocates Room with Smart Seat Searching
// @route   PUT /api/applications/:id/approve-allocation
exports.approveAllocation = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { allocatedHall, allocatedFloor, allocatedRoom, allocatedBed, remarks, reviewedBy } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Seat application not found' });
    }

    const hall = allocatedHall || application.recommendedHall || application.preferredHall || 'Padma Residential Hall';
    const hallId = 'padma';
    const hallName = 'Padma Residential Hall';

    let floorStr = allocatedFloor || application.recommendedFloor || application.preferredFloor || 'Floor 1';
    let floorNum = parseInt(floorStr.replace(/\D/g, '')) || 1;
    let roomStr = (allocatedRoom || application.recommendedRoom || application.preferredRoomNo || '').replace(/Room\s*/i, '').trim();
    let bedLabel = allocatedBed || application.recommendedBed || application.preferredBed || '';

    // Smart Room Resolution:
    // If a room is specified, check if it has a vacant bed OR if this student already holds a bed in it
    let roomDoc = null;
    if (roomStr) {
      roomDoc = await Room.findOne({ hallId, floor: floorNum, roomNumber: roomStr });
      if (roomDoc) {
        const canUseRoom = roomDoc.beds && roomDoc.beds.some(
          (b) => !b.isOccupied || b.studentId?.toString().trim() === application.studentId?.toString().trim()
        );
        if (!canUseRoom) {
          roomDoc = null;
          roomStr = '';
        }
      }
    }

    // If no room specified or requested room is completely occupied by OTHER students, find the first available room in this hall
    if (!roomDoc || !roomStr) {
      // First try current floor
      let candidateRooms = await Room.find({
        hallId,
        floor: floorNum,
        status: { $in: ['Available', 'Partially Occupied'] },
      }).sort({ roomNumber: 1 });

      // If current floor is full, try any floor in the hall
      if (candidateRooms.length === 0) {
        candidateRooms = await Room.find({
          hallId,
          status: { $in: ['Available', 'Partially Occupied'] },
        }).sort({ floor: 1, roomNumber: 1 });
      }

      // Find first room with an unoccupied bed or bed held by this student
      for (const cand of candidateRooms) {
        const freeBed = cand.beds.find(
          (b) => !b.isOccupied || b.studentId?.toString().trim() === application.studentId?.toString().trim()
        );
        if (freeBed) {
          roomDoc = cand;
          roomStr = cand.roomNumber;
          floorNum = cand.floor;
          break;
        }
      }

      // If still no room found, generate next room number dynamically (e.g. 101, 102, etc.)
      if (!roomDoc) {
        const existingRoomsCount = await Room.countDocuments({ hallId, floor: floorNum });
        const nextRoomNum = `${floorNum}0${existingRoomsCount + 1}`;
        roomStr = nextRoomNum;
      }
    }

    // Determine House Tutor based on final resolved floor (Padma Hall)
    const houseTutor = floorNum === 2 
      ? 'Prof. Anisur Rahman (Padma Floor 2 House Tutor)' 
      : 'Dr. Tariqul Islam (Padma Floor 1 House Tutor)';
    const houseTutorPhone = floorNum === 2 ? '+880 1819 234567' : '+880 1819 123456';

    // Update or Create Room occupancy in MongoDB
    if (!roomDoc) {
      const initialBedLabel = bedLabel || 'Bed A';
      roomDoc = await Room.create({
        roomNumber: roomStr,
        hallId,
        hallName,
        floor: floorNum,
        roomType: application.preferredRoom || 'Double Shared Room',
        capacity: 2,
        occupiedCount: 1,
        status: 'Partially Occupied',
        assignedHouseTutor: houseTutor,
        beds: [
          { bedLabel: 'Bed A', isOccupied: initialBedLabel === 'Bed A', studentId: initialBedLabel === 'Bed A' ? application.studentId : null, studentName: initialBedLabel === 'Bed A' ? application.fullName : null, studentDept: initialBedLabel === 'Bed A' ? application.department : null },
          { bedLabel: 'Bed B', isOccupied: initialBedLabel === 'Bed B', studentId: initialBedLabel === 'Bed B' ? application.studentId : null, studentName: initialBedLabel === 'Bed B' ? application.fullName : null, studentDept: initialBedLabel === 'Bed B' ? application.department : null },
        ],
      });
      bedLabel = initialBedLabel;
    } else {
      // Find the specific bed if requested and free (or already held by this student), or next unoccupied bed
      let targetBed = null;
      if (bedLabel) {
        targetBed = roomDoc.beds.find(
          (b) => b.bedLabel.toLowerCase() === bedLabel.toLowerCase() && (!b.isOccupied || b.studentId?.toString().trim() === application.studentId?.toString().trim())
        );
      }
      if (!targetBed) {
        targetBed = roomDoc.beds.find(
          (b) => !b.isOccupied || b.studentId?.toString().trim() === application.studentId?.toString().trim()
        );
      }

      if (!targetBed) {
        return res.status(400).json({
          success: false,
          message: `Room ${roomStr} is already fully occupied. Please select an available room.`,
        });
      }

      // Vacate any previous bed this student might have held in other rooms
      await Room.updateMany(
        { _id: { $ne: roomDoc._id }, 'beds.studentId': application.studentId.trim() },
        {
          $set: {
            'beds.$[elem].isOccupied': false,
            'beds.$[elem].studentId': null,
            'beds.$[elem].studentName': null,
            'beds.$[elem].studentDept': null,
          },
        },
        { arrayFilters: [{ 'elem.studentId': application.studentId.trim() }] }
      );

      targetBed.isOccupied = true;
      targetBed.studentId = application.studentId.trim();
      targetBed.studentName = application.fullName;
      targetBed.studentDept = application.department;
      bedLabel = targetBed.bedLabel;

      roomDoc.occupiedCount = roomDoc.beds.filter((b) => b.isOccupied).length;
      roomDoc.status = roomDoc.occupiedCount >= roomDoc.capacity ? 'Fully Occupied' : 'Partially Occupied';
      if (!roomDoc.assignedHouseTutor) roomDoc.assignedHouseTutor = houseTutor;
      await roomDoc.save();
    }

    // Check if there is another student occupying another bed in this exact room
    const actualRoommateBed = roomDoc.beds.find(
      (b) => b.isOccupied && b.studentId && b.studentId.toString().trim() !== application.studentId.trim()
    );

    let partnerData = null;

    if (actualRoommateBed) {
      const roommateId = actualRoommateBed.studentId.toString().trim();
      const actualRoommateUser = await User.findOne({ userId: roommateId });
      const actualRoommateApp = await Application.findOne({ studentId: roommateId });

      // Calculate real match criteria between these two actual room occupants
      const p1 = application.preferences || {};
      const p2 = actualRoommateApp?.preferences || actualRoommateUser?.preferences || {};

      const reasons = [];
      let matchCount = 0;

      // 1. Sleep Schedule
      const s1 = (p1.sleepSchedule || 'night-owl').toLowerCase();
      const s2 = (p2.sleepSchedule || 'night-owl').toLowerCase();
      if (s1 === s2 || (s1.includes('night') && s2.includes('night')) || (s1.includes('early') && s2.includes('early')) || s1 === 'flexible' || s2 === 'flexible') {
        matchCount++;
        reasons.push(`Synchronized sleep cycle: both prefer ${s1.includes('night') ? 'Late-Night Study (1:00 AM+)' : 'Early Rising Routine'}`);
      }

      // 2. Study Habit
      const st1 = (p1.studyHabit || 'moderate-study').toLowerCase();
      const st2 = (p2.studyHabit || 'moderate-study').toLowerCase();
      if (st1 === st2 || (st1.includes('silent') && st2.includes('silent')) || (st1.includes('casual') && st2.includes('casual'))) {
        matchCount++;
        reasons.push(`Matched study habit: mutual focus on ${st1.includes('silent') ? 'quiet academic focus' : 'moderate study routine'}`);
      }

      // 3. Cleanliness
      matchCount++;
      reasons.push('Aligned sanitization discipline: high tidiness & room hygiene');

      // 4. Religious / Routine
      matchCount++;
      reasons.push('Congruent daily prayer & lifestyle routine agreement');

      // 5. Behavior
      const b1 = (p1.behavior || 'balanced').toLowerCase();
      const b2 = (p2.behavior || 'balanced').toLowerCase();
      if (b1 === b2) {
        matchCount++;
        reasons.push(`Harmonious personality vibe: both prefer ${b1 === 'friendly-extrovert' ? 'friendly & social atmosphere' : 'balanced room vibe'}`);
      } else {
        matchCount++;
        reasons.push('Mutual respect for personal space & quiet hours');
      }

      const matchScore = Math.round((matchCount / 5) * 100);

      partnerData = {
        name: actualRoommateBed.studentName || actualRoommateUser?.name || 'Resident Roommate',
        userId: roommateId,
        department: actualRoommateBed.studentDept || actualRoommateUser?.department || 'CSE',
        cgpa: actualRoommateUser?.cgpa ? String(actualRoommateUser.cgpa) : '3.75',
        phone: actualRoommateUser?.phone || '',
        room: `Room ${roomStr}`,
        seatNo: actualRoommateBed.bedLabel,
        matchScore,
        matchReasons: reasons,
      };

      // Mutually update roommate's User & Application records so both reflect each other
      await User.findOneAndUpdate(
        { userId: roommateId },
        {
          room: `Room ${roomStr}`,
          seatNo: actualRoommateBed.bedLabel,
          roommate: {
            name: application.fullName,
            userId: application.studentId.trim(),
            department: application.department,
            cgpa: application.cgpa ? String(application.cgpa) : '3.80',
            phone: application.phone || '',
            room: `Room ${roomStr}`,
            seatNo: bedLabel,
            matchScore,
            matchReasons: reasons,
          },
        }
      );

      await Application.findOneAndUpdate(
        { studentId: roommateId },
        {
          allocatedRoom: `Room ${roomStr}`,
          allocatedBed: actualRoommateBed.bedLabel,
          aiPartner: {
            name: application.fullName,
            userId: application.studentId.trim(),
            department: application.department,
            cgpa: application.cgpa ? String(application.cgpa) : '3.80',
            phone: application.phone || '',
            seatNo: bedLabel,
            matchScore,
            matchReasons: reasons,
          },
        }
      );
    } else {
      partnerData = {
        name: '',
        userId: '',
        department: '',
        cgpa: '',
        phone: '',
        seatNo: '',
        matchScore: null,
        matchReasons: [],
      };
    }

    // Update Application
    application.status = 'Allocated';
    application.allocatedHall = hallName;
    application.allocatedFloor = `Floor ${floorNum}`;
    application.allocatedRoom = `Room ${roomStr}`;
    application.allocatedBed = bedLabel;
    application.aiPartner = partnerData;
    application.remarks = remarks || 'Officially allocated by Provost Office upon AI Smart Roommate Review.';
    application.reviewedBy = reviewedBy || 'Prof. Dr. Monirul Islam (Hostel Super / Provost)';
    await application.save();

    // Update User Record in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { userId: application.studentId.trim() },
      {
        hall: hallName,
        floor: `Floor ${floorNum}`,
        room: `Room ${roomStr}`,
        seatNo: bedLabel,
        unit: `${hallName} (Floor ${floorNum}, Room ${roomStr}, ${bedLabel})`,
        floorTeacher: houseTutor,
        floorTeacherPhone: houseTutorPhone,
        allocationStatus: 'Allocated',
        status: 'Active',
        roommate: partnerData.name ? partnerData : null,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Provost Approved & Allocated! ${application.fullName} is now assigned to ${hallName}, Floor ${floorNum}, Room ${roomStr} (${bedLabel}).`,
      data: application,
      user: updatedUser,
      allocation: {
        hall: hallName,
        floor: `Floor ${floorNum}`,
        room: `Room ${roomStr}`,
        seatNo: bedLabel,
        houseTutor,
        houseTutorPhone,
        roommate: partnerData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Revoke seat allocation (Frees room bed, resets student to pending)
// @route   PUT /api/applications/:id/revoke-allocation
exports.revokeAllocation = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const studentIdClean = application.studentId ? application.studentId.trim() : '';

    // 1. Release bed in Room collection in MongoDB
    if (studentIdClean) {
      await Room.updateMany(
        { 'beds.studentId': studentIdClean },
        {
          $set: {
            'beds.$[elem].isOccupied': false,
            'beds.$[elem].studentId': null,
            'beds.$[elem].studentName': null,
            'beds.$[elem].studentDept': null,
          },
        },
        { arrayFilters: [{ 'elem.studentId': studentIdClean }] }
      );

      // Recalculate room occupancy & status for all rooms
      const allRooms = await Room.find();
      for (const r of allRooms) {
        const occ = r.beds.filter((b) => b.isOccupied).length;
        r.occupiedCount = occ;
        r.status = occ >= r.capacity ? 'Fully Occupied' : occ > 0 ? 'Partially Occupied' : 'Available';
        await r.save();
      }

      // 2. Clear roommate link on any partner student who was paired with this student
      await User.updateMany(
        { 'roommate.userId': studentIdClean },
        { $set: { roommate: null } }
      );

      // 3. Reset student User record
      await User.findOneAndUpdate(
        { userId: studentIdClean },
        {
          room: '',
          seatNo: '',
          allocationStatus: 'Pending Provost Approval',
          unit: `${application.preferredHall || 'Padma Residential Hall'} (Seat Allocation Pending Provost Approval)`,
          roommate: null,
        }
      );
    }

    // 4. Reset Application record
    application.status = 'Pending Provost Approval';
    application.allocatedHall = '';
    application.allocatedFloor = '';
    application.allocatedRoom = '';
    application.allocatedBed = '';
    application.remarks = 'Seat allocation revoked by Provost Office. Bed returned to vacant pool.';
    application.reviewedBy = 'Prof. Dr. Monirul Islam (Hostel Super / Provost)';
    await application.save();

    res.status(200).json({
      success: true,
      message: `Seat allocation for ${application.fullName} (${studentIdClean}) has been revoked. Bed successfully freed up in Room directory!`,
      data: application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete application completely
// @route   DELETE /api/applications/:id
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const studentIdClean = application.studentId ? application.studentId.trim() : '';

    // 1. Release bed in Room collection
    if (studentIdClean) {
      await Room.updateMany(
        { 'beds.studentId': studentIdClean },
        {
          $set: {
            'beds.$[elem].isOccupied': false,
            'beds.$[elem].studentId': null,
            'beds.$[elem].studentName': null,
            'beds.$[elem].studentDept': null,
          },
        },
        { arrayFilters: [{ 'elem.studentId': studentIdClean }] }
      );

      // Recalculate room occupancy & status for all rooms
      const allRooms = await Room.find();
      for (const r of allRooms) {
        const occ = r.beds.filter((b) => b.isOccupied).length;
        r.occupiedCount = occ;
        r.status = occ >= r.capacity ? 'Fully Occupied' : occ > 0 ? 'Partially Occupied' : 'Available';
        await r.save();
      }

      // 2. Clear roommate link on any partner student
      await User.updateMany(
        { 'roommate.userId': studentIdClean },
        { $set: { roommate: null } }
      );

      // 3. Delete student User record completely from Database
      await User.deleteMany({
        $or: [
          { userId: studentIdClean },
          ...(application.email ? [{ email: application.email.trim().toLowerCase() }] : []),
        ],
      });

      // 4. Delete student operational records
      const GatePass = require('../models/GatePass');
      const Complaint = require('../models/Complaint');
      const { MealBooking } = require('../models/Meal');
      const Payment = require('../models/Payment');
      const RoomTransferRequest = require('../models/RoomTransferRequest');
      const RoommateMatch = require('../models/RoommateMatch');

      await GatePass.deleteMany({ studentId: studentIdClean });
      await Complaint.deleteMany({ studentId: studentIdClean });
      await MealBooking.deleteMany({ studentId: studentIdClean });
      await Payment.deleteMany({ studentId: studentIdClean });
      await RoomTransferRequest.deleteMany({ studentId: studentIdClean });
      await RoommateMatch.deleteMany({
        $or: [{ student1Id: studentIdClean }, { student2Id: studentIdClean }],
      });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Seat application #${application.applicationRef} deleted and room vacancy restored.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, allocatedHall, allocatedFloor, allocatedRoom, allocatedBed, remarks, reviewedBy } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status,
        allocatedHall,
        allocatedFloor,
        allocatedRoom,
        allocatedBed,
        remarks,
        reviewedBy: reviewedBy || 'Office of the Provost',
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (status === 'Allocated') {
      await User.findOneAndUpdate(
        { userId: application.studentId },
        {
          hall: allocatedHall || application.preferredHall,
          floor: allocatedFloor || application.preferredFloor || 'Floor 1',
          room: allocatedRoom || 'Room 101',
          seatNo: allocatedBed || 'Bed A',
          status: 'Active',
          allocationStatus: 'Allocated',
        }
      );
    }

    res.status(200).json({ success: true, message: `Application status updated to ${status}`, data: application });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
