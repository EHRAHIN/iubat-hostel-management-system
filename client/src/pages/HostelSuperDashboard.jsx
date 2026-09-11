import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Building2,
  UserCheck,
  FileText,
  CheckCircle2,
  Sparkles,
  Wrench,
  Bell,
  LogOut,
  Check,
  X,
  Plus,
  Search,
  Filter,
  Bed,
  Users,
  AlertCircle,
  Layers,
  Send,
  Clock,
  ShieldAlert,
  ArrowRight,
  Download,
  UserPlus,
  Trash2,
  Copy,
  Key,
  Lock,
  Mail,
  Phone,
  Briefcase,
  Zap,
  Droplets,
  Utensils,
  RotateCcw,
  Eye,
  ArrowRightLeft,
  ChevronRight,
  ShoppingBag,
  GraduationCap,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api';
import StudentHistoryModal from '../components/StudentHistoryModal';
import RoomManagerSection from '../components/RoomManagerSection';
import RoomAllocateModal from '../components/RoomAllocateModal';
import RoomTransferModal from '../components/RoomTransferModal';
import DailyBazarMealReportSection from '../components/DailyBazarMealReportSection';

// CGPA Proximity & Comparison Calculator (Scale 4.00)
const getCgpaComparison = (studentCgpa, partnerCgpa) => {
  const c1 = parseFloat(studentCgpa) || 0;
  const c2 = parseFloat(partnerCgpa) || 0;
  if (!c1 || !c2) return null;

  const maxCgpa = 4.00;
  const diff = Math.abs(c1 - c2);
  
  // Accurate percentage difference and closeness out of 4.00 scale
  const diffPercent = ((diff / maxCgpa) * 100);
  const closenessPercent = Math.max(0, Math.min(100, ((maxCgpa - diff) / maxCgpa) * 100));

  let status = '';
  let badgeColor = '';
  let advice = '';

  // Theme-consistent emerald & teal colors (matching hostel dashboard)
  const progressColor = 'from-emerald-600 via-teal-500 to-emerald-400';

  if (diff <= 0.15) {
    status = 'Extremely Close Match';
    badgeColor = 'text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 bg-emerald-100/90 dark:bg-emerald-950/80';
    advice = 'Ideal joint study cohort with near-identical academic pace';
  } else if (diff <= 0.35) {
    status = 'High Academic Alignment';
    badgeColor = 'text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-700 bg-teal-100/90 dark:bg-teal-950/80';
    advice = 'Strong academic compatibility with well-matched study routines';
  } else if (diff <= 0.60) {
    status = 'Balanced Academic Range';
    badgeColor = 'text-teal-900 dark:text-teal-200 border-teal-300/80 dark:border-teal-700/80 bg-emerald-50 dark:bg-emerald-950/60';
    advice = 'Balanced cohort pairing suitable for collaborative group learning';
  } else {
    status = 'Complementary Study Match';
    badgeColor = 'text-emerald-900 dark:text-emerald-100 border-emerald-300/60 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40';
    advice = 'Complementary academic partnership with mutual peer mentoring synergy';
  }

  return {
    c1: c1.toFixed(2),
    c2: c2.toFixed(2),
    diff: diff.toFixed(2),
    diffPercent: diffPercent.toFixed(1),
    closenessPercent: closenessPercent.toFixed(1),
    status,
    badgeColor,
    progressColor,
    advice,
  };
};

export default function HostelSuperDashboard({ currentUser, onLogout, onShowToast }) {
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Room allocation and transfer modal state
  const [roomsList, setRoomsList] = useState([]);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedAppForAllocate, setSelectedAppForAllocate] = useState(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedStudentForTransfer, setSelectedStudentForTransfer] = useState(null);

  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('iubat_provost_tab') || 'allocations';
    } catch {
      return 'allocations';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('iubat_provost_tab', activeTab);
    } catch (e) {
      console.error(e);
    }
  }, [activeTab]);

  // Provost Profile Data
  const provost = {
    name: currentUser?.name || 'Prof. Dr. Monirul Islam',
    title: 'Provost & Chief Residential Warden',
    department: 'Office of the Provost, IUBAT Residential Operations',
    provostId: currentUser?.userId || 'PRV-IUBAT-001',
    jurisdiction: 'Padma Residential Hall (Campus Male Residence)',
  };

  // 1. Pending Seat Applications & AI Roommate Pairs State (Dynamic from MongoDB)
  const [seatApplications, setSeatApplications] = useState([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  // 2. Final Out-Pass Clearance State
  const [leaveApprovals, setLeaveApprovals] = useState([]);

  // 3. Provisioned Staff & Floor Teacher Directory State (4 Floor Teachers + 4 Staff accounts)
  const [provisionedPersonnel, setProvisionedPersonnel] = useState([
    // --- 4 Floor Teachers (2 Male Hall, 2 Female Hall) ---
    {
      _id: 'tut-pad-1',
      userId: 'TUT-PAD-001',
      name: 'Dr. Tariqul Islam',
      email: 'tutor.padma1@iubat.edu',
      role: 'teacher',
      department: 'Department of Computer Science & Engineering (CSE)',
      hall: 'Padma Residential Hall (Male)',
      floor: 'Floor 1',
      phone: '+880 1819 123456',
      unit: 'Padma Residential Hall (Floor 1 House Tutor)',
      status: 'Active',
    },
    {
      _id: 'tut-pad-2',
      userId: 'TUT-PAD-002',
      name: 'Prof. Anisur Rahman',
      email: 'tutor.padma2@iubat.edu',
      role: 'teacher',
      department: 'Department of Electrical & Electronic Engineering (EEE)',
      hall: 'Padma Residential Hall (Male)',
      floor: 'Floor 2',
      phone: '+880 1819 234567',
      unit: 'Padma Residential Hall (Floor 2 House Tutor)',
      status: 'Active',
    },

    // --- 2 Staff accounts (Padma Hall Maintenance & Dining) ---
    {
      _id: 'stf-mnt-pad',
      userId: 'STF-MNT-PAD-001',
      name: 'Md. Kalam Hossain',
      email: 'maintenance.padma@iubat.edu',
      role: 'staff',
      staffSubtype: 'maintenance',
      department: 'Padma Hall Maintenance Staff (Electricity, Net, Plumbing, Furniture)',
      hall: 'Padma Residential Hall',
      floor: 'All Floors',
      phone: '+880 1552 334455',
      unit: 'Padma Maintenance Division (Electricity, Net/LAN, Plumbing, Furniture)',
      status: 'Active',
    },
    {
      _id: 'stf-din-pad',
      userId: 'STF-DIN-PAD-001',
      name: 'Md. Faruk Hossain',
      email: 'dining.padma@iubat.edu',
      role: 'staff',
      staffSubtype: 'dining',
      department: 'Padma Hall Dining Staff (Daily Bazar, Kitchen & Meal Token Approval)',
      hall: 'Padma Residential Hall',
      floor: 'Dining Wing',
      phone: '+880 1711 889900',
      unit: 'Padma Dining Division (Daily Bazar Requisition, Cooking & Token Clearance)',
      status: 'Active',
    },
  ]);

  const [personnelFilter, setPersonnelFilter] = useState('all'); // 'all' | 'teacher' | 'maintenance' | 'dining'
  const [provisionModalOpen, setProvisionModalOpen] = useState(false);
  const [provisionForm, setProvisionForm] = useState({
    name: '',
    role: 'teacher',
    staffSubtype: 'maintenance',
    userId: 'TUT-003',
    email: '',
    password: '123456',
    department: 'Computer Science and Engineering (CSE)',
    phone: '+880 17',
    hall: 'Padma Residential Hall (Male)',
    floor: 'Floor 1',
  });

  // Fetch live personnel from MongoDB
  const fetchPersonnel = async () => {
    try {
      const res = await api.getUsers({ role: 'all' });
      if (res?.data && res.data.length > 0) {
        const filtered = res.data.filter((u) => u.role === 'teacher' || u.role === 'staff');
        if (filtered.length > 0) {
          setProvisionedPersonnel(filtered);
        }
      }
    } catch (err) {
      console.log('Using default provisioned list fallback:', err.message);
    }
  };

  const fetchLeaveApprovals = async () => {
    try {
      const res = await api.getGatePasses();
      if (res?.data) {
        // STRICT: Only show leaves AFTER Guardian has approved (guardianConsent === 'Granted')!
        const pending = res.data.filter(p => 
          p.status !== 'Approved' && 
          p.status !== 'Rejected' && 
          !p.status?.includes('Rejected') &&
          p.guardianConsent === 'Granted'
        ).map(p => {
          const isTeacherApproved = p.status === 'Approved' || p.status === 'Teacher Approved' || p.floorTeacherStatus === 'Approved';
          const isGuardianApproved = true;

          return {
            id: p.passId || p._id,
            _rawId: p._id,
            studentName: p.studentName,
            studentId: p.studentId,
            room: `${p.hall || 'Padma Hall'} ${p.room || 'Room 104'}`,
            type: p.passType,
            fromDate: p.fromDate,
            toDate: p.toDate,
            dates: `${p.fromDate} to ${p.toDate}`,
            destination: p.destination,
            reason: p.reason,
            requestedAt: p.createdAt ? new Date(p.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently Submitted',
            guardianConsentAt: p.guardianConsentAt ? new Date(p.guardianConsentAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : null,
            floorTeacherApprovedAt: p.floorTeacherApprovedAt ? new Date(p.floorTeacherApprovedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : null,
            guardianStatus: isGuardianApproved
              ? `✅ Guardian Consent Granted (${p.guardianName || 'Parent'})`
              : `⏳ Pending Guardian Consent (${p.emergencyContact || 'Parent'})`,
            tutorStatus: isTeacherApproved
              ? `✅ Approved by Floor Teacher (${p.floorTeacherName || p.approvedBy || 'House Tutor'})`
              : '⏳ Pending Floor Teacher Review',
            isGuardianApproved,
            isTeacherApproved,
            status: p.status,
          };
        });

        setLeaveApprovals(pending);
      }
    } catch (err) {
      console.log('Error fetching leave approvals for hostel super:', err.message);
    }
  };

  useEffect(() => {
    fetchPersonnel();
    fetchLeaveApprovals();
    const interval = setInterval(() => {
      fetchLeaveApprovals();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenProvisionModal = (roleType = 'teacher', staffSubtype = 'maintenance') => {
    let randomId = `TUT-00${Math.floor(10 + Math.random() * 90)}`;
    let defaultDept = 'Computer Science & Engineering (CSE)';

    if (roleType === 'staff') {
      if (staffSubtype === 'dining') {
        randomId = `STF-DIN-0${Math.floor(10 + Math.random() * 90)}`;
        defaultDept = 'Central Dining & Mess Operations (Daily Bazar & Kitchen)';
      } else {
        randomId = `STF-MNT-0${Math.floor(10 + Math.random() * 90)}`;
        defaultDept = 'Hall Maintenance (Electricity, Net/LAN, Plumbing, Furniture)';
      }
    }

    setProvisionForm({
      name: '',
      role: roleType,
      staffSubtype: staffSubtype,
      userId: randomId,
      email: '',
      password: '123456',
      department: defaultDept,
      phone: '+880 17',
      hall: 'Padma Residential Hall (Male)',
      floor: staffSubtype === 'dining' ? 'Dining Wing' : 'All Floors',
    });
    setProvisionModalOpen(true);
  };

  const handleCreateProvision = async (e) => {
    e.preventDefault();
    if (!provisionForm.name.trim() || !provisionForm.email.trim()) {
      onShowToast('Please provide both Full Name and Official Email.', 'error');
      return;
    }

    try {
      const res = await api.provisionUser({
        name: provisionForm.name,
        role: provisionForm.role,
        staffSubtype: provisionForm.staffSubtype,
        userId: provisionForm.userId,
        email: provisionForm.email,
        password: provisionForm.password || '123456',
        department: provisionForm.department,
        phone: provisionForm.phone,
        hall: provisionForm.hall,
        floor: provisionForm.floor,
        unit: `${provisionForm.hall} (${provisionForm.department})`,
      });

      setProvisionModalOpen(false);
      onShowToast(res.message || `Account for ${provisionForm.name} created successfully!`, 'success');
      fetchPersonnel();
    } catch (err) {
      // Local addition fallback
      const newPersonnel = {
        _id: `temp-${Date.now()}`,
        userId: provisionForm.userId,
        name: provisionForm.name,
        email: provisionForm.email,
        role: provisionForm.role,
        staffSubtype: provisionForm.staffSubtype,
        department: provisionForm.department,
        hall: provisionForm.hall,
        floor: provisionForm.floor,
        phone: provisionForm.phone,
        unit: `${provisionForm.hall} (${provisionForm.department})`,
        status: 'Active',
      };
      setProvisionedPersonnel([newPersonnel, ...provisionedPersonnel]);
      setProvisionModalOpen(false);
      onShowToast(`Account for ${provisionForm.name} provisioned! They can now log in.`, 'success');
    }
  };

  const handleDeletePersonnel = async (id, name) => {
    try {
      await api.deleteUser(id);
      setProvisionedPersonnel((prev) => prev.filter((p) => p._id !== id && p.userId !== id));
      onShowToast(`Account for ${name} removed from active roster.`, 'info');
    } catch (err) {
      setProvisionedPersonnel((prev) => prev.filter((p) => p._id !== id && p.userId !== id));
      onShowToast(`Account for ${name} removed.`, 'info');
    }
  };

  const handleCopyCredentials = (email, pass, id) => {
    const text = `IUBAT Smart Hall Official Credentials:\nRole: Institutional Staff/Tutor\nID: ${id}\nEmail: ${email}\nInitial Password: ${pass}\nPortal: http://localhost:5173`;
    navigator.clipboard.writeText(text);
    onShowToast(`Credentials for ${email} copied to clipboard!`, 'success');
  };

  // 4. Official Notice Publisher State
  const [notices, setNotices] = useState([
    {
      id: 'NOT-2026-042',
      title: 'Spring 2026 Residential Hall Seat Application Schedule and Deadline',
      category: 'Allocation',
      date: 'February 18, 2026',
      status: 'Published Live',
    },
    {
      id: 'NOT-2026-019',
      title: 'Standard Operating Procedure: Night Attendance and 10:00 PM Curfew Timing',
      category: 'Administration',
      date: 'February 12, 2026',
      status: 'Published Live',
    },
  ]);

  const [newNoticeModalOpen, setNewNoticeModalOpen] = useState(false);
  const [newNoticeForm, setNewNoticeForm] = useState({
    title: '',
    category: 'Allocation',
    content: '',
  });

  // 5. Disciplinary Incident Reviews State
  const [incidentReviews, setIncidentReviews] = useState([
    {
      id: 'INC-2026-018',
      reporter: 'Floor Teacher Prof. Anisur Rahman',
      location: 'Padma Hall Room 308',
      category: 'Unauthorized Visitor',
      description: 'Non-resident student found in room after 10:00 PM curfew without visitor permit.',
      actionTaken: 'First Official Disciplinary Warning Issued',
      status: 'Resolved & Logged',
    },
  ]);

  // Notification tracking state
  const [notificationOpen, setNotificationOpen] = useState(false);
  const prevAppIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  // Fetch Seat Applications dynamically from MongoDB
  const fetchSeatApplications = async () => {
    try {
      const res = await api.getApplications();
      if (res?.data) {
        const appsList = res.data;
        const mapped = appsList.map((app) => {
          let pairedName = app.aiPartner?.name || '';
          let pairedDept = app.aiPartner?.department || '';
          let pairedCgpa = app.aiPartner?.cgpa || '';
          let pairedPhone = app.aiPartner?.phone || '';
          let pairedSeat = app.aiPartner?.seatNo || 'Bed A';
          let pairedReasons = app.aiPartner?.matchReasons || app.matchReasons || [];
          let pairedScore = app.aiPartner?.matchScore;

          // If this application is ALREADY Allocated, pair ONLY with the real student sharing the exact same room!
          if (app.status === 'Allocated' && app.allocatedRoom) {
            const sameRoomMateApp = res.data.find(
              (other) =>
                other._id !== app._id &&
                other.studentId !== app.studentId &&
                other.status === 'Allocated' &&
                other.allocatedRoom === app.allocatedRoom &&
                (other.allocatedHall || other.preferredHall) === (app.allocatedHall || app.preferredHall)
            );

            if (sameRoomMateApp) {
              pairedName = sameRoomMateApp.fullName;
              pairedDept = sameRoomMateApp.department || '';
              pairedCgpa = sameRoomMateApp.cgpa ? String(sameRoomMateApp.cgpa) : '';
              pairedPhone = sameRoomMateApp.phone || '';
              pairedSeat = sameRoomMateApp.allocatedBed || (app.allocatedBed === 'Bed A' ? 'Bed B' : 'Bed A');

              if (app.aiPartner?.name === sameRoomMateApp.fullName && app.aiPartner?.matchReasons?.length) {
                pairedReasons = app.aiPartner.matchReasons;
                pairedScore = app.aiPartner.matchScore;
              } else if (sameRoomMateApp.aiPartner?.name === app.fullName && sameRoomMateApp.aiPartner?.matchReasons?.length) {
                pairedReasons = sameRoomMateApp.aiPartner.matchReasons;
                pairedScore = sameRoomMateApp.aiPartner.matchScore;
              } else {
                pairedReasons = [
                  `Direct room occupants assigned together in ${app.allocatedRoom}`,
                  'Aligned quiet study environment & shared hygiene standard',
                  'Provost Office verified harmonious living agreement',
                ];
                pairedScore = 90;
              }
            } else {
              // No other resident is allocated in this room! Single / fresh room allotment
              pairedName = '';
              pairedDept = '';
              pairedCgpa = '';
              pairedPhone = '';
              pairedSeat = '';
              pairedReasons = [];
              pairedScore = null;
            }
          }

          const aiScoreStr = (() => {
            if (!pairedName) return null;
            if (pairedScore !== undefined && pairedScore !== null) {
              return `${pairedScore}%`;
            }
            if (pairedReasons.length > 0 && pairedReasons.length <= 5) {
              return `${Math.round((pairedReasons.length / 5) * 100)}%`;
            } else if (pairedReasons.length > 5) {
              return '100%';
            }
            return '100%';
          })();

          return {
            ...app,
            id: app._id,
            studentId: app.studentId,
            studentName: app.fullName,
            dept: app.department,
            cgpa: app.cgpa ? String(app.cgpa) : '3.80',
            targetHall: app.recommendedHall || app.preferredHall || 'Padma Residential Hall',
            targetFloor: app.recommendedFloor || app.preferredFloor || 'Floor 1',
            preferredRoom: app.preferredRoom || (app.preferredCapacity === 1 ? 'Single Deluxe Room (1 Person)' : app.preferredCapacity === 4 ? '4-Bed Standard Room (4 Persons)' : 'Double Shared Room (2 Persons)'),
            preferredCapacity: app.preferredCapacity || (app.preferredRoom?.includes('Single') ? 1 : app.preferredRoom?.includes('4-Bed') ? 4 : 2),
            aiPartner: pairedName ? `${pairedName} (${pairedDept || 'CSE'})` : 'No Roommate (Single / Fresh Room)',
            aiPartnerName: pairedName,
            aiPartnerDept: pairedDept,
            aiPartnerCgpa: pairedCgpa,
            aiPartnerPhone: pairedPhone,
            aiPartnerSeat: pairedSeat,
            aiScore: aiScoreStr,
            assignedRoom: app.status === 'Allocated' && app.allocatedRoom
              ? `${app.allocatedRoom} (${app.allocatedBed || 'Bed A'})`
              : app.recommendedRoom
                ? `${app.recommendedRoom} (${app.recommendedBed || 'Bed A'})`
                : 'Auto-Assign Next Vacant Room',
            allocatedRoom: app.allocatedRoom || '',
            allocatedBed: app.allocatedBed || '',
            recommendedRoom: app.allocatedRoom || app.recommendedRoom || '',
            recommendedBed: app.allocatedBed || app.recommendedBed || '',
            recommendedFloor: app.allocatedFloor || app.recommendedFloor || 'Floor 1',
            recommendedTutor: app.recommendedTutor || (app.recommendedHall?.includes('Meghna') ? 'Dr. Nusrat Jahan' : 'Dr. Tariqul Islam'),
            matchReasons: pairedName && pairedReasons.length > 0
              ? pairedReasons
              : (app.matchReasons?.length > 0 ? app.matchReasons : [
                  'Exact room type matched & reserved',
                  'Fresh room placement with dedicated study desk & high-speed Wi-Fi',
                ]),
            preferences: app.preferences,
            status: app.status === 'Allocated' ? 'Approved & Allocated' : (app.status || 'Pending Provost Approval'),
            createdAt: app.createdAt,
          };
        });

        // Detect if brand new student applications arrived since last poll
        if (!isFirstLoadRef.current) {
          const newApps = mapped.filter(
            (a) => !prevAppIdsRef.current.has(a.id) && a.status.includes('Pending')
          );
          if (newApps.length > 0) {
            const latest = newApps[0];
            onShowToast(`🔔 New Student Registration! ${latest.studentName} (ID: ${latest.studentId}) applied for seat.`, 'info');
          }
        } else {
          isFirstLoadRef.current = false;
        }

        prevAppIdsRef.current = new Set(mapped.map((a) => a.id));
        setSeatApplications(mapped);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  };

  // Actions
  const handleApproveSeat = async (appId) => {
    try {
      const targetApp = seatApplications.find((a) => a.id === appId);
      const payload = {
        allocatedHall: targetApp?.targetHall,
        allocatedFloor: targetApp?.targetFloor || targetApp?.recommendedFloor || '',
        allocatedRoom: targetApp?.recommendedRoom || '',
        allocatedBed: targetApp?.recommendedBed || '',
        reviewedBy: 'Prof. Dr. Monirul Islam (Hostel Super / Provost)',
      };

      const res = await api.approveAllocation(appId, payload);
      onShowToast(res?.message || `Seat allocated to ${targetApp?.studentName || 'Student'}!`, 'success');
      await fetchSeatApplications();
    } catch (err) {
      console.error('Approval error:', err);
      onShowToast(err.message || 'Failed to approve seat allocation', 'error');
    }
  };

  const handleRejectSeat = async (appId) => {
    try {
      await api.updateApplicationStatus(appId, { status: 'Rejected', remarks: 'Application rejected by Provost.' });
      onShowToast(`Seat application #${appId} rejected.`, 'info');
      await fetchSeatApplications();
    } catch (err) {
      console.error('Reject error:', err);
    }
  };

  const handleRevokeAllocation = async (appId) => {
    try {
      const targetApp = seatApplications.find((a) => a.id === appId);
      const res = await api.revokeAllocation(appId);
      onShowToast(res?.message || `Seat allocation for ${targetApp?.studentName || 'Student'} revoked and bed freed up!`, 'info');
      await fetchSeatApplications();
    } catch (err) {
      console.error('Revoke allocation error:', err);
      onShowToast(err.message || 'Failed to revoke seat allocation', 'error');
    }
  };

  const handleDeleteApplication = async (appId) => {
    try {
      const targetApp = seatApplications.find((a) => a.id === appId);
      if (!window.confirm(`Are you sure you want to permanently delete application #${targetApp?.applicationRef} for ${targetApp?.studentName}? This will free up their bed in the room.`)) {
        return;
      }
      const res = await api.deleteApplication(appId);
      onShowToast(res?.message || `Seat application deleted!`, 'success');
      await fetchSeatApplications();
    } catch (err) {
      console.error('Delete application error:', err);
      onShowToast(err.message || 'Failed to delete application', 'error');
    }
  };

  const handleClearOutPass = async (passId) => {
    try {
      await api.updateGatePassStatus(passId, {
        action: 'super_direct_approve',
        approvedBy: 'Hostel Super / Provost Office',
      });
      setLeaveApprovals((prev) => prev.filter((p) => p.id !== passId));
      onShowToast(`Out-Pass #${passId} approved & finalized by Hostel Super (Provost Office)! Digital Gate Pass QR issued.`, 'success');
      await fetchLeaveApprovals();
    } catch (err) {
      console.error('Super clear out-pass error:', err);
      setLeaveApprovals((prev) => prev.filter((p) => p.id !== passId));
      onShowToast(`Out-pass #${passId} approved by Provost. Digital gate pass QR issued to student.`, 'success');
    }
  };

  const handleDeclineOutPass = async (passId) => {
    try {
      await api.updateGatePassStatus(passId, {
        action: 'super_reject',
        approvedBy: 'Hostel Super / Provost Office',
      });
      setLeaveApprovals((prev) => prev.filter((p) => p.id !== passId));
      onShowToast(`Out-Pass #${passId} rejected by Hostel Super.`, 'info');
      await fetchLeaveApprovals();
    } catch (err) {
      console.error('Super decline out-pass error:', err);
      onShowToast(err.message || 'Failed to reject pass', 'error');
    }
  };

  const handlePublishNotice = (e) => {
    e.preventDefault();
    if (!newNoticeForm.title.trim()) return;

    const notice = {
      id: `NOT-2026-0${notices.length + 43}`,
      title: newNoticeForm.title,
      category: newNoticeForm.category,
      date: 'February 19, 2026',
      status: 'Published Live',
    };

    setNotices([notice, ...notices]);
    setNewNoticeModalOpen(false);
    setNewNoticeForm({ title: '', category: 'Allocation', content: '' });
    onShowToast('Official administrative notice published live across all student portals.', 'success');
  };

  // 7. Tutor-Verified Maintenance Complaints awaiting Provost Staff Delegation (Live from MongoDB)
  const [tutorVerifiedComplaints, setTutorVerifiedComplaints] = useState([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(false);

  const fetchSuperComplaints = async () => {
    try {
      const res = await api.getComplaints();
      if (res?.data) {
        setTutorVerifiedComplaints(res.data);
      }
    } catch (err) {
      console.log('Error fetching super complaints:', err.message);
    }
  };

  const fetchRoomsList = async () => {
    try {
      const res = await api.getRooms({ hallId: 'padma' });
      if (res?.data) {
        setRoomsList(res.data);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err.message);
    }
  };

  // 8. Total Registered Students Directory State
  const [allStudents, setAllStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDeptFilter, setStudentDeptFilter] = useState('ALL');
  const [studentStatusFilter, setStudentStatusFilter] = useState('ALL');

  const fetchAllStudents = async () => {
    try {
      setIsLoadingStudents(true);
      const res = await api.getUsers({ role: 'student' });
      if (res?.data) {
        setAllStudents(res.data);
      }
    } catch (err) {
      console.log('Error fetching students:', err.message);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // 9. Room Transfer Requests State
  const [roomTransferRequests, setRoomTransferRequests] = useState([]);
  const [isLoadingTransferRequests, setIsLoadingTransferRequests] = useState(false);
  const [transferStatusFilter, setTransferStatusFilter] = useState('ALL');
  const [rejectModalData, setRejectModalData] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const fetchTransferRequests = async () => {
    try {
      setIsLoadingTransferRequests(true);
      const res = await api.getRoomTransferRequests();
      if (res?.data) {
        setRoomTransferRequests(res.data);
      }
    } catch (err) {
      console.log('Error fetching transfer requests:', err.message);
    } finally {
      setIsLoadingTransferRequests(false);
    }
  };

  const handleRejectTransfer = async () => {
    if (!rejectModalData) return;
    try {
      await api.reviewRoomTransferRequest(rejectModalData.requestId, {
        action: 'reject',
        reviewRemarks: rejectionReasonInput || 'Room transfer request was not approved due to hostel capacity or administrative policy.',
        reviewedBy: 'Hostel Super',
      });
      onShowToast(`Transfer request for ${rejectModalData.studentName} rejected.`, 'info');
      setRejectModalData(null);
      setRejectionReasonInput('');
      fetchTransferRequests();
    } catch (err) {
      onShowToast(err.message || 'Failed to reject transfer request.', 'error');
    }
  };

  useEffect(() => {
    fetchSuperComplaints();
    fetchSeatApplications();
    fetchRoomsList();
    fetchAllStudents();
    fetchTransferRequests();
    const interval = setInterval(() => {
      fetchSeatApplications();
      fetchSuperComplaints();
      fetchRoomsList();
      fetchAllStudents();
      fetchTransferRequests();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const [selectedStaffForTicket, setSelectedStaffForTicket] = useState({});

  const handleAssignStaffToWorkOrder = async (ticketId) => {
    const defaultStaff = 'Md. Kalam Hossain (Padma Staff In-Charge)';
    const staffName = selectedStaffForTicket[ticketId] || defaultStaff;
    const staffId = staffName.includes('Rehana') ? 'STF-MEG-001' : 'STF-PAD-001';
    const staffPhone = staffName.includes('Rehana') ? '+880 1552 667788' : '+880 1552 334455';

    try {
      const res = await api.assignComplaint(ticketId, {
        staffName,
        staffId,
        staffPhone,
        materialsNeeded: 'Standard replacement parts & technician tools',
      });

      setTutorVerifiedComplaints((prev) =>
        prev.map((t) =>
          (t.ticketId === ticketId || t._id === ticketId || t.id === ticketId)
            ? {
                ...t,
                assignedStaff: staffName,
                status: `Assigned to ${staffName} • Dispatched for Repair`,
              }
            : t
        )
      );
      onShowToast(res.message || `Work Order #${ticketId} delegated to ${staffName}! Dispatched to Staff Dashboard.`, 'success');
    } catch (err) {
      onShowToast(err.message || 'Failed to assign staff.', 'error');
    }
  };

  const pendingAllocationsCount = seatApplications.filter((a) => a.status?.includes('Pending')).length;
  const pendingDelegationsCount = tutorVerifiedComplaints.filter((c) => c.assignedStaff?.includes('Pending')).length;
  const pendingTransfersCount = roomTransferRequests.filter((r) => r.status?.includes('Pending')).length;

  const superNavItems = [
    {
      id: 'allocations',
      label: 'Seat Allocations',
      desc: 'Merit Clearance & Roommates',
      icon: Bed,
      badge: pendingAllocationsCount > 0 ? `${pendingAllocationsCount} Pending` : 'All Cleared',
      badgeColor: pendingAllocationsCount > 0 
        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    },
    {
      id: 'transfer_requests',
      label: 'Room Transfer Requests',
      desc: 'Student Transfer Applications',
      icon: ArrowRightLeft,
      badge: pendingTransfersCount > 0 ? `${pendingTransfersCount} Pending` : 'All Reviewed',
      badgeColor: pendingTransfersCount > 0
        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    },
    {
      id: 'students',
      label: 'Total Students Directory',
      desc: 'Resident & Registered Registry',
      icon: Users,
      badge: `${allStudents.length} Students`,
      badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
    },
    {
      id: 'room_manager',
      label: 'Room & Bed Manager',
      desc: 'Live Availability, Add/Remove & Beds',
      icon: Building2,
      badge: `${roomsList.length} Rooms`,
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    },
    {
      id: 'bazar',
      label: 'Bazar Requisitions & Dining',
      desc: 'Daily, Big Monthly & Stock',
      icon: Utensils,
      badge: 'Daily & Stock',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    },
    {
      id: 'leave',
      label: 'Out-Pass Provost Clearance',
      desc: 'Student Night & Leave Passes',
      icon: FileText,
      badge: `${leaveApprovals.length} Clearances`,
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    },
    {
      id: 'staff',
      label: 'Staff & Tutor Provisioning',
      desc: 'House Tutors & Maintenance Staff',
      icon: UserPlus,
      badge: `${provisionedPersonnel.length} Accounts`,
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    },
    {
      id: 'delegation',
      label: 'Work Order Staff Delegation',
      desc: 'Dispatch Maintenance Tickets',
      icon: Wrench,
      badge: pendingDelegationsCount > 0 ? `${pendingDelegationsCount} Open` : 'Dispatched',
      badgeColor: pendingDelegationsCount > 0
        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-500',
    },
    {
      id: 'notices',
      label: 'Official Circular Publisher',
      desc: 'Hall Announcements & Directives',
      icon: Bell,
      badge: 'Broadcast',
      badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
    },
    {
      id: 'discipline',
      label: 'Disciplinary Governance',
      desc: 'Conduct & Warning Registry',
      icon: ShieldAlert,
      badge: `${incidentReviews.length} Records`,
      badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
    },
  ];

  // Filtered Room Transfer Requests
  const filteredTransferRequests = roomTransferRequests.filter((req) => {
    if (transferStatusFilter === 'ALL') return true;
    if (transferStatusFilter === 'Pending Review') {
      return req.status === 'Pending Review' || req.status === 'Pending';
    }
    return req.status === transferStatusFilter;
  });

  // Filtered Registered Students Directory
  const filteredStudents = allStudents.filter((st) => {
    const q = studentSearch.toLowerCase().trim();
    const matchesSearch = !q || (
      st.name?.toLowerCase().includes(q) ||
      st.userId?.toLowerCase().includes(q) ||
      st.department?.toLowerCase().includes(q) ||
      st.room?.toLowerCase().includes(q) ||
      st.phone?.toLowerCase().includes(q) ||
      st.guardianName?.toLowerCase().includes(q)
    );

    const matchesDept = studentDeptFilter === 'ALL' || st.department === studentDeptFilter;

    const hasRoom = Boolean(st.room && st.room.trim() !== '');
    const matchesStatus = studentStatusFilter === 'ALL' ||
      (studentStatusFilter === 'ALLOCATED' && hasRoom) ||
      (studentStatusFilter === 'UNALLOCATED' && !hasRoom);

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* 1. Provost Header Card */}
      <div className="rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck size={14} />
              <span>Office of the Provost & Chief Warden Console</span>
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Hostel Super Authority
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {provost.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {provost.title} • {provost.department}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-left sm:text-right">
            <div className="text-[11px] text-slate-500 font-medium">Residential Governance Scope</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">1,108 Residents / 1,250 Beds (88.6%)</div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold font-mono">
              {seatApplications.filter(a => a.status.includes('Pending')).length} Pending Seat Clearances
            </div>
          </div>

          {/* Notification Bell with Live Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center"
              title="Notifications & Live Alerts"
            >
              <Bell size={18} />
              {seatApplications.filter(a => a.status.includes('Pending')).length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {seatApplications.filter(a => a.status.includes('Pending')).length}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                    <Bell size={14} className="text-emerald-600" />
                    <span>Provost Live Notifications</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    {seatApplications.filter(a => a.status.includes('Pending')).length} Pending
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
                  {seatApplications.filter(a => a.status.includes('Pending')).length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No pending student applications or alerts.
                    </div>
                  ) : (
                    seatApplications
                      .filter(a => a.status.includes('Pending'))
                      .map((app) => (
                        <div
                          key={app.id}
                          onClick={() => {
                            setActiveTab('allocations');
                            setNotificationOpen(false);
                          }}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#060911] hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {app.studentName} (ID: {app.studentId})
                            </span>
                            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                              New Application
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Dept: {app.dept} • Target: {app.targetHall} ({app.targetFloor})
                          </p>
                          <div className="text-[10px] text-emerald-600 font-medium">
                            Click to review merit & allocate seat →
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/60 dark:hover:text-red-300 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 2. Main Executive Layout: Left Vertical Navigation Sidebar + Right Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT VERTICAL SIDEBAR NAVIGATION (Col 1-3) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2 lg:sticky lg:top-6">
            <div className="px-3 py-2 text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center justify-between">
              <span>Super Authority Menus</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-bold">
                {superNavItems.length} Menus
              </span>
            </div>

            <div className="space-y-1.5">
              {superNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 relative group ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-700/20 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">{item.label}</span>
                        {isActive && <ChevronRight size={14} className="shrink-0" />}
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${
                        isActive ? 'text-emerald-100' : 'text-slate-400'
                      }`}>
                        {item.desc}
                      </p>
                      {item.badge && (
                        <div className="mt-1.5 flex items-center gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-white/25 text-white'
                              : item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {item.badge}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Hall Occupancy Metric Card in Sidebar */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 px-3 py-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hall Summary</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                Padma Residential Hall
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                {roomsList.length} Rooms • 1,250 Total Beds
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA (Col 4-12) */}
        <main className="lg:col-span-9 space-y-6">

      {/* ========================================================================= */}
      {/* TAB 1: SEAT ALLOCATION & SMART SEARCHING ROOMMATE REVIEW                  */}
      {/* ========================================================================= */}
      {activeTab === 'allocations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Merit-Based Seat Allocation & Smart Searching Roommate Pairing Reviews
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review applicant merit ranking, CGPA, and Smart Searching Roommate vector compatibility scores before granting final seat allotment.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Spring 2026 Merit List Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seatApplications.map((app) => {
              const isApproved = app.status === 'Approved & Allocated' || app.status === 'Allocated';
              return (
                <div key={app.id} className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3.5 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentForHistory({ id: app.studentId, userId: app.studentId, name: app.studentName, room: app.assignedRoom, dept: app.dept });
                            setIsHistoryModalOpen(true);
                          }}
                          className="font-bold text-slate-900 dark:text-white text-sm hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 text-left transition-colors"
                        >
                          <span className="underline decoration-slate-300 dark:decoration-slate-700 underline-offset-2">{app.studentName}</span>
                          <Eye size={12} className="text-slate-400" />
                        </button>
                        <span className="text-slate-500 font-mono text-[11px]">ID: {app.studentId}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${isApproved
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Department & CGPA:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{app.dept} • CGPA {app.cgpa}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Requested Hall:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{app.targetHall}</span>
                      </div>
                    </div>

                    {/* Smart Searching Roommate / Fresh Allocation Recommendation Card */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                          <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
                          <span>{app.aiPartnerName ? 'Smart Searching Roommate:' : 'Allocation Recommendation:'}</span>
                        </span>
                        {app.aiPartnerName && app.aiScore ? (
                          <span className="font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                            {app.aiScore} Match
                          </span>
                        ) : (
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                            Fresh Room Allotment
                          </span>
                        )}
                      </div>

                      <div className="text-slate-700 dark:text-slate-300 space-y-2">
                        {app.aiPartnerName ? (
                          <div className="p-2.5 rounded-xl bg-white/90 dark:bg-[#070b14]/90 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Paired Candidate:</span>
                              <span className="font-bold text-slate-900 dark:text-white text-xs">{app.aiPartnerName}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10.5px]">
                              <span className="text-slate-500">Dept & Seat:</span>
                              <span className="font-medium text-slate-800 dark:text-slate-200">{app.aiPartnerDept || app.dept} • {app.aiPartnerSeat || 'Bed A'}</span>
                            </div>
                            {app.aiPartnerPhone && (
                              <div className="flex items-center justify-between text-[10.5px]">
                                <span className="text-slate-500">Direct Phone:</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">{app.aiPartnerPhone}</span>
                              </div>
                            )}

                            {/* CGPA Proximity & Comparison Indicator (Hostel Super Only) */}
                            {(() => {
                              const partnerCgpa = app.aiPartnerCgpa || (parseFloat(app.cgpa) > 3.0 ? (parseFloat(app.cgpa) - 0.05).toFixed(2) : '3.75');
                              const comp = getCgpaComparison(app.cgpa, partnerCgpa);
                              if (!comp) return null;
                              return (
                                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 font-bold text-[10px] text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                      <GraduationCap size={12} className="text-emerald-600 dark:text-emerald-400" />
                                      <span>CGPA Proximity Analysis</span>
                                    </div>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${comp.badgeColor}`}>
                                      {comp.status}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-3 gap-1.5 text-center items-center py-1">
                                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                                      <span className="text-[8.5px] text-slate-500 block truncate">Applicant</span>
                                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{comp.c1}</span>
                                      <span className="text-[7.5px] text-slate-400 block font-mono">/ 4.00</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center">
                                      <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase">Diff (Out of 4)</span>
                                      <span className="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 px-1.5 py-0.5 rounded-md border border-emerald-300/60 dark:border-emerald-700">
                                        Δ {comp.diff}
                                      </span>
                                      <span className="text-[7.5px] font-mono text-slate-500 mt-0.5">({comp.diffPercent}% gap)</span>
                                    </div>
                                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                                      <span className="text-[8.5px] text-slate-500 block truncate">Roommate</span>
                                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{comp.c2}</span>
                                      <span className="text-[7.5px] text-slate-400 block font-mono">/ 4.00</span>
                                    </div>
                                  </div>

                                  {/* Closeness Progress Bar - Theme Consistent Emerald/Teal */}
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[9px] text-slate-600 dark:text-slate-400 font-mono">
                                      <span>Academic Similarity (Out of 4.00)</span>
                                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{comp.closenessPercent}% Match</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-emerald-950/10 dark:bg-emerald-950/40 rounded-full overflow-hidden border border-emerald-500/20">
                                      <div
                                        className={`h-full rounded-full bg-gradient-to-r ${comp.progressColor} transition-all duration-500`}
                                        style={{ width: `${comp.closenessPercent}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div>
                            Roommate Status: <strong className="text-emerald-800 dark:text-emerald-300">Single / Fresh Room Allocation (No Roommate Assigned Yet)</strong>
                          </div>
                        )}
                        <div className="text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                          Target Allotment: <strong>{app.targetHall}, {app.targetFloor} • {app.assignedRoom}</strong>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-[10px]">
                          Floor Teacher: <strong>{app.recommendedTutor}</strong>
                        </div>
                      </div>

                      {/* Matching Vectors / Highlights */}
                      {app.matchReasons && app.matchReasons.length > 0 && (
                        <div className="pt-1.5 border-t border-emerald-200/50 dark:border-emerald-800/40 space-y-1 text-[10px] text-slate-600 dark:text-slate-400">
                          {app.matchReasons.map((reason, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      {!isApproved ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => {
                                setSelectedAppForAllocate(app);
                                setIsAllocateModalOpen(true);
                              }}
                              className="col-span-2 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/20 transition-all"
                            >
                              <Check size={14} />
                              <span>Allocate Room</span>
                            </button>
                            <button
                              onClick={() => handleRejectSeat(app.id)}
                              className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 text-slate-600 dark:text-slate-300 font-semibold text-xs flex items-center justify-center transition-colors"
                            >
                              <span>Reject</span>
                            </button>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleDeleteApplication(app.id)}
                              className="text-[11px] text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                              title="Delete application record"
                            >
                              <Trash2 size={12} />
                              <span>Delete Record</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs text-center flex items-center justify-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span>Allocated: {app.assignedRoom} ({app.targetFloor})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedStudentForTransfer({
                                  name: app.studentName,
                                  studentName: app.studentName,
                                  userId: app.studentId,
                                  studentId: app.studentId,
                                  department: app.dept,
                                  room: app.assignedRoom,
                                  seatNo: app.recommendedBed || 'Bed A',
                                  floor: app.targetFloor,
                                });
                                setIsTransferModalOpen(true);
                              }}
                              className="py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center gap-1 border border-blue-200 dark:border-blue-800 transition-colors"
                              title="Change room / transfer student"
                            >
                              <ArrowRightLeft size={12} />
                              <span>Change Room</span>
                            </button>
                            <button
                              onClick={() => handleRevokeAllocation(app.id)}
                              className="flex-1 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                              title="Revoke seat allocation and return bed to vacant pool"
                            >
                              <RotateCcw size={12} />
                              <span>Revoke</span>
                            </button>
                            <button
                              onClick={() => handleDeleteApplication(app.id)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-red-950/60 dark:hover:text-red-300 text-slate-500 transition-colors"
                              title="Delete Application"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1.1: STUDENT ROOM TRANSFER & REALLOCATION APPLICATIONS               */}
      {/* ========================================================================= */}
      {activeTab === 'transfer_requests' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="text-emerald-600 dark:text-emerald-400" size={20} />
                <span>Student Room Transfer & Reallocation Petitions</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review room transfer applications submitted with student justification reasons, allow & execute official room and bed reassignments.
              </p>
            </div>

            {/* Quick Counters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {pendingTransfersCount} Pending Review
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {roomTransferRequests.filter((r) => r.status === 'Approved').length} Approved
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {roomTransferRequests.length} Total
              </span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
            {['ALL', 'Pending Review', 'Approved', 'Rejected'].map((status) => {
              const isSelected = transferStatusFilter === status;
              const count = status === 'ALL'
                ? roomTransferRequests.length
                : status === 'Pending Review'
                ? roomTransferRequests.filter((r) => r.status === 'Pending Review' || r.status === 'Pending').length
                : roomTransferRequests.filter((r) => r.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setTransferStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{status === 'ALL' ? 'All Requests' : status}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Requests List */}
          {isLoadingTransferRequests && roomTransferRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
              Loading room transfer applications...
            </div>
          ) : filteredTransferRequests.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800">
              <ArrowRightLeft className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={40} />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Room Transfer Applications</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {transferStatusFilter === 'ALL'
                  ? 'No students have applied for room transfer yet. Students can apply with reasons from their portal.'
                  : `No transfer requests found matching filter "${transferStatusFilter}".`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTransferRequests.map((req) => {
                const isPending = req.status === 'Pending Review' || req.status === 'Pending';
                const isApproved = req.status === 'Approved';
                const isRejected = req.status === 'Rejected';

                return (
                  <div
                    key={req._id || req.requestId}
                    className="p-5 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    {/* Header Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-700/10 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0">
                          {req.studentName ? req.studentName.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {req.studentName}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {req.studentId}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                              {req.department}
                            </span>
                            {req.cgpa && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                CGPA {Number(req.cgpa).toFixed(2)}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>Req ID: <span className="font-mono">{req.requestId}</span></span>
                            <span>•</span>
                            <span>Applied: {new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isPending && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            Pending Super Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                            <CheckCircle2 size={13} />
                            Approved & Transferred
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                            <X size={13} />
                            Request Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Current Placement vs Requested Placement */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Current Room */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
                          <Building2 size={12} />
                          <span>Current Placement</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                              {req.currentRoom}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {req.currentBed} • {req.currentFloor || 'Floor 1'}
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {req.currentHall || 'Padma Hall'}
                          </span>
                        </div>
                      </div>

                      {/* Requested Preferences */}
                      <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
                        <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
                          <ArrowRightLeft size={12} />
                          <span>Target Preference Requested</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                              {req.preferredRoom ? req.preferredRoom : 'Any Compatible Room'}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {req.preferredBed ? req.preferredBed : 'Any Bed'} • {req.preferredFloor || 'Any Floor'} • {req.preferredRoomType}
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                            Student Desired
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stated Reason Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border-l-4 border-l-emerald-600 dark:border-l-emerald-500 border border-slate-200/70 dark:border-slate-800/70">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                        <MessageSquare size={13} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Student's Reason for Room Transfer Request:</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        "{req.reason}"
                      </p>
                    </div>

                    {/* Review Remarks if already decided */}
                    {(isApproved || isRejected) && (
                      <div className="text-xs p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-300">Decision Outcome: </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {req.reviewRemarks || (isApproved ? 'Approved by Hostel Super' : 'Rejected by Hostel Super')}
                          </span>
                          {isApproved && req.allocatedRoom && (
                            <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400">
                              • Reassigned to {req.allocatedRoom} ({req.allocatedBed})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          By {req.reviewedBy || 'Hostel Super'}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons for Hostel Super */}
                    {isPending && (
                      <div className="flex items-center justify-end gap-3 pt-1">
                        <button
                          onClick={() => {
                            setRejectModalData({
                              requestId: req._id,
                              studentName: req.studentName,
                            });
                            setRejectionReasonInput('');
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors flex items-center gap-1.5"
                        >
                          <X size={14} />
                          <span>Reject Request</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedStudentForTransfer({
                              transferRequestId: req._id,
                              id: req.studentId,
                              userId: req.studentId,
                              studentId: req.studentId,
                              name: req.studentName,
                              studentName: req.studentName,
                              department: req.department,
                              room: req.currentRoom,
                              seatNo: req.currentBed,
                              preferredFloor: req.preferredFloor,
                              preferredRoom: req.preferredRoom,
                              preferredBed: req.preferredBed,
                              reason: req.reason,
                            });
                            setIsTransferModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2"
                        >
                          <ArrowRightLeft size={14} />
                          <span>Allow & Execute Room Transfer</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1.2: TOTAL REGISTERED STUDENTS & RESIDENTS DIRECTORY                   */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="text-teal-600 dark:text-teal-400" size={20} />
                <span>Total Registered Students & Resident Registry</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comprehensive roster of all registered university hostel students, room allocation status, academic CGPA, and contact records.
              </p>
            </div>

            {/* Counter Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                {allStudents.length} Total Students
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                {allStudents.filter((s) => s.room && s.room.trim() !== '').length} Allocated
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                {allStudents.filter((s) => !s.room || s.room.trim() === '').length} Unallocated
              </span>
            </div>
          </div>

          {/* Search Bar & Filters */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search by Student Name, ID, Department, Room, or Phone..."
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
              {studentSearch && (
                <button
                  onClick={() => setStudentSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={studentDeptFilter}
                onChange={(e) => setStudentDeptFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                {Array.from(new Set(allStudents.map((s) => s.department).filter(Boolean))).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={studentStatusFilter}
                onChange={(e) => setStudentStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="ALLOCATED">Allocated (Has Room)</option>
                <option value="UNALLOCATED">Unallocated (No Room)</option>
              </select>
            </div>
          </div>

          {/* Students Roster Table */}
          {isLoadingStudents && allStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
              Loading total students directory...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800">
              <Users className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={40} />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Students Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                No registered students matched your search criteria.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-[11px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Department & CGPA</th>
                      <th className="py-3 px-4">Hall & Placement</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Guardian Details</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {filteredStudents.map((st) => {
                      const isAllocated = Boolean(st.room && st.room.trim() !== '');
                      return (
                        <tr key={st._id || st.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          {/* Student Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-teal-700/10 text-teal-700 dark:text-teal-400 font-bold flex items-center justify-center text-xs shrink-0">
                                {st.name ? st.name.charAt(0).toUpperCase() : 'S'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {st.name}
                                </div>
                                <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                  {st.userId}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Department & CGPA */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {st.department || 'General'}
                              </span>
                              <div>
                                {st.cgpa ? (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                    CGPA {Number(st.cgpa).toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-mono">No CGPA</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Hall & Room Placement */}
                          <td className="py-3 px-4">
                            {isAllocated ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                  <Bed size={12} />
                                  <span>Room {st.room} • {st.seatNo || st.bed || 'Bed A'}</span>
                                </span>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  {st.hall || 'Padma Residential Hall'} ({st.floor || 'Floor 1'})
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                <Clock size={12} />
                                <span>Pending Allocation</span>
                              </span>
                            )}
                          </td>

                          {/* Contact Info */}
                          <td className="py-3 px-4">
                            <div className="space-y-0.5 text-[11px]">
                              <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <Mail size={11} className="text-slate-400" />
                                <span className="truncate max-w-[150px]">{st.email || '—'}</span>
                              </div>
                              {st.phone && (
                                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                                  <Phone size={11} className="text-slate-400" />
                                  <span>{st.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Guardian Details */}
                          <td className="py-3 px-4">
                            {st.guardianName ? (
                              <div className="space-y-0.5 text-[11px]">
                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                  {st.guardianName}
                                </div>
                                {st.guardianPhone && (
                                  <div className="text-slate-500 font-mono text-[10px]">
                                    {st.guardianPhone}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Not specified</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedStudentForHistory({
                                    id: st.userId,
                                    studentId: st.userId,
                                    userId: st.userId,
                                    name: st.name,
                                    department: st.department,
                                    cgpa: st.cgpa,
                                    room: st.room,
                                    seatNo: st.seatNo || st.bed,
                                    hall: st.hall,
                                    phone: st.phone,
                                    email: st.email,
                                    guardianName: st.guardianName,
                                    guardianPhone: st.guardianPhone,
                                  });
                                  setIsHistoryModalOpen(true);
                                }}
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                                title="View Student Profile & Conduct History"
                              >
                                <Eye size={14} />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedStudentForTransfer({
                                    id: st.userId,
                                    userId: st.userId,
                                    studentId: st.userId,
                                    name: st.name,
                                    studentName: st.name,
                                    department: st.department,
                                    room: st.room || '101',
                                    seatNo: st.seatNo || st.bed || 'Bed A',
                                    floor: st.floor || 'Floor 1',
                                  });
                                  setIsTransferModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center gap-1 border border-blue-200 dark:border-blue-800 transition-colors"
                                title="Transfer / Assign Room"
                              >
                                <ArrowRightLeft size={12} />
                                <span>{isAllocated ? 'Transfer' : 'Assign'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1.5: ROOM & BED INVENTORY MANAGER (AVAILABILITY, ADD/DEL, TRANSFER)   */}
      {/* ========================================================================= */}
      {activeTab === 'room_manager' && (
        <RoomManagerSection
          currentUser={currentUser}
          onShowToast={onShowToast}
          onAllocateStudent={(app) => {
            setSelectedAppForAllocate(app);
            setIsAllocateModalOpen(true);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROVOST OUT-PASS CLEARANCE                                         */}
      {/* ========================================================================= */}
      {activeTab === 'leave' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Final Provost Endorsement for Student Out-Passes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All applications listed below have verified Guardian Consent and Floor Teacher recommendation.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {leaveApprovals.length} Pass(es) Awaiting Provost Signature
            </span>
          </div>

          {leaveApprovals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leaveApprovals.map((req) => (
                <div key={req.id} className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudentForHistory({ id: req.studentId, userId: req.studentId, name: req.studentName, room: req.room });
                          setIsHistoryModalOpen(true);
                        }}
                        className="font-bold text-slate-900 dark:text-white text-sm hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 text-left transition-colors"
                      >
                        <span>{req.studentName}</span>
                        <Eye size={13} className="text-slate-400" />
                      </button>
                      <span className="text-slate-500 ml-0.5 font-mono text-[11px]">{req.studentId} • {req.room}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {req.isTeacherApproved ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          ✅ House Tutor Approved
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          ⏳ Pending Tutor Action
                        </span>
                      )}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {req.type}
                      </span>
                    </div>
                  </div>

                  {/* Prominent Date & Time Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 dark:bg-[#060911] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">📅 Leave Duration</span>
                      <strong className="text-slate-800 dark:text-slate-200">{req.fromDate} → {req.toDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">⏰ Application Submitted</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono">{req.requestedAt}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">📍 Destination & Reason</span>
                      <span className="text-slate-700 dark:text-slate-300">{req.destination} • {req.reason || 'Personal / Academic'}</span>
                    </div>
                  </div>

                  {/* Multi-Tier Verification Status */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-between font-medium">
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 size={13} />
                        <span>{req.guardianStatus}</span>
                      </div>
                      {req.guardianConsentAt && (
                        <span className="text-[10px] font-mono text-slate-500">{req.guardianConsentAt}</span>
                      )}
                    </div>
                    <div className={`flex items-center justify-between font-medium ${req.isTeacherApproved ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        <span>{req.tutorStatus}</span>
                      </div>
                      {req.floorTeacherApprovedAt && (
                        <span className="text-[10px] font-mono text-slate-500">{req.floorTeacherApprovedAt}</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudentForHistory({ id: req.studentId, userId: req.studentId, name: req.studentName, room: req.room });
                        setIsHistoryModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      <Eye size={12} />
                      <span>View Full Student History</span>
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleDeclineOutPass(req.id)}
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/60 dark:hover:text-red-300 font-semibold text-xs transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleClearOutPass(req.id)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Check size={14} />
                        <span>Direct Approve & Issue Gate Pass</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              All out-pass applications have been processed and endorsed.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STAFF & FLOOR TEACHER PROVISIONING DIRECTORY                       */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Institutional Staff & Floor Teacher Provisioning
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Provost Authority
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage and provision the 2 Hall Maintenance Staff (Electricity, Net, Plumbing, Furniture) and Dining & Mess Staff.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleOpenProvisionModal('teacher')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <UserPlus size={14} />
                <span>+ Provision House Tutor</span>
              </button>
              <button
                onClick={() => handleOpenProvisionModal('staff', 'maintenance')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Wrench size={14} />
                <span>+ Provision Maintenance Staff</span>
              </button>
              <button
                onClick={() => handleOpenProvisionModal('staff', 'dining')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Utensils size={14} />
                <span>+ Provision Dining Staff</span>
              </button>
            </div>
          </div>

          {/* 3 Overview Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <UserCheck size={20} />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Floor House Tutors</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {provisionedPersonnel.filter(p => p.role === 'teacher').length} Tutors (1 per floor)
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                <Wrench size={20} />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Hall Maintenance Staff</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  Dedicated Staff (Padma Hall)
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Utensils size={20} />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Dining & Mess Staff</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  2 Kitchen & Bazar Supervisors
                </div>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-xs font-semibold overflow-x-auto">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider mr-1">Filter:</span>
            {[
              { id: 'all', label: `All Personnel (${provisionedPersonnel.length})` },
              { id: 'teacher', label: `🎓 Floor Tutors (${provisionedPersonnel.filter(p => p.role === 'teacher').length})` },
              { id: 'maintenance', label: `🛠️ Maintenance Staff (${provisionedPersonnel.filter(p => p.role === 'staff' && (p.staffSubtype === 'maintenance' || p.department?.toLowerCase().includes('maintenance') || p.email?.includes('maintenance'))).length})` },
              { id: 'dining', label: `🍲 Dining & Mess Staff (${provisionedPersonnel.filter(p => p.role === 'staff' && (p.staffSubtype === 'dining' || p.department?.toLowerCase().includes('dining') || p.email?.includes('dining'))).length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setPersonnelFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${personnelFilter === tab.id
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Personnel Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {provisionedPersonnel
              .filter(p => {
                if (personnelFilter === 'all') return true;
                if (personnelFilter === 'teacher') return p.role === 'teacher';
                if (personnelFilter === 'maintenance') {
                  return p.role === 'staff' && (p.staffSubtype === 'maintenance' || p.department?.toLowerCase().includes('maintenance') || p.email?.includes('maintenance'));
                }
                if (personnelFilter === 'dining') {
                  return p.role === 'staff' && (p.staffSubtype === 'dining' || p.department?.toLowerCase().includes('dining') || p.email?.includes('dining'));
                }
                return true;
              })
              .map((p) => {
                const isTeacher = p.role === 'teacher';
                const isDining = p.staffSubtype === 'dining' || p.department?.toLowerCase().includes('dining') || p.email?.includes('dining');
                const isMaintenance = !isTeacher && !isDining;

                return (
                  <div
                    key={p._id || p.userId}
                    className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isTeacher
                              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : isMaintenance
                                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}>
                            {isTeacher && <UserCheck size={18} />}
                            {isMaintenance && <Wrench size={18} />}
                            {isDining && <Utensils size={18} />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</div>
                            <span className="text-[10px] text-slate-500 font-mono">{p.userId}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${isTeacher
                            ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                            : isMaintenance
                              ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200'
                              : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                          }`}>
                          {isTeacher ? 'House Tutor' : isMaintenance ? 'Maintenance Staff' : 'Dining Staff'}
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                        <div><strong>Assigned Hall:</strong> {p.hall || 'Padma Residential Hall'}</div>
                        <div><strong>Operational Scope:</strong> {p.floor || 'All Floors'}</div>
                        <div><strong>Department:</strong> {p.department || 'Estate & Operations'}</div>
                        {p.phone && <div><strong>Phone:</strong> {p.phone}</div>}
                      </div>

                      {/* Domain Badges */}
                      {isMaintenance && (
                        <div className="p-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 flex flex-wrap gap-1 text-[10px]">
                          <span className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-300 font-medium">⚡ Electricity</span>
                          <span className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-300 font-medium">🌐 Net/LAN</span>
                          <span className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300 font-medium">🚰 Plumbing</span>
                          <span className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded text-purple-700 dark:text-purple-300 font-medium">🚪 Furniture</span>
                        </div>
                      )}

                      {isDining && (
                        <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex flex-wrap gap-1 text-[10px]">
                          <span className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-300 font-medium">🛒 Daily Bazar List</span>
                          <span className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded text-emerald-800 dark:text-emerald-300 font-medium">🍳 Kitchen Cooking</span>
                          <span className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded text-blue-800 dark:text-blue-300 font-medium">🎫 Meal Booking Count</span>
                        </div>
                      )}

                      {/* Login Credentials Box */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-[11px]">
                        <div className="text-slate-500 text-[10px] uppercase font-sans font-bold flex items-center gap-1">
                          <Key size={11} className="text-emerald-600" />
                          <span>Login Credentials:</span>
                        </div>
                        <div className="text-slate-800 dark:text-slate-200 truncate">
                          <span className="text-slate-400">Email:</span> {p.email}
                        </div>
                        <div className="text-slate-800 dark:text-slate-200">
                          <span className="text-slate-400">Pass:</span> <code>123456</code>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleCopyCredentials(p.email, '123456', p.userId)}
                        className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 font-semibold text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 transition-colors"
                      >
                        <Copy size={12} />
                        <span>Copy Login</span>
                      </button>

                      <button
                        onClick={() => handleDeletePersonnel(p._id || p.userId, p.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Deprovision Account"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: TUTOR-VERIFIED WORK ORDER DELEGATION & STAFF DISPATCH                */}
      {/* ========================================================================= */}
      {activeTab === 'delegation' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Tutor-Verified Work Order Delegation
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Provost Assignment Desk
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review problems physically verified by Floor Teachers (Electricity, Water Pump, Cleaning). Assign maintenance staff to execute repairs.
              </p>
            </div>

            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {tutorVerifiedComplaints.filter(c => (c.assignedStaff || '').includes('Pending')).length} Tickets Awaiting Staff Assignment
            </span>
          </div>

          {/* Work Orders Grid */}
          {(() => {
            const verifiedTickets = tutorVerifiedComplaints.filter(c => c.tutorStatus?.includes('Verified') || c.status?.includes('Verified') || c.status?.includes('Assigned') || c.status?.includes('Resolved'));

            if (verifiedTickets.length === 0) {
              return (
                <div className="p-12 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Work Orders Pending Delegation</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    When a Floor Teacher physically verifies a resident's electrical, plumbing, net, or furniture complaint, it will appear here for you to delegate to the Hall Staff In-Charge.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {verifiedTickets.map((ticket) => {
                  const ticketId = ticket.ticketId || ticket.id || ticket._id;
                  const isAssigned = !ticket.assignedStaff?.includes('Pending');
                  const isElectrical = ticket.category === 'Electrical';
                  const isWater = ticket.category?.includes('Water');
                  const isCleaning = ticket.category?.includes('Cleaning');

                  return (
                    <div
                      key={ticketId}
                      className="p-5 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3.5 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between pb-2 border-b border-slate-100 dark:border-slate-800 gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isElectrical
                                ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400'
                                : isWater
                                  ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400'
                                  : isCleaning
                                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400'
                              }`}>
                              {isElectrical && <Zap size={16} />}
                              {isWater && <Droplets size={16} />}
                              {isCleaning && <Sparkles size={16} />}
                              {!isElectrical && !isWater && !isCleaning && <Wrench size={16} />}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white text-sm block">
                                {ticket.title || ticket.category}
                              </span>
                              <span className="text-slate-500 font-mono text-[11px]">{ticket.room} • {ticket.floor || 'Floor 1'}</span>
                            </div>
                          </div>

                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 border ${isAssigned
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            }`}>
                            {isAssigned ? 'Staff Dispatched' : 'Awaiting Assignment'}
                          </span>
                        </div>

                        <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                          {ticket.description}
                        </div>

                        {/* Step 2 Verification Badge */}
                        <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            <span>Verified by {ticket.tutorName || 'House Tutor'}</span>
                          </span>
                          <span className="font-mono text-slate-500 text-[10px]">#{ticketId}</span>
                        </div>

                        {/* Ticket Details */}
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
                          <div><strong>Student Ward:</strong> {ticket.studentName} ({ticket.studentId})</div>
                          <div><strong>Hall:</strong> {ticket.hall || 'Padma Residential Hall'}</div>
                          <div><strong>Assigned Staff:</strong> <span className={isAssigned ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'text-amber-600 font-semibold'}>{ticket.assignedStaff}</span></div>
                        </div>
                      </div>

                      {/* Step 3: Provost Staff Assignment Action */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                        {!isAssigned ? (
                          <div className="space-y-2">
                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                              Select Hall Staff In-Charge to Assign:
                            </label>
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedStaffForTicket[ticketId] || 'Md. Kalam Hossain (Padma Staff In-Charge)'}
                                onChange={(e) => setSelectedStaffForTicket({ ...selectedStaffForTicket, [ticketId]: e.target.value })}
                                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 text-xs cursor-pointer"
                              >
                                <option value="Md. Kalam Hossain (Padma Staff In-Charge)">Md. Kalam Hossain (STF-PAD-001) - Padma Hall In-Charge</option>
                              </select>

                              <button
                                onClick={() => handleAssignStaffToWorkOrder(ticketId)}
                                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1 shrink-0 shadow-sm transition-all"
                              >
                                <Check size={13} />
                                <span>Assign Staff</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 size={14} />
                              <span>Dispatched to {ticket.assignedStaff}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">Live on Staff Dashboard</span>
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
      {/* TAB 4: PUBLISH NOTICES & CIRCULARS                                        */}
      {/* ========================================================================= */}
      {activeTab === 'notices' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Official Circular & Notice Board Publisher
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Draft and broadcast official policy circulars across the public website and student portals.
              </p>
            </div>
            <button
              onClick={() => setNewNoticeModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
            >
              <Plus size={14} />
              <span>Draft New Circular</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.map((n) => (
              <div key={n.id} className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-mono text-slate-400 text-[11px]">Ref: {n.id}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {n.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{n.title}</h3>
                <div className="text-slate-500 text-[11px]">Category: {n.category} • Date: {n.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DISCIPLINARY GOVERNANCE                                            */}
      {/* ========================================================================= */}
      {activeTab === 'discipline' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Residential Disciplinary Reviews & Warning Registry
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review room inspection reports forwarded by Floor Teachers to impose corrective actions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidentReviews.map((inc) => (
              <div key={inc.id} className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{inc.category}</span>
                  <span className="font-mono text-slate-400 text-[11px]">#{inc.id}</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300 leading-relaxed">{inc.description}</div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
                  <div><strong>Reported By:</strong> {inc.reporter}</div>
                  <div><strong>Location:</strong> {inc.location}</div>
                  <div><strong>Action Taken:</strong> {inc.actionTaken}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: BAZAR REQUISITIONS, DINING ATTENDANCE & KITCHEN PANTRY STOCK      */}
      {/* ========================================================================= */}
      {activeTab === 'bazar' && (
        <DailyBazarMealReportSection
          role="super"
          currentUser={currentUser}
          onShowToast={onShowToast}
        />
      )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: DRAFT NEW CIRCULAR                                                 */}
      {/* ========================================================================= */}
      {newNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 p-6 shadow-xl text-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Publish Administrative Notice
            </h2>
            <p className="text-slate-500 mb-4">
              Issued under the authority of the Office of the Provost.
            </p>

            <form onSubmit={handlePublishNotice} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Circular Title</label>
                <input
                  type="text"
                  value={newNoticeForm.title}
                  onChange={(e) => setNewNoticeForm({ ...newNoticeForm, title: e.target.value })}
                  placeholder="e.g. Schedule for Room Inventory Handover..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Notice Category</label>
                <select
                  value={newNoticeForm.category}
                  onChange={(e) => setNewNoticeForm({ ...newNoticeForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 cursor-pointer"
                >
                  <option value="Allocation">Seat Allocation & Deadlines</option>
                  <option value="Administration">Administration & Night Roll-Call</option>
                  <option value="Dining">Mess Billing & Dining Tokens</option>
                  <option value="Maintenance">Estate & Maintenance</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Circular Description / Directives</label>
                <textarea
                  rows={3}
                  value={newNoticeForm.content}
                  onChange={(e) => setNewNoticeForm({ ...newNoticeForm, content: e.target.value })}
                  placeholder="Provide circular text directives..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewNoticeModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                >
                  Publish Notice Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Modal: Provision New Personnel (Floor Teacher or Staff) */}
      {provisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 p-6 shadow-xl text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus size={18} className="text-emerald-600" />
                  <span>Provision {provisionForm.role === 'teacher' ? 'Floor Teacher (House Tutor)' : 'Staff & Operations'}</span>
                </h2>
                <p className="text-slate-500 mt-0.5">
                  Issue official IUBAT credentials for hostel administration & security access.
                </p>
              </div>
              <button
                onClick={() => setProvisionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProvision} className="space-y-3.5">

              {/* Role Type Selector */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Institutional Position & Role</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const id = `TUT-00${Math.floor(10 + Math.random() * 90)}`;
                      setProvisionForm({
                        ...provisionForm,
                        role: 'teacher',
                        staffSubtype: 'teacher',
                        userId: id,
                        department: 'Computer Science and Engineering (CSE)',
                        floor: 'Floor 1',
                      });
                    }}
                    className={`p-2.5 rounded-xl border font-semibold flex flex-col items-center text-center justify-center gap-1 transition-all ${provisionForm.role === 'teacher'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    <UserCheck size={16} className="text-emerald-600" />
                    <span className="text-xs">Floor Teacher</span>
                    <span className="text-[10px] text-slate-400 font-normal">House Tutor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const id = `STF-MNT-0${Math.floor(10 + Math.random() * 90)}`;
                      setProvisionForm({
                        ...provisionForm,
                        role: 'staff',
                        staffSubtype: 'maintenance',
                        userId: id,
                        department: 'Hall Maintenance (Electricity, Net, Plumbing, Furniture)',
                        floor: 'All Floors',
                      });
                    }}
                    className={`p-2.5 rounded-xl border font-semibold flex flex-col items-center text-center justify-center gap-1 transition-all ${provisionForm.role === 'staff' && provisionForm.staffSubtype === 'maintenance'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 ring-1 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    <Wrench size={16} className="text-blue-600" />
                    <span className="text-xs">Maintenance Staff</span>
                    <span className="text-[10px] text-slate-400 font-normal">Electricity, Net, Pipe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const id = `STF-DIN-0${Math.floor(10 + Math.random() * 90)}`;
                      setProvisionForm({
                        ...provisionForm,
                        role: 'staff',
                        staffSubtype: 'dining',
                        userId: id,
                        department: 'Central Dining & Mess Operations',
                        floor: 'Dining Wing',
                      });
                    }}
                    className={`p-2.5 rounded-xl border font-semibold flex flex-col items-center text-center justify-center gap-1 transition-all ${provisionForm.role === 'staff' && provisionForm.staffSubtype === 'dining'
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 ring-1 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    <Utensils size={16} className="text-amber-600" />
                    <span className="text-xs">Dining & Mess</span>
                    <span className="text-[10px] text-slate-400 font-normal">Bazar & Cooking</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name (Academic/Staff)</label>
                <input
                  type="text"
                  value={provisionForm.name}
                  onChange={(e) => setProvisionForm({ ...provisionForm, name: e.target.value })}
                  placeholder={provisionForm.role === 'teacher' ? 'e.g. Dr. Kamrul Hasan' : 'e.g. Md. Anowar Hossain'}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                  required
                />
              </div>

              {/* Hall & Floor Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Assigned Hall</label>
                  <select
                    value={provisionForm.hall}
                    onChange={(e) => setProvisionForm({ ...provisionForm, hall: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="Padma Residential Hall">Padma Residential Hall</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Assigned Floor</label>
                  <select
                    value={provisionForm.floor}
                    onChange={(e) => setProvisionForm({ ...provisionForm, floor: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="Floor 1">Floor 1</option>
                    <option value="Floor 2">Floor 2</option>
                    <option value="All Floors (Estate / Dining)">All Floors (Estate / Dining)</option>
                  </select>
                </div>
              </div>

              {/* Department & Official ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Department / Unit</label>
                  <input
                    type="text"
                    value={provisionForm.department}
                    onChange={(e) => setProvisionForm({ ...provisionForm, department: e.target.value })}
                    placeholder="e.g. CSE, EEE, Estate..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Official ID (Generated)</label>
                  <input
                    type="text"
                    value={provisionForm.userId}
                    onChange={(e) => setProvisionForm({ ...provisionForm, userId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-emerald-600"
                    required
                  />
                </div>
              </div>

              {/* Official Email & Initial Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Official Email (Login ID)</label>
                  <input
                    type="email"
                    value={provisionForm.email}
                    onChange={(e) => setProvisionForm({ ...provisionForm, email: e.target.value })}
                    placeholder={provisionForm.role === 'teacher' ? 'tutor.name@iubat.edu' : 'staff.name@iubat.edu'}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={provisionForm.password}
                    onChange={(e) => setProvisionForm({ ...provisionForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-emerald-600"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={provisionForm.phone}
                  onChange={(e) => setProvisionForm({ ...provisionForm, phone: e.target.value })}
                  placeholder="+880 1819 001122"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setProvisionModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Check size={14} />
                  <span>Issue Official Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Comprehensive Student Profile & History Modal */}
      <StudentHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedStudentForHistory(null);
        }}
        studentId={selectedStudentForHistory?.id || selectedStudentForHistory?.studentId || selectedStudentForHistory?.userId}
        studentData={selectedStudentForHistory}
      />

      {/* 6. Manual Room & Bed Allocation Modal */}
      <RoomAllocateModal
        isOpen={isAllocateModalOpen}
        onClose={() => {
          setIsAllocateModalOpen(false);
          setSelectedAppForAllocate(null);
        }}
        application={selectedAppForAllocate}
        roomsList={roomsList}
        onSuccess={(msg) => {
          onShowToast(msg, 'success');
          fetchSeatApplications();
          fetchRoomsList();
          fetchAllStudents();
        }}
      />

      {/* 7. Student Room Transfer Modal */}
      <RoomTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setSelectedStudentForTransfer(null);
        }}
        studentData={selectedStudentForTransfer}
        roomsList={roomsList}
        onSuccess={(msg) => {
          onShowToast(msg, 'success');
          fetchSeatApplications();
          fetchRoomsList();
          fetchAllStudents();
          fetchTransferRequests();
        }}
      />

      {/* 8. Room Transfer Rejection Modal */}
      {rejectModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <X className="text-rose-600" size={18} />
                <span>Reject Room Transfer Request</span>
              </h3>
              <button
                onClick={() => setRejectModalData(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Rejecting room transfer request for <span className="font-bold text-slate-800 dark:text-slate-200">{rejectModalData.studentName}</span>. Please specify the administrative justification:
            </p>

            <textarea
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. Requested room is already fully occupied or unavailable this semester."
              rows={3}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalData(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectTransfer}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
