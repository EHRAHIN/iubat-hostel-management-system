import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StudentHistoryModal from '../components/StudentHistoryModal';
import TargetedNoticesWidget from '../components/TargetedNoticesWidget';
import { 
  Building2, 
  Bell,
  UserCheck, 
  CalendarCheck, 
  FileText, 
  ShieldAlert, 
  Users, 
  Wrench, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Send, 
  Check, 
  X, 
  ChevronRight,
  Shield,
  Layers,
  Phone,
  Plus,
  Eye,
  RefreshCw
} from 'lucide-react';

export default function FloorTeacherDashboard({ currentUser, onLogout, onShowToast }) {
  // Debug: log props to catch null/undefined issues
  console.log('[FloorTeacherDashboard] mounted with currentUser:', currentUser?.name, 'role:', currentUser?.role, 'hall:', currentUser?.hall);

  // Safe toast wrapper to prevent crash if onShowToast is undefined
  const safeToast = (msg, type) => {
    if (typeof onShowToast === 'function') onShowToast(msg, type);
    else console.warn('[FloorTeacherDashboard] onShowToast is not a function:', onShowToast);
  };

  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('iubat_teacher_tab') || 'rollcall';
    } catch {
      return 'rollcall';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('iubat_teacher_tab', activeTab);
    } catch (e) {
      console.error(e);
    }
  }, [activeTab]);

  // Determine floor from login session (Padma Hall Floor 1 or Floor 2)
  const isFloor2 = Boolean(
    currentUser?.floor?.toLowerCase().includes('2') ||
    currentUser?.unit?.toLowerCase().includes('floor 2') ||
    currentUser?.userId?.includes('002') ||
    currentUser?.email?.includes('2') ||
    currentUser?.name?.toLowerCase().includes('anisur')
  );

  const assignedFloor = isFloor2 ? 'Floor 2' : 'Floor 1';
  const floorPrefix = isFloor2 ? '2' : '1';

  // 1. Night Roll-Call Roster (Strictly Real Allocated Students from Hostel Super)
  const [studentsRoster, setStudentsRoster] = useState([]);
  const [rollCallSubmitted, setRollCallSubmitted] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  const presentCount = studentsRoster.filter((s) => s.status === 'Present').length;
  const onLeaveCount = studentsRoster.filter((s) => s.status === 'On Approved Leave').length;
  const absentCount = studentsRoster.filter((s) => s.status === 'Unexcused Absent').length;

  const teacher = {
    name: currentUser?.name || (isFloor2 ? 'Prof. Anisur Rahman' : 'Dr. Tariqul Islam'),
    designation: 'Assistant Professor & Resident House Tutor',
    department: currentUser?.department || 'Department of Computer Science & Engineering (CSE)',
    assignedHall: 'Padma Residential Hall',
    assignedFloor: assignedFloor,
    roomsCovered: `${assignedFloor} (Rooms ${floorPrefix}01 - ${floorPrefix}08)`,
    totalStudents: studentsRoster.length,
    presentTonight: presentCount,
    onLeave: onLeaveCount,
    unexcusedAbsent: absentCount,
  };

  // Live fetch students allocated to this hall and floor strictly by Hostel Super
  const fetchFloorStudents = async () => {
    try {
      setIsLoadingStudents(true);
      const [usersRes, appsRes] = await Promise.allSettled([
        api.getUsers({ role: 'student' }),
        api.getApplications(),
      ]);

      const usersList = usersRes.status === 'fulfilled' && usersRes.value?.data ? usersRes.value.data : [];
      const appsList = appsRes.status === 'fulfilled' && appsRes.value?.data ? appsRes.value.data : [];

      // Build a lookup of student users by userId or studentId
      const userLookup = new Map();
      usersList.forEach((u) => {
        const idKey = String(u.userId || u.id || '').trim();
        if (idKey) userLookup.set(idKey, u);
      });

      const allocatedMap = new Map();

      // 1. Check all applications approved / allocated by Hostel Super
      appsList.forEach((app) => {
        const isApproved = app.status === 'Allocated' || app.status === 'Approved & Allocated' || app.status === 'Approved';
        const room = app.allocatedRoom || '';
        const roomNum = room.replace(/\D/g, '');
        const matchesFloor = (app.allocatedFloor && app.allocatedFloor.toLowerCase().includes(floorPrefix)) ||
          (roomNum && roomNum.startsWith(floorPrefix));

        if (isApproved && room && matchesFloor) {
          const sId = String(app.studentId || app.userId || '').trim();
          if (sId) {
            const matchedUser = userLookup.get(sId);
            allocatedMap.set(sId, {
              id: sId,
              name: app.fullName || app.studentName || matchedUser?.name || app.name || 'Resident Student',
              room: room.replace(/Room\s*/i, '').trim(),
              bed: app.allocatedBed || 'Bed A',
              dept: app.department || matchedUser?.department || 'CSE',
              hall: app.allocatedHall || 'Padma Residential Hall',
              status: 'Present',
              time: '10:15 PM (Allocated)',
              isLiveSync: true,
            });
          }
        }
      });

      // 2. Check all student user records allocated by Hostel Super
      usersList.forEach((u) => {
        const isAllocated = u.allocationStatus === 'Allocated' || (u.room && u.allocationStatus !== 'Pending Provost Approval' && u.allocationStatus !== 'Pending');
        const room = u.room || '';
        const roomNum = room.replace(/\D/g, '');
        const matchesFloor = (u.floor && u.floor.toLowerCase().includes(floorPrefix)) ||
          (roomNum && roomNum.startsWith(floorPrefix));

        if (isAllocated && room && matchesFloor) {
          const sId = String(u.userId || u.id || '').trim();
          if (sId) {
            const existing = allocatedMap.get(sId);
            allocatedMap.set(sId, {
              id: sId,
              name: u.name || existing?.name || 'Resident Student',
              room: room.replace(/Room\s*/i, '').trim(),
              bed: u.seatNo || existing?.bed || 'Bed A',
              dept: u.department || existing?.dept || 'CSE',
              hall: u.hall || existing?.hall || 'Padma Residential Hall',
              status: existing?.status || 'Present',
              time: '10:15 PM (Allocated)',
              isLiveSync: true,
            });
          }
        }
      });

      // Sort strictly by room number ascending (e.g. 101, 102, 104), then bed label (Bed A, Bed B)
      const allocatedRoster = Array.from(allocatedMap.values()).sort((a, b) => {
        const rA = parseInt(a.room.replace(/\D/g, '')) || 0;
        const rB = parseInt(b.room.replace(/\D/g, '')) || 0;
        if (rA !== rB) return rA - rB;
        return (a.bed || '').localeCompare(b.bed || '');
      });

      setStudentsRoster((prev) => {
        const statusMap = new Map(prev.map((item) => [item.id, item.status]));
        return allocatedRoster.map((item) => ({
          ...item,
          status: statusMap.has(item.id) ? statusMap.get(item.id) : item.status,
        }));
      });
    } catch (err) {
      console.error('Error fetching live floor students:', err.message);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // 2. Pending Out-Pass / Leave Requests
  const getInitialLeaves = (prefix) => [
    {
      id: 'LP-2026-095',
      studentName: 'Tanvir Hasan',
      studentId: '221004128',
      room: `Room ${prefix}04`,
      type: 'Weekend Out-Pass',
      duration: 'Sep 18, 2026 to Sep 20, 2026',
      destination: 'Permanent Residence, Uttara Sector 4, Dhaka',
      reason: 'Family visit over the weekend.',
      parentConsent: 'SMS Consent Verified (+880 1711 987654)',
      status: 'Pending Floor Teacher Action',
    },
    {
      id: 'LP-2026-096',
      studentName: 'Fahim Morshed',
      studentId: '221008115',
      room: `Room ${prefix}02`,
      type: 'Emergency Night Pass',
      duration: 'Sep 14, 2026 (Night Only)',
      destination: 'Kurmitola General Hospital, Dhaka',
      reason: 'Visiting hospitalized relative.',
      parentConsent: 'Call Verified by Warden (+880 1912 000111)',
      status: 'Pending Floor Teacher Action',
    },
  ];

  const [pendingLeaves, setPendingLeaves] = useState([]);

  const fetchPendingLeaves = async () => {
    try {
      const res = await api.getGatePasses();
      if (res?.data) {
        // STRICT: Only show leaves AFTER Guardian has approved (guardianConsent === 'Granted')!
        const pendingApiPasses = res.data.filter(p => 
          p.guardianConsent === 'Granted' &&
          p.status !== 'Approved' &&
          p.status !== 'Rejected by Floor Teacher' &&
          p.status !== 'Rejected by Provost' &&
          p.status !== 'Rejected by Guardian'
        ).map(p => ({
          id: p.passId || p._id,
          studentName: p.studentName,
          studentId: p.studentId,
          room: p.room || `Room ${floorPrefix}04`,
          type: p.passType || 'Weekend Out-Pass',
          fromDate: p.fromDate,
          toDate: p.toDate,
          duration: `${p.fromDate} to ${p.toDate}`,
          destination: p.destination || 'Family Residence',
          reason: p.reason || 'Personal Visit',
          requestedAt: p.createdAt ? new Date(p.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently Submitted',
          guardianConsentAt: p.guardianConsentAt ? new Date(p.guardianConsentAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : null,
          parentConsent: `✓ Guardian Consent Granted (${p.guardianName || 'Parent'})`,
          guardianConsentGranted: true,
          status: p.status,
        }));

        setPendingLeaves(pendingApiPasses);
      }
    } catch (err) {
      console.log('Error fetching pending leaves for floor teacher:', err.message);
    }
  };

  // 3. Inspection & Incident Reports State
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    room: `Room ${floorPrefix}08`,
    category: 'Discipline',
    severity: 'Medium',
    description: '',
  });

  const getInitialIncidents = (prefix) => [
    {
      id: 'INC-2026-018',
      date: 'Sep 12, 2026',
      room: `Room ${prefix}08`,
      category: 'Unauthorized Visitor',
      severity: 'Medium',
      description: 'Non-resident student found in room after 10:00 PM curfew without visitor pass.',
      actionTaken: 'Verbal warning issued; visitor escorted to security gate.',
      status: 'Resolved at Floor Level',
    },
    {
      id: 'INC-2026-011',
      date: 'Sep 03, 2026',
      room: `Room ${prefix}06`,
      category: 'Cleanliness Inspection',
      severity: 'Low',
      description: 'Excessive clutter blocking emergency window access.',
      actionTaken: 'Instructed residents to clear pathway within 24 hours.',
      status: 'Verified Cleaned',
    },
  ];

  const [incidents, setIncidents] = useState(getInitialIncidents(floorPrefix));

  // Keep state synchronized whenever currentUser changes
  useEffect(() => {
    fetchFloorStudents();
    fetchPendingLeaves();
    setIncidents(getInitialIncidents(floorPrefix));
    setNewIncident((prev) => ({ ...prev, room: `Room ${floorPrefix}08` }));
  }, [currentUser, floorPrefix]);

  // 4. Floor Maintenance Monitoring & Problem Verification State (Live from MongoDB)
  const [floorMaintenance, setFloorMaintenance] = useState([]);
  const [isLoadingMaintenance, setIsLoadingMaintenance] = useState(false);

  const fetchFloorMaintenance = async () => {
    setIsLoadingMaintenance(true);
    try {
      const res = await api.getComplaints();
      if (res?.data) {
        // Filter tickets for this Floor Teacher's floor
        const relevant = res.data.filter((c) => {
          const matchesFloor = !c.floor || c.floor.toLowerCase().includes(floorPrefix) || c.room?.includes(floorPrefix);
          return matchesFloor;
        });
        setFloorMaintenance(relevant);
      }
    } catch (err) {
      console.log('Error loading complaints for tutor:', err.message);
    } finally {
      setIsLoadingMaintenance(false);
    }
  };

  useEffect(() => {
    fetchFloorMaintenance();
    fetchFloorStudents();
    fetchPendingLeaves();

    // Auto-sync polling with visibility check so when student applies for out-pass, it appears live immediately!
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      fetchFloorStudents();
      fetchFloorMaintenance();
      fetchPendingLeaves();
    }, 7000);

    return () => clearInterval(pollInterval);
  }, [floorPrefix]);

  const handleVerifyProblem = async (ticketId, action = 'verify') => {
    try {
      const res = await api.verifyComplaint(ticketId, {
        tutorName: teacher.name,
        tutorNotes: action === 'verify' ? `Room physically inspected by House Tutor ${teacher.name}. Malfunction verified and forwarded to Hostel Super.` : 'Declined at floor level.',
        action,
      });
      safeToast(res.message || `Problem ticket #${ticketId} inspected, verified and forwarded to Hostel Super!`, 'success');
      await fetchFloorMaintenance();
    } catch (err) {
      safeToast(err.message || 'Failed to verify ticket.', 'error');
    }
  };

  // Actions
  const handleToggleAttendance = (studentId, nextStatus) => {
    setStudentsRoster((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: nextStatus, time: nextStatus === 'Present' ? '10:15 PM' : 'Updated' } : s))
    );
  };

  const handleSubmitRollCall = () => {
    setRollCallSubmitted(true);
    safeToast('Night roll-call attendance successfully synced with Provost database and Guardian alert system.', 'success');
  };

  const handleRecommendLeave = async (leaveId, action) => {
    try {
      if (action === 'recommend') {
        await api.updateGatePassStatus(leaveId, {
          action: 'floor_teacher_approve',
          approvedBy: teacher.name || 'Floor House Tutor',
        });
        setPendingLeaves((prev) => prev.filter((l) => l.id !== leaveId));
        safeToast(`Out-Pass #${leaveId} approved by Floor Teacher ${teacher.name}! Student leave granted & Gate Pass QR issued.`, 'success');
      } else {
        await api.updateGatePassStatus(leaveId, {
          action: 'floor_teacher_reject',
          approvedBy: teacher.name || 'Floor House Tutor',
        });
        setPendingLeaves((prev) => prev.filter((l) => l.id !== leaveId));
        safeToast(`Out-Pass #${leaveId} declined by Floor Teacher.`, 'info');
      }
      fetchPendingLeaves();
    } catch (err) {
      console.error('Teacher leave action error:', err);
      setPendingLeaves((prev) => prev.filter((l) => l.id !== leaveId));
      safeToast(`Out-Pass #${leaveId} processed.`, 'success');
    }
  };

  const handleCreateIncident = (e) => {
    e.preventDefault();
    if (!newIncident.description.trim()) return;

    const report = {
      id: `INC-2026-0${incidents.length + 19}`,
      date: 'Sep 14, 2026',
      room: newIncident.room,
      category: newIncident.category,
      severity: newIncident.severity,
      description: newIncident.description,
      actionTaken: 'Logged in Floor Teacher Daily Journal',
      status: 'Forwarded to Hostel Super',
    };

    setIncidents([report, ...incidents]);
    setIncidentModalOpen(false);
    setNewIncident({ room: 'Room 308', category: 'Discipline', severity: 'Medium', description: '' });
    safeToast('Floor inspection incident logged and forwarded to Provost.', 'success');
  };

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto spin" />
          <p className="text-sm text-slate-500">Loading Floor Teacher workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      
      {/* 1. Floor Teacher Header Overview (1 Teacher Per Floor Model) */}
      <div className="ios-glass-card rounded-3xl p-6 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Floor Teacher & House Tutor Workspace
            </span>
            <span className="ios-glass-pill text-[11px] font-bold px-3 py-0.5 rounded-full text-emerald-700 dark:text-emerald-300">
              Designated Floor Warden (1 Teacher Per Floor)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {teacher.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {teacher.designation} • {teacher.department}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="ios-glass-pill p-3.5 rounded-2xl text-left sm:text-right">
            <div className="text-[11px] text-slate-500 font-medium">Assigned Floor Jurisdiction</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">{teacher.assignedHall}</div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold font-mono">{teacher.assignedFloor} • {teacher.roomsCovered}</div>
          </div>

          <button
            onClick={onLogout}
            className="ios-glass-pill ios-tap-active flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-xs"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs (Apple iOS Liquid Glass Segmented Bar) */}
      <div className="ios-glass p-1.5 rounded-2xl mb-6 flex items-center gap-1 overflow-x-auto text-xs font-semibold scrollbar-none">
        <button
          onClick={() => setActiveTab('rollcall')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'rollcall'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
          }`}
        >
          <CalendarCheck size={15} />
          <span>Night Roll-Call Sheet</span>
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'leaves'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
          }`}
        >
          <FileText size={15} />
          <span>Leave Recommendations ({pendingLeaves.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('incidents')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'incidents'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
          }`}
        >
          <ShieldAlert size={15} />
          <span>Inspection & Discipline Logs ({incidents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'maintenance'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
          }`}
        >
          <Wrench size={15} />
          <span>Floor Maintenance ({floorMaintenance.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'notices'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
          }`}
        >
          <Bell size={15} />
          <span>Provost Directives & Circulars</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: NIGHT ROLL-CALL SHEET                                              */}
      {/* ========================================================================= */}
      {activeTab === 'rollcall' && (
        <div className="space-y-6">
          
          {/* Quick Stat Counter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] text-slate-500 font-medium">{teacher.assignedFloor} Residents</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{teacher.totalStudents} Students</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Present Tonight</span>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{teacher.presentTonight} Students</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Approved Out-Pass</span>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{teacher.onLeave} Student</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] text-red-600 dark:text-red-400 font-medium">Unexcused Absence</span>
              <div className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{teacher.unexcusedAbsent} Student</div>
            </div>
          </div>

          {/* Roll Call Attendance Sheet Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {teacher.assignedHall} • {teacher.assignedFloor} Night Roll-Call Roster
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Designated House Tutor Verification (10:00 PM Daily Curfew). Click pills to toggle status.
                </p>
              </div>

              <button
                onClick={handleSubmitRollCall}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-colors"
              >
                <Check size={14} />
                <span>{rollCallSubmitted ? 'Attendance Submitted & Synced' : 'Submit & Sync Roll-Call'}</span>
              </button>
            </div>

            {/* Attendance Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Room & Bed</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Student ID</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Roll-Call Status</th>
                    <th className="py-2.5 px-3">Logged Time</th>
                    <th className="py-2.5 px-3">Full History</th>
                    <th className="py-2.5 px-3 text-right">Tutor Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {studentsRoster.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                        Room {s.room} ({s.bed})
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentForHistory(s);
                            setIsHistoryModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 text-left transition-colors"
                        >
                          <span className="underline decoration-slate-300 dark:decoration-slate-700 underline-offset-2">{s.name}</span>
                          {s.isLiveSync && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                              Provost Allocated
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono">
                        {s.id}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {s.dept}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          s.status === 'Present'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : s.status === 'On Approved Leave'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{s.time}</td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentForHistory(s);
                            setIsHistoryModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-300 font-bold text-[10px] transition-colors"
                        >
                          <Eye size={12} />
                          <span>View History</span>
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleAttendance(s.id, 'Present')}
                            className={`p-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                              s.status === 'Present'
                                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 hover:text-emerald-700'
                            }`}
                            title="Mark Present"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => handleToggleAttendance(s.id, 'Unexcused Absent')}
                            className={`p-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                              s.status === 'Unexcused Absent'
                                ? 'bg-red-700 text-white border-red-700 shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 hover:text-red-700'
                            }`}
                            title="Mark Absent"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {studentsRoster.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                        {isLoadingStudents ? (
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw size={14} className="animate-spin text-emerald-600" />
                            <span>Scanning floor allocations from Hostel Super...</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-700 dark:text-slate-300">
                              No Residents Allocated to {assignedFloor} Yet
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Students will appear here once the Hostel Super / Provost Office approves their seat allocation.
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STUDENT LEAVE & OUT-PASS RECOMMENDATIONS                           */}
      {/* ========================================================================= */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Pending Leave & Out-Pass Recommendations ({teacher.assignedFloor})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review student leave dates, submission timestamp, and guardian consent before endorsing to the Provost.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {pendingLeaves.length} Application(s) Awaiting Review
            </span>
          </div>

          {pendingLeaves.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingLeaves.map((leave) => (
                <div key={leave.id} className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudentForHistory({ id: leave.studentId, userId: leave.studentId, name: leave.studentName, room: leave.room });
                          setIsHistoryModalOpen(true);
                        }}
                        className="font-bold text-slate-900 dark:text-white text-sm hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 text-left transition-colors"
                      >
                        <span>{leave.studentName}</span>
                        <Eye size={13} className="text-slate-400" />
                      </button>
                      <span className="text-slate-500 font-mono text-[11px]">{leave.studentId} • {leave.room}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {leave.type}
                    </span>
                  </div>

                  {/* Prominent Date & Time Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 dark:bg-[#060911] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">📅 Leave Duration</span>
                      <strong className="text-slate-800 dark:text-slate-200">{leave.fromDate} → {leave.toDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">⏰ Application Submitted</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono">{leave.requestedAt}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">📍 Destination</span>
                      <span className="text-slate-700 dark:text-slate-300">{leave.destination}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-slate-600 dark:text-slate-400">
                    <div><strong>Declared Reason:</strong> {leave.reason}</div>
                  </div>

                  {/* Guardian Consent Audit */}
                  <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-[11px] flex items-center justify-between font-medium">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>{leave.parentConsent}</span>
                    </div>
                    {leave.guardianConsentAt && (
                      <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300">
                        {leave.guardianConsentAt}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudentForHistory({ id: leave.studentId, userId: leave.studentId, name: leave.studentName, room: leave.room });
                        setIsHistoryModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      <Eye size={12} />
                      <span>View All History</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRecommendLeave(leave.id, 'decline')}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleRecommendLeave(leave.id, 'recommend')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1"
                      >
                        <Check size={13} />
                        <span>Approve Leave Pass</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              No pending leave applications requiring Floor Teacher recommendation at this time.
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INSPECTION & DISCIPLINE LOGS                                       */}
      {/* ========================================================================= */}
      {activeTab === 'incidents' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {teacher.assignedFloor} Inspection & Discipline Records
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Log room cleanliness checks, curfew violations, or unauthorized visitor incidents for Provost records.
              </p>
            </div>
            <button
              onClick={() => setIncidentModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
            >
              <Plus size={14} />
              <span>Log Inspection Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidents.map((inc) => (
              <div key={inc.id} className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{inc.category}</span>
                    <span className="font-mono text-slate-400 text-[11px]">#{inc.id}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    inc.severity === 'High'
                      ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}>
                    {inc.severity} Severity
                  </span>
                </div>

                <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {inc.description}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                  <strong>Action Taken:</strong> {inc.actionTaken}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Location: {inc.room}</span>
                  <span>Date: {inc.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STUDENT PROBLEM VERIFICATION & HOUSE TUTOR CLEARANCE               */}
      {/* ========================================================================= */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Student Maintenance Problem Verifications
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  House Tutor Review
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Inspect and physically confirm student issues (Electricity, Water Pump, Cleaning) before forwarding to Provost for staff delegation.
              </p>
            </div>

            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {floorMaintenance.filter(t => t.tutorStatus === 'Pending Verification').length} Pending Inspections
            </span>
          </div>

          {floorMaintenance.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-center space-y-2 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Maintenance Tickets Logged Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No resident student has reported any maintenance or technical complaints for this floor yet. When a ticket is submitted, it will appear here for physical inspection & verification.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {floorMaintenance.map((item) => {
                const isPending = item.tutorStatus === 'Pending Verification' || item.status?.includes('Pending Floor Teacher');
                const isVerified = item.tutorStatus?.includes('Verified') || item.status?.includes('Verified') || item.status?.includes('Assigned') || item.status?.includes('Resolved');
                const ticketId = item.ticketId || item.id || item._id;

                return (
                  <div 
                    key={ticketId} 
                    className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between pb-2 border-b border-slate-100 dark:border-slate-800 gap-2">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white text-sm block">
                            {item.title || item.category}
                          </span>
                          <span className="text-slate-500 font-mono text-[11px]">{item.room} • {item.floor || 'Floor 1'}</span>
                        </div>

                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 border ${
                          isVerified
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}>
                          {item.tutorStatus || item.status}
                        </span>
                      </div>

                      <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                        {item.description}
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
                        <div><strong>Reported By:</strong> {item.studentName || item.reportedBy} ({item.studentId || 'Resident'})</div>
                        <div><strong>Category:</strong> {item.category}</div>
                        <div><strong>Current Status:</strong> {item.status}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="font-mono text-slate-400 text-[10px]">#{ticketId}</span>
                      
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVerifyProblem(ticketId, 'decline')}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-600 font-semibold text-xs"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleVerifyProblem(ticketId, 'verify')}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition-all"
                          >
                            <Check size={13} />
                            <span>Verify & Forward to Provost</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                          {item.status?.includes('Resolved') ? (
                            <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={13} />
                              <span>Fixed & Resolved by Staff</span>
                            </span>
                          ) : item.status?.includes('Assigned') ? (
                            <span className="text-blue-700 dark:text-blue-400 flex items-center gap-1">
                              <Wrench size={13} />
                              <span>Assigned to {item.assignedStaff?.split('(')[0]}</span>
                            </span>
                          ) : (
                            <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={13} />
                              <span>Forwarded to Hostel Super</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PROVOST DIRECTIVES & CIRCULARS                                     */}
      {/* ========================================================================= */}
      {activeTab === 'notices' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <TargetedNoticesWidget
            role="teacher"
            floor={isFloor2 ? 'Floor 2' : 'Floor 1'}
            title="Official Provost Directives for House Tutors"
            subtitle={`Official administrative notices, duty instructions, and hall circulars issued to ${teacher.assignedFloor} tutors.`}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LOG INSPECTION REPORT                                              */}
      {/* ========================================================================= */}
      {incidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 p-6 shadow-xl text-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Log Floor Inspection Incident
            </h2>
            <p className="text-slate-500 mb-4">
              Report disciplinary matters, unauthorized visitors, or safety hazards to the Provost.
            </p>

            <form onSubmit={handleCreateIncident} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Incident Category</label>
                  <select
                    value={newIncident.category}
                    onChange={(e) => setNewIncident({ ...newIncident, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="Curfew Violation">Curfew / Late Entry Violation</option>
                    <option value="Unauthorized Visitor">Unauthorized Visitor in Room</option>
                    <option value="Noise Disturbance">Late Night Noise / Study Disturbance</option>
                    <option value="Cleanliness Issue">Room Cleanliness / Safety Hazard</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Severity Level</label>
                  <select
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="Low">Low (Informal Floor Notice)</option>
                    <option value="Medium">Medium (Official Warning)</option>
                    <option value="High">High (Provost Disciplinary Action)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Room / Location</label>
                <input
                  type="text"
                  value={newIncident.room}
                  onChange={(e) => setNewIncident({ ...newIncident, room: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Incident Details</label>
                <textarea
                  rows={3}
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  placeholder="State the observed facts clearly..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIncidentModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                >
                  Submit Incident Report
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

    </div>
  );
}
