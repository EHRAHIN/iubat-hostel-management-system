import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  CalendarCheck, 
  FileText, 
  CreditCard, 
  Phone, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Building2, 
  Download, 
  Check, 
  X, 
  DollarSign, 
  Shield,
  Smartphone,
  Utensils,
  Lock,
  RefreshCw,
  Bell,
} from 'lucide-react';
import { api } from '../services/api';
import SSLCommerzModal from '../components/SSLCommerzModal';
import PaymentReceiptModal from '../components/PaymentReceiptModal';
import TargetedNoticesWidget from '../components/TargetedNoticesWidget';

export default function ParentDashboard({ currentUser, onLogout, onShowToast }) {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('hostel_parent_tab') || 'attendance';
    } catch {
      return 'attendance';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hostel_parent_tab', activeTab);
    } catch (e) {
      console.error(e);
    }
  }, [activeTab]);

  // Guardian Profile Data
  const [guardian, setGuardian] = useState({
    name: currentUser?.guardianName || currentUser?.name || 'Md. Rafiqul Hasan',
    relationship: 'Father / Primary Registered Guardian',
    phone: currentUser?.guardianPhone || currentUser?.phone || '+880 1711 987654',
    email: currentUser?.email || 'guardian@hostel.edu',
    smsAlertsEnabled: true,
  });

  // Linked Student Ward Profile Data
  const [student, setStudent] = useState({
    name: currentUser?.wardName || currentUser?.name || 'Tanvir Hasan',
    id: currentUser?.wardId || currentUser?.userId || '221004128',
    dept: currentUser?.department ? `${currentUser.department} Department` : 'Computer Science and Engineering (CSE)',
    year: 'Enrolled Resident Student',
    cgpa: currentUser?.cgpa ? String(currentUser.cgpa) : '3.84',
    hall: currentUser?.hall || 'Padma Residential Hall (Male)',
    floor: currentUser?.floor || 'Floor 1',
    room: currentUser?.room ? `${currentUser.room} (${currentUser.seatNo || 'Bed B'})` : 'Room 104 (Bed B)',
    roomType: 'Double Shared Room',
    roommate: 'Allocated Roommate',
    houseTutor: currentUser?.floorTeacher || 'Dr. Tariqul Islam (Floor 1 House Tutor)',
    houseTutorPhone: currentUser?.floorTeacherPhone || '+880 1819 123456',
  });

  // Keep state perfectly synchronized with logged-in user
  useEffect(() => {
    if (currentUser) {
      setGuardian({
        name: currentUser.guardianName || currentUser.name || (currentUser.wardName ? `Guardian of ${currentUser.wardName}` : 'Md. Rafiqul Hasan'),
        relationship: 'Father / Primary Registered Guardian',
        phone: currentUser.guardianPhone || currentUser.phone || '+880 1711 987654',
        email: currentUser.email || 'guardian@hostel.edu',
        smsAlertsEnabled: true,
      });

      setStudent({
        name: currentUser.wardName || currentUser.name || 'Tanvir Hasan',
        id: currentUser.wardId || currentUser.userId || '221004128',
        dept: currentUser.department ? `${currentUser.department} Department` : 'Computer Science and Engineering (CSE)',
        year: 'Enrolled Resident Student',
        cgpa: currentUser.cgpa ? String(currentUser.cgpa) : '3.84',
        hall: currentUser.hall || 'Padma Residential Hall (Male)',
        floor: currentUser.floor || 'Floor 1',
        room: currentUser.room ? `${currentUser.room} (${currentUser.seatNo || 'Bed B'})` : 'Room 104 (Bed B)',
        roomType: 'Double Shared Room',
        roommate: 'Allocated Roommate',
        houseTutor: currentUser.floorTeacher || 'Dr. Tariqul Islam (Floor 1 House Tutor)',
        houseTutorPhone: currentUser.floorTeacherPhone || '+880 1819 123456',
      });
    }
  }, [currentUser]);

  // 1. Pending Leave Pass Requests for Guardian Authorization (Live from MongoDB)
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(false);

  const fetchParentLeaves = async () => {
    try {
      setIsLoadingLeaves(true);
      const sId = student.id || currentUser?.studentId || '221004128';
      const res = await api.getGatePasses({ studentId: sId });
      if (res?.data) {
        const passes = res.data;
        const pending = passes.filter(p => 
          p.status === 'Pending Guardian Consent' || p.guardianConsent === 'Pending'
        ).map(p => ({
          id: p.passId || p._id,
          _rawId: p._id,
          type: p.passType || 'Weekend Out-Pass',
          duration: `${p.fromDate} to ${p.toDate}`,
          destination: p.destination || 'Permanent Residence',
          reason: p.reason || 'Personal Visit',
          requestedAt: p.createdAt ? new Date(p.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently',
          status: p.status || 'Pending Guardian Consent',
        }));

        const history = passes.filter(p => 
          p.status !== 'Pending Guardian Consent' && p.guardianConsent !== 'Pending'
        ).map(p => ({
          id: p.passId || p._id,
          type: p.passType || 'Weekend Out-Pass',
          duration: `${p.fromDate} to ${p.toDate}`,
          destination: p.destination || 'Permanent Residence',
          consentStatus: p.guardianConsent === 'Granted' ? 'Authorized via Guardian Portal' : p.guardianConsent === 'Declined' ? 'Declined by Guardian' : 'Consent Pending',
          provostStatus: p.status === 'Approved' ? `Approved by ${p.approvedBy || 'House Tutor'}` : p.status,
          returnStatus: p.status === 'Approved' ? 'Gate Pass Issued & Valid' : p.status,
        }));

        setPendingLeaveRequests(pending);
        setLeaveHistory(history);
      }
    } catch (err) {
      console.error('Fetch parent leaves error:', err);
    } finally {
      setIsLoadingLeaves(false);
    }
  };

  useEffect(() => {
    fetchParentLeaves();
  }, [student.id]);

  // 2. Night Roll-Call Attendance Logs
  const attendanceLogs = [
    { date: 'Sep 13, 2026', time: '10:12 PM', status: 'Present in Room', warden: 'Prof. Anisur Rahman' },
    { date: 'Sep 12, 2026', time: '10:08 PM', status: 'Present in Room', warden: 'Prof. Anisur Rahman' },
    { date: 'Sep 11, 2026', time: '10:20 PM', status: 'Present in Room', warden: 'Prof. Anisur Rahman' },
    { date: 'Sep 10, 2026', time: '10:05 PM', status: 'Present in Room', warden: 'Prof. Anisur Rahman' },
    { date: 'Sep 09, 2026', time: 'N/A', status: 'On Approved Leave', warden: 'Out-Pass Verified' },
    { date: 'Sep 08, 2026', time: '10:14 PM', status: 'Present in Room', warden: 'Prof. Anisur Rahman' },
  ];

  // 3. Fee Invoices & Payments State (Live from MongoDB)
  const [invoices, setInvoices] = useState([]);
  const [isSSLModalOpen, setIsSSLModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeInvoiceForPay, setActiveInvoiceForPay] = useState(null);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState(null);
  const [isRedirectingSSL, setIsRedirectingSSL] = useState(false);

  // Open Exact SSLCommerz Payment Gateway Interface for Guardian (No auto-back)
  const handlePayViaSSLCommerz = (inv) => {
    setActiveInvoiceForPay(inv);
    setIsSSLModalOpen(true);
  };


  const fetchParentPayments = async () => {
    try {
      const sId = student.id || currentUser?.studentId || '221004128';
      const res = await api.getPayments({ studentId: sId });
      if (res?.data) {
        setInvoices(res.data);
      }
    } catch (err) {
      console.error('Fetch parent payments error:', err);
    }
  };

  const handleVerifyInvoice = async (inv) => {
    if (!inv?.transactionId) return;
    try {
      const res = await api.validateSSLPayment(inv.transactionId);
      if (res?.data?.paymentStatus === 'Paid') {
        if (onShowToast) onShowToast(`Invoice #${inv.invoiceNo} verified & cleared as Paid via SSLCommerz!`, 'success');
        fetchParentPayments();
      } else {
        if (onShowToast) onShowToast(`SSLCommerz Status: ${res?.data?.paymentStatus || 'Pending'}`, 'info');
      }
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to verify transaction status', 'error');
    }
  };

  useEffect(() => {
    fetchParentPayments();
  }, [student.id]);

  // 4. Ward Residential Meal Attendance History (Live from MongoDB)
  const [wardMealSummary, setWardMealSummary] = useState(null);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);

  const fetchWardMeals = async () => {
    try {
      setIsLoadingMeals(true);
      const sId = student.id || currentUser?.wardId || currentUser?.studentId || '221004128';
      const res = await api.getStudentMealSummary(sId);
      if (res?.data) {
        setWardMealSummary(res.data);
      }
    } catch (err) {
      console.error('Fetch ward meals error:', err);
    } finally {
      setIsLoadingMeals(false);
    }
  };

  useEffect(() => {
    fetchWardMeals();
  }, [student.id]);

  // Actions
  const handleAuthorizeLeave = async (leaveId, action) => {
    try {
      if (action === 'grant') {
        await api.updateGatePassStatus(leaveId, {
          action: 'grant_guardian_consent',
          guardianName: guardian.name,
          guardianPhone: guardian.phone,
        });
        onShowToast(`Leave pass #${leaveId} authorized by Guardian! Dispatched to Floor Teacher for final review.`, 'success');
      } else {
        await api.updateGatePassStatus(leaveId, {
          action: 'decline_guardian_consent',
          guardianName: guardian.name,
        });
        onShowToast(`Leave pass #${leaveId} declined by Guardian. Student has been notified.`, 'info');
      }
      await fetchParentLeaves();
    } catch (err) {
      console.error('Authorize leave error:', err);
      onShowToast(err.message || 'Failed to update leave status', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      
      {/* 1. Guardian Header Card */}
      <div className="ios-glass-card rounded-3xl p-6 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Parent & Guardian Oversight Portal
            </span>
            <span className="ios-glass-pill text-[11px] font-bold px-3 py-0.5 rounded-full text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <Smartphone size={11} />
              <span>SMS Notifications Active</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {guardian.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Guardian of <span className="font-semibold text-slate-900 dark:text-white">{student.name}</span> (ID: <span className="font-mono font-medium">{student.id}</span>) • {student.dept}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="ios-glass-pill p-3.5 rounded-2xl text-left sm:text-right">
            <div className="text-[11px] text-slate-500 font-medium">Assigned Residential Unit</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">{student.hall} • {student.floor}</div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold font-mono">{student.room}</div>
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
          onClick={() => setActiveTab('attendance')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
          }`}
        >
          <CalendarCheck size={15} />
          <span>Night Attendance & Safety</span>
        </button>

        <button
          onClick={() => setActiveTab('leave')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'leave'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
          }`}
        >
          <FileText size={15} />
          <span>Leave & Out-Pass Consent ({pendingLeaveRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'fees'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
          }`}
        >
          <CreditCard size={15} />
          <span>Hostel Fees & Invoices</span>
        </button>

        <button
          onClick={() => setActiveTab('meals')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'meals'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
          }`}
        >
          <Utensils size={15} />
          <span>Residential Dining & Meals ({wardMealSummary?.totalConsumedMeals || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'contacts'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
          }`}
        >
          <Phone size={15} />
          <span>Emergency Warden Contacts</span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`ios-tap-active flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'notices'
              ? 'border-emerald-700 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bell size={15} />
          <span>Provost Circulars & Notices</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: NIGHT ATTENDANCE & SAFETY                                          */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Monthly Attendance Compliance</span>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">96.8% Present</div>
              <p className="text-[11px] text-slate-500 mt-1">Daily 10:00 PM Roll-Call Verification</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Curfew Discrepancies</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">0 Violations</div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">Clean Disciplinary Standing</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Assigned House Tutor</span>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-1">{student.houseTutor}</div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">{student.houseTutorPhone}</p>
            </div>
          </div>

          {/* Roll Call Feed Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Night Roll-Call Audit Feed
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Official daily physical verification conducted by {student.floor || 'Floor 1'} House Tutor.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Live Audit Logs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px] uppercase">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Physical Roll-Call Time</th>
                    <th className="py-2.5 px-3">Student Safety Status</th>
                    <th className="py-2.5 px-3">Verified By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {attendanceLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{log.date}</td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">{log.time}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          log.status === 'Present in Room'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">{log.warden}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LEAVE & OUT-PASS CONSENT AUTHORIZATION                             */}
      {/* ========================================================================= */}
      {activeTab === 'leave' && (
        <div className="space-y-6">
          
          {/* Pending Consent Action Card */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Pending Leave Authorization Requests
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your ward has submitted the following leave applications. Your digital consent is required before Provost endorsement.
                </p>
              </div>
            </div>

            {pendingLeaveRequests.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {pendingLeaveRequests.map((req) => (
                  <div key={req.id} className="p-6 rounded-2xl bg-white dark:bg-[#0d121f] border-2 border-emerald-600/60 dark:border-emerald-500/60 shadow-sm text-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-base">{req.type}</span>
                        <span className="text-slate-500 ml-2 font-mono">#{req.id}</span>
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                        {req.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                      <div><strong className="text-slate-900 dark:text-white">Leave Dates:</strong> {req.duration}</div>
                      <div><strong className="text-slate-900 dark:text-white">Destination:</strong> {req.destination}</div>
                      <div className="sm:col-span-2"><strong className="text-slate-900 dark:text-white">Declared Reason:</strong> {req.reason}</div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-500">
                        An automated SMS confirmation will also be registered with your number ({guardian.phone}).
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleAuthorizeLeave(req.id, 'decline')}
                          className="w-1/2 sm:w-auto px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
                        >
                          Decline Request
                        </button>
                        <button
                          onClick={() => handleAuthorizeLeave(req.id, 'grant')}
                          className="w-1/2 sm:w-auto px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                        >
                          <Check size={14} />
                          <span>Grant Guardian Consent</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                No pending leave applications requiring your consent at this moment.
              </div>
            )}
          </div>

          {/* Past Leave History */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Past Authorized Out-Pass History
            </h3>

            <div className="space-y-3 text-xs">
              {leaveHistory.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{item.type} ({item.duration})</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Destination: {item.destination}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {item.returnStatus}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">{item.consentStatus}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HOSTEL FEES & DIGITAL PAYMENT                                      */}
      {/* ========================================================================= */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Hostel Seat Accommodation & Dining Invoices
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pay residential hall rents, utility dues, and monthly mess meal bills remotely via SSLCommerz.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                SSLCommerz 256-Bit Secured
              </span>
            </div>
          </div>

          {/* Quick Pay Action Cards for Guardian */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Seat Rent Card */}
            {(() => {
              const dueRent = invoices.find(p => p.feeType === 'Seat Rent' && p.status === 'Due');
              const isRentCleared = !dueRent;
              return (
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Hostel Accommodation
                      </span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                        isRentCleared
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}>
                        {isRentCleared ? '৳0 Due (Cleared)' : `৳${dueRent.amountBDT} Due`}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Monthly Seat Rent & Utilities for {student.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Direct clearance for {student.hall} ({student.room}). Generates university official receipt instantly.
                    </p>
                  </div>
                  {isRentCleared ? (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span>Monthly Seat Rent 100% Cleared & Paid</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isRedirectingSSL}
                      onClick={() => {
                        handlePayViaSSLCommerz({
                          invoiceId: dueRent._id,
                          invoiceNo: dueRent.invoiceNo,
                          feeType: 'Seat Rent',
                          amountBDT: dueRent.amountBDT,
                          month: dueRent.month || 'March 2026',
                          studentId: student.id,
                          studentName: student.name,
                          hall: student.hall,
                          room: student.room,
                        });
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Lock size={13} />
                      <span>Pay Seat Rent (৳{dueRent.amountBDT}) via SSLCommerz</span>
                    </button>
                  )}
                </div>
              );
            })()}

            {/* 2. Dining & Mess Consumed Card */}
            {(() => {
              const dueMeal = invoices.find(p => (p.feeType === 'Monthly Meal Token' || p.feeType.includes('Meal')) && p.status === 'Due' && p.amountBDT > 0);
              const hasDue = Boolean(dueMeal && dueMeal.amountBDT > 0);
              return (
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                        Dining & Mess (Actual Consumed)
                      </span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                        hasDue
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {hasDue ? `৳${dueMeal.amountBDT} Due` : '৳0 Due'}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Monthly Dining & Mess Bill for {student.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Billed at month end based strictly on the exact number of meals consumed by your ward.
                    </p>
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
                          month: dueMeal.month || 'March 2026',
                          studentId: student.id,
                          studentName: student.name,
                          hall: student.hall,
                          room: student.room,
                        });
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Utensils size={13} />
                      <span>Pay Consumed Mess Bill (৳{dueMeal.amountBDT}) via SSLCommerz</span>
                    </button>
                  ) : (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span>No Mess Bill Due (৳0 Due)</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invoices.map((inv) => {
              const isPaid = inv.status === 'Paid' || inv.status === 'Paid in Full';
              return (
                <div key={inv._id || inv.id || inv.invoiceNo} className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-mono text-slate-400 text-[11px]">{inv.invoiceNo || inv.id}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        isPaid
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                      {inv.feeType || inv.title} ({inv.month || 'Spring 2026'})
                    </h3>

                    <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-2 font-['Outfit']">
                      ৳{inv.amountBDT?.toLocaleString() || inv.amount} BDT
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 mt-3 space-y-0.5">
                      <div><strong>Payment Gateway:</strong> {inv.paymentMethod || inv.paidVia || 'SSLCommerz Gateway'}</div>
                      <div><strong>Transaction ID:</strong> <span className="font-mono">{inv.transactionId || '—'}</span></div>
                      <div><strong>Receipt Date:</strong> {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('en-GB') : inv.receiptDate || 'Pending'}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Month: {inv.month || 'March 2026'}</span>
                    {isPaid ? (
                      <button
                        onClick={() => {
                          setSelectedPaymentForReceipt(inv);
                          setIsReceiptModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <Download size={13} />
                        <span>Download Receipt (PDF)</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        {inv.transactionId && (
                          <button
                            type="button"
                            title="Verify SSL Status"
                            onClick={() => handleVerifyInvoice(inv)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                          >
                            <RefreshCw size={11} />
                            <span>Verify</span>
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={isRedirectingSSL}
                          onClick={() => handlePayViaSSLCommerz(inv)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                        >
                          <Lock size={12} />
                          <span>Pay via SSLCommerz</span>
                        </button>
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
      {/* TAB: RESIDENTIAL DINING & MEAL ATTENDANCE (FOR GUARDIAN)                   */}
      {/* ========================================================================= */}
      {activeTab === 'meals' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Total Consumed Meals</span>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
                {wardMealSummary?.totalConsumedMeals || 0} Meals
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Total Residential Dining Count</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Monthly Mess Bill</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                {wardMealSummary?.totalCostBDT || '0 BDT'}
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">Payable at Month-End with Hostel Rent</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Food Collection Status</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-xs">
                  {wardMealSummary?.foodCollectedMeals || 0} Collected
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs">
                  {wardMealSummary?.uncollectedMeals || 0} Ready at Counter
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Verified by Central Dining Hall Staff</p>
            </div>
          </div>

          {/* Date-wise Meal Log Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Utensils size={16} className="text-emerald-600" />
                  <span>Ward Meal Attendance by Date (When & Which Meals Taken)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Transparent record for parents to verify which dates their ward took Breakfast, Lunch, or Dinner.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchWardMeals}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1 w-fit cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>Refresh Log</span>
              </button>
            </div>

            {(!wardMealSummary?.recentApplications || wardMealSummary.recentApplications.length === 0) ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-1">
                <Utensils size={28} className="mx-auto text-slate-400 opacity-60 mb-2" />
                <p className="font-semibold">No meal records found for your ward yet.</p>
                <p className="text-[11px] text-slate-400">Meal bookings submitted by your child will appear here immediately.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
                      <th className="pb-3">Scheduled Date</th>
                      <th className="pb-3">Token Ref ID</th>
                      <th className="pb-3">Meal Slot</th>
                      <th className="pb-3">Diet & Items</th>
                      <th className="pb-3">Meal Charge</th>
                      <th className="pb-3">Collection Status</th>
                      <th className="pb-3 text-right">Dining In-Charge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {wardMealSummary.recentApplications.map((b) => {
                      const isHandedOver = Boolean(b.foodCollected || b.status === 'Approved & Served');
                      const isBreakfast = b.mealType === 'Breakfast';
                      const isLunch = b.mealType === 'Lunch';
                      const isDinner = b.mealType === 'Dinner';

                      return (
                        <tr key={b._id || b.bookingId} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                            {b.date || 'Today'}
                          </td>
                          <td className="py-3.5 font-mono text-slate-500 font-bold">
                            #{b.bookingId}
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
                              isBreakfast
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : isLunch
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : isDinner
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {isBreakfast ? '🍳 Breakfast' : isLunch ? '🍛 Lunch' : isDinner ? '🍲 Dinner' : b.mealType}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate text-[11px]" title={b.diet}>
                            {b.diet || 'Standard Residential Diet'}
                          </td>
                          <td className="py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ৳{b.tokenCostBDT || (isBreakfast ? 30 : 50)} BDT
                          </td>
                          <td className="py-3.5">
                            {isHandedOver ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                                <CheckCircle2 size={11} className="text-emerald-600" />
                                <span>Food Collected</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 inline-flex items-center gap-1">
                                <Clock size={11} className="text-blue-600" />
                                <span>Ready at Counter</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 text-right text-slate-500 text-[11px]">
                            {b.approvedBy || (isHandedOver ? 'Dining Staff' : 'Awaiting Pickup')}
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
      {/* TAB 4: EMERGENCY WARDEN & CAMPUS CONTACTS                                 */}
      {/* ========================================================================= */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Official Residential Hall & Emergency Hotlines
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Direct communication channels with residential hall authorities and medical services.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
              
              {/* House Tutor */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <UserCheck size={18} />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{student.floor || 'Floor 1'} House Tutor</div>
                  <div className="text-slate-600 dark:text-slate-400 text-[11px]">{student.houseTutor}</div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-mono font-bold mt-1">{student.houseTutorPhone}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Available for parent inquiries (04:00 PM – 09:00 PM)</div>
                </div>
              </div>

              {/* Provost Office */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Building2 size={18} />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Office of the Provost (Hostel Super)</div>
                  <div className="text-slate-600 dark:text-slate-400 text-[11px]">Padma Residential Hall Administration</div>
                  <div className="text-blue-700 dark:text-blue-400 font-mono font-bold mt-1">+880 2 55091801 (Ext: 201)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Email: provost@hostel.edu</div>
                </div>
              </div>

              {/* Campus Medical Center */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">24/7 Campus Medical Center</div>
                  <div className="text-slate-600 dark:text-slate-400 text-[11px]">Emergency First Aid & Ambulance Dispatch</div>
                  <div className="text-red-700 dark:text-red-400 font-mono font-bold mt-1">+880 1711 009988</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">On-campus 24-hour doctor on duty</div>
                </div>
              </div>

              {/* Main Security Gate */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Shield size={18} />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Hostel Main Gate & Security Command</div>
                  <div className="text-slate-600 dark:text-slate-400 text-[11px]">Padma Hall Security Desk & Gate-pass Log</div>
                  <div className="text-amber-700 dark:text-amber-400 font-mono font-bold mt-1">+880 1911 223344</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">24-hour gatekeeper desk</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PROVOST CIRCULARS & NOTICES FOR PARENTS                            */}
      {/* ========================================================================= */}
      {activeTab === 'notices' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <TargetedNoticesWidget
            role="parent"
            title="Official Provost Circulars & Notices for Parents / Guardians"
            subtitle="Official guidelines, fee schedules, hall policy directives, and student welfare notices issued by the Hostel Super & Provost Office."
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

      {/* SSLCommerz Secure Checkout Modal */}
      <SSLCommerzModal
        isOpen={isSSLModalOpen}
        onClose={() => setIsSSLModalOpen(false)}
        invoiceData={activeInvoiceForPay}
        studentUser={{ ...student, name: student.name, userId: student.id }}
        onPaymentSuccess={(completed) => {
          onShowToast(`Guardian Payment of ৳${completed.amountBDT || activeInvoiceForPay?.amountBDT} completed successfully via SSLCommerz!`, 'success');
          fetchParentPayments();
        }}
      />

      {/* Official Printable Money Receipt Modal */}
      <PaymentReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        paymentData={selectedPaymentForReceipt}
        studentUser={{ ...student, name: student.name, userId: student.id }}
      />
    </div>
  );
}
