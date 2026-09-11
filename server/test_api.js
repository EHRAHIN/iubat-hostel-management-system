const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '.env') });

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting Backend API Automated Verification...\n');

  try {
    // 1. Check MongoDB Connection
    console.log('1️⃣ Checking MongoDB Atlas connection...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('   ✅ MongoDB Atlas connected successfully:', mongoose.connection.name);

    // Import controllers directly for deterministic direct testing
    const { seedDatabase } = require('./src/controllers/seedController');
    const { getSummary } = require('./src/controllers/analyticsController');
    const { login, getUsers, verifyStudent } = require('./src/controllers/authController');
    const { getHalls, getRooms, getHallFloorMatrix } = require('./src/controllers/hallController');
    const { submitApplication, getApplications, trackApplication } = require('./src/controllers/applicationController');
    const { evaluateMatch, getCandidates } = require('./src/controllers/roommateController');
    const { getComplaints, createComplaint } = require('./src/controllers/complaintController');
    const { getGatePasses, createGatePass } = require('./src/controllers/gatePassController');
    const { getMenu, getBookings, bookMeal, getMessStats } = require('./src/controllers/messController');
    const { getNotices, createNotice } = require('./src/controllers/noticeController');

    // Helper mock res/req
    const mockRes = () => {
      const res = {};
      res.statusCode = 200;
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (data) => {
        res.data = data;
        return res;
      };
      return res;
    };

    // 2. Test Seeder
    console.log('\n2️⃣ Testing Database Seeder...');
    const seedRes = mockRes();
    await seedDatabase({}, seedRes);
    console.log('   ✅ Seed result:', seedRes.data.message, seedRes.data.counts);

    // 3. Test Analytics Summary
    console.log('\n3️⃣ Testing Analytics Summary Endpoint...');
    const analyticsRes = mockRes();
    await getSummary({}, analyticsRes);
    console.log('   ✅ Analytics stats:', analyticsRes.data.stats);

    // 4. Test Auth & Role Login
    console.log('\n4️⃣ Testing Auth & Login Endpoint...');
    const authRes = mockRes();
    await login({ body: { username: 'student.cse@iubat.edu', password: 'password123', role: 'student' } }, authRes);
    console.log('   ✅ Login result:', authRes.data.message, '| User:', authRes.data.user.name, authRes.data.user.role);

    // 5. Test Student Verification Terminal
    console.log('\n5️⃣ Testing Student Verification Terminal...');
    const verifyRes = mockRes();
    await verifyStudent({ params: { studentId: '221004128' } }, verifyRes);
    console.log('   ✅ Verified student:', verifyRes.data.data.name, '| Hall:', verifyRes.data.data.hall, '| Room:', verifyRes.data.data.room);

    // 6. Test Halls & Floor Matrix
    console.log('\n6️⃣ Testing Halls and Floor Matrix...');
    const hallsRes = mockRes();
    await getHalls({}, hallsRes);
    console.log(`   ✅ Found ${hallsRes.data.count} residential halls.`);
    const matrixRes = mockRes();
    await getHallFloorMatrix({ params: { hallId: 'padma' } }, matrixRes);
    console.log(`   ✅ Floor matrix for Padma Hall generated: ${matrixRes.data.floorMatrix.length} floors.`);

    // 7. Test Seat Application Flow
    console.log('\n7️⃣ Testing Seat Application Flow...');
    const appRes = mockRes();
    await submitApplication(
      {
        body: {
          fullName: 'Sazzad Hossain',
          studentId: '221008771',
          department: 'CSE',
          cgpa: 3.88,
          preferredHall: 'Padma Residential Hall',
          preferredRoom: 'Double Shared Room',
          guardianPhone: '+880 1711 001122',
          homeAddress: 'Rajshahi',
        },
      },
      appRes
    );
    console.log('   ✅ Application created:', appRes.data.data.applicationRef, '| Status:', appRes.data.data.status);

    const trackRes = mockRes();
    await trackApplication({ params: { refOrId: appRes.data.data.applicationRef } }, trackRes);
    console.log('   ✅ Tracked Application:', trackRes.data.data.applicationRef, '| Name:', trackRes.data.data.fullName);

    // 8. Test AI Roommate Matcher
    console.log('\n8️⃣ Testing AI Roommate Matcher Algorithmic Evaluation...');
    const matchRes = mockRes();
    await evaluateMatch(
      {
        body: {
          studentId: '221004128',
          studentName: 'Tanvir Hasan',
          sleep: 'night-owl',
          study: 'silent',
          cleanliness: 9,
          ac: 'yes',
          deptPref: 'any',
        },
      },
      matchRes
    );
    console.log('   ✅ AI Match Score:', matchRes.data.data.score + '%', '| Status:', matchRes.data.data.status, '| Match:', matchRes.data.data.recommendation);

    // 9. Test Maintenance Complaints
    console.log('\n9️⃣ Testing Maintenance Complaints...');
    const compRes = mockRes();
    await createComplaint(
      {
        body: {
          studentId: '221004128',
          studentName: 'Tanvir Hasan',
          hall: 'Padma Residential Hall',
          room: 'Room 304',
          category: 'Plumbing',
          priority: 'High',
          title: 'Washroom Faucet Leak',
          description: 'Basin tap valve is dripping continuously.',
        },
      },
      compRes
    );
    console.log('   ✅ Created ticket:', compRes.data.data.ticketId, '| Title:', compRes.data.data.title);

    // 10. Test Gate Pass / Leave Application
    console.log('\n🔟 Testing Gate Pass & Out-Pass Workflow...');
    const passRes = mockRes();
    await createGatePass(
      {
        body: {
          studentId: '221004128',
          studentName: 'Tanvir Hasan',
          hall: 'Padma Residential Hall',
          room: 'Room 304',
          passType: 'Weekend Out-Pass',
          fromDate: '2026-03-06',
          toDate: '2026-03-08',
          destination: 'Gazipur Residence',
          emergencyContact: '+880 1711 987654',
          reason: 'Visiting grandparents for family dinner.',
        },
      },
      passRes
    );
    console.log('   ✅ Created Out-Pass:', passRes.data.data.passId, '| QR Code:', passRes.data.data.qrPassCode);

    // 11. Test Mess & Dining
    console.log('\n1️⃣1️⃣ Testing Mess Operations & Bookings...');
    const messRes = mockRes();
    await getMenu({}, messRes);
    console.log(`   ✅ Loaded weekly mess menus: ${messRes.data.count} days configured.`);
    const statsRes = mockRes();
    await getMessStats({}, statsRes);
    console.log('   ✅ Mess operational stats:', statsRes.data.stats);

    // 12. Test Notices & Circulars
    console.log('\n1️⃣2️⃣ Testing Official Notices...');
    const noticeRes = mockRes();
    await getNotices({}, noticeRes);
    console.log(`   ✅ Loaded ${noticeRes.data.count} official circulars and notices.`);

    console.log('\n🎉 ALL 12 BACKEND MODULES & MONGO ATLAS PIPELINES PASSED WITH 100% SUCCESS!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test Error:', error);
    process.exit(1);
  }
}

runTests();
