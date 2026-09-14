const User = require('../models/User');
const Hall = require('../models/Hall');
const Room = require('../models/Room');
const Application = require('../models/Application');
const Complaint = require('../models/Complaint');
const GatePass = require('../models/GatePass');
const Notice = require('../models/Notice');
const { Menu, MealBooking } = require('../models/Meal');
const Payment = require('../models/Payment');

const ensureAllRoomsExist = async () => {
  const configs = [
    { hallId: 'padma', hallName: 'Padma Residential Hall' },
  ];

  for (const hall of configs) {
    for (const floor of [1, 2]) {
      for (let i = 1; i <= 8; i++) {
        const roomNumber = `${floor}0${i}`;
        const existing = await Room.findOne({ hallId: hall.hallId, roomNumber });
        if (!existing) {
          let roomType = 'Double Shared Room';
          let capacity = 2;
          let monthlyRent = 2200;
          let hasAC = i <= 4;
          let hasBalcony = true;

          if (i === 5) {
            roomType = 'Single Deluxe Room';
            capacity = 1;
            monthlyRent = 3500;
            hasAC = true;
          } else if (i === 7 || (hall.hallId === 'padma' && i === 8)) {
            roomType = '4-Bed Standard Room';
            capacity = 4;
            monthlyRent = 1400;
            hasAC = false;
          }

          const beds = [];
          const labels = ['Bed A', 'Bed B', 'Bed C', 'Bed D'];
          for (let b = 0; b < capacity; b++) {
            beds.push({
              bedLabel: labels[b],
              isOccupied: false,
              studentId: null,
              studentName: null,
              studentDept: null,
            });
          }

          await Room.create({
            roomNumber,
            hallId: hall.hallId,
            hallName: hall.hallName,
            floor,
            roomType,
            capacity,
            occupiedCount: 0,
            hasAC,
            hasBalcony,
            monthlyRent,
            status: 'Available',
            beds,
          });
        }
      }
    }
  }
};

// Internal seed function (Preserves existing data on restart)
const runSeedData = async (forceReset = false) => {
  const existingUserCount = await User.countDocuments();
  if (!forceReset && existingUserCount > 0) {
    await ensureAllRoomsExist();
    const [users, halls, rooms, notices] = await Promise.all([
      User.countDocuments(),
      Hall.countDocuments(),
      Room.countDocuments(),
      Notice.countDocuments(),
    ]);
    return { users, halls, rooms, notices, alreadySeeded: true };
  }

  // 1. Clear existing collections if force reset or empty
  await Promise.all([
    User.deleteMany({}),
    Hall.deleteMany({}),
    Room.deleteMany({}),
    Application.deleteMany({}),
    Complaint.deleteMany({}),
    GatePass.deleteMany({}),
    Notice.deleteMany({}),
    Menu.deleteMany({}),
    MealBooking.deleteMany({}),
    Payment.deleteMany({}),
  ]);

  // 2. Insert Users (All 6 roles with 4 Floor Teachers & 4 Staff accounts)
  const users = await User.insertMany([
    // --- Students (Registered Students with Specific Guardians) ---
    {
      userId: '221004128',
      name: 'Tanvir Hasan',
      email: 'student.cse@iubat.edu',
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

    // --- 2 FLOOR TEACHERS (Padma Hall Floor 1 & Floor 2) ---
    // 1. Padma Hall Floor 1 House Tutor
    {
      userId: 'TUT-PAD-001',
      name: 'Dr. Tariqul Islam',
      email: 'tutor.padma1@iubat.edu',
      password: '123456',
      role: 'teacher',
      department: 'Department of Computer Science & Engineering (CSE)',
      hall: 'Padma Residential Hall',
      floor: 'Floor 1',
      phone: '+880 1819 123456',
      unit: 'Padma Residential Hall (Floor 1 House Tutor)',
      status: 'Active',
    },
    // 2. Padma Hall Floor 2 House Tutor
    {
      userId: 'TUT-PAD-002',
      name: 'Prof. Anisur Rahman',
      email: 'tutor.padma2@iubat.edu',
      password: '123456',
      role: 'teacher',
      department: 'Department of Electrical & Electronic Engineering (EEE)',
      hall: 'Padma Residential Hall',
      floor: 'Floor 2',
      phone: '+880 1819 234567',
      unit: 'Padma Residential Hall (Floor 2 House Tutor)',
      status: 'Active',
    },

    // --- 2 STAFF ACCOUNTS (Padma Hall Maintenance & Dining) ---
    // 1. Padma Hall - Maintenance Staff (Electricity, Net, Plumbing, Furniture)
    {
      userId: 'STF-MNT-PAD-001',
      name: 'Md. Kalam Hossain',
      email: 'maintenance.padma@iubat.edu',
      password: '123456',
      role: 'staff',
      department: 'Padma Hall Maintenance Staff (Electricity, Net, Plumbing, Furniture)',
      hall: 'Padma Residential Hall',
      floor: 'All Floors',
      phone: '+880 1552 334455',
      unit: 'Padma Maintenance Division (Electricity, Net/LAN, Plumbing, Furniture)',
      status: 'Active',
    },
    // 2. Padma Hall - Dining Staff (Daily Bazar, Kitchen & Meal Approval)
    {
      userId: 'STF-DIN-PAD-001',
      name: 'Md. Faruk Hossain',
      email: 'dining.padma@iubat.edu',
      password: '123456',
      role: 'staff',
      department: 'Padma Hall Dining Staff (Daily Bazar, Kitchen & Meal Token Approval)',
      hall: 'Padma Residential Hall',
      floor: 'Dining Wing',
      phone: '+880 1711 889900',
      unit: 'Padma Dining Division (Daily Bazar Requisition, Cooking & Token Clearance)',
      status: 'Active',
    },

    // --- Provost & Super Admin & Parent ---
    {
      userId: 'PRV-001',
      name: 'Prof. Dr. Monirul Islam',
      email: 'provost@iubat.edu',
      password: '123456',
      role: 'super',
      department: 'Academic Administration',
      phone: '+880 1710 000001',
      unit: 'Office of the Provost (All Residential Halls)',
      status: 'Active',
    },
    {
      userId: 'PAR-091',
      name: 'Md. Rafiqul Hasan',
      email: 'guardian@mail.com',
      password: '123456',
      role: 'parent',
      phone: '+880 1711 987654',
      unit: 'Guardian of Tanvir Hasan (221004128)',
      status: 'Active',
    },
    {
      userId: 'ADM-IUBAT-001',
      name: 'Engr. Mahbubur Rahman',
      email: 'admin.it@iubat.edu',
      password: '123456',
      role: 'admin',
      department: 'IUBAT Central IT & Infrastructure Division',
      phone: '+880 1713 998877',
      unit: 'Central IT & Server Infrastructure',
      status: 'Active',
    },
  ]);

  // 3. Insert Hall (Padma Residential Hall • 2 Floors)
  const halls = await Hall.insertMany([
    {
      hallId: 'padma',
      name: 'Padma Residential Hall',
      gender: 'Campus Residence',
      floors: 2,
      totalRooms: 16,
      totalBeds: 40,
      occupiedBeds: 2,
      status: 'Active',
      provostName: 'Prof. Dr. Monirul Islam',
      tutorsAssigned: 2,
      amenities: ['High-Speed Wi-Fi', '24/7 Security', 'Mess Dining', 'Common Room', 'Generator Backup'],
      monthlyBaseRent: { single: 3500, double: 2200, fourBed: 1400 },
    },
  ]);

  // 4. Insert Rooms for Both Halls (Floor 1 & Floor 2)
  // Only the registered students (Room 104 in Padma Hall) are marked occupied; all other rooms are Available
  const rooms = await Room.insertMany([
    // --- Padma Hall (Male) - Floor 1 ---
    {
      roomNumber: '101',
      hallId: 'padma',
      hallName: 'Padma Residential Hall (Male)',
      floor: 1,
      roomType: 'Double Shared Room',
      capacity: 2,
      occupiedCount: 0,
      hasAC: true,
      hasBalcony: true,
      monthlyRent: 2200,
      status: 'Available',
      beds: [
        { bedLabel: 'Bed A', isOccupied: false },
        { bedLabel: 'Bed B', isOccupied: false },
      ],
    },
    {
      roomNumber: '102',
      hallId: 'padma',
      hallName: 'Padma Residential Hall (Male)',
      floor: 1,
      roomType: 'Double Shared Room',
      capacity: 2,
      occupiedCount: 0,
      hasAC: true,
      hasBalcony: true,
      monthlyRent: 2200,
      status: 'Available',
      beds: [
        { bedLabel: 'Bed A', isOccupied: false },
        { bedLabel: 'Bed B', isOccupied: false },
      ],
    },
    {
      roomNumber: '103',
      hallId: 'padma',
      hallName: 'Padma Residential Hall (Male)',
      floor: 1,
      roomType: 'Double Shared Room',
      capacity: 2,
      occupiedCount: 0,
      hasAC: true,
      hasBalcony: true,
      monthlyRent: 2200,
      status: 'Available',
      beds: [
        { bedLabel: 'Bed A', isOccupied: false },
        { bedLabel: 'Bed B', isOccupied: false },
      ],
    },
    {
      roomNumber: '104',
      hallId: 'padma',
      hallName: 'Padma Residential Hall (Male)',
      floor: 1,
      roomType: 'Double Shared Room',
      capacity: 2,
      occupiedCount: 1,
      hasAC: true,
      hasBalcony: true,
      monthlyRent: 2200,
      status: 'Partially Occupied',
      beds: [
        { bedLabel: 'Bed A', isOccupied: true, studentId: '221004128', studentName: 'Tanvir Hasan', studentDept: 'CSE' },
        { bedLabel: 'Bed B', isOccupied: false },
      ],
    },
    {
      roomNumber: '105',
      hallId: 'padma',
      hallName: 'Padma Residential Hall (Male)',
      floor: 1,
      roomType: 'Single Deluxe Room',
      capacity: 1,
      occupiedCount: 0,
      hasAC: true,
      hasBalcony: true,
      monthlyRent: 3500,
      status: 'Available',
      beds: [
        { bedLabel: 'Bed A', isOccupied: false },
      ],
    },
    {
      roomNumber: '106',
      hallId: 'padma',
      hallName: 'Padma Residential Hall (Male)',
      floor: 1,
      roomType: 'Double Shared Room',
      capacity: 2,
      occupiedCount: 0,
      hasAC: false,
      hasBalcony: true,
      monthlyRent: 2200,
      status: 'Available',
      beds: [
        { bedLabel: 'Bed A', isOccupied: false },
        { bedLabel: 'Bed B', isOccupied: false },
      ],
    },
    {
      roomNumber: '107',
      hallId: 'padma',
      hallName: 'Padma Residential Hall (Male)',
      floor: 1,
      roomType: '4-Bed Standard Room',
      capacity: 4,
      occupiedCount: 0,
      hasAC: false,
      hasBalcony: true,
      monthlyRent: 1400,
      status: 'Available',
      beds: [
        { bedLabel: 'Bed A', isOccupied: false },
        { bedLabel: 'Bed B', isOccupied: false },
        { bedLabel: 'Bed C', isOccupied: false },
        { bedLabel: 'Bed D', isOccupied: false },
      ],
    },
    {
      roomNumber: '108',
      hallId: 'padma',
      hallName: 'Padma Residential Hall (Male)',
      floor: 1,
      roomType: 'Double Shared Room',
      capacity: 2,
      occupiedCount: 0,
      hasAC: false,
      hasBalcony: true,
      monthlyRent: 2200,
      status: 'Available',
      beds: [
        { bedLabel: 'Bed A', isOccupied: false },
        { bedLabel: 'Bed B', isOccupied: false },
      ],
    },

    // --- Padma Hall (Male) - Floor 2 ---
    {
      roomNumber: '201',
      hallId: 'padma',
      hallName: 'Padma Residential Hall (Male)',
      floor: 2,
      roomType: 'Double Shared Room',
      capacity: 2,
      occupiedCount: 0,
      hasAC: true,
      hasBalcony: true,
      monthlyRent: 2200,
      status: 'Available',
      beds: [
        { bedLabel: 'Bed A', isOccupied: false },
        { bedLabel: 'Bed B', isOccupied: false },
      ],
    },
    {
      roomNumber: '202',
      hallId: 'padma',
      hallName: 'Padma Residential Hall (Male)',
      floor: 2,
      roomType: 'Double Shared Room',
      capacity: 2,
      occupiedCount: 0,
      hasAC: true,
      hasBalcony: true,
      monthlyRent: 2200,
      status: 'Available',
      beds: [
        { bedLabel: 'Bed A', isOccupied: false },
        { bedLabel: 'Bed B', isOccupied: false },
      ],
    },
    {
      roomNumber: '203',
      hallId: 'padma',
      hallName: 'Padma Residential Hall (Male)',
      floor: 2,
      roomType: 'Double Shared Room',
      capacity: 2,
      occupiedCount: 0,
      hasAC: true,
      hasBalcony: true,
      monthlyRent: 2200,
      status: 'Available',
      beds: [
        { bedLabel: 'Bed A', isOccupied: false },
        { bedLabel: 'Bed B', isOccupied: false },
      ],
    },
    {
      roomNumber: '204',
      hallId: 'padma',
      hallName: 'Padma Residential Hall (Male)',
      floor: 2,
      roomType: 'Double Shared Room',
      capacity: 2,
      occupiedCount: 0,
      hasAC: true,
      hasBalcony: true,
      monthlyRent: 2200,
      status: 'Available',
      beds: [
        { bedLabel: 'Bed A', isOccupied: false },
        { bedLabel: 'Bed B', isOccupied: false },
      ],
    },
    {
      roomNumber: '205',
      hallId: 'padma',
      hallName: 'Padma Residential Hall (Male)',
      floor: 2,
      roomType: 'Single Deluxe Room',
      capacity: 1,
      occupiedCount: 0,
      hasAC: true,
      hasBalcony: true,
      monthlyRent: 3500,
      status: 'Available',
      beds: [
        { bedLabel: 'Bed A', isOccupied: false },
      ],
    },
    {
      roomNumber: '206',
      hallId: 'padma',
      hallName: 'Padma Residential Hall (Male)',
      floor: 2,
      roomType: 'Double Shared Room',
      capacity: 2,
      occupiedCount: 0,
      hasAC: false,
      hasBalcony: true,
      monthlyRent: 2200,
      status: 'Available',
      beds: [
        { bedLabel: 'Bed A', isOccupied: false },
        { bedLabel: 'Bed B', isOccupied: false },
      ],
    },
    {
      roomNumber: '207',
      hallId: 'padma',
      hallName: 'Padma Residential Hall (Male)',
      floor: 2,
      roomType: '4-Bed Standard Room',
      capacity: 4,
      occupiedCount: 0,
      hasAC: false,
      hasBalcony: true,
      monthlyRent: 1400,
      status: 'Available',
      beds: [
        { bedLabel: 'Bed A', isOccupied: false },
        { bedLabel: 'Bed B', isOccupied: false },
        { bedLabel: 'Bed C', isOccupied: false },
        { bedLabel: 'Bed D', isOccupied: false },
      ],
    },
    {
      roomNumber: '208',
      hallId: 'padma',
      hallName: 'Padma Residential Hall (Male)',
      floor: 2,
      roomType: 'Double Shared Room',
      capacity: 2,
      occupiedCount: 0,
      hasAC: false,
      hasBalcony: true,
      monthlyRent: 2200,
      status: 'Available',
      beds: [
        { bedLabel: 'Bed A', isOccupied: false },
        { bedLabel: 'Bed B', isOccupied: false },
      ],
    },
  ]);

  // 5. Insert Notices
  const notices = await Notice.insertMany([
    {
      title: 'Fall 2026 Residential Hall Seat Application Schedule and Deadline',
      date: 'September 12, 2026',
      category: 'Allocation',
      refNo: 'IUBAT/RO/2026/042',
      summary: 'All eligible students seeking hostel accommodation for the upcoming semester must complete online submissions before September 25, 2026.',
      authority: 'Office of the Provost',
      isPinned: true,
    },
    {
      title: 'Standard Operating Procedure: Night Attendance and 10:00 PM Curfew Timing',
      date: 'September 08, 2026',
      category: 'Administration',
      refNo: 'IUBAT/HD/2026/019',
      summary: 'Floor teachers will conduct scheduled digital roll call at 10:00 PM daily. Unapproved absences will generate automatic guardian alerts.',
      authority: 'Hostel Disciplinary Committee',
      isPinned: false,
    },
    {
      title: 'Monthly Mess Billing and Dining Token Clearance for September 2026',
      date: 'September 02, 2026',
      category: 'Dining',
      refNo: 'IUBAT/MC/2026/008',
      summary: 'Students may recharge dining allowances and verify monthly token counts via the Student Portal by the 5th of every month.',
      authority: 'Hostel Mess Management Committee',
      isPinned: false,
    },
    {
      title: 'Scheduled Network Maintenance and High-Speed LAN Upgrade in Padma Hall',
      date: 'August 28, 2026',
      category: 'Maintenance',
      refNo: 'IUBAT/IT/2026/011',
      summary: 'IT infrastructure maintenance will take place on Saturday between 09:00 AM and 01:00 PM. Minimal internet disruption is expected.',
      authority: 'Estate and IT Services',
      isPinned: false,
    },
  ]);

  // 6. Insert Applications
  const applications = await Application.insertMany([
    {
      applicationRef: '#IUBAT-APP-8492',
      fullName: 'Tanvir Hasan',
      studentId: '221004128',
      department: 'CSE',
      cgpa: 3.84,
      preferredHall: 'Padma Residential Hall',
      preferredRoom: 'Double Shared Room',
      status: 'Allocated',
      allocatedHall: 'Padma Residential Hall',
      allocatedRoom: 'Room 304',
      allocatedBed: 'Bed B',
    },
    {
      applicationRef: '#IUBAT-APP-7104',
      fullName: 'Mahmudur Rahman',
      studentId: '221005592',
      department: 'EEE',
      cgpa: 3.91,
      preferredHall: 'Padma Residential Hall',
      preferredRoom: 'Single Deluxe Room',
      status: 'Pending Review',
    },
    {
      applicationRef: '#IUBAT-APP-9218',
      fullName: 'Sadiya Afrin',
      studentId: '221003481',
      department: 'BBA',
      cgpa: 3.75,
      preferredHall: 'Padma Residential Hall',
      preferredRoom: 'Double Shared Room',
      status: 'Provost Approved',
    },
  ]);

  // 7. Complaints collection initialized dynamically (Empty by default for real-time student submissions)
  const complaints = [];

  // 8. Insert Gate Passes
  const gatePasses = await GatePass.insertMany([
    {
      passId: 'LP-2026-094',
      studentId: '221004128',
      studentName: 'Tanvir Hasan',
      hall: 'Padma Residential Hall',
      room: 'Room 304',
      passType: 'Weekend Out-Pass',
      fromDate: '2026-09-18',
      toDate: '2026-09-20',
      destination: 'Uttara Sector 4, Dhaka',
      emergencyContact: '+880 1711 987654',
      reason: 'Family visit over the weekend.',
      status: 'Teacher Approved',
      approvedBy: 'Prof. Anisur Rahman',
      qrPassCode: 'IUBAT-QR-PASS-9842',
    },
  ]);

  // 9. Insert Weekly Menu
  const menus = await Menu.insertMany([
    {
      dayOfWeek: 'Monday',
      breakfast: { items: ['Paratha', 'Egg Omelet / Bhaji', 'Hot Tea / Milk'] },
      lunch: { items: ['Steamed Rice', 'Rui Fish Curry', 'Dal Butter Fry', 'Salad'] },
      dinner: { items: ['Steamed Rice / Roti', 'Chicken Korma', 'Mixed Vegetable', 'Dal'] },
    },
    {
      dayOfWeek: 'Friday',
      breakfast: { items: ['Khichuri', 'Egg Fry', 'Pickle', 'Hot Tea'] },
      lunch: { items: ['Beef Tehari / Polao', 'Shami Kabab', 'Borhani', 'Salad'], specialFeast: true },
      dinner: { items: ['Steamed Rice', 'Egg Curry', 'Lau Chingri', 'Dal'] },
    },
  ]);

  // 10. Insert Payments
  const payments = await Payment.insertMany([
    {
      invoiceNo: 'INV-2026-0318',
      studentId: '221004128',
      studentName: 'Tanvir Hasan',
      feeType: 'Seat Rent',
      month: 'August 2026',
      amountBDT: 2200,
      status: 'Paid',
      paymentMethod: 'bKash',
      transactionId: 'TRX-9BK-77489',
    },
    {
      invoiceNo: 'INV-2026-0319',
      studentId: '221004128',
      studentName: 'Tanvir Hasan',
      feeType: 'Mess Advance',
      month: 'September 2026',
      amountBDT: 3500,
      status: 'Paid',
      paymentMethod: 'Nagad',
      transactionId: 'TRX-8NG-22941',
    },
  ]);

  return {
    users: users.length,
    halls: halls.length,
    rooms: rooms.length,
    notices: notices.length,
    applications: applications.length,
    complaints: complaints.length,
    gatePasses: gatePasses.length,
    menus: menus.length,
    payments: payments.length,
  };
};

// @desc    Seed MongoDB with complete institutional dataset
// @route   POST /api/seed
const seedDatabase = async (req, res) => {
  try {
    const forceReset = req.query.reset === 'true' || req.body?.reset === true;
    const counts = await runSeedData(forceReset);
    res.status(200).json({
      success: true,
      message: counts.alreadySeeded ? 'Database already populated. Existing records preserved.' : 'MongoDB successfully seeded with complete IUBAT dataset!',
      counts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { seedDatabase, runSeedData };

