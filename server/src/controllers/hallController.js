const Hall = require('../models/Hall');
const Room = require('../models/Room');
const User = require('../models/User');
const Application = require('../models/Application');
const RoomTransferRequest = require('../models/RoomTransferRequest');
const Payment = require('../models/Payment');

// @desc    Get all residential halls with stats
// @route   GET /api/halls
exports.getHalls = async (req, res) => {
  try {
    const halls = await Hall.find().sort({ name: 1 });
    const dynamicHalls = await Promise.all(
      halls.map(async (h) => {
        const rooms = await Room.find({ hallId: h.hallId.toLowerCase() });
        let totalBeds = 0;
        let occupiedBeds = 0;
        rooms.forEach((r) => {
          totalBeds += r.capacity || (r.beds ? r.beds.length : 0);
          occupiedBeds += r.occupiedCount || 0;
        });
        const hObj = h.toObject();
        hObj.totalRooms = rooms.length;
        hObj.totalBeds = totalBeds;
        hObj.occupiedBeds = occupiedBeds;
        return hObj;
      })
    );
    res.status(200).json({ success: true, count: dynamicHalls.length, data: dynamicHalls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single hall details
// @route   GET /api/halls/:id
exports.getHallById = async (req, res) => {
  try {
    const hall = await Hall.findOne({
      $or: [{ hallId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });
    if (!hall) return res.status(404).json({ success: false, message: 'Hall not found' });
    const rooms = await Room.find({ hallId: hall.hallId.toLowerCase() });
    let totalBeds = 0;
    let occupiedBeds = 0;
    rooms.forEach((r) => {
      totalBeds += r.capacity || (r.beds ? r.beds.length : 0);
      occupiedBeds += r.occupiedCount || 0;
    });
    const hObj = hall.toObject();
    hObj.totalRooms = rooms.length;
    hObj.totalBeds = totalBeds;
    hObj.occupiedBeds = occupiedBeds;
    res.status(200).json({ success: true, data: hObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get rooms (supports hallId, floor, roomType, status filters)
// @route   GET /api/rooms
exports.getRooms = async (req, res) => {
  try {
    const { hallId, floor, roomType, status, search } = req.query;
    const query = {};

    if (hallId && hallId !== 'all') {
      query.hallId = hallId.toLowerCase();
    }
    if (floor && floor !== 'all') {
      query.floor = Number(floor);
    }
    if (roomType && roomType !== 'all') {
      query.roomType = roomType;
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { roomNumber: { $regex: search, $options: 'i' } },
        { hallName: { $regex: search, $options: 'i' } },
      ];
    }

    const rooms = await Room.find(query).sort({ floor: 1, roomNumber: 1 });
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get floor matrix for a specific hall
// @route   GET /api/halls/:hallId/matrix
exports.getHallFloorMatrix = async (req, res) => {
  try {
    const { hallId } = req.params;
    const rooms = await Room.find({ hallId: hallId.toLowerCase() }).sort({ floor: 1, roomNumber: 1 });

    // Group by floor
    const floors = {};
    rooms.forEach((room) => {
      if (!floors[room.floor]) {
        floors[room.floor] = {
          floorNumber: room.floor,
          totalRooms: 0,
          occupiedBeds: 0,
          totalBeds: 0,
          rooms: [],
        };
      }
      floors[room.floor].totalRooms += 1;
      floors[room.floor].totalBeds += room.capacity;
      floors[room.floor].occupiedBeds += room.occupiedCount;
      floors[room.floor].rooms.push(room);
    });

    res.status(200).json({
      success: true,
      hallId,
      floorMatrix: Object.values(floors),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new room with bed layout
// @route   POST /api/rooms
exports.createRoom = async (req, res) => {
  try {
    const {
      roomNumber,
      hallId = 'padma',
      hallName = 'Padma Residential Hall (Male)',
      floor = 1,
      roomType = 'Double Shared Room',
      capacity = 2,
      hasAC = false,
      hasBalcony = true,
      monthlyRent = 2200,
      assignedHouseTutor,
      status = 'Available',
      beds,
    } = req.body;

    if (!roomNumber) {
      return res.status(400).json({ success: false, message: 'Room number is required.' });
    }

    const cleanRoomNo = roomNumber.toString().replace(/Room\s*/i, '').trim();
    const cleanFloor = Number(floor) || 1;

    // Check if room already exists on this floor
    const existing = await Room.findOne({ hallId, floor: cleanFloor, roomNumber: cleanRoomNo });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Room ${cleanRoomNo} already exists on Floor ${cleanFloor} of ${hallName}.`,
      });
    }

    // STRICT ROOM CAPACITY VALIDATION (User Specification):
    // 1. Single room: strictly 1 bed (cannot be made 2 or more)
    // 2. Double bed room: strictly 2 beds (cannot be made 3 or more)
    // 3. 4-Bed room: strictly 4 beds (cannot be made 5 or more)
    const normalizedType = (roomType || '').toLowerCase();
    let strictCapacity = 2;
    let defaultRent = 3500;

    const existingTypeRoom = await Room.findOne({
      roomType: new RegExp(
        normalizedType.includes('single') ? 'single' : normalizedType.includes('double') ? 'double' : '4-bed|quad',
        'i'
      ),
    });

    if (normalizedType.includes('single')) {
      strictCapacity = 1;
      defaultRent = existingTypeRoom?.monthlyRent || 5500;
      if (capacity && Number(capacity) > 1) {
        return res.status(400).json({
          success: false,
          message: 'Capacity Violation: Single Deluxe Room is strictly limited to 1 bed (cannot be double/2 or more).',
        });
      }
    } else if (normalizedType.includes('double')) {
      strictCapacity = 2;
      defaultRent = existingTypeRoom?.monthlyRent || 3500;
      if (capacity && Number(capacity) > 2) {
        return res.status(400).json({
          success: false,
          message: 'Capacity Violation: Double Shared Room is strictly limited to 2 beds (cannot be made 3 or more).',
        });
      }
    } else if (normalizedType.includes('4-bed') || normalizedType.includes('quad') || normalizedType.includes('four')) {
      strictCapacity = 4;
      defaultRent = existingTypeRoom?.monthlyRent || 2500;
      if (capacity && Number(capacity) > 4) {
        return res.status(400).json({
          success: false,
          message: 'Capacity Violation: 4-Bed Standard Room is strictly limited to 4 beds (cannot be made 5 or more).',
        });
      }
    }

    // Price change permission: Only admin can set a custom price different from the default tariff
    const requesterRole = (req.body.userRole || req.body.role || req.headers['x-user-role'] || '').toLowerCase();
    let finalRent = Number(monthlyRent) || defaultRent;
    if (requesterRole && !['admin', 'superadmin', 'super_admin'].includes(requesterRole) && Number(monthlyRent) && Number(monthlyRent) !== defaultRent) {
      // Non-admin (e.g. hostel super) must use standard official tariff
      finalRent = defaultRent;
    }

    // Determine default House Tutor
    const defaultTutor = cleanFloor === 2
      ? 'Prof. Anisur Rahman (Padma Floor 2 House Tutor)'
      : 'Dr. Tariqul Islam (Padma Floor 1 House Tutor)';

    // Build default beds according to strict capacity
    const bedCount = strictCapacity;
    let finalBeds = [];
    for (let i = 0; i < bedCount; i++) {
      const letter = String.fromCharCode(65 + i); // A, B, C, D...
      finalBeds.push({
        bedLabel: `Bed ${letter}`,
        isOccupied: false,
        studentId: null,
        studentName: null,
        studentDept: null,
      });
    }

    const newRoom = await Room.create({
      roomNumber: cleanRoomNo,
      hallId,
      hallName,
      floor: cleanFloor,
      roomType,
      capacity: bedCount,
      occupiedCount: 0,
      hasAC: Boolean(hasAC),
      hasBalcony: Boolean(hasBalcony),
      monthlyRent: finalRent,
      status,
      assignedHouseTutor: assignedHouseTutor || defaultTutor,
      beds: finalBeds,
    });

    res.status(201).json({
      success: true,
      message: `Room ${cleanRoomNo} (${roomType} • ${bedCount} Bed) successfully created on Floor ${cleanFloor}!`,
      data: newRoom,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update room details / availability / status
// @route   PUT /api/rooms/:id
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    const {
      status,
      roomType,
      monthlyRent,
      hasAC,
      hasBalcony,
      assignedHouseTutor,
      roomNumber,
      floor,
      capacity,
    } = req.body;

    // Room Price Control: Only Super Admin can modify room price / monthly rent
    if (monthlyRent !== undefined) {
      const requesterRole = (req.body.userRole || req.body.role || req.headers['x-user-role'] || '').toLowerCase();
      if (requesterRole && !['admin', 'superadmin', 'super_admin'].includes(requesterRole)) {
        return res.status(403).json({
          success: false,
          message: 'Permission Denied: Only Super Admin is authorized to change room prices/tariffs.',
        });
      }
      room.monthlyRent = Number(monthlyRent);
      // Synchronize any unpaid/due Seat Rent invoices for this room
      await Payment.updateMany(
        { room: new RegExp(room.roomNumber, 'i'), feeType: 'Seat Rent', status: 'Due' },
        { $set: { amountBDT: Number(monthlyRent), payAbleAmount: Number(monthlyRent) } }
      );
    }

    // Strict Capacity check on update
    const activeType = (roomType || room.roomType || '').toLowerCase();
    if (activeType.includes('single') && (Number(capacity) > 1 || room.beds.length > 1)) {
      return res.status(400).json({
        success: false,
        message: 'Capacity Violation: Single Deluxe Room is strictly limited to 1 bed (cannot be double/2).',
      });
    }
    if (activeType.includes('double') && (Number(capacity) > 2 || room.beds.length > 2)) {
      return res.status(400).json({
        success: false,
        message: 'Capacity Violation: Double Shared Room is strictly limited to 2 beds (cannot be 3).',
      });
    }
    if ((activeType.includes('4-bed') || activeType.includes('quad')) && (Number(capacity) > 4 || room.beds.length > 4)) {
      return res.status(400).json({
        success: false,
        message: 'Capacity Violation: 4-Bed Standard Room is strictly limited to 4 beds (cannot be 5).',
      });
    }

    if (status !== undefined) room.status = status;
    if (roomType !== undefined) room.roomType = roomType;
    if (hasAC !== undefined) room.hasAC = Boolean(hasAC);
    if (hasBalcony !== undefined) room.hasBalcony = Boolean(hasBalcony);
    if (assignedHouseTutor !== undefined) room.assignedHouseTutor = assignedHouseTutor;
    if (roomNumber !== undefined) room.roomNumber = roomNumber.toString().replace(/Room\s*/i, '').trim();
    if (floor !== undefined) room.floor = Number(floor);

    // If status is not manually forced to Under Maintenance, recalculate based on occupancy
    if (room.status !== 'Under Maintenance') {
      const occ = room.beds.filter((b) => b.isOccupied).length;
      room.occupiedCount = occ;
      room.status = occ >= room.capacity ? 'Fully Occupied' : occ > 0 ? 'Partially Occupied' : 'Available';
    }

    await room.save();
    res.status(200).json({ success: true, message: `Room ${room.roomNumber} updated successfully.`, data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update room tariffs university-wide (Super Admin only)
// @route   PUT /api/rooms/batch/tariffs
exports.updateRoomTariffs = async (req, res) => {
  try {
    const { singleRent, doubleRent, quadRent, userRole } = req.body;
    const role = (userRole || req.body.role || req.headers['x-user-role'] || '').toLowerCase();
    if (role && !['admin', 'superadmin', 'super_admin'].includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Permission Denied: Only Super Admin is authorized to modify university room tariffs.',
      });
    }

    const updates = [];
    if (singleRent && Number(singleRent) > 0) {
      updates.push(
        Room.updateMany(
          { roomType: /Single/i },
          { $set: { monthlyRent: Number(singleRent) } }
        )
      );
    }
    if (doubleRent && Number(doubleRent) > 0) {
      updates.push(
        Room.updateMany(
          { roomType: /Double/i },
          { $set: { monthlyRent: Number(doubleRent) } }
        )
      );
      // Synchronize any due Seat Rent invoices
      updates.push(
        Payment.updateMany(
          { feeType: 'Seat Rent', status: 'Due' },
          { $set: { amountBDT: Number(doubleRent), payAbleAmount: Number(doubleRent) } }
        )
      );
    }
    if (quadRent && Number(quadRent) > 0) {
      updates.push(
        Room.updateMany(
          { roomType: /(4-Bed|Quad)/i },
          { $set: { monthlyRent: Number(quadRent) } }
        )
      );
    }

    await Promise.all(updates);

    res.status(200).json({
      success: true,
      message: 'Room tariffs successfully updated across all residential rooms and pending invoices!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check if any beds are occupied
    const occupiedBeds = room.beds.filter((b) => b.isOccupied);
    if (occupiedBeds.length > 0) {
      // Unassign students and return them to pending allocation
      for (const b of occupiedBeds) {
        if (b.studentId) {
          await User.findOneAndUpdate(
            { userId: b.studentId.toString().trim() },
            {
              room: '',
              seatNo: '',
              allocationStatus: 'Pending Provost Approval',
              unit: `${room.hallName} (Pending Allocation)`,
            }
          );
          await Application.findOneAndUpdate(
            { studentId: b.studentId.toString().trim() },
            {
              status: 'Pending Provost Approval',
              allocatedRoom: '',
              allocatedBed: '',
              remarks: `Previous Room ${room.roomNumber} removed from residential layout.`,
            }
          );
        }
      }
    }

    await Room.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: `Room ${room.roomNumber} has been removed. Any previous occupants were reset to Pending Allocation.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new bed to an existing room (increase capacity)
// @route   POST /api/rooms/:id/beds
exports.addBed = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    // STRICT CAPACITY LIMIT ENFORCEMENT:
    // - Single room cannot be made 2 beds
    // - Double room cannot be made 3 beds
    // - 4-Bed room cannot be made 5 beds
    const normalizedType = (room.roomType || '').toLowerCase();
    if (normalizedType.includes('single') && room.beds.length >= 1) {
      return res.status(400).json({
        success: false,
        message: 'Strict Capacity Limit: Single Deluxe Room is strictly limited to 1 bed. Additional beds cannot be added.',
      });
    }
    if (normalizedType.includes('double') && room.beds.length >= 2) {
      return res.status(400).json({
        success: false,
        message: 'Strict Capacity Limit: Double Shared Room is strictly limited to 2 beds. Cannot add a 3rd bed.',
      });
    }
    if ((normalizedType.includes('4-bed') || normalizedType.includes('quad') || normalizedType.includes('four')) && room.beds.length >= 4) {
      return res.status(400).json({
        success: false,
        message: 'Strict Capacity Limit: 4-Bed Standard Room is strictly limited to 4 beds. Cannot add a 5th bed.',
      });
    }

    // Determine next bed label (e.g. Bed C, Bed D...)
    const existingLabels = room.beds.map((b) => b.bedLabel);
    let nextLetterCode = 65; // 'A'
    while (existingLabels.includes(`Bed ${String.fromCharCode(nextLetterCode)}`)) {
      nextLetterCode++;
    }
    const newBedLabel = req.body.bedLabel || `Bed ${String.fromCharCode(nextLetterCode)}`;

    room.beds.push({
      bedLabel: newBedLabel,
      isOccupied: false,
      studentId: null,
      studentName: null,
      studentDept: null,
    });

    room.capacity = room.beds.length;
    const occ = room.beds.filter((b) => b.isOccupied).length;
    room.occupiedCount = occ;
    if (room.status !== 'Under Maintenance') {
      room.status = occ >= room.capacity ? 'Fully Occupied' : occ > 0 ? 'Partially Occupied' : 'Available';
    }

    await room.save();
    res.status(200).json({
      success: true,
      message: `${newBedLabel} added to Room ${room.roomNumber}. New capacity: ${room.capacity} beds.`,
      data: room,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Remove a vacant bed from a room (decrease capacity)
// @route   DELETE /api/rooms/:id/beds/:bedLabel
exports.removeBed = async (req, res) => {
  try {
    const { id, bedLabel } = req.params;
    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    const targetBed = room.beds.find((b) => b.bedLabel.toLowerCase() === bedLabel.toLowerCase());
    if (!targetBed) {
      return res.status(404).json({ success: false, message: `Bed "${bedLabel}" not found in Room ${room.roomNumber}` });
    }

    if (targetBed.isOccupied) {
      return res.status(400).json({
        success: false,
        message: `Cannot remove ${targetBed.bedLabel} because it is currently occupied by ${targetBed.studentName || targetBed.studentId}. Reallocate the student first.`,
      });
    }

    room.beds = room.beds.filter((b) => b.bedLabel.toLowerCase() !== bedLabel.toLowerCase());
    room.capacity = Math.max(1, room.beds.length);
    const occ = room.beds.filter((b) => b.isOccupied).length;
    room.occupiedCount = occ;
    if (room.status !== 'Under Maintenance') {
      room.status = occ >= room.capacity ? 'Fully Occupied' : occ > 0 ? 'Partially Occupied' : 'Available';
    }

    await room.save();
    res.status(200).json({
      success: true,
      message: `${bedLabel} removed from Room ${room.roomNumber}. New capacity: ${room.capacity} beds.`,
      data: room,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Transfer / Change a student's room and bed
// @route   POST /api/rooms/transfer
exports.transferStudentRoom = async (req, res) => {
  try {
    const {
      studentId,
      targetRoomId,
      targetRoomNumber,
      targetFloor,
      targetBedLabel,
      reason,
      reviewedBy = 'Office of the Provost / Admin',
    } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required for room transfer.' });
    }

    const cleanId = studentId.toString().trim();
    const studentUser = await User.findOne({ userId: cleanId });
    if (!studentUser) {
      return res.status(404).json({ success: false, message: `Student account with ID "${cleanId}" not found.` });
    }

    // 1. Locate Destination Room
    let destRoom = null;
    if (targetRoomId) {
      destRoom = await Room.findById(targetRoomId);
    } else if (targetRoomNumber) {
      const cleanTargetRoomNo = targetRoomNumber.toString().replace(/Room\s*/i, '').trim();
      const cleanTargetFloor = Number(targetFloor) || 1;
      destRoom = await Room.findOne({ floor: cleanTargetFloor, roomNumber: cleanTargetRoomNo });
    }

    if (!destRoom) {
      return res.status(404).json({ success: false, message: 'Destination room not found.' });
    }

    // 2. Locate Target Bed in Destination Room
    let destBed = null;
    if (targetBedLabel) {
      destBed = destRoom.beds.find((b) => b.bedLabel.toLowerCase() === targetBedLabel.toLowerCase());
    } else {
      // Find first vacant bed
      destBed = destRoom.beds.find((b) => !b.isOccupied);
    }

    if (!destBed) {
      return res.status(400).json({
        success: false,
        message: `No vacant bed available in Room ${destRoom.roomNumber}.`,
      });
    }

    if (destBed.isOccupied && destBed.studentId?.toString().trim() !== cleanId) {
      return res.status(400).json({
        success: false,
        message: `${destBed.bedLabel} in Room ${destRoom.roomNumber} is already occupied by another student.`,
      });
    }

    // 3. Vacate Old Bed in Any Room
    const oldRooms = await Room.find({ 'beds.studentId': cleanId });
    for (const oldRoom of oldRooms) {
      oldRoom.beds.forEach((b) => {
        if (b.studentId?.toString().trim() === cleanId) {
          b.isOccupied = false;
          b.studentId = null;
          b.studentName = null;
          b.studentDept = null;
        }
      });
      const occ = oldRoom.beds.filter((b) => b.isOccupied).length;
      oldRoom.occupiedCount = occ;
      if (oldRoom.status !== 'Under Maintenance') {
        oldRoom.status = occ >= oldRoom.capacity ? 'Fully Occupied' : occ > 0 ? 'Partially Occupied' : 'Available';
      }
      await oldRoom.save();
    }

    // 4. Assign to Destination Bed
    // Reload destRoom to ensure freshest state
    const refreshedDestRoom = await Room.findById(destRoom._id);
    const refreshedBed = refreshedDestRoom.beds.find((b) => b.bedLabel.toLowerCase() === destBed.bedLabel.toLowerCase());
    if (refreshedBed) {
      refreshedBed.isOccupied = true;
      refreshedBed.studentId = cleanId;
      refreshedBed.studentName = studentUser.name;
      refreshedBed.studentDept = studentUser.department;
    }
    const occDest = refreshedDestRoom.beds.filter((b) => b.isOccupied).length;
    refreshedDestRoom.occupiedCount = occDest;
    if (refreshedDestRoom.status !== 'Under Maintenance') {
      refreshedDestRoom.status = occDest >= refreshedDestRoom.capacity ? 'Fully Occupied' : 'Partially Occupied';
    }
    await refreshedDestRoom.save();

    // 5. Determine House Tutor
    const destTutor = refreshedDestRoom.floor === 2
      ? 'Prof. Anisur Rahman (Padma Floor 2 House Tutor)'
      : 'Dr. Tariqul Islam (Padma Floor 1 House Tutor)';
    const destTutorPhone = refreshedDestRoom.floor === 2 ? '+880 1819 234567' : '+880 1819 123456';

    // 6. Update Student User
    const updatedUser = await User.findOneAndUpdate(
      { userId: cleanId },
      {
        room: `Room ${refreshedDestRoom.roomNumber}`,
        floor: `Floor ${refreshedDestRoom.floor}`,
        seatNo: destBed.bedLabel,
        unit: `${refreshedDestRoom.hallName} (Floor ${refreshedDestRoom.floor}, Room ${refreshedDestRoom.roomNumber}, ${destBed.bedLabel})`,
        floorTeacher: destTutor,
        floorTeacherPhone: destTutorPhone,
        allocationStatus: 'Allocated',
        status: 'Active',
      },
      { new: true }
    );

    // 7. Update Application
    await Application.findOneAndUpdate(
      { studentId: cleanId },
      {
        status: 'Allocated',
        allocatedHall: refreshedDestRoom.hallName,
        allocatedFloor: `Floor ${refreshedDestRoom.floor}`,
        allocatedRoom: `Room ${refreshedDestRoom.roomNumber}`,
        allocatedBed: destBed.bedLabel,
        remarks: reason ? `Room transferred: ${reason}` : 'Room transferred by Provost/Admin.',
        reviewedBy,
      }
    );

    res.status(200).json({
      success: true,
      message: `Student ${studentUser.name} (${cleanId}) successfully transferred to Floor ${refreshedDestRoom.floor}, Room ${refreshedDestRoom.roomNumber} (${destBed.bedLabel})!`,
      data: {
        room: `Room ${refreshedDestRoom.roomNumber}`,
        seatNo: destBed.bedLabel,
        floor: `Floor ${refreshedDestRoom.floor}`,
        user: updatedUser,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Student applies for room transfer with reason
// @route   POST /api/rooms/transfer-requests
exports.createTransferRequest = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      department,
      cgpa,
      phone,
      currentHall,
      currentFloor,
      currentRoom,
      currentBed,
      preferredHall,
      preferredFloor,
      preferredRoomType,
      preferredRoom,
      preferredBed,
      reason,
    } = req.body;

    if (!studentId || !reason) {
      return res.status(400).json({ success: false, message: 'Student ID and Reason for transfer are required.' });
    }

    const cleanId = studentId.toString().trim();
    const studentUser = await User.findOne({
      $or: [
        { userId: cleanId },
        { userId: !isNaN(cleanId) ? Number(cleanId) : cleanId },
        { name: new RegExp(`^${cleanId}$`, 'i') },
      ],
    });

    const randomReqId = `TR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest = await RoomTransferRequest.create({
      requestId: randomReqId,
      studentId: cleanId,
      studentName: studentName || studentUser?.name || 'Student Resident',
      department: department || studentUser?.department || 'CSE',
      cgpa: cgpa || studentUser?.cgpa || 3.5,
      phone: phone || studentUser?.phone || '',
      currentHall: currentHall || studentUser?.hall || 'Padma Residential Hall (Male)',
      currentFloor: currentFloor || studentUser?.floor || 'Floor 1',
      currentRoom: currentRoom || studentUser?.room || 'Room 101',
      currentBed: currentBed || studentUser?.seatNo || 'Bed A',
      preferredHall: preferredHall || studentUser?.hall || 'Padma Residential Hall (Male)',
      preferredFloor: preferredFloor || 'Floor 1',
      preferredRoomType: preferredRoomType || 'Double Shared Room',
      preferredRoom: preferredRoom || '',
      preferredBed: preferredBed || '',
      reason: reason.trim(),
      status: 'Pending Review',
    });

    res.status(201).json({
      success: true,
      message: `Room transfer request ${randomReqId} submitted to Hostel Super for review!`,
      data: newRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get room transfer requests (Hostel Super / Student)
// @route   GET /api/rooms/transfer-requests
exports.getTransferRequests = async (req, res) => {
  try {
    const { status, studentId } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (studentId) {
      query.studentId = studentId.toString().trim();
    }

    const requests = await RoomTransferRequest.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Hostel Super reviews & executes or rejects room transfer
// @route   PUT /api/rooms/transfer-requests/:id/review
exports.reviewTransferRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, targetRoomNumber, targetFloor, targetBedLabel, reviewRemarks, reviewedBy = 'Office of the Provost (Hostel Super)' } = req.body;

    const request = await RoomTransferRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Transfer request not found.' });
    }

    if (action === 'reject') {
      request.status = 'Rejected';
      request.reviewedBy = reviewedBy;
      request.reviewRemarks = reviewRemarks || 'Transfer request rejected by Hostel Super.';
      await request.save();

      return res.status(200).json({
        success: true,
        message: `Transfer request for ${request.studentName} has been rejected.`,
        data: request,
      });
    }

    // If allowed / approved, execute the physical room and bed change!
    const cleanId = request.studentId;
    const studentUser = await User.findOne({ userId: cleanId });
    if (!studentUser) {
      return res.status(404).json({ success: false, message: `Student account with ID "${cleanId}" not found.` });
    }

    // Determine target room & bed
    const cleanTargetRoomNo = (targetRoomNumber || request.preferredRoom || '102').toString().replace(/Room\s*/i, '').trim();
    const cleanTargetFloor = Number(targetFloor || (request.preferredFloor ? request.preferredFloor.replace(/\D/g, '') : 1)) || 1;

    const destRoom = await Room.findOne({ floor: cleanTargetFloor, roomNumber: cleanTargetRoomNo });
    if (!destRoom) {
      return res.status(404).json({ success: false, message: `Destination Room ${cleanTargetRoomNo} not found on Floor ${cleanTargetFloor}.` });
    }

    // Find destination bed
    let destBed = null;
    if (targetBedLabel || request.preferredBed) {
      const preferred = (targetBedLabel || request.preferredBed).toLowerCase();
      destBed = destRoom.beds.find((b) => b.bedLabel.toLowerCase() === preferred && (!b.isOccupied || b.studentId === cleanId));
    }
    if (!destBed) {
      destBed = destRoom.beds.find((b) => !b.isOccupied);
    }

    if (!destBed) {
      return res.status(400).json({
        success: false,
        message: `No vacant bed available in Room ${destRoom.roomNumber} on Floor ${cleanTargetFloor}.`,
      });
    }

    // Vacate old bed in old room
    const oldRooms = await Room.find({ 'beds.studentId': cleanId });
    for (const oldRoom of oldRooms) {
      oldRoom.beds.forEach((b) => {
        if (b.studentId?.toString().trim() === cleanId) {
          b.isOccupied = false;
          b.studentId = null;
          b.studentName = null;
          b.studentDept = null;
        }
      });
      const occ = oldRoom.beds.filter((b) => b.isOccupied).length;
      oldRoom.occupiedCount = occ;
      if (oldRoom.status !== 'Under Maintenance') {
        oldRoom.status = occ >= oldRoom.capacity ? 'Fully Occupied' : occ > 0 ? 'Partially Occupied' : 'Available';
      }
      await oldRoom.save();
    }

    // Occupy new bed in destination room
    const freshDestRoom = await Room.findById(destRoom._id);
    const bedInFresh = freshDestRoom.beds.find((b) => b.bedLabel.toLowerCase() === destBed.bedLabel.toLowerCase());
    if (bedInFresh) {
      bedInFresh.isOccupied = true;
      bedInFresh.studentId = cleanId;
      bedInFresh.studentName = studentUser.name;
      bedInFresh.studentDept = studentUser.department || request.department || 'CSE';
    }
    const destOcc = freshDestRoom.beds.filter((b) => b.isOccupied).length;
    freshDestRoom.occupiedCount = destOcc;
    if (freshDestRoom.status !== 'Under Maintenance') {
      freshDestRoom.status = destOcc >= freshDestRoom.capacity ? 'Fully Occupied' : destOcc > 0 ? 'Partially Occupied' : 'Available';
    }
    await freshDestRoom.save();

    // Determine House Tutor
    const destTutor = freshDestRoom.floor === 2
      ? 'Prof. Anisur Rahman (Padma Floor 2 House Tutor)'
      : 'Dr. Tariqul Islam (Padma Floor 1 House Tutor)';
    const destTutorPhone = freshDestRoom.floor === 2 ? '+880 1819 234567' : '+880 1819 123456';

    // Update Student User
    const updatedUser = await User.findOneAndUpdate(
      { userId: cleanId },
      {
        room: `Room ${freshDestRoom.roomNumber}`,
        floor: `Floor ${freshDestRoom.floor}`,
        seatNo: destBed.bedLabel,
        unit: `${freshDestRoom.hallName} (Floor ${freshDestRoom.floor}, Room ${freshDestRoom.roomNumber}, ${destBed.bedLabel})`,
        floorTeacher: destTutor,
        floorTeacherPhone: destTutorPhone,
        allocationStatus: 'Allocated',
        status: 'Active',
      },
      { new: true }
    );

    // Update Application
    await Application.findOneAndUpdate(
      { studentId: cleanId },
      {
        status: 'Allocated',
        allocatedHall: freshDestRoom.hallName,
        allocatedFloor: `Floor ${freshDestRoom.floor}`,
        allocatedRoom: `Room ${freshDestRoom.roomNumber}`,
        allocatedBed: destBed.bedLabel,
        remarks: `Room transfer approved by Hostel Super: ${request.reason}`,
        reviewedBy,
      }
    );

    // Update Request status
    request.status = 'Approved';
    request.allocatedRoom = `Room ${freshDestRoom.roomNumber}`;
    request.allocatedBed = destBed.bedLabel;
    request.reviewedBy = reviewedBy;
    request.reviewRemarks = reviewRemarks || `Approved & transferred to Room ${freshDestRoom.roomNumber} (${destBed.bedLabel}).`;
    await request.save();

    res.status(200).json({
      success: true,
      message: `Room transfer request for ${studentUser.name} (${cleanId}) approved & moved to Floor ${freshDestRoom.floor}, Room ${freshDestRoom.roomNumber} (${destBed.bedLabel})!`,
      data: {
        request,
        room: `Room ${freshDestRoom.roomNumber}`,
        seatNo: destBed.bedLabel,
        floor: `Floor ${freshDestRoom.floor}`,
        user: updatedUser,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

