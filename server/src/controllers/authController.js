const User = require('../models/User');
const Application = require('../models/Application');
const Room = require('../models/Room');
const GatePass = require('../models/GatePass');
const Complaint = require('../models/Complaint');
const { MealBooking } = require('../models/Meal');
const Payment = require('../models/Payment');
const RoomTransferRequest = require('../models/RoomTransferRequest');
const RoommateMatch = require('../models/RoommateMatch');

// @desc    Register a new student account (Only students self-register; Staff & Teachers are provisioned by Provost)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, userId, department, cgpa, phone, preferredHall, guardianName, guardianPhone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full Name, Institutional/Personal Email, and Password are required.' });
    }

    if (!guardianName || !guardianName.trim() || !guardianPhone || !guardianPhone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Guardian Name and Guardian Phone Number are mandatory fields during registration.',
      });
    }

    const userEmail = email.toLowerCase().trim();
    const cleanId = userId && userId.trim() ? userId.trim() : `22203${Math.floor(100 + Math.random() * 900)}`;

    // Check existing student
    const existing = await User.findOne({
      $or: [
        { email: userEmail },
        { userId: cleanId },
      ],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An institutional student account already exists with this Email or Student ID.',
      });
    }

    const selectedHallName = 'Padma Residential Hall';
    const assignedFloor = (preferredHall || '').includes('Floor 2') ? 'Floor 2' : 'Floor 1';
    const assignedTutor = assignedFloor === 'Floor 2'
      ? 'Prof. Anisur Rahman (Padma Floor 2 House Tutor)'
      : 'Dr. Tariqul Islam (Padma Floor 1 House Tutor)';

    // Process Room Capacity Preference: 1 Person (Single), 2 Persons (Double), or 4 Persons (4-Bed)
    const rawCapacity = Number(req.body.preferredCapacity);
    const capacity = [1, 2, 4].includes(rawCapacity) ? rawCapacity : 2;
    let roomType = 'Double Shared Room';
    if (capacity === 1) roomType = 'Single Deluxe Room';
    if (capacity === 4) roomType = '4-Bed Standard Room';

    const defaultPrefs = req.body.preferences || {
      sleepSchedule: 'night-owl',
      studyHabit: 'moderate-study',
      cleanliness: 'strictly-clean',
      religious: 'regular-practicing',
      departmentPreference: 'same-dept',
      behavior: 'balanced',
      roomTypePreference: roomType,
      noiseTolerance: 'Low',
    };
    defaultPrefs.roomTypePreference = roomType;

    const user = await User.create({
      userId: cleanId,
      name: name.trim(),
      email: userEmail,
      password: password || '123456',
      role: 'student',
      department: department || 'CSE',
      cgpa: cgpa ? Number(cgpa) : 3.25,
      phone: phone ? phone.trim() : '',
      hall: selectedHallName,
      floor: assignedFloor,
      room: '',
      seatNo: '',
      preferredCapacity: capacity,
      guardianName: guardianName && guardianName.trim() ? guardianName.trim() : `Guardian of ${name.trim()}`,
      guardianPhone: guardianPhone ? guardianPhone.trim() : '',
      status: 'Active',
      allocationStatus: 'Pending Provost Approval',
      unit: `${selectedHallName} (Seat Allocation Pending Provost Approval)`,
      floorTeacher: assignedTutor,
      floorTeacherPhone: '+880 1819 123456',
      preferences: defaultPrefs,
    });

    // Automatically create a pending seat application in MongoDB for the Hostel Super / Provost Desk
    const randomRef = `#HSTL-APP-${Math.floor(1000 + Math.random() * 9000)}`;
    const application = await Application.create({
      applicationRef: randomRef,
      fullName: name.trim(),
      studentId: cleanId,
      department: department || 'CSE',
      cgpa: cgpa ? Number(cgpa) : 3.25,
      phone: phone ? phone.trim() : '',
      preferredHall: selectedHallName,
      preferredFloor: assignedFloor,
      preferredRoom: roomType,
      preferredCapacity: capacity,
      guardianName: guardianName.trim(),
      guardianPhone: guardianPhone ? guardianPhone.trim() : '',
      status: 'Pending Provost Approval',
      preferences: defaultPrefs,
      recommendedHall: selectedHallName,
      recommendedFloor: assignedFloor,
      recommendedRoom: capacity === 1 ? 'Room 105' : (capacity === 4 ? 'Room 107' : 'Room 101'),
      recommendedBed: capacity === 1 ? 'Bed A' : 'Bed B',
      recommendedTutor: assignedTutor,
    });

    res.status(201).json({
      success: true,
      message: `Student account registered successfully! Room allocation application #${application.applicationRef} submitted to Office of the Provost. Welcome, ${user.name}.`,
      application,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: 'student',
        department: user.department,
        hall: user.hall,
        floor: user.floor,
        room: user.room,
        seatNo: user.seatNo,
        cgpa: user.cgpa,
        phone: user.phone,
        guardianName: user.guardianName,
        guardianPhone: user.guardianPhone,
        floorTeacher: user.floorTeacher,
        floorTeacherPhone: user.floorTeacherPhone,
        status: user.status,
        allocationStatus: user.allocationStatus,
        preferredCapacity: user.preferredCapacity || capacity,
        preferredRoom: roomType,
        unit: user.unit,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user / Role login
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: 'Institutional Email or Student ID is required.' });
    }

    const searchKey = username.trim();
    const lowerKey = searchKey.toLowerCase();
    let targetRole = role;

    // Specific alias mapping for convenience shortcuts
    let effectiveKey = searchKey;
    if (['student', 'student@hostel.edu', 'tanvir', 'tanvir hasan', 'demo-student', 'student.cse@hostel.edu', '221004128'].includes(lowerKey)) {
      effectiveKey = 'student.cse@hostel.edu';
      targetRole = 'student';
    } else if (['hostelsuper', 'hostel_super', 'super', 'provost', 'superadmin_provost', 'hostel-super', 'provost@hostel.edu'].includes(lowerKey)) {
      effectiveKey = 'provost@hostel.edu';
      targetRole = 'super';
    } else if (['admin', 'superadmin', 'super_admin', 'root', 'rootit', 'super-admin', 'itadmin', 'admin.it@hostel.edu'].includes(lowerKey)) {
      effectiveKey = 'admin.it@hostel.edu';
      targetRole = 'admin';
    } else if (['tutor1', 'padma-tutor1', 'padma-tutor', 'floorteacher@hostel.edu', 'floorteacher', 'tutor', 'tutor@hostel.edu'].includes(lowerKey)) {
      effectiveKey = 'tutor.padma1@hostel.edu';
      targetRole = 'teacher';
    } else if (['tutor2', 'padma-tutor2', 'anisur', 'tutor.padma2@hostel.edu'].includes(lowerKey)) {
      effectiveKey = 'tutor.padma2@hostel.edu';
      targetRole = 'teacher';
    } else if (['padma-maintenance', 'maintenance@hostel.edu', 'maintenance', 'staff-maintenance'].includes(lowerKey)) {
      effectiveKey = 'maintenance.padma@hostel.edu';
      targetRole = 'staff';
    } else if (['padma-dining', 'dining@hostel.edu', 'dining', 'mess', 'staff-dining'].includes(lowerKey)) {
      effectiveKey = 'dining.padma@hostel.edu';
      targetRole = 'staff';
    }

    const escapedKey = effectiveKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(`^${escapedKey}$`, 'i');

    // SPECIAL PARENT LOGIC: If role is 'parent', find the specific student's record using student's ID, email, or phone
    if (targetRole === 'parent' || role === 'parent') {
      const cleanKey = username.trim();
      const cleanRegex = new RegExp(`^${cleanKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

      let student = await User.findOne({
        $or: [
          { userId: cleanRegex },
          { email: cleanRegex },
          { phone: cleanRegex },
          { guardianPhone: cleanRegex },
        ],
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: `No registered student found with Student ID or Email '${username}'. Please verify the Student ID.`,
        });
      }

      const guardianName = student.guardianName && student.guardianName.trim() && student.guardianName !== 'Registered Guardian'
        ? student.guardianName.trim()
        : `Guardian of ${student.name}`;

      const tutorName = student.floorTeacher || (student.floor?.includes('2') 
        ? 'Prof. Anisur Rahman (Padma Floor 2 House Tutor)' 
        : 'Dr. Tariqul Islam (Padma Floor 1 House Tutor)');

      return res.status(200).json({
        success: true,
        message: `Guardian portal accessed successfully for student ${student.name} (${student.userId})!`,
        user: {
          name: guardianName,
          guardianName: guardianName,
          wardName: student.name,
          wardId: student.userId,
          email: student.email,
          role: 'parent',
          phone: student.guardianPhone || student.phone || '+880 1711 987654',
          guardianPhone: student.guardianPhone || student.phone || '+880 1711 987654',
          department: student.department || 'CSE',
          hall: student.hall || 'Padma Residential Hall (Male)',
          floor: student.floor || 'Floor 1',
          room: student.room || 'Room 104',
          seatNo: student.seatNo || 'Bed B',
          cgpa: student.cgpa || 3.5,
          floorTeacher: tutorName,
          floorTeacherPhone: student.floorTeacherPhone || '+880 1819 123456',
          status: student.status || 'Active',
        },
      });
    }

    // Standard login for other roles (Student, Floor Teacher, Hostel Super, Staff, Super Admin)
    const findConditions = [
      { email: searchRegex },
      { userId: searchRegex },
    ];

    let user = await User.findOne({ $or: findConditions });

    if (!user) {
      const fallbackConditions = [
        { email: new RegExp(searchKey, 'i') },
        { userId: new RegExp(searchKey, 'i') },
      ];
      user = await User.findOne({ $or: fallbackConditions });
    }

    // Auto-provision standard institutional accounts if missing
    if (!user) {
      if (lowerKey.includes('dining')) {
        user = await User.findOneAndUpdate(
          { email: 'dining.padma@hostel.edu' },
          {
            userId: 'STF-DIN-PAD-001',
            name: 'Md. Faruk Hossain',
            email: 'dining.padma@hostel.edu',
            password: '123456',
            role: 'staff',
            department: 'Padma Hall Dining Staff (Daily Bazar, Kitchen & Meal Token Approval)',
            hall: 'Padma Residential Hall',
            floor: 'Dining Wing',
            phone: '+880 1711 889900',
            unit: 'Padma Dining Division (Daily Bazar Requisition, Cooking & Token Clearance)',
            status: 'Active',
          },
          { upsert: true, new: true }
        );
      } else if (lowerKey.includes('maintenance')) {
        user = await User.findOneAndUpdate(
          { email: 'maintenance.padma@hostel.edu' },
          {
            userId: 'STF-MNT-PAD-001',
            name: 'Md. Kalam Hossain',
            email: 'maintenance.padma@hostel.edu',
            password: '123456',
            role: 'staff',
            department: 'Padma Hall Maintenance Staff (Electricity, Net, Plumbing, Furniture)',
            hall: 'Padma Residential Hall',
            floor: 'All Floors',
            phone: '+880 1552 334455',
            unit: 'Padma Maintenance Division (Electricity, Net/LAN, Plumbing, Furniture)',
            status: 'Active',
          },
          { upsert: true, new: true }
        );
      } else if (lowerKey.includes('tutor.padma2') || lowerKey.includes('anisur') || lowerKey.includes('tutor2')) {
        user = await User.findOneAndUpdate(
          { email: 'tutor.padma2@hostel.edu' },
          {
            userId: 'TUT-PAD-002',
            name: 'Prof. Anisur Rahman',
            email: 'tutor.padma2@hostel.edu',
            password: '123456',
            role: 'teacher',
            department: 'Department of Electrical & Electronic Engineering (EEE)',
            hall: 'Padma Residential Hall',
            floor: 'Floor 2',
            phone: '+880 1819 234567',
            unit: 'Padma Residential Hall (Floor 2 House Tutor)',
            status: 'Active',
          },
          { upsert: true, new: true }
        );
      } else if (lowerKey.includes('tutor') || lowerKey.includes('floorteacher') || lowerKey.includes('tariqul')) {
        user = await User.findOneAndUpdate(
          { email: 'tutor.padma1@hostel.edu' },
          {
            userId: 'TUT-PAD-001',
            name: 'Dr. Tariqul Islam',
            email: 'tutor.padma1@hostel.edu',
            password: '123456',
            role: 'teacher',
            department: 'Department of Computer Science & Engineering (CSE)',
            hall: 'Padma Residential Hall',
            floor: 'Floor 1',
            phone: '+880 1819 123456',
            unit: 'Padma Residential Hall (Floor 1 House Tutor)',
            status: 'Active',
          },
          { upsert: true, new: true }
        );
      } else if (lowerKey.includes('provost') || lowerKey.includes('hostelsuper') || lowerKey.includes('super')) {
        user = await User.findOneAndUpdate(
          { email: 'provost@hostel.edu' },
          {
            userId: 'PRV-001',
            name: 'Prof. Dr. Monirul Islam',
            email: 'provost@hostel.edu',
            password: '123456',
            role: 'super',
            department: 'Academic Administration',
            phone: '+880 1710 000001',
            unit: 'Office of the Provost (All Residential Halls)',
            status: 'Active',
          },
          { upsert: true, new: true }
        );
      } else if (lowerKey.includes('admin') || lowerKey.includes('root')) {
        user = await User.findOneAndUpdate(
          { email: 'admin.it@hostel.edu' },
          {
            userId: 'ADM-HSTL-001',
            name: 'Engr. Mahbubur Rahman',
            email: 'admin.it@hostel.edu',
            password: '123456',
            role: 'admin',
            department: 'Central IT & Infrastructure Division',
            phone: '+880 1713 998877',
            unit: 'Central IT & Server Infrastructure',
            status: 'Active',
          },
          { upsert: true, new: true }
        );
      } else if (lowerKey.includes('student') || lowerKey.includes('tanvir') || lowerKey.includes('221004128')) {
        user = await User.findOneAndUpdate(
          { email: 'student.cse@hostel.edu' },
          {
            userId: '221004128',
            name: 'Tanvir Hasan',
            email: 'student.cse@hostel.edu',
            password: '123456',
            role: 'student',
            department: 'CSE',
            cgpa: 3.84,
            phone: '+880 1712 345678',
            hall: 'Padma Residential Hall (Male)',
            floor: 'Floor 1',
            room: 'Room 104',
            seatNo: 'Bed B',
            status: 'Active',
            guardianName: 'Md. Rafiqul Hasan',
            guardianPhone: '+880 1711 987654',
            floorTeacher: 'Dr. Tariqul Islam (Padma Floor 1 House Tutor)',
            floorTeacherPhone: '+880 1819 123456',
            unit: 'Padma Hall Floor 1, Room 104 (Bed B)',
          },
          { upsert: true, new: true }
        );
      }
    }

    if (!user && effectiveKey.includes('@')) {
      const emailPrefix = effectiveKey.split('@')[0];
      user = await User.findOne({ email: new RegExp('^' + emailPrefix + '@', 'i') });
      if (user) {
        user.email = effectiveKey;
        await user.save();
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No registered account found with Email, Username, or ID '${username}'. Please verify your credentials or register.`,
      });
    }

    // Account Suspension check
    if (user.status === 'Blocked' || user.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Account for ${user.name} (${user.userId || user.email}) has been Suspended / Blocked by Super Admin.`,
      });
    }

    // Password validation (accepts 123456, password123, or user password)
    if (password && user.password && user.password !== password && password !== '123456' && password !== 'password123') {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials or use 123456.',
      });
    }

    res.status(200).json({
      success: true,
      message: `Authenticated successfully as ${user.name} (${user.role.toUpperCase()})`,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        hall: user.hall,
        floor: user.floor,
        room: user.room,
        seatNo: user.seatNo,
        cgpa: user.cgpa,
        guardianName: user.guardianName,
        guardianPhone: user.guardianPhone,
        floorTeacher: user.floorTeacher,
        floorTeacherPhone: user.floorTeacherPhone,
        unit: user.unit,
        status: user.status,
        allocationStatus: user.allocationStatus || 'Allocated',
        preferredCapacity: user.preferredCapacity || 2,
        preferredRoom: user.preferences?.roomTypePreference || (user.preferredCapacity === 1 ? 'Single Deluxe Room' : user.preferredCapacity === 4 ? '4-Bed Standard Room' : 'Double Shared Room'),
        roommate: user.roommate || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all institutional users / actors
// @route   GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { hall: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student verification info by Student ID (Terminal Lookup)
// @route   GET /api/users/verify/:studentId
exports.verifyStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const user = await User.findOne({ userId: studentId.trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: `No active student found with ID: ${studentId}`,
      });
    }

    res.status(200).json({
      success: true,
      verified: true,
      data: {
        name: user.name,
        studentId: user.userId,
        department: user.department,
        cgpa: user.cgpa,
        hall: user.hall || 'Not Allocated Yet',
        room: user.room || 'N/A',
        seatNo: user.seatNo || 'N/A',
        status: user.status,
        floorTeacher: user.floorTeacher || 'Assigned on allocation',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Hostel Super / Provost provision Staff & Floor Teacher accounts
// @route   POST /api/users/provision
exports.provisionStaffOrTeacher = async (req, res) => {
  try {
    const { name, role, email, userId, password, department, phone, hall, floor, unit } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and Email are required.' });
    }

    const roleNorm = (role || 'student').toLowerCase();
    const validRoles = ['student', 'teacher', 'provost', 'staff', 'admin', 'parent'];
    const assignedRole = validRoles.includes(roleNorm) ? roleNorm : 'student';

    let defaultIdPrefix = 'USR';
    if (assignedRole === 'student') defaultIdPrefix = 'STD';
    else if (assignedRole === 'teacher') defaultIdPrefix = 'TUT';
    else if (assignedRole === 'provost') defaultIdPrefix = 'PRV';
    else if (assignedRole === 'staff') defaultIdPrefix = 'STF';
    else if (assignedRole === 'parent') defaultIdPrefix = 'PAR';
    else if (assignedRole === 'admin') defaultIdPrefix = 'ADM';

    const officialId = userId && userId.trim() ? userId.trim() : (assignedRole === 'student' ? `22100${Math.floor(1000 + Math.random() * 9000)}` : `${defaultIdPrefix}-${Math.floor(100 + Math.random() * 900)}`);
    const cleanEmail = email.toLowerCase().trim();

    // Check existing
    const existing = await User.findOne({
      $or: [
        { email: cleanEmail },
        { userId: officialId },
      ],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `An institutional user already exists with this Email (${cleanEmail}) or ID (${officialId}).`,
      });
    }

    const newUser = await User.create({
      userId: officialId,
      name: name.trim(),
      email: cleanEmail,
      password: password || '123456',
      role: assignedRole,
      department: department || (assignedRole === 'teacher' ? 'CSE' : (assignedRole === 'student' ? 'CSE' : 'Central Administration')),
      phone: phone || '+880 1711 000000',
      hall: hall || 'Padma Residential Hall (Male)',
      floor: floor || 'Floor 1',
      unit: unit || `${hall || 'Padma Hall'} ${floor || 'Floor 1'} (${assignedRole})`,
      status: 'Active',
    });

    res.status(201).json({
      success: true,
      message: `Account for ${newUser.name} (${newUser.userId} - ${assignedRole.toUpperCase()}) successfully provisioned and active!`,
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new user
// @route   POST /api/users
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update user / Toggle Status (Active / Blocked)
// @route   PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    let user;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    }
    if (!user) {
      user = await User.findOneAndUpdate({ userId: id }, req.body, { new: true, runValidators: true });
    }
    if (!user) {
      user = await User.findOneAndUpdate({ email: id }, req.body, { new: true, runValidators: true });
    }
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: `User ${user.name} status updated to ${user.status || 'Active'}.`, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete / Deprovision user permanently from Database
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id ? req.params.id.trim() : '';
    if (!id) return res.status(400).json({ success: false, message: 'User ID is required.' });

    let user;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(id);
    }
    if (!user) {
      user = await User.findOne({ userId: id });
    }
    if (!user) {
      user = await User.findOne({ email: id.toLowerCase() });
    }

    // If user not found in User collection, check if an orphan application exists with this ID
    if (!user) {
      const orphanApp = await Application.findOne({
        $or: [
          ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
          { studentId: id },
          { email: id.toLowerCase() },
        ],
      });

      if (orphanApp) {
        const studentIdClean = orphanApp.studentId ? orphanApp.studentId.trim() : '';
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
        }
        await Application.findByIdAndDelete(orphanApp._id);
        return res.status(200).json({
          success: true,
          message: `Record for application #${orphanApp.applicationRef} (${orphanApp.studentName}) removed from database.`,
        });
      }

      return res.status(404).json({ success: false, message: 'User not found in system database.' });
    }

    const userIdClean = user.userId ? user.userId.trim() : '';
    const userEmailClean = user.email ? user.email.trim().toLowerCase() : '';

    // If user is a student, cascade clean all university residential dependencies
    if (user.role === 'student') {
      // 1. Free allocated bed in Room collection
      if (userIdClean) {
        await Room.updateMany(
          { 'beds.studentId': userIdClean },
          {
            $set: {
              'beds.$[elem].isOccupied': false,
              'beds.$[elem].studentId': null,
              'beds.$[elem].studentName': null,
              'beds.$[elem].studentDept': null,
            },
          },
          { arrayFilters: [{ 'elem.studentId': userIdClean }] }
        );

        // Recalculate room occupancy & status for all rooms
        const allRooms = await Room.find();
        for (const r of allRooms) {
          const occ = r.beds.filter((b) => b.isOccupied).length;
          r.occupiedCount = occ;
          r.status = occ >= r.capacity ? 'Fully Occupied' : occ > 0 ? 'Partially Occupied' : 'Available';
          await r.save();
        }

        // 2. Clear roommate references pointing to this student
        await User.updateMany(
          { 'roommate.userId': userIdClean },
          { $set: { roommate: null } }
        );

        // 3. Delete student Application records
        await Application.deleteMany({
          $or: [
            { studentId: userIdClean },
            ...(userEmailClean ? [{ email: userEmailClean }] : []),
          ],
        });

        // 4. Delete related student operational records
        await GatePass.deleteMany({ studentId: userIdClean });
        await Complaint.deleteMany({ studentId: userIdClean });
        await MealBooking.deleteMany({ studentId: userIdClean });
        await Payment.deleteMany({ studentId: userIdClean });
        await RoomTransferRequest.deleteMany({ studentId: userIdClean });
        await RoommateMatch.deleteMany({
          $or: [{ student1Id: userIdClean }, { student2Id: userIdClean }],
        });
      }
    }

    // 5. Delete User record completely from Database
    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: `Account for ${user.name} (${user.userId || user.email}, ${user.role}) permanently deleted from database.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
