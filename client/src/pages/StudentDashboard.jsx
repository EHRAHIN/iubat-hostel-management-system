import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Building2,
  User,
  Bed,
  Sparkles,
  FileText,
  Wrench,
  LogOut,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
  AlertCircle,
  CalendarCheck,
  CreditCard,
  Phone,
  Shield,
  ShieldCheck,
  Layers,
  ArrowRight,
  Plus,
  Filter,
  Download,
  Utensils,
  ChevronRight,
  UserCheck,
  Zap,
  DollarSign,
  Receipt,
  Lock,
  Building,
  ArrowRightLeft,
  QrCode,
} from 'lucide-react';
import SSLCommerzModal from '../components/SSLCommerzModal';
import PaymentReceiptModal from '../components/PaymentReceiptModal';
import StudentMealReceiptModal from '../components/StudentMealReceiptModal';
import StudentRoomTransferModal from '../components/StudentRoomTransferModal';
import TargetedNoticesWidget from '../components/TargetedNoticesWidget';
import StudentMealQrModal from '../components/StudentMealQrModal';
import GatePassQrModal from '../components/GatePassQrModal';

export default function StudentDashboard({ currentUser, onLogout, onShowToast, onOpenSmartAssign }) {
  // Navigation Tabs (Persisted across page reloads)
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('hostel_student_tab') || 'overview';
    } catch {
      return 'overview';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hostel_student_tab', activeTab);
    } catch (e) {
      console.error(e);
    }
  }, [activeTab]);

  // Student Profile Data (Dynamically hydrated from registered/logged in user)
  const isInitiallyAllocated = Boolean(currentUser?.room && currentUser?.allocationStatus !== 'Pending Provost Approval');
  const [student, setStudent] = useState({
    name: currentUser?.name || 'Student Resident',
    id: currentUser?.userId || currentUser?.id || '221004128',
    dept: currentUser?.department ? (currentUser.department.includes('(') ? currentUser.department : `${currentUser.department} - Bachelor of Science`) : 'Computer Science and Engineering (CSE)',
    year: currentUser?.year || '1st Year, 1st Semester',
    hall: currentUser?.hall || 'Padma Residential Hall (Male)',
    floor: currentUser?.floor || 'Floor 1',
    room: isInitiallyAllocated ? currentUser.room : '',
    seat: isInitiallyAllocated ? (currentUser.seatNo || 'Bed A') : '',
    status: isInitiallyAllocated ? 'Resident Allocated' : 'Pending Provost Allocation Approval',
    allocationStatus: currentUser?.allocationStatus || (isInitiallyAllocated ? 'Allocated' : 'Pending Provost Approval'),
    roomType: currentUser?.roomType || 'Double Shared Room',
    preferredCapacity: Number(currentUser?.preferredCapacity) || (currentUser?.roomType?.includes('Single') ? 1 : currentUser?.roomType?.includes('4-Bed') ? 4 : 2),
    cgpa: currentUser?.cgpa ? currentUser.cgpa.toString() : '3.50',
    merit: currentUser?.merit || 'Merit Rank #14',
    floorTeacher: currentUser?.floorTeacher || 'Dr. Tariqul Islam (Padma Floor 1 House Tutor)',
    floorTeacherPhone: currentUser?.floorTeacherPhone || '+880 1819 123456',
    balance: currentUser?.balance || '৳ 4,500',
  });

  // 0. Payments & Financial Transactions State
  const [payments, setPayments] = useState([]);
  const [isSSLModalOpen, setIsSSLModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isMealReceiptModalOpen, setIsMealReceiptModalOpen] = useState(false);
  const [activeInvoiceForPay, setActiveInvoiceForPay] = useState(null);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState(null);
  const [isRedirectingSSL, setIsRedirectingSSL] = useState(false);

  // Room Transfer Application State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [activeTransferRequest, setActiveTransferRequest] = useState(null);
  const [transferPrefill, setTransferPrefill] = useState(null);

  // Digital QR Code Modals (Meal Tokens & Gate Passes)
  const [isMealQrModalOpen, setIsMealQrModalOpen] = useState(false);
  const [selectedMealTokenForQr, setSelectedMealTokenForQr] = useState(null);
  const [isGatePassQrModalOpen, setIsGatePassQrModalOpen] = useState(false);
  const [selectedGatePassForQr, setSelectedGatePassForQr] = useState(null);

  // Live Inventory Rooms & Tariffs for accurate student rent calculation
  const [allRooms, setAllRooms] = useState([]);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await api.getRooms();
        if (res?.data) {
          setAllRooms(res.data);
        }
      } catch (e) {}
    };
    loadRooms();
    window.addEventListener('hostel_tariffs_updated', loadRooms);
    return () => window.removeEventListener('hostel_tariffs_updated', loadRooms);
  }, []);

  const studentRoomNum = (student.room || currentUser?.room || '').replace(/\D/g, '');
  const allocatedRoomDoc = allRooms.find(r => 
    (studentRoomNum && r.roomNumber === studentRoomNum) ||
    r.beds?.some(b => b.studentId === student.id || b.studentId === currentUser?.userId)
  );
  const typeFallbackRoom = allRooms.find(r => 
    student.roomType?.includes('Single') ? r.roomType?.includes('Single') :
    (student.roomType?.includes('4-Bed') || student.roomType?.includes('Quad')) ? (r.roomType?.includes('4-Bed') || r.roomType?.includes('Quad')) :
    r.roomType?.includes('Double')
  );
  const dynamicRoomMonthlyRent = allocatedRoomDoc?.monthlyRent || typeFallbackRoom?.monthlyRent || (student.roomType?.includes('Single') ? 5500 : student.roomType?.includes('4-Bed') ? 2500 : 3500);

  // Open Exact SSLCommerz Payment Gateway Interface (No auto-back, authentic checkout)
  const handlePayViaSSLCommerz = (inv) => {
    setActiveInvoiceForPay(inv);
    setIsSSLModalOpen(true);
  };


  const fetchPayments = async () => {
    try {
      const sId = currentUser?.userId || currentUser?.id || student.id;
      if (!sId) return;
      const res = await api.getPayments({ studentId: sId });
      if (res?.data) {
        setPayments(res.data);
      }
    } catch (err) {
      console.error('Fetch payments error:', err);
    }
  };

  const handleVerifyInvoice = async (inv) => {
    try {
      onShowToast('Checking gateway status with SSLCommerz servers...', 'info');
      const res = await api.validateSSLPayment({
        val_id: inv.transactionId || inv.invoiceNo,
        tran_id: inv.transactionId || inv.invoiceNo,
      });
      if (res?.status === 'VALID' || res?.status === 'SUCCESS' || res?.data?.status === 'Paid') {
        onShowToast(`Invoice ${inv.invoiceNo} verified as Paid!`, 'success');
        fetchPayments();
      } else {
        onShowToast(`Invoice status: ${res?.status || inv.status}`, 'info');
      }
    } catch (err) {
      onShowToast(err.message || 'Failed to verify invoice with gateway.', 'error');
    }
  };

  const fetchTransferRequests = async () => {
    try {
      const sId = currentUser?.userId || currentUser?.id || student.id;
      if (!sId) return;
      const res = await api.getRoomTransferRequests({ studentId: sId });
      if (res?.data && res.data.length > 0) {
        setActiveTransferRequest(res.data[0]);
      }
    } catch (err) {
      console.error('Fetch transfer requests error:', err);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchTransferRequests();
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'roommate' || activeTab === 'ai-matcher') {
      handleCalculateAiMatch();
    }
  }, [activeTab]);

  useEffect(() => {
    if (currentUser) {
      const isAllocated = Boolean(currentUser.room && currentUser.allocationStatus !== 'Pending Provost Approval');
      setStudent((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        id: currentUser.userId || currentUser.id || prev.id,
        dept: currentUser.department ? (currentUser.department.includes('(') ? currentUser.department : `${currentUser.department} - Bachelor of Science`) : prev.dept,
        cgpa: currentUser.cgpa ? String(currentUser.cgpa) : prev.cgpa,
        hall: currentUser.hall || prev.hall,
        floor: currentUser.floor || prev.floor,
        room: isAllocated ? currentUser.room : '',
        seat: isAllocated ? (currentUser.seatNo || 'Bed A') : '',
        seatNo: isAllocated ? currentUser.seatNo : '',
        allocationStatus: currentUser.allocationStatus || (isAllocated ? 'Allocated' : 'Pending Provost Approval'),
        status: isAllocated ? 'Resident Allocated' : 'Pending Provost Allocation Approval',
        preferredCapacity: Number(currentUser.preferredCapacity) || prev.preferredCapacity || 2,
        roomType: currentUser.preferredRoom || currentUser.roomType || prev.roomType,
        phone: currentUser.phone || prev.phone,
        floorTeacher: currentUser.floorTeacher || 'Dr. Tariqul Islam (Padma Floor 1 House Tutor)',
        floorTeacherPhone: currentUser.floorTeacherPhone || '+880 1819 123456',
        guardianName: currentUser.guardianName || prev.guardianName,
        guardianPhone: currentUser.guardianPhone || prev.guardianPhone,
      }));
    }
  }, [currentUser]);

  // Live application & live roommate synchronization
  const [liveApp, setLiveApp] = useState(null);
  const [liveRoommate, setLiveRoommate] = useState(null);

  useEffect(() => {
    let isMounted = true;
    // 1. Live Fetch Student Application
    const fetchLiveStatus = async () => {
      try {
        const studentUserId = currentUser?.userId || currentUser?.id;
        if (!studentUserId) return;
        const res = await api.getApplications();
        if (res?.data && res.data.length > 0 && isMounted) {
          const myApp = res.data.find(a =>
            a.userId === studentUserId ||
            a.studentId === studentUserId ||
            a.email === currentUser?.email
          );
          if (myApp && isMounted) {
            setLiveApp(myApp);
            const isApproved = myApp.status === 'Allocated' || myApp.status === 'Approved & Allocated' || myApp.status === 'Approved';
            setStudent((prev) => ({
              ...prev,
              hall: myApp.allocatedHall || myApp.recommendedHall || prev.hall || 'Padma Residential Hall',
              floor: myApp.allocatedFloor || myApp.recommendedFloor || prev.floor,
              room: isApproved ? (myApp.allocatedRoom || prev.room) : '',
              seat: isApproved ? (myApp.allocatedBed || prev.seat) : '',
              status: isApproved ? 'Resident Allocated' : 'Pending Provost Allocation Approval',
              allocationStatus: myApp.status || prev.allocationStatus,
            }));

            if (isApproved && myApp.allocatedRoom) {
              // Room is officially allocated: check for a real student allocated to the other bed in this room
              const coOccupant = res.data.find(a =>
                (a.status === 'Allocated' || a.status === 'Approved & Allocated' || a.status === 'Approved') &&
                a.allocatedHall === myApp.allocatedHall &&
                a.allocatedRoom === myApp.allocatedRoom &&
                String(a._id) !== String(myApp._id) &&
                a.userId !== studentUserId &&
                a.studentId !== studentUserId &&
                a.email !== currentUser?.email
              );
              if (coOccupant) {
                setLiveRoommate({
                  name: coOccupant.fullName || coOccupant.studentName || coOccupant.name,
                  id: coOccupant.userId || coOccupant.studentId || '',
                  dept: coOccupant.department || 'CSE',
                  cgpa: coOccupant.cgpa ? String(coOccupant.cgpa) : '3.75',
                  seat: coOccupant.allocatedBed || (myApp.allocatedBed === 'Bed A' ? 'Bed B' : 'Bed A'),
                  phone: coOccupant.phone || '',
                  aiMatchScore: coOccupant.matchScore !== undefined ? `${coOccupant.matchScore}%` : '83%',
                  matchReasons: [
                    'Synchronized sleep schedule and study routine',
                    'Matched quiet study environment preference',
                    'High shared standard of room hygiene and clean desks',
                  ],
                });
              } else {
                setLiveRoommate(null);
              }
            } else if (myApp.aiPartner?.name && myApp.aiPartner.name.trim() !== '') {
              setLiveRoommate({
                name: myApp.aiPartner.name,
                id: myApp.aiPartner.userId || myApp.aiPartner.id || '',
                dept: myApp.aiPartner.department || 'CSE',
                cgpa: myApp.aiPartner.cgpa ? String(myApp.aiPartner.cgpa) : '3.75',
                seat: myApp.aiPartner.seatNo || (myApp.allocatedBed === 'Bed A' ? 'Bed B' : 'Bed A'),
                phone: myApp.aiPartner.phone || '',
                aiMatchScore: myApp.aiPartner.matchScore !== undefined && myApp.aiPartner.matchScore !== null
                  ? `${myApp.aiPartner.matchScore}%`
                  : (myApp.aiPartner.matchReasons?.length ? `${Math.round((myApp.aiPartner.matchReasons.length / 6) * 100)}%` : '83%'),
                matchReasons: myApp.aiPartner.matchReasons?.length ? myApp.aiPartner.matchReasons : [
                  'Synchronized sleep schedule and study routine',
                  'Matched quiet study environment preference',
                  'High shared standard of room hygiene and clean desks',
                ],
              });
            } else {
              setLiveRoommate(null);
            }
          }
        }
      } catch (err) {
        console.error('Live status sync error:', err);
      }
    };
    fetchLiveStatus();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      fetchLiveStatus();
    }, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser]);


  const roommate = liveApp ? liveRoommate : (currentUser?.roommate?.name ? {
    name: currentUser.roommate.name,
    id: currentUser.roommate.userId || currentUser.roommate.id || '',
    dept: currentUser.roommate.department || 'CSE',
    cgpa: currentUser.roommate.cgpa ? String(currentUser.roommate.cgpa) : '3.75',
    seat: currentUser.roommate.seatNo || (student.seat === 'Bed A' ? 'Bed B' : 'Bed A'),
    phone: currentUser.roommate.phone || '+880 1912 345678',
    aiMatchScore: currentUser.roommate.matchScore !== undefined && currentUser.roommate.matchScore !== null
      ? `${currentUser.roommate.matchScore}%`
      : (currentUser.roommate.matchReasons?.length ? `${Math.round((currentUser.roommate.matchReasons.length / 5) * 100)}%` : '100%'),
    matchReasons: currentUser.roommate.matchReasons || [
      'Synchronized sleep schedule and study routine',
      'Matched quiet study environment preference',
      'High shared standard of room hygiene and clean desks',
    ],
  } : null);

  // 1. AI Roommate Matcher State
  const [aiTrait, setAiTrait] = useState({
    sleep: currentUser?.preferences?.sleepSchedule || 'night-owl',
    study: currentUser?.preferences?.studyHabit || 'silent',
    cleanliness: currentUser?.preferences?.cleanliness || 9,
    deptPref: currentUser?.preferences?.departmentPref || 'same',
  });
  const [isAiMatching, setIsAiMatching] = useState(false);
  const [aiMatchResult, setAiMatchResult] = useState(null);

  // 2. Room Swap / Transfer Request State
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapForm, setSwapForm] = useState({
    targetHall: 'Padma Residential Hall',
    targetFloor: 'Floor 2',
    targetRoom: 'Room 204',
    reason: 'Closer to senior project teammates for final semester thesis work.',
  });
  const [swapRequests, setSwapRequests] = useState([
    {
      id: 'SWP-2026-012',
      from: 'Padma Room 104 (Bed B)',
      to: 'Padma Room 204',
      reason: 'Thesis group study proximity',
      status: 'Pending Provost Office Review',
      date: 'Sep 10, 2026',
    },
  ]);

  // 3. Leave & Out-Pass Requests State
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: 'Weekend Out-Pass',
    fromDate: '2026-09-18',
    toDate: '2026-09-20',
    destination: 'Permanent Residence, Uttara Sector 4, Dhaka',
    emergencyContact: '+880 1711 987654',
    reason: 'Family visit during weekend.',
  });
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 'LP-2026-094',
      type: 'Weekend Out-Pass',
      dates: 'Sep 05, 2026 to Sep 07, 2026',
      destination: 'Permanent Residence, Uttara Sector 4, Dhaka',
      reason: 'Family visit over the weekend.',
      status: 'Returned & Completed',
      approvedBy: 'Prof. Anisur Rahman',
      appliedOn: 'Sep 05, 2026',
    },
  ]);

  // 4. Maintenance / Repair Complaints State
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState('all');
  const [complaintForm, setComplaintForm] = useState({
    category: 'Electrical',
    urgency: 'Medium',
    description: 'Ceiling fan regulator not working in room.',
  });
  const [complaints, setComplaints] = useState([
    {
      id: 'CMP-2026-042',
      category: 'Electrical',
      urgency: 'Medium',
      description: 'Ceiling fan regulator knob broken in Padma 104.',
      status: 'In Progress',
      reportedDate: 'Sep 11, 2026',
      assignedTechnician: 'Md. Rafiq (Hostel Electrician)',
    },
    {
      id: 'CMP-2026-018',
      category: 'Plumbing',
      urgency: 'High',
      description: 'Water faucet leakage in common washroom.',
      status: 'Resolved',
      reportedDate: 'Sep 05, 2026',
      assignedTechnician: 'Alamgir Hossain (Plumber)',
    },
  ]);

  const [teacherIncidents, setTeacherIncidents] = useState([]);

  const fetchComplaints = async () => {
    try {
      const sId = currentUser?.userId || currentUser?.id || student.id;
      if (!sId) return;
      const res = await api.getComplaints({ studentId: sId });
      const list = res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list)) {
        // Separate maintenance complaints and teacher conduct complaints
        const maint = list.filter(c => !c.isTeacherComplaint);
        const incidents = list.filter(c => c.isTeacherComplaint);

        setComplaints(maint.map(c => ({
          id: c.complaintId || c._id || `CMP-${c._id?.slice(-4)}`,
          ticketId: c.ticketId || c.complaintId || c._id,
          title: c.title,
          category: c.category || 'General',
          priority: c.priority || c.urgency || 'Medium',
          description: c.description || c.title || 'Maintenance issue',
          status: c.status || 'Pending',
          reportedDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
          assignedStaff: c.assignedStaff || c.assignedTo || 'Maintenance Division',
          progressPercent: c.progressPercent || 0,
          staffNotes: c.staffNotes || '',
          estimatedCompletion: c.estimatedCompletion || '',
          workStartedAt: c.workStartedAt || null,
          hall: c.hall,
          room: c.room,
        })));

        setTeacherIncidents(incidents.map(c => ({
          id: c.ticketId || c._id,
          title: c.title,
          category: c.incidentType || c.category || 'Discipline',
          severity: c.severity || 'Medium',
          description: c.description,
          reportedByName: c.reportedByName || 'Floor Teacher',
          reportedByRole: c.reportedByRole || 'Floor House Tutor',
          room: c.room,
          date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
          status: c.status || 'Logged with Provost',
        })));
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    }
  };

  // 5. Dining & Meal Log State
  const [activeMealDay, setActiveMealDay] = useState('today');
  const [mealBookings, setMealBookings] = useState([]);
  const [isApplyingMeal, setIsApplyingMeal] = useState(false);
  const [overrideAutoMealOff, setOverrideAutoMealOff] = useState(false);
  const [isMealDisabledManual, setIsMealDisabledManual] = useState(false);
  const [mealBalance, setMealBalance] = useState(student.balance);
  const [todayMealStatus, setTodayMealStatus] = useState({
    breakfast: true,
    lunch: true,
    dinner: false,
  });
  const [studentMealSummary, setStudentMealSummary] = useState({
    totalConsumedMeals: 0,
    pendingApprovalMeals: 0,
    totalAppliedMeals: 0,
    totalCostBDT: '0 BDT',
    totalSpentBDT: 0,
    recentApplications: [],
  });

  const fetchStudentMeals = async () => {
    try {
      const sId = currentUser?.userId || currentUser?.id || student.id;
      if (!sId) return;
      const res = await api.getStudentMeals(sId);
      const summaryData = res?.data?.data || res?.data || (res?.success ? res.data : null);
      if (summaryData) {
        const meals = summaryData.recentApplications || (Array.isArray(summaryData) ? summaryData : []);
        setMealBookings(meals);
        const consumed = summaryData.totalConsumedMeals ?? meals.filter(m => m.status === 'Approved' || m.status === 'Consumed' || m.status === 'Approved & Served').length;
        const pending = summaryData.uncollectedMeals ?? meals.filter(m => m.status === 'Pending').length;
        const cost = summaryData.totalCostBDT || `${meals.reduce((acc, m) => acc + (m.tokenCostBDT || m.costBDT || 50), 0)} BDT`;
        setStudentMealSummary({
          totalConsumedMeals: consumed,
          pendingApprovalMeals: pending,
          totalAppliedMeals: summaryData.totalAppliedMeals || meals.length,
          totalCostBDT: typeof cost === 'number' ? `${cost} BDT` : cost,
          totalSpentBDT: typeof cost === 'number' ? cost : parseInt(cost) || 0,
          recentApplications: meals,
        });
      }
    } catch (err) {
      console.error('Error fetching student meals:', err);
    }
  };

  useEffect(() => {
    fetchStudentMeals();
    fetchComplaints();
  }, [student.id]);

  // 6. Night Attendance State
  const attendanceLogs = [
    { date: 'Sep 13, 2026', time: '10:14 PM', status: 'Present', verifiedBy: 'Prof. Anisur Rahman' },
    { date: 'Sep 12, 2026', time: '10:08 PM', status: 'Present', verifiedBy: 'Prof. Anisur Rahman' },
    { date: 'Sep 11, 2026', time: '10:22 PM', status: 'Present', verifiedBy: 'Prof. Anisur Rahman' },
    { date: 'Sep 10, 2026', time: '10:05 PM', status: 'Present', verifiedBy: 'Prof. Anisur Rahman' },
    { date: 'Sep 09, 2026', time: '10:12 PM', status: 'Present', verifiedBy: 'Prof. Anisur Rahman' },
  ];

  const handleCalculateAiMatch = async () => {
    setIsAiMatching(true);
    try {
      const sId = currentUser?.userId || currentUser?.id || student.id;
      const res = await api.evaluateRoommateMatch({
        studentId: sId,
        name: student.name,
        department: student.dept,
        sleep: currentUser?.preferences?.sleepSchedule || 'night-owl',
        study: currentUser?.preferences?.studyHabit || 'silent',
        cleanliness: currentUser?.preferences?.cleanliness || 9,
        deptPref: currentUser?.preferences?.departmentPreference || currentUser?.preferences?.departmentPref || 'same',
      });

      if (res?.success && res.data) {
        const d = res.data;
        setAiMatchResult({
          score: d.score,
          recommendation: d.recommendation,
          status: d.status,
          reasons: d.reasons || [],
          allocatedRoom: d.allocatedRoom,
          candidate: d.candidate,
          isDifferentRoom: d.isDifferentRoom,
        });
        if (onShowToast) {
          onShowToast(`Smart Roommate Matching evaluated! Highest match found: ${d.candidate?.name || 'Resident'} (${d.score}%)`, 'success');
        }
      }
    } catch (err) {
      console.error('Roommate match error:', err);
      if (onShowToast) onShowToast(err.message || 'Failed to calculate match', 'error');
    } finally {
      setIsAiMatching(false);
    }
  };

  const handleApplyRoomTransferForMatch = (matchData) => {
    if (!matchData) return;
    const cand = matchData.candidate || {};
    setTransferPrefill({
      targetHall: cand.hall || student.hall,
      targetFloor: cand.floor || 'Floor 1',
      targetRoomType: 'Double Shared Room',
      targetRoom: cand.room || 'Room 102',
      targetBed: cand.seat === 'Bed A' ? 'Bed B' : 'Bed A',
      reasonCategory: 'Sleep Cycle & Lifestyle Harmony',
      detailedReason: `High AI Living Compatibility Match (${matchData.score}%) with ${cand.name || 'Resident'} (${cand.department || 'CSE'}, CGPA ${cand.cgpa || '3.8'}). Both share synchronized sleep, study, and cleanliness routines. Requesting official room transfer to reside together in ${cand.room || 'Room 102'}.`,
    });
    setIsTransferModalOpen(true);
  };

  const handleCreateSwap = (e) => {
    e.preventDefault();
    const newSwap = {
      id: `SWP-2026-0${swapRequests.length + 13}`,
      from: `${student.hall} ${student.room} (${student.seat})`,
      to: `${swapForm.targetHall} ${swapForm.targetRoom}`,
      reason: swapForm.reason,
      status: 'Pending Provost Office Review',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };
    setSwapRequests([newSwap, ...swapRequests]);
    setSwapModalOpen(false);
    onShowToast('Room swap request submitted to Provost Office!', 'success');
  };

  const fetchStudentLeaves = async () => {
    try {
      const res = await api.getGatePasses({ studentId: student.id });
      if (res?.data) {
        const mapped = res.data.map(p => {
          const isApproved = p.status === 'Approved' || p.status === 'Teacher Approved' || p.status === 'Provost Approved';
          const isRejected = p.status?.includes('Rejected') || p.status === 'Declined';
          const isGuardianGranted = p.guardianConsent === 'Granted';
          const isGuardianDeclined = p.guardianConsent === 'Declined';

          return {
            id: p.passId || `GP-${p._id?.slice(-4)}`,
            type: p.passType || 'Leave Pass',
            dates: `${p.fromDate || 'N/A'} to ${p.toDate || 'N/A'}`,
            destination: p.destination || 'N/A',
            reason: p.reason || 'Personal / Academic',
            status: p.status || 'Pending Guardian Consent',
            guardianConsent: p.guardianConsent || 'Pending',
            guardianName: p.guardianName || 'Guardian',
            guardianConsentAt: p.guardianConsentAt,
            isApproved,
            isRejected,
            isGuardianGranted,
            isGuardianDeclined,
            approvedBy: p.approvedBy || (isApproved ? 'House Tutor / Provost' : ''),
            gatePassCode: p.qrPassCode || `HSTL-QR-${p.passId?.slice(-6) || '8832'}`,
          };
        });
        setLeaveRequests(mapped);
      }
    } catch (err) {
      console.log('Error fetching student gate passes:', err.message);
    }
  };

  useEffect(() => {
    fetchStudentLeaves();
  }, [student.id]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.destination || !leaveForm.reason) {
      onShowToast('Please complete all leave form fields.', 'error');
      return;
    }
    try {
      const res = await api.createGatePass({
        studentId: student.id,
        studentName: student.name,
        hall: student.hall,
        room: student.room,
        passType: leaveForm.type,
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        destination: leaveForm.destination,
        emergencyContact: student.guardianPhone || '+880 1711 987654',
        guardianName: student.guardianName || 'Parent / Guardian',
        guardianPhone: student.guardianPhone || '+880 1711 987654',
        reason: leaveForm.reason,
      });
      setLeaveModalOpen(false);
      setLeaveForm({ type: 'Weekend Out-Pass', fromDate: '', toDate: '', destination: '', reason: '' });
      onShowToast(res?.message || 'Out-Pass request submitted! Dispatched to Guardian for digital consent.', 'success');
      await fetchStudentLeaves();
    } catch (err) {
      onShowToast(err.message || 'Failed to submit leave request.', 'error');
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    if (!complaintForm.description) {
      onShowToast('Please provide an issue description.', 'error');
      return;
    }
    try {
      const res = await api.createComplaint({
        studentId: student.id,
        studentName: student.name,
        hall: student.hall,
        room: student.room,
        category: complaintForm.category,
        priority: complaintForm.priority,
        title: complaintForm.title || `${complaintForm.category} Problem in ${student.room}`,
        description: complaintForm.description,
      });
      if (res?.data) {
        setComplaints([res.data, ...complaints]);
        setComplaintModalOpen(false);
        onShowToast(res.message || 'Problem reported. Dispatched to Floor Teacher for physical inspection.', 'success');
      }
    } catch (err) {
      onShowToast(err.message || 'Failed to submit complaint.', 'error');
    }
  };

  // Auto Meal-Off ONLY applies if leave is fully approved AND NOT rejected by guardian or tutor
  const isMealAutoOffActive = !overrideAutoMealOff && leaveRequests.some(
    req => {
      const st = (req.status || '').toLowerCase();
      const isApproved = st.includes('approved') || st.includes('completed');
      const isRejected = st.includes('reject') ||
        req.guardianConsent === 'Declined' ||
        req.floorTeacherStatus === 'Rejected';
      return isApproved && !isRejected;
    }
  );

  const isMealDisabled = isMealAutoOffActive || isMealDisabledManual;

  const todayDateStr = new Date().toISOString().split('T')[0];
  const tomorrowDateStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();
  const [mealApplyDate, setMealApplyDate] = useState(todayDateStr);

  const getMealCutoffStatus = (type, targetDate) => {
    if (targetDate > todayDateStr) {
      return {
        isCutoffExpired: false,
        label: 'Advance Booking (Open for Tomorrow)',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      };
    }
    if (targetDate < todayDateStr) {
      return {
        isCutoffExpired: true,
        label: 'Past Date (Closed)',
        badgeColor: 'bg-slate-100 text-slate-500 border-slate-200',
      };
    }

    const now = new Date();
    const currentDecimal = now.getHours() + now.getMinutes() / 60;

    if (type === 'Full Day (3 Meals)') {
      // Full Day includes Breakfast. If morning cutoff (02:30 AM) has passed, 3 meals cannot be booked together for today!
      const isExpired = currentDecimal > 2.5;
      return {
        isCutoffExpired: isExpired,
        label: isExpired ? 'Cutoff Passed for Today (Book Tomorrow)' : 'Available for Today (Before 02:30 AM)',
        badgeColor: isExpired
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      };
    }

    if (type === 'Breakfast') {
      const isExpired = currentDecimal > 2.5;
      return {
        isCutoffExpired: isExpired,
        label: isExpired ? '5h Cutoff Passed (was 02:30 AM)' : 'Min 5h Before (by 02:30 AM)',
        badgeColor: isExpired ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
      };
    }
    if (type === 'Lunch') {
      const isExpired = currentDecimal > 8.0;
      return {
        isCutoffExpired: isExpired,
        label: isExpired ? '5h Cutoff Passed (was 08:00 AM)' : 'Min 5h Before (by 08:00 AM)',
        badgeColor: isExpired ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
      };
    }
    if (type === 'Dinner') {
      const isExpired = currentDecimal > 15.5;
      return {
        isCutoffExpired: isExpired,
        label: isExpired ? '5h Cutoff Passed (was 03:30 PM)' : 'Min 5h Before (by 03:30 PM)',
        badgeColor: isExpired ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
      };
    }
    return { isCutoffExpired: false, label: 'Standard', badgeColor: 'bg-slate-100 text-slate-700' };
  };

  const handleApplyMeal = async (mealType, diet = 'Standard Rice, Dal & Curry', tokenCostBDT = 50) => {
    // Guaranteed Dining Right: Floor teacher rejection of leave, gate pass, or complaints NEVER locks meal tokens!
    if ((student.allocationStatus === 'Pending Provost Approval' || student.status?.includes('Pending')) && !student.room) {
      onShowToast('Meal token applications are locked until Hostel Super approves and allocates your hall seat.', 'error');
      return;
    }
    if (isMealDisabled) {
      onShowToast('Meal applications are currently disabled in settings.', 'error');
      return;
    }

    const cutoffInfo = getMealCutoffStatus(mealType, mealApplyDate);
    if (cutoffInfo.isCutoffExpired) {
      if (mealType === 'Full Day (3 Meals)') {
        onShowToast(`The Full Day (3 Meals) package is locked for today because the morning cutoff has passed. Please switch date to Tomorrow to book all 3 meals!`, 'error');
      } else {
        onShowToast(`Booking for ${mealType} is closed for ${mealApplyDate} because the 5-hour cutoff has passed. You may apply for Tomorrow!`, 'error');
      }
      return;
    }

    setIsApplyingMeal(true);
    try {
      const res = await api.applyMeal({
        studentId: student.id,
        studentName: student.name,
        hall: student.hall,
        room: student.room,
        date: mealApplyDate,
        mealType,
        diet,
        tokenCostBDT,
      });
      onShowToast(res.message || `Meal application for ${mealType} submitted! Non-refundable dining charges added to your monthly dues.`, 'success');
      fetchStudentMeals();
    } catch (err) {
      onShowToast(err.message || 'Failed to submit meal application.', 'error');
    } finally {
      setIsApplyingMeal(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">

      {/* 1. Student Primary Status Card */}
      <div className="ios-glass-card rounded-3xl p-6 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Student Residential Workspace
            </span>
            <span className="ios-glass-pill text-[11px] font-bold px-3 py-0.5 rounded-full text-emerald-700 dark:text-emerald-300">
              {student.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {student.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Student ID: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{student.id}</span> | {student.dept} | CGPA: {student.cgpa}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="ios-glass-pill p-3.5 rounded-2xl text-left sm:text-right">
            <div className="text-[11px] text-slate-500 font-medium">Assigned Accommodation</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">{student.hall} • {student.floor}</div>
            {student.room ? (
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold font-mono">{student.room} ({student.seatNo || student.seat})</div>
            ) : (
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold font-sans">Pending Provost Allocation</div>
            )}
          </div>

          <button
            onClick={onLogout}
            className="ios-tap-active flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full bg-rose-50/80 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200/80 hover:border-rose-600 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white dark:border-rose-900/50 dark:hover:border-rose-600 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:shadow-rose-600/20"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs (Apple iOS Liquid Glass Segmented Bar) */}
      <div className="ios-glass p-1.5 rounded-2xl mb-6 flex items-center gap-1 overflow-x-auto text-xs font-semibold scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${activeTab === 'overview'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
            }`}
        >
          <Building2 size={15} />
          <span>Room & Overview</span>
        </button>

        {/* Smart Searching Roommate only for 2 or 4 sharing rooms */}
        {Number(student.preferredCapacity) !== 1 && (
          <button
            onClick={() => setActiveTab('ai-matcher')}
            className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${activeTab === 'ai-matcher'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
              }`}
          >
            <Sparkles size={15} />
            <span>Roommate Matcher ({student.preferredCapacity || 2}-Bed)</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('leave')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${activeTab === 'leave'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
            }`}
        >
          <FileText size={15} />
          <span>Leave & Out-Pass ({leaveRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${activeTab === 'complaints'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
            }`}
        >
          <Wrench size={15} />
          <span>Maintenance Tickets ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dining')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${activeTab === 'dining'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
            }`}
        >
          <Utensils size={15} />
          <span>Dining & Mess</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${activeTab === 'attendance'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
            }`}
        >
          <CalendarCheck size={15} />
          <span>Night Roll-Call History</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${activeTab === 'payments'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
            }`}
        >
          <CreditCard size={15} />
          <span>Fees & SSLCommerz Payments ({payments.filter(p => p.status === 'Due').length} Due)</span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${activeTab === 'notices'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
            }`}
        >
          <FileText size={15} />
          <span>Provost Circulars & Notices</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & ALLOCATED ROOM                                          */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Live Application Status Banner */}
          {liveApp?.status === 'Allocated' || liveApp?.status === 'Approved & Allocated' || liveApp?.status === 'Approved' || currentUser?.allocationStatus === 'Allocated' ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <span className="font-bold text-sm block">
                    Room Allocation Approved & Officially Verified by Provost!
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    Your seat application for <strong>{student.hall}</strong> • <strong>{student.room}</strong> ({student.seat}) has been approved by the Provost Office.
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-bold text-[10px] uppercase tracking-wider shrink-0">
                Officially Allocated
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-900/20 shrink-0">
                  <Clock size={22} />
                </div>
                <div>
                  <span className="font-bold text-sm block">
                    Room Allocation Application Under Provost Review
                  </span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-300">
                    Smart Searching Roommate recommendation submitted to Provost <strong>Office of the Provost</strong>. Target: <strong>{student.hall}</strong> • <strong>{student.room}</strong> ({student.seat}){roommate?.name ? ` with ${roommate.name} (${roommate.aiMatchScore} Match)` : ' (Single / Fresh Room Allocation)'}.
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold text-[10px] uppercase tracking-wider shrink-0">
                Awaiting Provost Clearance
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Roommate & Assigned Space Details */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {student.room ? 'Assigned Room & Resident Cohort' : 'Room Allocation Status'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {student.room ? `${student.hall} • ${student.room} (${student.roomType})` : `${student.hall} • Awaiting Room & Bed Allocation by Hostel Super`}
                  </p>
                </div>
                {student.room ? (
                  <div className="flex items-center gap-2">
                    {activeTransferRequest && activeTransferRequest.status === 'Pending Review' ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700 text-xs font-semibold shadow-sm">
                        <Clock size={12} className="animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Room Transfer Pending Review</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsTransferModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700 transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        <ArrowRightLeft size={13} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Apply for Room Transfer</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Pending Allocation
                  </span>
                )}
              </div>

              {!student.room ? (
                <div className="p-6 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Room Allocation Pending Hostel Super Approval</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1">
                      Your registration is active. The Hostel Super (Provost Office) will review your application and preferred sharing configuration ({student.roomType || (Number(student.preferredCapacity) === 1 ? 'Single Room' : Number(student.preferredCapacity) === 4 ? '4-Bed Room' : '2-Bed Shared Room')}).
                    </p>
                  </div>

                  {/* Smart Room Allocation Option: Only available for 2 or 4 sharing rooms */}
                  {Number(student.preferredCapacity) !== 1 ? (
                    onOpenSmartAssign && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => onOpenSmartAssign(student)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-900/20 active:scale-95 transition-all cursor-pointer"
                        >
                          <Sparkles size={14} className="text-emerald-300" />
                          <span>Launch Smart Room & Roommate Allocation Questionnaire</span>
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                        <span>Single Deluxe Room (1-Person Private Room) • Direct Provost Allocation (No Roommate)</span>
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Bed B (You) */}
                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider font-mono">
                          {student.seat || 'Bed A'} (Your Slot)
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                          Active Resident
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {student.name}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        ID: {student.id} • CGPA: {student.cgpa}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/40">
                        Key Clearance: Handed Over • Bedding Verified
                      </div>
                    </div>

                    {/* Bed A (Roommate / Vacant) */}
                    {roommate ? (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                            {roommate.seat || 'Bed B'} (Roommate)
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            AI Match: {roommate.aiMatchScore}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {roommate.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Department: {roommate.dept || 'Engineering'}
                        </div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 pt-1.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-1">
                          <span>✓ Verified Resident Match</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                            Vacant Bed Slot
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Fresh Room Allotment
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          No Roommate Assigned Yet
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Single Room Privacy • Dedicated Study Workspace
                        </div>
                        <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                          Pending Provost AI Roommate Allocation
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Room Inventory & Amenities Checklist */}
                  <div className="pt-2">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Assigned Inventory & Utilities
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Study Desks</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">2 Workstations</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Wardrobes</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">2 Locked Units</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Network</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">High-Speed LAN</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Washroom</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Shared {student.floor || 'Floor 1'}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Contacts & Guardian Compliance Card */}
            <div className="lg:col-span-5 space-y-6">

              <div className="p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
                  Hall Administration Contacts
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <UserCheck size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Floor Teacher / House Tutor</div>
                      <div className="text-slate-600 dark:text-slate-400 text-[11px]">{student.floorTeacher}</div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px] mt-1">{student.floorTeacherPhone}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Shield size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Registered Guardian</div>
                      <div className="text-slate-600 dark:text-slate-400 text-[11px]">{student.guardianName}</div>
                      <div className="text-slate-500 font-mono text-[11px] mt-1">{student.guardianPhone} (SMS Alerts Active)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Quick Resident Actions
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setLeaveModalOpen(true)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#060911] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left font-semibold text-slate-900 dark:text-white flex flex-col justify-between transition-colors"
                  >
                    <span>Apply Out-Pass</span>
                    <ArrowRight size={13} className="text-emerald-700 dark:text-emerald-400 mt-2" />
                  </button>
                  <button
                    onClick={() => setComplaintModalOpen(true)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#060911] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left font-semibold text-slate-900 dark:text-white flex flex-col justify-between transition-colors"
                  >
                    <span>Report Issue</span>
                    <ArrowRight size={13} className="text-emerald-700 dark:text-emerald-400 mt-2" />
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Active Room Swap Requests Feed */}
          {swapRequests.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Room Transfer Applications
              </h3>
              <div className="space-y-3 text-xs">
                {swapRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{req.id}: {req.from} ➔ {req.to}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">Reason: {req.reason}</div>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SMART SEARCHING ROOMMATE                                           */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TAB 2: SMART SEARCHING ROOMMATE & LIVING HARMONY                           */}
      {/* ========================================================================= */}
      {activeTab === 'ai-matcher' && (
        <div className="space-y-6">

          {/* Top Section: Officially Allocated Room & Roommate Status */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-0.5">
                  Official Room Allocation & Resident Cohort
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {student.room ? `Assigned Room: ${student.hall} • ${student.room}` : 'Hostel Room Allocation Status'}
                </h2>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border self-start sm:self-auto ${student.room
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}>
                {student.room ? 'Provost Office Allocated' : 'Pending Provost Approval'}
              </span>
            </div>

            {student.room ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Slot 1: Your Bed */}
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider font-mono">
                      {student.seat || 'Bed A'} (Your Slot)
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                      Active Resident
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {student.name}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    ID: {student.id} • {student.dept}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    CGPA: {student.cgpa || '3.75'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/40">
                    Room Slot: {student.hall} • {student.room} ({student.seat || 'Bed A'})
                  </div>
                </div>

                {/* Slot 2: Allocated Roommate or Vacant */}
                {roommate ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                          {roommate.seat || 'Bed B'} (Allocated Roommate)
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Match Index: {roommate.aiMatchScore || '95%'}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {roommate.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Department: {roommate.dept || 'Engineering'}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
                        <span>✓ Verified Compatibility Peer</span>
                      </div>
                    </div>

                    {roommate.matchReasons && roommate.matchReasons.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Allocated Alignment:
                        </span>
                        {roommate.matchReasons.slice(0, 2).map((r, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                            <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                            <span className="truncate">{r}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                          Adjacent Bed Slot ({student.seat === 'Bed A' ? 'Bed B' : 'Bed A'})
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Vacant Bed
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        No Roommate Assigned Yet
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        You have fresh, single-room occupancy in this 2-bed room. When the Hostel Super allocates another student into this room, their verified details will appear here automatically.
                      </p>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                      Use the search tool below to find students in other rooms you may want to room with.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-center">
                <Clock size={28} className="text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Awaiting Room Allocation by Hostel Super</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1">
                  Your seat registration is submitted. Once approved by the Provost / Hostel Super office, your assigned room and paired roommate will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Section: 2 Columns */}
          {/* Left Column: Student Registered Lifestyle Summary + Actions (NO DROPDOWNS) */}
          {/* Right Column: Search Results (Shows ONLY after searching) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column: Your Lifestyle Profile & Search Trigger */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                  Roommate Compatibility Matcher
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Your Registered Living & Study Profile
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  These verified lifestyle habits are compared with other hostel residents to find your best roommate match.
                </p>
              </div>

              {/* Trait badges list */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🌙</span>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Sleep Schedule Routine</div>
                      <div className="text-[11px] text-slate-500">
                        {currentUser?.preferences?.sleepSchedule === 'early-riser' || currentUser?.preferences?.sleepSchedule === 'early-bird'
                          ? 'Early Bird (Sleeps 11:00 PM, wakes 6:00 AM)'
                          : 'Night Owl (Active late night, sleeps 1:00 AM - 8:30 AM)'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                    Active
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📚</span>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Study Noise & Focus Environment</div>
                      <div className="text-[11px] text-slate-500">
                        {currentUser?.preferences?.studyHabit === 'group'
                          ? 'Group Study & Discussion Tolerant'
                          : 'Strict Silence and Individual Deep Focus'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                    Active
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">✨</span>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Room Cleanliness Standard</div>
                      <div className="text-[11px] text-slate-500">
                        High Hygiene & Neat Workstations ({currentUser?.preferences?.cleanliness || 9}/10)
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                    Strict
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🎓</span>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Department Preference</div>
                      <div className="text-[11px] text-slate-500">
                        {currentUser?.preferences?.departmentPreference === 'diff-dept'
                          ? 'Prefer Different Department'
                          : 'Prefer Same Department (Computer Science)'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                    Preferred
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleCalculateAiMatch}
                  disabled={isAiMatching}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-900/20 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={14} className={isAiMatching ? 'animate-spin' : ''} />
                  <span>{isAiMatching ? 'Searching Hall Database...' : 'Search Compatible Roommates in Hall'}</span>
                </button>

                {onOpenSmartAssign && (
                  <button
                    type="button"
                    onClick={onOpenSmartAssign}
                    className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Update / Re-Run Lifestyle Questionnaire</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Search Results (Shows ONLY after searching) */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              {isAiMatching ? (
                <div className="my-auto py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Checking Resident Database...
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Comparing sleep schedules, study habits, and preferences with hall residents...
                  </p>
                </div>
              ) : aiMatchResult ? (
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Roommate Match Result
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {aiMatchResult.status}
                    </span>
                  </div>

                  {/* Big Score */}
                  <div className="text-center py-4">
                    <div className="text-4xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight font-['Outfit']">
                      {aiMatchResult.score}%
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                      Compatibility Match
                    </div>
                  </div>

                  {/* Candidate Info */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 mb-4 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          Best Matched Resident: {aiMatchResult.recommendation}
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          Room Allocation: {aiMatchResult.allocatedRoom}
                        </div>
                      </div>
                      {aiMatchResult.candidate?.cgpa && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold shrink-0 border border-emerald-300 dark:border-emerald-800 shadow-sm">
                          CGPA {aiMatchResult.candidate.cgpa}
                        </span>
                      )}
                    </div>

                    {/* Transfer Button if in different room */}
                    {aiMatchResult.candidate && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          <span className="text-slate-500">Current Room: </span>
                          <strong>{aiMatchResult.candidate.room || 'Room 102'} ({aiMatchResult.candidate.seatNo || aiMatchResult.candidate.seat || 'Bed A'})</strong>
                          {aiMatchResult.isDifferentRoom && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-semibold">
                              Different Room
                            </span>
                          )}
                        </div>
                        {aiMatchResult.isDifferentRoom ? (
                          <button
                            type="button"
                            onClick={() => handleApplyRoomTransferForMatch(aiMatchResult)}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/20 transition-all hover:scale-[1.02] shrink-0 cursor-pointer"
                          >
                            <ArrowRightLeft size={13} className="text-emerald-200" />
                            <span>Apply for Room Change to this Roommate</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                            ✓ Currently Allocated in Same Room
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Reasons List */}
                  {aiMatchResult.reasons && aiMatchResult.reasons.length > 0 && (
                    <div className="space-y-2 text-xs">
                      <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                        Shared Habits & Preferences:
                      </div>
                      {aiMatchResult.reasons.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                          <CheckCircle2 size={13} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Hostel Super Database Verified</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">{student.hall}</span>
                  </div>
                </div>
              ) : (
                <div className="my-auto py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
                    <Sparkles size={24} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Roommate Search Engine Ready
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Click <strong>&quot;Search Compatible Roommates in Hall&quot;</strong> on the left to compare your lifestyle profile against registered residents and discover your optimal living match.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LEAVE & OUT-PASS REQUESTS                                          */}
      {/* ========================================================================= */}
      {activeTab === 'leave' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Digital Leave and Gate Pass System
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Apply for weekend leave, semester vacation out-pass, or emergency passes with automated guardian consent.
              </p>
            </div>
            <button
              onClick={() => setLeaveModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
            >
              <Plus size={14} />
              <span>New Out-Pass Application</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaveRequests.map((req) => (
              <div key={req.id} className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{req.type}</span>
                    <span className="text-slate-400 font-mono text-[10px] ml-1.5">#{req.id}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${req.isApproved
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : req.isRejected
                        ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}>
                    {req.status}
                  </span>
                </div>

                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div><strong className="text-slate-700 dark:text-slate-200">Duration:</strong> {req.dates}</div>
                  <div><strong className="text-slate-700 dark:text-slate-200">Destination:</strong> {req.destination}</div>
                  <div><strong className="text-slate-700 dark:text-slate-200">Reason:</strong> {req.reason}</div>
                </div>

                {/* 3-Tier Step Tracking Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 space-y-2 text-[11px]">
                  {/* Step 1: Guardian */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">1. Guardian Digital Consent:</span>
                    <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${req.isGuardianGranted
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                        : req.isGuardianDeclined
                          ? 'bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300'
                          : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                      }`}>
                      {req.isGuardianGranted ? '✓ Authorized by Guardian' : req.isGuardianDeclined ? '✕ Declined by Guardian' : '⏳ Awaiting Guardian Consent'}
                    </span>
                  </div>

                  {/* Step 2: Floor Teacher */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">2. Floor Teacher / Provost:</span>
                    <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${req.isApproved
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                        : req.isRejected
                          ? 'bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                      {req.isApproved ? `✓ Approved by ${req.approvedBy || 'House Tutor'}` : req.isRejected ? '✕ Rejected' : '⏳ Awaiting Review'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    {req.isApproved ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGatePassForQr(req);
                          setIsGatePassQrModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <QrCode size={13} />
                        <span>View Gate Pass QR</span>
                      </button>
                    ) : (
                      <span className="text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                        <Clock size={12} />
                        <span>QR Available Upon Full Approval</span>
                      </span>
                    )}
                    <span className="font-mono text-slate-500">
                      {req.isApproved ? req.gatePassCode : `Ref: #${req.id}`}
                    </span>
                  </div>
                  {req.isApproved && (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>Leave Active (Meal AUTO-OFF)</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MAINTENANCE & COMPLAINTS                                           */}
      {/* ========================================================================= */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Hostel Maintenance & Repair Work Orders
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {complaints.length} Logged Tickets
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Report electrical, plumbing, network/LAN, or furniture malfunctions. Track live Floor Teacher & Provost delegation progress.
              </p>
            </div>
            <button
              onClick={() => setComplaintModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-700 hover:bg-blue-800 text-white shadow-md transition-all shrink-0"
            >
              <Plus size={14} />
              <span>+ Create Repair Ticket</span>
            </button>
          </div>

          {/* Floor Teacher Incident Notice (If any conduct/demerit recorded) */}
          {teacherIncidents.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold">⚠️</span>
                  <div>
                    <h3 className="font-bold text-rose-900 dark:text-rose-200 text-xs">
                      Floor Teacher Conduct & Room Demerit Notices ({teacherIncidents.length})
                    </h3>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300">
                      Observations recorded by your Floor House Tutor and forwarded to the Provost Office.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {teacherIncidents.map((inc) => (
                  <div key={inc.id} className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-200/60 dark:border-rose-900/30 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-rose-800 dark:text-rose-300">{inc.title || inc.category}</span>
                      <span className="text-slate-400 font-mono">{inc.date}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{inc.description}</p>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-rose-100 dark:border-rose-900/20">
                      <span>Reported by: <strong>{inc.reportedByName}</strong> ({inc.reportedByRole})</span>
                      <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{inc.severity} Severity</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-2 text-xs font-semibold">
            {[
              { id: 'all', label: 'All Tickets', icon: '🛠️' },
              { id: 'Electrical', label: 'Electricity (Fan, Light)', icon: '⚡' },
              { id: 'Network', label: 'Internet / Wi-Fi & LAN', icon: '🌐' },
              { id: 'Plumbing', label: 'Plumbing & Water', icon: '🚰' },
              { id: 'Furniture', label: 'Furniture & Locks', icon: '🚪' },
            ].map((cat) => {
              const count = cat.id === 'all'
                ? complaints.length
                : complaints.filter(c => {
                    const cCat = (c.category || '').toLowerCase();
                    if (cat.id === 'Electrical') return cCat.includes('electr');
                    if (cat.id === 'Network') return cCat.includes('net') || cCat.includes('wi-fi');
                    if (cat.id === 'Plumbing') return cCat.includes('plumb') || cCat.includes('water');
                    if (cat.id === 'Furniture') return cCat.includes('furn') || cCat.includes('lock');
                    return cCat === cat.id.toLowerCase();
                  }).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setComplaintCategoryFilter(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    complaintCategoryFilter === cat.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-[#0d121f] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    complaintCategoryFilter === cat.id ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {(() => {
            const filteredComplaints = complaints.filter(c => {
              if (complaintCategoryFilter === 'all') return true;
              const cCat = (c.category || '').toLowerCase();
              if (complaintCategoryFilter === 'Electrical') return cCat.includes('electr');
              if (complaintCategoryFilter === 'Network') return cCat.includes('net') || cCat.includes('wi-fi');
              if (complaintCategoryFilter === 'Plumbing') return cCat.includes('plumb') || cCat.includes('water');
              if (complaintCategoryFilter === 'Furniture') return cCat.includes('furn') || cCat.includes('lock');
              return cCat === complaintCategoryFilter.toLowerCase();
            });

            if (filteredComplaints.length === 0) {
              return (
                <div className="p-12 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <Wrench size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Tickets in this Category</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    No work orders found for the selected category filter. Click "+ Create Repair Ticket" to log an issue.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredComplaints.map((c) => {
                  const catLower = (c.category || '').toLowerCase();
                  const isElectrical = catLower.includes('electr');
                  const isNet = catLower.includes('net') || catLower.includes('wi-fi');
                  const isWater = catLower.includes('plumb') || catLower.includes('water');
                  const isFurniture = catLower.includes('furn') || catLower.includes('lock') || catLower.includes('bed');

                  return (
                    <div key={c._id || c.id} className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{isElectrical ? '⚡' : isNet ? '🌐' : isWater ? '🚰' : isFurniture ? '🚪' : '🛠️'}</span>
                          <span>{c.title || `${c.category} Issue`}</span>
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {c.status || 'Reported'}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Category:</span>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            isElectrical ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' :
                            isNet ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300' :
                            isWater ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300' :
                            isFurniture ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {isElectrical ? '⚡ Electricity' : isNet ? '🌐 Internet & LAN' : isWater ? '🚰 Plumbing & Water' : isFurniture ? '🚪 Furniture & Locks' : c.category}
                          </span>
                        </div>
                        <div><strong>Ticket ID:</strong> <span className="font-mono text-slate-800 dark:text-slate-200">{c.ticketId || c._id}</span></div>
                        <div><strong>Location:</strong> {c.location || `${c.hall || student.hall} • ${c.room || student.room}`}</div>
                        <div><strong>Priority:</strong> <span className={`font-semibold ${c.priority === 'Critical' ? 'text-rose-600 dark:text-rose-400' : c.priority === 'Urgent' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>{c.priority || 'Normal'}</span></div>
                        <div><strong>Description:</strong> {c.description}</div>

                        {/* Live Maintenance Work Progress Bar */}
                        {(c.status?.includes('In Progress') || (c.progressPercent && c.progressPercent > 0) || c.status?.includes('Resolved')) && (
                          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-1.5 mt-2">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${c.progressPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'} inline-block`} />
                                {c.progressPercent >= 100 ? 'Work Completed (100%)' : 'Crew Active Progress'}
                              </span>
                              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{c.progressPercent || 0}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-blue-200/50 dark:bg-blue-900/60 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  c.progressPercent >= 100
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(0, c.progressPercent || 0))}%` }}
                              />
                            </div>
                            {c.staffNotes && (
                              <p className="text-[10px] text-blue-800 dark:text-blue-200 italic mt-1 font-medium">
                                Maintenance Staff Note: "{c.staffNotes}"
                              </p>
                            )}
                            {c.estimatedCompletion && (
                              <p className="text-[10px] text-blue-600 dark:text-blue-400">
                                Est. Completion: <strong>{c.estimatedCompletion}</strong>
                              </p>
                            )}
                          </div>
                        )}

                        {c.assignedStaff && !c.assignedStaff.includes('Pending') && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                            ✓ Assigned Staff: {c.assignedStaff}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DINING & MESS OPERATIONS (Meal Booking & Consumed History)         */}
      {/* ========================================================================= */}
      {activeTab === 'dining' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Residential Hall Dining & Daily Mess System
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {student.hall} Dining Hall
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Apply for daily & advance meal tokens, view your consumed meals record, and track live Dining Staff approvals.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMealReceiptModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Receipt size={14} />
                <span>Monthly Meal Receipt</span>
              </button>
              <button
                onClick={fetchStudentMeals}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold"
              >
                <RefreshCw size={12} />
                <span>Refresh Meal Stats</span>
              </button>
            </div>
          </div>

          {/* Institutional Dining Rights Assurance Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-2.5">
              <Utensils size={18} className="text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-200">
                  Guaranteed Dining Access:
                </span>{' '}
                <span className="text-emerald-800 dark:text-emerald-300">
                  Even if your leave or gate pass is rejected by your Floor Teacher, your residential dining rights and meal token applications remain 100% active and unblocked. You can apply for all daily meals (Breakfast, Lunch, Dinner) below.
                </span>
              </div>
            </div>
            <span className="hidden md:inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 shrink-0">
              Active Dining Access
            </span>
          </div>

          {/* 4 Live Meal Status Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Consumed Meals */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Consumed Meals</span>
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {studentMealSummary.totalConsumedMeals || 0} Meals
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Approved & Served by Dining Staff
              </div>
            </div>

            {/* 2. Pending Token Requests */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Pending Approvals</span>
                <Clock size={16} className="text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {studentMealSummary.pendingApprovalMeals || 0} Tokens
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                Awaiting Dining Staff Action
              </div>
            </div>

            {/* 3. Total Applied Requests */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Total Token Requests</span>
                <FileText size={16} className="text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {studentMealSummary.totalAppliedMeals || (studentMealSummary.recentApplications?.length || 0)} Requests
              </div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                Lifetime Applications
              </div>
            </div>

            {/* 4. Total Mess Cost */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Current Mess Bill</span>
                <DollarSign size={16} className="text-purple-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {studentMealSummary.totalCostBDT || '0 BDT'}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                  Accumulated Charge
                </span>
                <button
                  type="button"
                  onClick={() => setIsMealReceiptModalOpen(true)}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                >
                  <Receipt size={11} />
                  <span>View Receipt</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Apply For Meals Grid */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus size={16} className="text-emerald-600" />
                  <span>Quick Apply for Daily Meal Tokens</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any slot below to submit your token request to the Central Dining Hall Staff.
                </p>
              </div>

              {/* Target Date Selector (Today vs Tomorrow) */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-500">Meal Date:</span>
                <button
                  type="button"
                  onClick={() => setMealApplyDate(todayDateStr)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${mealApplyDate === todayDateStr
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                >
                  Today ({todayDateStr})
                </button>
                <button
                  type="button"
                  onClick={() => setMealApplyDate(tomorrowDateStr)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${mealApplyDate === tomorrowDateStr
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                >
                  Tomorrow ({tomorrowDateStr})
                </button>
              </div>
            </div>

            {/* Mandatory Dining Hall Policy & 5-Hour Cutoff Alert Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-950 dark:text-amber-100">
                    Dining Regulations & Mandatory Billing Policy:
                  </p>
                  <div className="text-[11px] text-amber-800 dark:text-amber-300 space-y-0.5 leading-relaxed">
                    <p>
                      • <strong>Mandatory Non-Refundable Billing:</strong> Once an application is submitted, dining charges are strictly non-refundable and will be added to monthly mess dues regardless of meal consumption.
                    </p>
                    <p>
                      • <strong>5-Hour Advance Cutoff Policy:</strong> Meal tokens require at least 5 hours advance booking prior to service time (Breakfast by 02:30 AM, Lunch by 08:00 AM, Dinner by 03:30 PM). When a cutoff warning appears, that meal and the Full Day (3-Meal) package are locked for today, but can be booked freely for Tomorrow.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Breakfast */}
              {(() => {
                const cutoff = getMealCutoffStatus('Breakfast', mealApplyDate);
                return (
                  <button
                    type="button"
                    onClick={() => handleApplyMeal('Breakfast', 'Fresh Egg, Khichuri / Parata, Milk Tea', 30)}
                    disabled={isApplyingMeal || cutoff.isCutoffExpired}
                    className={`p-4 rounded-2xl border text-left transition-all group shadow-sm hover:shadow-md ${cutoff.isCutoffExpired
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 opacity-75 cursor-not-allowed'
                        : 'bg-slate-50 dark:bg-[#060911] border-slate-200 dark:border-slate-800 hover:border-emerald-500 cursor-pointer'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">🍳 Breakfast</span>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">30 BDT</span>
                    </div>
                    <p className="text-[11px] text-slate-500">07:30 AM - 09:00 AM</p>
                    <p className="text-[10px] text-slate-400 mt-1">Egg / Khichuri, Parata, Tea</p>

                    {/* Cutoff Pill */}
                    <div className="mt-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${cutoff.badgeColor}`}>
                        {cutoff.label}
                      </span>
                    </div>

                    <span className={`inline-block mt-2 text-[10px] font-bold ${cutoff.isCutoffExpired ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400 group-hover:underline'
                      }`}>
                      {cutoff.isCutoffExpired ? '⛔ Booking Closed (Cutoff Passed)' : '+ Apply for Breakfast Token →'}
                    </span>
                  </button>
                );
              })()}

              {/* Lunch */}
              {(() => {
                const cutoff = getMealCutoffStatus('Lunch', mealApplyDate);
                return (
                  <button
                    type="button"
                    onClick={() => handleApplyMeal('Lunch', 'Standard Lunch (Chicken/Fish, Rice, Dal)', 50)}
                    disabled={isApplyingMeal || cutoff.isCutoffExpired}
                    className={`p-4 rounded-2xl border text-left transition-all group shadow-sm hover:shadow-md ${cutoff.isCutoffExpired
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 opacity-75 cursor-not-allowed'
                        : 'bg-slate-50 dark:bg-[#060911] border-slate-200 dark:border-slate-800 hover:border-emerald-500 cursor-pointer'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">🍛 Lunch</span>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">50 BDT</span>
                    </div>
                    <p className="text-[11px] text-slate-500">01:00 PM - 02:30 PM</p>
                    <p className="text-[10px] text-slate-400 mt-1">Chicken / Rui Fish, Rice, Dal</p>

                    {/* Cutoff Pill */}
                    <div className="mt-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${cutoff.badgeColor}`}>
                        {cutoff.label}
                      </span>
                    </div>

                    <span className={`inline-block mt-2 text-[10px] font-bold ${cutoff.isCutoffExpired ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400 group-hover:underline'
                      }`}>
                      {cutoff.isCutoffExpired ? '⛔ Booking Closed (Cutoff Passed)' : '+ Apply for Lunch Token →'}
                    </span>
                  </button>
                );
              })()}

              {/* Dinner */}
              {(() => {
                const cutoff = getMealCutoffStatus('Dinner', mealApplyDate);
                return (
                  <button
                    type="button"
                    onClick={() => handleApplyMeal('Dinner', 'Standard Dinner (Egg/Fish Curry, Rice, Dal)', 50)}
                    disabled={isApplyingMeal || cutoff.isCutoffExpired}
                    className={`p-4 rounded-2xl border text-left transition-all group shadow-sm hover:shadow-md ${cutoff.isCutoffExpired
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 opacity-75 cursor-not-allowed'
                        : 'bg-slate-50 dark:bg-[#060911] border-slate-200 dark:border-slate-800 hover:border-emerald-500 cursor-pointer'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">🍲 Dinner</span>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">50 BDT</span>
                    </div>
                    <p className="text-[11px] text-slate-500">08:30 PM - 10:00 PM</p>
                    <p className="text-[10px] text-slate-400 mt-1">Egg / Fish Curry, Sabji, Dal</p>

                    {/* Cutoff Pill */}
                    <div className="mt-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${cutoff.badgeColor}`}>
                        {cutoff.label}
                      </span>
                    </div>

                    <span className={`inline-block mt-2 text-[10px] font-bold ${cutoff.isCutoffExpired ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400 group-hover:underline'
                      }`}>
                      {cutoff.isCutoffExpired ? '⛔ Booking Closed (Cutoff Passed)' : '+ Apply for Dinner Token →'}
                    </span>
                  </button>
                );
              })()}

              {/* Full Day 3 Meals - Locked if Cutoff has passed for today, open for tomorrow */}
              {(() => {
                const fullDayCutoff = getMealCutoffStatus('Full Day (3 Meals)', mealApplyDate);
                const isExpired = fullDayCutoff.isCutoffExpired;
                return (
                  <button
                    type="button"
                    onClick={() => handleApplyMeal('Full Day (3 Meals)', 'Breakfast + Lunch + Dinner Full Package', 130)}
                    disabled={isApplyingMeal || isExpired}
                    className={`p-4 rounded-2xl border-2 text-left transition-all group shadow-sm hover:shadow-md ${isExpired
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 opacity-75 cursor-not-allowed'
                        : 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-500/70 hover:border-emerald-600 cursor-pointer'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">🌟 Full Day (3 Meals)</span>
                      <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">130 BDT</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">Breakfast + Lunch + Dinner</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Generates 3 separate individual tokens</p>

                    {/* Cutoff Pill */}
                    <div className="mt-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${fullDayCutoff.badgeColor}`}>
                        {fullDayCutoff.label}
                      </span>
                    </div>

                    <span className={`inline-block mt-2 text-[10px] font-bold ${isExpired
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-emerald-700 dark:text-emerald-300 group-hover:underline'
                      }`}>
                      {isExpired ? '⛔ Closed for Today (Switch to Tomorrow)' : '+ Apply All 3 Meals Together →'}
                    </span>
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Weekly Mess Menu Schedule */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Weekly Residential Mess Roster (Padma Hall Dining)
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Updated for September 2026</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
              {[
                { day: 'Sun', lunch: 'Chicken Bhuna', dinner: 'Dim Curry' },
                { day: 'Mon', lunch: 'Rui Fish', dinner: 'Mixed Sabji' },
                { day: 'Tue', lunch: 'Egg Curry', dinner: 'Pangash Fish' },
                { day: 'Wed', lunch: 'Beef/Special', dinner: 'Dal & Bhorta' },
                { day: 'Thu', lunch: 'Chicken Khichuri', dinner: 'Egg Curry' },
                { day: 'Fri', lunch: 'Special Biryani', dinner: 'Chicken Curry' },
                { day: 'Sat', lunch: 'Pangas/Rui', dinner: 'Egg Masala' },
              ].map((m, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">{m.day}</div>
                  <div className="text-[10px] text-slate-500">L: <span className="font-medium text-slate-700 dark:text-slate-300">{m.lunch}</span></div>
                  <div className="text-[10px] text-slate-500">D: <span className="font-medium text-slate-700 dark:text-slate-300">{m.dinner}</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Meal Token Applications & Booking History Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  My Live Meal Token Applications & Consumed History
                </h3>
                <p className="text-xs text-slate-500">
                  Track your applied meal tokens and verify whether Dining Staff has marked them as Approved & Served.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {studentMealSummary.recentApplications?.length || 0} Total Records
              </span>
            </div>

            {/* Bookings List Table */}
            {(!studentMealSummary.recentApplications || studentMealSummary.recentApplications.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No meal token requests submitted yet. Click one of the quick apply meal buttons above to apply!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
                      <th className="pb-3">Token Ref ID</th>
                      <th className="pb-3">Meal Category</th>
                      <th className="pb-3">Scheduled Date</th>
                      <th className="pb-3">Diet & Items</th>
                      <th className="pb-3">Token Charge</th>
                      <th className="pb-3">Application Time</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-center">Digital QR Token</th>
                      <th className="pb-3 text-right">Staff Approver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {studentMealSummary.recentApplications.map((b) => {
                      const isApproved = b.foodCollected || b.status === 'Approved & Served' || b.status === 'Approved';
                      const isRejected = b.status === 'Rejected' || b.status === 'Declined';
                      const isBreakfast = b.mealType === 'Breakfast';
                      const isLunch = b.mealType === 'Lunch';
                      const isDinner = b.mealType === 'Dinner';

                      return (
                        <tr key={b._id || b.bookingId} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="py-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {b.bookingId || `MEL-${b._id?.slice(-4)}`}
                          </td>
                          <td className="py-3.5 font-semibold text-slate-900 dark:text-white">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 ${isBreakfast
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : isLunch
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : isDinner
                                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                              }`}>
                              {isBreakfast ? '🍳 Breakfast' : isLunch ? '🍛 Lunch' : isDinner ? '🍲 Dinner' : b.mealType}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                            {b.date || 'Today'}
                          </td>
                          <td className="py-3.5 text-slate-600 dark:text-slate-400 text-[11px] max-w-xs truncate" title={b.diet}>
                            {b.diet || 'Standard Meal'}
                          </td>
                          <td className="py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ৳{b.tokenCostBDT || (isBreakfast ? 30 : 50)} BDT
                          </td>
                          <td className="py-3.5 text-slate-500 text-[11px]">
                            {b.createdAt ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${isApproved
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : isRejected
                                    ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                }`}
                            >
                              {isApproved ? (
                                <>
                                  <CheckCircle2 size={11} className="text-emerald-600" />
                                  <span>Food Collected</span>
                                </>
                              ) : isRejected ? (
                                <span>Rejected</span>
                              ) : (
                                <>
                                  <Clock size={11} className="text-blue-600" />
                                  <span>Ready at Counter</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMealTokenForQr(b);
                                setIsMealQrModalOpen(true);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                                isApproved
                                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                              }`}
                              title={isApproved ? 'View Claimed Meal Record' : 'Show QR Token to Dining Counter'}
                            >
                              <QrCode size={13} />
                              <span>{isApproved ? 'QR (Claimed)' : 'Show QR'}</span>
                            </button>
                          </td>
                          <td className="py-3.5 text-right text-slate-500 text-[11px]">
                            {b.approvedBy || (isApproved ? 'Dining Staff' : 'Awaiting Collection')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: NIGHT ATTENDANCE                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Night Roll-Call Verification History
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Conducted nightly at 10:00 PM by your Floor House Tutor.
            </p>
          </div>

          <div className="space-y-2">
            {attendanceLogs.map((log, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{log.date}</span>
                  <span className="text-slate-400 ml-2">({log.time})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500">Verified by: {log.verifiedBy}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: FEES & SSLCOMMERZ PAYMENTS                                         */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Total Cleared & Paid</span>
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                ৳{payments.filter(p => p.status === 'Paid').reduce((acc, curr) => acc + (curr.amountBDT || 0), 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {payments.filter(p => p.status === 'Paid').length} Invoices Cleared
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Current Outstanding Due</span>
                <Clock size={16} className="text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                ৳{payments.filter(p => p.status === 'Due').reduce((acc, curr) => acc + (curr.amountBDT || 0), 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                {payments.filter(p => p.status === 'Due').length} Invoices Pending
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Hostel Billing Plan</span>
                <Building2 size={16} className="text-blue-500" />
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {student.roomType}
              </div>
              <div className="text-[11px] text-slate-500">
                ৳{Number(dynamicRoomMonthlyRent || 3500).toLocaleString()}/mo (Base Rent + Wi-Fi + Utility)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white shadow-sm space-y-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck size={16} />
                  <span>SSLCommerz Secured</span>
                </div>
                <div className="text-xs text-emerald-100/90 mt-1">
                  Pay via bKash, Nagad, Rocket, Visa/Mastercard & Net Banking
                </div>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full inline-block font-mono w-fit">
                256-Bit Encrypted
              </span>
            </div>
          </div>

          {/* Official Hostel Payment Policy & Financial Rules Notice */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0c1527] text-white border border-slate-700/80 shadow-md space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Official Hostel Payment Rules & Policy</h4>
                  <p className="text-[11px] text-slate-400">Institutional financial compliance mandated by Provost Desk</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold">
                Payment Deadline: 5th of Month
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1 text-[11px]">
                  <span>📅 Monthly Due Date</span>
                </div>
                <p className="text-[10.5px] text-slate-300">
                  Hostel room rent must be paid on or before the <strong>5th of each month</strong>.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1 text-[11px]">
                  <span>⚠️ 10% Late Fine Penalty</span>
                </div>
                <p className="text-[10.5px] text-slate-300">
                  Payments made after the 5th automatically incur a <strong>10% penalty surcharge (jorimana)</strong>.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-bold text-sky-400 flex items-center gap-1 text-[11px]">
                  <span>🍽️ Month-End Meal Bill</span>
                </div>
                <p className="text-[10.5px] text-slate-300">
                  Actual consumed dining meals are billed at month-end and paid concurrently with room rent.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Pay Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pay Hostel Seat Rent Card */}
            {(() => {
              const dueRent = payments.find(p => p.feeType === 'Seat Rent' && p.status === 'Due');
              const isRentCleared = !dueRent;
              const currentDay = new Date().getDate();
              const isPast5th = currentDay > 5;
              const baseRent = dynamicRoomMonthlyRent;
              const lateFine = isPast5th ? Math.round(baseRent * 0.10) : 0;
              const payableRent = dueRent ? dueRent.amountBDT : (baseRent + lateFine);

              return (
                <div className="p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        Residential Hall Fee
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isPast5th && !isRentCleared && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            +10% Late Fine
                          </span>
                        )}
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${isRentCleared
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}>
                          {isRentCleared ? '৳0 Due (Cleared)' : `৳${payableRent} Due`}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Monthly Hostel Seat Rent ({new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Includes Room Base Rent, High-Speed Wi-Fi LAN access, 24/7 Security, and Emergency Generator maintenance.
                    </p>
                    {!isRentCleared && (
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-[11px] font-mono flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>Base Rent: ৳{baseRent}</span>
                        <span>Late Fine: {isPast5th ? `+৳${lateFine} (10%)` : '৳0 (Before 5th)'}</span>
                        <strong className="text-emerald-600 dark:text-emerald-400">Total: ৳{payableRent}</strong>
                      </div>
                    )}
                  </div>

                  {isRentCleared ? (
                    <div className="w-full py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Monthly Seat Rent 100% Cleared & Paid</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isRedirectingSSL}
                      onClick={() => {
                        handlePayViaSSLCommerz({
                          invoiceId: dueRent?._id,
                          invoiceNo: dueRent?.invoiceNo || `INV-2026-R${currentUser?.userId?.slice(-4) || '8812'}`,
                          feeType: 'Seat Rent',
                          amountBDT: payableRent,
                          month: dueRent?.month || `${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
                        });
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20 transition-all cursor-pointer"
                    >
                      <Lock size={14} />
                      <span>Pay Seat Rent (৳{payableRent}) via SSLCommerz</span>
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Pay Monthly Consumed Meals Bill Card */}
            {(() => {
              const consumedCount = studentMealSummary.totalConsumedMeals || 0;
              const dueMeal = payments.find(p => (p.feeType === 'Monthly Meal Token' || p.feeType.includes('Meal')) && p.status === 'Due' && p.amountBDT > 0);
              const hasDue = Boolean(dueMeal && dueMeal.amountBDT > 0);

              return (
                <div className="p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                        Dining & Mess (Month-End Actual Consumed)
                      </span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${hasDue
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}>
                        {hasDue ? `৳${dueMeal.amountBDT} Due` : '৳0 Due'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Month-End Mess Bill ({consumedCount} Consumed Meals)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Billed automatically at month end based on the exact number of meals approved and served by Dining Staff.
                    </p>
                    {hasDue && (
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-[11px] font-mono flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>Consumed: {consumedCount} Meals</span>
                        <span>Rate: ৳50/meal</span>
                        <strong className="text-orange-600 dark:text-orange-400">Total: ৳{dueMeal.amountBDT}</strong>
                      </div>
                    )}
                  </div>

                  {hasDue ? (
                    <button
                      type="button"
                      disabled={isRedirectingSSL}
                      onClick={() => {
                        handlePayViaSSLCommerz({
                          invoiceId: dueMeal._id,
                          invoiceNo: dueMeal.invoiceNo,
                          feeType: 'Monthly Meal Token',
                          amountBDT: dueMeal.amountBDT,
                          month: dueMeal.month || `${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
                        });
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-900/20 transition-all cursor-pointer"
                    >
                      <Utensils size={14} />
                      <span>Pay Consumed Meal Bill (৳{dueMeal.amountBDT}) via SSLCommerz</span>
                    </button>
                  ) : (
                    <div className="w-full py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>No Mess Bill Due ({consumedCount} Meals Consumed)</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Combined Month-End Clearance Banner (Pay Both Rent + Meals together) */}
          {(() => {
            const dueRent = payments.find(p => p.feeType === 'Seat Rent' && p.status === 'Due');
            const dueMeal = payments.find(p => (p.feeType === 'Monthly Meal Token' || p.feeType.includes('Meal')) && p.status === 'Due' && p.amountBDT > 0);
            if (!dueRent && !dueMeal) return null;

            const currentDay = new Date().getDate();
            const isPast5th = currentDay > 5;
            const rentAmount = dueRent ? dueRent.amountBDT : (isPast5th ? Math.round(dynamicRoomMonthlyRent * 1.1) : dynamicRoomMonthlyRent);
            const mealAmount = dueMeal ? dueMeal.amountBDT : 0;
            const combinedTotal = (dueRent ? rentAmount : 0) + mealAmount;

            if (combinedTotal <= 0) return null;

            return (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm tracking-tight">Combined Monthly Clearance (Rent + Meal Bill)</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">1-Click SSLCommerz</span>
                  </div>
                  <p className="text-xs text-emerald-200/90">
                    Pay entire monthly hostel dues in a single secure transaction {isPast5th && '(Includes 10% late fine for rent)'}.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-200/80 block uppercase font-mono">Total Combined</span>
                    <span className="text-lg font-black font-mono">৳{combinedTotal.toLocaleString()}</span>
                  </div>
                  <button
                    type="button"
                    disabled={isRedirectingSSL}
                    onClick={() => {
                      handlePayViaSSLCommerz({
                        invoiceId: dueRent?._id || dueMeal?._id,
                        invoiceNo: `INV-COMBINED-${new Date().getFullYear()}${currentUser?.userId?.slice(-4) || '9912'}`,
                        feeType: 'Combined Monthly Clearance (Rent + Meal Bill)',
                        amountBDT: combinedTotal,
                        month: `${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
                      });
                    }}
                    className="py-2.5 px-4 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-all flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
                  >
                    <Lock size={13} className="text-emerald-700" />
                    <span>Pay All ৳{combinedTotal.toLocaleString()}</span>
                  </button>
                </div>
              </div>
            );
          })()}

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Payment History & Institutional Money Receipts
                </h3>
                <p className="text-xs text-slate-500">
                  All transactions validated via SSLCommerz Gateway with downloadable official money receipts.
                </p>
              </div>
              <button
                onClick={fetchPayments}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold"
              >
                <RefreshCw size={12} />
                <span>Refresh Invoices</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
                    <th className="pb-3">Invoice No</th>
                    <th className="pb-3">Fee Category</th>
                    <th className="pb-3">Billing Month</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Method & Gateway</th>
                    <th className="pb-3">Transaction ID</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {payments.map((inv) => {
                    const isPaid = inv.status === 'Paid';
                    return (
                      <tr key={inv._id || inv.invoiceNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {inv.invoiceNo}
                        </td>
                        <td className="py-3.5 font-semibold text-slate-900 dark:text-white">
                          {inv.feeType}
                        </td>
                        <td className="py-3.5 text-slate-500">
                          {inv.month}
                        </td>
                        <td className="py-3.5 font-mono font-black text-emerald-600 dark:text-emerald-400">
                          ৳{inv.amountBDT?.toLocaleString()}
                        </td>
                        <td className="py-3.5 text-slate-600 dark:text-slate-400 text-[11px]">
                          {inv.paymentMethod}
                        </td>
                        <td className="py-3.5 font-mono text-[11px] text-slate-500">
                          {inv.transactionId || '—'}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPaid
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          {isPaid ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPaymentForReceipt(inv);
                                setIsReceiptModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] transition-colors"
                            >
                              <Download size={12} />
                              <span>Download Receipt</span>
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              {inv.transactionId && (
                                <button
                                  type="button"
                                  title="Check & Verify SSL Status"
                                  onClick={() => handleVerifyInvoice(inv)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] transition-colors"
                                >
                                  <RefreshCw size={11} />
                                  <span>Verify</span>
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={isRedirectingSSL}
                                onClick={() => handlePayViaSSLCommerz(inv)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                              >
                                <CreditCard size={12} />
                                <span>Pay ৳{inv.amountBDT}</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Official Provost Circulars & Notices Tab */}
      {activeTab === 'notices' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <TargetedNoticesWidget
            role="student"
            floor={student.floor}
            title="Official Circulars & Provost Directives for Students"
            subtitle="Official notifications, administrative circulars, and hall guidelines issued by the Hostel Super & Provost Office."
          />
        </div>
      )}

      {/* SSLCommerz Direct Gateway Redirection Loading Overlay */}
      {isRedirectingSSL && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center space-y-4 animate-in fade-in duration-200">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <div className="space-y-1">
            <h3 className="text-xl font-black tracking-tight">Connecting to SSLCommerz Bank Gateway</h3>
            <p className="text-xs text-slate-300 max-w-sm">
              Please wait... You are being redirected to SSLCommerz 256-Bit Encrypted Hosted Checkout to select your payment option.
            </p>
          </div>
        </div>
      )}

      {/* Fallback SSLCommerz Modal for Manual Testing */}
      <SSLCommerzModal
        isOpen={isSSLModalOpen}
        onClose={() => setIsSSLModalOpen(false)}
        invoiceData={activeInvoiceForPay}
        studentUser={{ ...student, name: student.name, userId: student.id }}
        onPaymentSuccess={(completed) => {
          onShowToast(`Payment of ৳${completed.amountBDT || activeInvoiceForPay?.amountBDT} completed successfully! Official receipt generated.`, 'success');
          fetchPayments();
        }}
      />

      {/* Official Printable Money Receipt Modal */}
      <PaymentReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        paymentData={selectedPaymentForReceipt}
        studentUser={{ ...student, name: student.name, userId: student.id }}
      />

      {/* Official Printable Student Monthly Meal Receipt Modal */}
      <StudentMealReceiptModal
        isOpen={isMealReceiptModalOpen}
        onClose={() => setIsMealReceiptModalOpen(false)}
        student={student}
        mealSummary={studentMealSummary}
        month="September 2026"
      />

      {/* Room Swap Modal */}
      {swapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Apply for Room Swap / Transfer
            </h2>
            <p className="text-slate-500 mb-4">
              Submit your desired target room and justification for Provost Office review.
            </p>
            <form onSubmit={handleCreateSwap} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Residential Hall</label>
                <input
                  type="text"
                  value={swapForm.targetHall}
                  onChange={(e) => setSwapForm({ ...swapForm, targetHall: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Floor</label>
                  <input
                    type="text"
                    value={swapForm.targetFloor}
                    onChange={(e) => setSwapForm({ ...swapForm, targetFloor: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Room</label>
                  <input
                    type="text"
                    value={swapForm.targetRoom}
                    onChange={(e) => setSwapForm({ ...swapForm, targetRoom: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Transfer Justification</label>
                <textarea
                  rows={3}
                  value={swapForm.reason}
                  onChange={(e) => setSwapForm({ ...swapForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 resize-none"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSwapModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                >
                  Submit Swap Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      {leaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Apply for Formal Leave / Out-Pass
            </h2>
            <p className="text-slate-500 mb-4">
              Your request will be routed directly to your Floor Teacher for approval and registered with the Security Gate.
            </p>
            <form onSubmit={handleApplyLeave} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Reason for Leave</label>
                <input
                  type="text"
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="e.g. Family Emergency, Medical, Weekend Stay"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Emergency Destination Address</label>
                <input
                  type="text"
                  value={leaveForm.destination}
                  onChange={(e) => setLeaveForm({ ...leaveForm, destination: e.target.value })}
                  placeholder="e.g. Permanent Residence, Uttara Sector 4, Dhaka"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">From Date</label>
                  <input
                    type="date"
                    value={leaveForm.fromDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">To Date</label>
                  <input
                    type="date"
                    value={leaveForm.toDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                >
                  Submit Out-Pass Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaint Modal */}
      {complaintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Create Maintenance Work Order
            </h2>
            <p className="text-slate-500 mb-4">
              Your ticket will be verified by your Floor Teacher and assigned directly to the Hall Maintenance Staff.
            </p>
            <form onSubmit={handleCreateComplaint} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Problem Category</label>
                  <select
                    value={complaintForm.category}
                    onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="Electrical">⚡ Electricity (Fan, Light, Switch)</option>
                    <option value="Network">🌐 Internet / Wi-Fi & LAN</option>
                    <option value="Plumbing">🚰 Plumbing & Water (Tap, Pump)</option>
                    <option value="Furniture">🚪 Furniture & Locks (Bed, Table)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Urgency Level</label>
                  <select
                    value={complaintForm.priority}
                    onChange={(e) => setComplaintForm({ ...complaintForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="Normal">Normal (Within 24 Hours)</option>
                    <option value="Urgent">Urgent (Within 6 Hours)</option>
                    <option value="Critical">Critical (Immediate Hazard)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Location Details</label>
                <input
                  type="text"
                  value={complaintForm.location}
                  onChange={(e) => setComplaintForm({ ...complaintForm, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  placeholder="Describe the malfunction precisely..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 resize-none"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setComplaintModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                >
                  Dispatch Ticket to Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Room Transfer Request Modal */}
      {isTransferModalOpen && (
        <StudentRoomTransferModal
          isOpen={isTransferModalOpen}
          onClose={() => {
            setIsTransferModalOpen(false);
            setTransferPrefill(null);
          }}
          studentUser={student}
          prefillData={transferPrefill}
          onSuccess={(msg) => {
            if (onShowToast) onShowToast(msg, 'success');
            fetchTransferRequests();
          }}
        />
      )}

      {/* Individual Meal Token QR Modal */}
      {isMealQrModalOpen && selectedMealTokenForQr && (
        <StudentMealQrModal
          isOpen={isMealQrModalOpen}
          onClose={() => {
            setIsMealQrModalOpen(false);
            setSelectedMealTokenForQr(null);
            fetchStudentMeals();
          }}
          token={selectedMealTokenForQr}
          student={student}
        />
      )}

      {/* Official Gate Pass QR Modal */}
      {isGatePassQrModalOpen && selectedGatePassForQr && (
        <GatePassQrModal
          isOpen={isGatePassQrModalOpen}
          onClose={() => {
            setIsGatePassQrModalOpen(false);
            setSelectedGatePassForQr(null);
          }}
          pass={selectedGatePassForQr}
          student={student}
        />
      )}

    </div>
  );
}
