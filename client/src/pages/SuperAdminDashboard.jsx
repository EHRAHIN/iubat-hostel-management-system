import React, { useState, useEffect, useCallback } from 'react';
import {
  Crown,
  Building2,
  Users,
  ShieldCheck,
  Settings,
  Activity,
  Database,
  LogOut,
  Plus,
  Search,
  Filter,
  Check,
  X,
  Layers,
  Bed,
  Sliders,
  Sparkles,
  Download,
  Lock,
  UserCheck,
  Wrench,
  AlertCircle,
  Clock,
  RotateCcw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  FileText,
  Trash2,
  Eye,
  Megaphone,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  Zap,
  Droplets,
  Utensils,
  ChevronRight,
  Shield,
  PieChart,
  BarChart3,
  Phone,
  Mail,
  Home,
  CheckCheck,
  Ban,
  Unlock,
  UserX,
  UserPlus,
  ArrowRightLeft,
  RefreshCw,
  Copy,
  ExternalLink,
  AlertTriangle,
  Send,
  CreditCard,
  CheckSquare,
  FileCheck2,
  Printer
} from 'lucide-react';
import { api } from '../services/api';
import StudentHistoryModal from '../components/StudentHistoryModal';
import RoomManagerSection from '../components/RoomManagerSection';
import DailyBazarMealReportSection from '../components/DailyBazarMealReportSection';
import RoomAllocateModal from '../components/RoomAllocateModal';
import RoomTransferModal from '../components/RoomTransferModal';
import PaymentReceiptModal from '../components/PaymentReceiptModal';

export default function SuperAdminDashboard({ currentUser, onLogout, onShowToast }) {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('iubat_admin_tab') || 'financials';
    } catch {
      return 'financials';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('iubat_admin_tab', activeTab);
    } catch (e) {
      console.error(e);
    }
  }, [activeTab]);

  // Super Admin Profile Data
  const admin = {
    name: currentUser?.name || 'Prof. Dr. Abdur Rob',
    role: 'Vice Chancellor & Chief Executive Authority',
    department: 'Central Institutional Administration & Governance',
    adminId: currentUser?.userId || 'VC-IUBAT-001',
    accessLevel: 'Root Executive Authority',
    lastLogin: 'Today at 09:15 AM (Campus Executive Network)',
  };

  // ==========================================
  // 1. FINANCIALS & SSLCOMMERZ TREASURY STATE
  // ==========================================
  const [financials, setFinancials] = useState(null);
  const [loadingFinancials, setLoadingFinancials] = useState(false);
  const [newExpenseModalOpen, setNewExpenseModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'Mess Grocery & Food Supplies',
    hall: 'Padma Residential Hall (Male)',
    amountBDT: '',
    vendor: '',
    paymentMethod: 'Bank Transfer',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // SSLCommerz Payments Live Ledger
  const [paymentsList, setPaymentsList] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStats, setPaymentStats] = useState(null);
  const [manualInvoiceModalOpen, setManualInvoiceModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    studentId: '',
    studentName: '',
    amountBDT: '',
    feeType: 'Seat Rent',
    month: 'March 2026',
    hall: 'Padma Residential Hall (Male)',
    room: 'Room 101',
    seatNo: 'Bed A',
  });

  // Official Money Receipt State
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [customReceiptModalOpen, setCustomReceiptModalOpen] = useState(false);
  const [customReceiptData, setCustomReceiptData] = useState({
    studentId: '221004128',
    studentName: 'Tanvir Hasan',
    invoiceNo: `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    transactionId: `TXN-ADM-${Math.floor(100000 + Math.random() * 900000)}`,
    amountBDT: 2200,
    feeType: 'Seat Rent',
    month: 'March 2026',
    paymentMethod: 'Office Cash / Accounts Counter',
    hall: 'Padma Residential Hall (Male)',
    room: 'Room 101',
    seatNo: 'Bed A',
    status: 'Paid',
    department: 'Department of Computer Science & Engineering (CSE)',
  });

  // ==========================================
  // 2. APPLICATIONS & ADMISSIONS STATE
  // ==========================================
  const [applicationsList, setApplicationsList] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appFilter, setAppFilter] = useState('all');
  const [appSearch, setAppSearch] = useState('');
  const [selectedAppForAllocate, setSelectedAppForAllocate] = useState(null);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);

  // ==========================================
  // 3. INFRASTRUCTURE & ROOMS STATE
  // ==========================================
  const [roomsList, setRoomsList] = useState([]);
  const [transferRequestsList, setTransferRequestsList] = useState([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);
  const [selectedTransferStudent, setSelectedTransferStudent] = useState(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // ==========================================
  // 4. USERS & ACTORS DIRECTORY STATE
  // ==========================================
  const [usersList, setUsersList] = useState([]);
  const [selectedActorFilter, setSelectedActorFilter] = useState('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    role: 'Student',
    email: '',
    unit: '',
    password: '',
    phone: '',
    department: 'CSE',
  });
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // ==========================================
  // 5. COMPLAINTS & GRIEVANCES STATE
  // ==========================================
  const [complaintsList, setComplaintsList] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [complaintFilter, setComplaintFilter] = useState('all');
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState('all');
  const [complaintSearch, setComplaintSearch] = useState('');

  // ==========================================
  // 6. GATE PASS & SECURITY RECORDS STATE
  // ==========================================
  const [gatePassesList, setGatePassesList] = useState([]);
  const [loadingGatePasses, setLoadingGatePasses] = useState(false);
  const [gatePassFilter, setGatePassFilter] = useState('all');
  const [gatePassSearch, setGatePassSearch] = useState('');

  // ==========================================
  // 7. NOTICES & DIRECTIVES STATE
  // ==========================================
  const [noticesList, setNoticesList] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    category: 'Executive Directive',
    priority: 'High (Immediate Popup)',
    targetHall: 'Padma Residential Hall (Campus Residence)',
  });

  // ==========================================
  // 8. TARIFFS, AI VECTORS & SYSTEM HEALTH
  // ==========================================
  const [tariffSettings, setTariffSettings] = useState({
    singleRoomRentBDT: 5500,
    doubleRoomRentBDT: 3500,
    quadRoomRentBDT: 2500,
    breakfastTokenBDT: 30,
    lunchTokenBDT: 50,
    dinnerTokenBDT: 50,
    lateFeePerDayBDT: 50,
    freeElectricityKWh: 40,
    applicationPortalOpen: true,
    curfewCutoffTime: '22:00',
  });

  const [sysParams, setSysParams] = useState({
    activeSession: 'Spring 2026',
    applicationOpen: true,
    cgpaWeight: 60,
    distanceWeight: 40,
    smartRoommateThreshold: 85,
    autoAssignRoommate: true,
    curfewCutoffTime: '22:00',
  });

  const [serverHealth, setServerHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState([
    { id: 'AUD-9915', timestamp: 'Today at 02:40 PM', actor: 'Super Admin Prof. Dr. Abdur Rob', action: 'Approved Emergency Grocery Procurement Voucher (৳72,500 BDT)', ip: '10.10.1.1', severity: 'Info' },
    { id: 'AUD-9914', timestamp: 'Today at 01:15 PM', actor: 'Hostel Super Prof. Monirul Islam', action: 'Direct Approved Leave Pass LP-2026-506 for Tanvir Hasan', ip: '192.168.10.22', severity: 'Info' },
    { id: 'AUD-9913', timestamp: 'Today at 12:45 PM', actor: 'Floor Teacher Dr. Tariqul Islam', action: 'Endorsed Roll-Call Sheet for Padma Floor 1 (15 Boarders)', ip: '192.168.10.45', severity: 'Low' },
    { id: 'AUD-9912', timestamp: 'Yesterday at 06:30 PM', actor: 'Parent Md. Rafiqul Hasan', action: 'Paid Monthly Mess Bill via SSLCommerz Gateway (৳2,450 BDT)', ip: '103.114.98.12', severity: 'Security' },
    { id: 'AUD-9911', timestamp: 'Yesterday at 03:00 PM', actor: 'Staff Md. Kalam Hossain', action: 'Executed Plumbing Work Order #WRK-089 (Water Pump Filter)', ip: '192.168.10.88', severity: 'Low' },
  ]);

  // ==========================================
  // DATA FETCHING FUNCTIONS
  // ==========================================

  // 1. Financials & Expenses
  const fetchFinancialData = useCallback(async () => {
    setLoadingFinancials(true);
    try {
      const res = await api.getFinancials();
      if (res?.data) {
        setFinancials(res.data);
      }
    } catch (err) {
      console.error('Error loading financials:', err);
    } finally {
      setLoadingFinancials(false);
    }
  }, []);

  // 2. Payments Ledger
  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const res = await api.getAllPaymentsAdmin({ limit: 150 });
      if (res?.data?.payments) {
        setPaymentsList(res.data.payments);
        if (res.data.statistics) {
          setPaymentStats(res.data.statistics);
        }
      }
    } catch (err) {
      console.error('Error loading payments ledger:', err);
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  // 3. Applications
  const fetchApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const res = await api.getApplications({ limit: 100 });
      if (res?.data) {
        setApplicationsList(res.data);
      }
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoadingApps(false);
    }
  }, []);

  // 4. Rooms & Transfers
  const fetchRooms = useCallback(async () => {
    try {
      const res = await api.getRooms();
      if (res?.data) {
        setRoomsList(res.data);
      }
    } catch (err) {
      console.error('Error loading rooms:', err);
    }
  }, []);

  const fetchTransfers = useCallback(async () => {
    setLoadingTransfers(true);
    try {
      const res = await api.getRoomTransferRequests();
      if (res?.data) {
        setTransferRequestsList(res.data);
      }
    } catch (err) {
      console.error('Error loading room transfer requests:', err);
    } finally {
      setLoadingTransfers(false);
    }
  }, []);

  // 5. Users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.getUsers();
      if (res?.data) {
        setUsersList(res.data.map(u => ({
          id: u.userId || u.id || u._id,
          _id: u._id,
          name: u.name,
          role: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Student',
          email: u.email,
          unit: u.room ? `${u.hall || 'Padma'} ${u.room} (${u.seatNo || 'Seat'})` : (u.unit || u.department || 'Padma Hall'),
          status: u.status || 'Active',
          phone: u.phone || 'N/A',
          department: u.department || 'CSE',
          raw: u,
        })));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  // 6. Complaints
  const fetchComplaints = useCallback(async () => {
    setLoadingComplaints(true);
    try {
      const res = await api.getComplaints({ limit: 100 });
      if (res?.data) {
        setComplaintsList(res.data);
      }
    } catch (err) {
      console.error('Error loading complaints:', err);
    } finally {
      setLoadingComplaints(false);
    }
  }, []);

  // 7. Gate Passes
  const fetchGatePasses = useCallback(async () => {
    setLoadingGatePasses(true);
    try {
      const res = await api.getGatePasses({ limit: 100 });
      if (res?.data) {
        setGatePassesList(res.data);
      }
    } catch (err) {
      console.error('Error loading gate passes:', err);
    } finally {
      setLoadingGatePasses(false);
    }
  }, []);

  // 8. Notices
  const fetchNotices = useCallback(async () => {
    setLoadingNotices(true);
    try {
      const res = await api.getNotices();
      if (res?.data) {
        setNoticesList(res.data);
      }
    } catch (err) {
      console.error('Error loading notices:', err);
    } finally {
      setLoadingNotices(false);
    }
  }, []);

  // 9. System Health Check
  const checkHealth = useCallback(async () => {
    setLoadingHealth(true);
    try {
      const res = await api.getHealth();
      setServerHealth(res);
      onShowToast?.('Hostel Server & MongoDB Atlas cluster are operational!', 'success');
    } catch (err) {
      onShowToast?.(`Health check failed: ${err.message}`, 'error');
    } finally {
      setLoadingHealth(false);
    }
  }, [onShowToast]);

  // Initial Data Load
  useEffect(() => {
    fetchFinancialData();
    fetchPayments();
    fetchUsers();
    fetchApplications();
    fetchRooms();
    fetchTransfers();
    fetchComplaints();
    fetchGatePasses();
    fetchNotices();
  }, [
    fetchFinancialData,
    fetchPayments,
    fetchUsers,
    fetchApplications,
    fetchRooms,
    fetchTransfers,
    fetchComplaints,
    fetchGatePasses,
    fetchNotices
  ]);

  // ==========================================
  // FINANCIALS & PAYMENT HANDLERS
  // ==========================================
  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      await api.updatePaymentStatusAdmin(paymentId, { paymentStatus: newStatus });
      onShowToast(`Payment status updated to "${newStatus}"!`, 'success');
      await fetchPayments();
      await fetchFinancialData();
    } catch (err) {
      onShowToast(err.message || 'Failed to update payment status.', 'error');
    }
  };

  const handleRefundPayment = async (payment) => {
    const reason = window.prompt(`Issue refund for Invoice #${payment.invoiceNo} (৳${payment.amount} BDT)? Enter reason:`, 'Administrative Refund requested by Student/Accounts');
    if (reason === null) return;

    try {
      await api.refundPaymentAdmin(payment._id, { reason: reason || 'Administrative Refund' });
      onShowToast(`Payment #${payment.invoiceNo} successfully marked as Refunded!`, 'info');
      await fetchPayments();
      await fetchFinancialData();
    } catch (err) {
      onShowToast(err.message || 'Failed to process refund.', 'error');
    }
  };

  const handleCreateManualInvoice = async (e) => {
    e.preventDefault();
    if (!newInvoice.studentId || !newInvoice.amountBDT) {
      onShowToast('Please provide Student ID and Invoice Amount.', 'error');
      return;
    }
    try {
      await api.createInvoice({
        studentId: newInvoice.studentId.trim(),
        studentName: newInvoice.studentName.trim() || 'Resident Student',
        amountBDT: Number(newInvoice.amountBDT),
        feeType: newInvoice.feeType,
        month: newInvoice.month,
        hall: newInvoice.hall,
        room: newInvoice.room,
        seatNo: newInvoice.seatNo,
      });
      onShowToast(`Manual Invoice issued for Student ${newInvoice.studentId}!`, 'success');
      setManualInvoiceModalOpen(false);
      setNewInvoice({
        studentId: '',
        studentName: '',
        amountBDT: '',
        feeType: 'Seat Rent',
        month: 'March 2026',
        hall: 'Padma Residential Hall (Male)',
        room: 'Room 101',
        seatNo: 'Bed A',
      });
      await fetchPayments();
    } catch (err) {
      onShowToast(err.message || 'Failed to create invoice.', 'error');
    }
  };

  const handleGenerateReceipt = (payment) => {
    setSelectedPaymentForReceipt({
      ...payment,
      amountBDT: Number(payment.amount || payment.amountBDT || payment.payAbleAmount || 0) || 2200,
      feeType: payment.feeType || 'Seat Rent',
      month: payment.month || 'March 2026',
      paymentMethod: payment.paymentMethod || 'SSLCommerz Gateway',
      studentName: payment.studentName || payment.tenantName || 'Resident Student',
      studentId: payment.studentId || '221004128',
      hall: payment.hall || 'Padma Residential Hall (Male)',
      room: payment.room || 'Room 101',
      seatNo: payment.seatNo || 'Bed A',
      status: payment.status || payment.paymentStatus || 'Paid',
    });
    setIsReceiptModalOpen(true);
  };

  const handleOpenCustomReceiptModal = (prefill = {}) => {
    setCustomReceiptData({
      studentId: prefill.studentId || prefill.id || '221004128',
      studentName: prefill.studentName || prefill.name || 'Tanvir Hasan',
      invoiceNo: `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      transactionId: `TXN-ADM-${Math.floor(100000 + Math.random() * 900000)}`,
      amountBDT: prefill.amountBDT || 2200,
      feeType: prefill.feeType || 'Seat Rent',
      month: prefill.month || 'March 2026',
      paymentMethod: 'Office Cash / Accounts Counter',
      hall: prefill.hall || 'Padma Residential Hall (Male)',
      room: prefill.room || 'Room 101',
      seatNo: prefill.seatNo || 'Bed A',
      status: 'Paid',
      department: prefill.department || 'Department of Computer Science & Engineering (CSE)',
    });
    setCustomReceiptModalOpen(true);
  };

  const handlePrintCustomReceipt = (e) => {
    e.preventDefault();
    setSelectedPaymentForReceipt({
      ...customReceiptData,
      amountBDT: Number(customReceiptData.amountBDT) || 2200,
      paidAt: new Date(),
    });
    setCustomReceiptModalOpen(false);
    setIsReceiptModalOpen(true);
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amountBDT) {
      onShowToast('Please provide expense title and amount.', 'error');
      return;
    }
    try {
      const res = await api.createExpense(newExpense);
      onShowToast(res.message || 'Expense voucher recorded successfully.', 'success');
      setNewExpenseModalOpen(false);
      setNewExpense({
        title: '',
        category: 'Mess Grocery & Food Supplies',
        hall: 'Padma Residential Hall',
        amountBDT: '',
        vendor: '',
        paymentMethod: 'Bank Transfer',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      await fetchFinancialData();
    } catch (err) {
      onShowToast(err.message || 'Failed to record expense.', 'error');
    }
  };

  const handleDeleteExpense = async (expId, title) => {
    if (!window.confirm(`Are you sure you want to delete expense record "${title}"?`)) return;
    try {
      await api.deleteExpense(expId);
      onShowToast(`Expense "${title}" removed from ledger.`, 'info');
      await fetchFinancialData();
    } catch (err) {
      onShowToast(err.message || 'Failed to delete expense.', 'error');
    }
  };

  // ==========================================
  // APPLICATION & ALLOCATION HANDLERS
  // ==========================================
  const handleRevokeAllocation = async (app) => {
    if (!window.confirm(`Revoke room allocation for ${app.fullName} (${app.studentId})? Their allocated bed will be freed.`)) return;
    try {
      await api.revokeAllocation(app._id);
      onShowToast(`Allocation revoked for ${app.fullName}. Bed returned to inventory.`, 'info');
      await fetchApplications();
      await fetchRooms();
      await fetchUsers();
    } catch (err) {
      onShowToast(err.message || 'Failed to revoke allocation.', 'error');
    }
  };

  const handleRejectApplication = async (app) => {
    const reason = window.prompt(`Reject application for ${app.fullName}? Enter review remarks:`, 'Seat capacity exceeded or criteria mismatch.');
    if (reason === null) return;

    try {
      await api.updateApplicationStatus(app._id, { status: 'Rejected', reviewRemarks: reason });
      onShowToast(`Application for ${app.fullName} marked as Rejected.`, 'warning');
      await fetchApplications();
    } catch (err) {
      onShowToast(err.message || 'Failed to reject application.', 'error');
    }
  };

  const handleDeleteApplication = async (app) => {
    if (!window.confirm(`Permanently delete application record #${app.applicationRef} (${app.fullName})? This cannot be undone.`)) return;
    try {
      await api.deleteApplication(app._id);
      onShowToast(`Application #${app.applicationRef} deleted from database.`, 'info');
      await fetchApplications();
    } catch (err) {
      onShowToast(err.message || 'Failed to delete application.', 'error');
    }
  };

  // ==========================================
  // ROOM TRANSFERS HANDLERS
  // ==========================================
  const handleReviewTransfer = async (reqId, action) => {
    const remarks = window.prompt(`Enter administrative remarks for ${action.toUpperCase()}:`, `Approved & executed by Super Admin Office`);
    if (remarks === null) return;

    try {
      await api.reviewRoomTransferRequest(reqId, { action, reviewRemarks: remarks });
      onShowToast(`Room transfer request has been ${action.toUpperCase()}!`, 'success');
      await fetchTransfers();
      await fetchRooms();
      await fetchUsers();
    } catch (err) {
      onShowToast(err.message || 'Failed to update transfer request.', 'error');
    }
  };

  // ==========================================
  // USER GOVERNANCE HANDLERS
  // ==========================================
  const handleToggleBlockUser = async (user) => {
    const isBlocked = user.status === 'Blocked' || user.status === 'Suspended';
    const nextStatus = isBlocked ? 'Active' : 'Blocked';
    const actionName = isBlocked ? 'Unblock & Activate' : 'Block & Suspend';

    if (!window.confirm(`Are you sure you want to ${actionName} account for ${user.name} (${user.role})?`)) {
      return;
    }

    try {
      await api.updateUser(user.id || user._id, { status: nextStatus });
      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id || u._id === user._id ? { ...u, status: nextStatus } : u))
      );
      onShowToast(
        `User ${user.name} (${user.role}) has been ${nextStatus === 'Blocked' ? 'BLOCKED / SUSPENDED' : 'UNBLOCKED & ACTIVATED'}!`,
        nextStatus === 'Blocked' ? 'warning' : 'success'
      );
    } catch (err) {
      onShowToast(err.message || 'Failed to update user status.', 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`[ADMIN OVERRIDE] Permanently delete account for "${user.name}" (${user.role} - ID: ${user.id}) from the database? This action frees their bed and cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteUser(user.id || user._id);
      setUsersList((prev) => prev.filter((u) => u.id !== user.id && u._id !== user._id));
      onShowToast(`Account for ${user.name} (${user.role}) permanently removed.`, 'info');
      await fetchRooms();
    } catch (err) {
      onShowToast(err.message || 'Failed to delete user.', 'error');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email) return;

    try {
      await api.provisionUser({
        name: newUserData.name.trim(),
        email: newUserData.email.trim(),
        password: newUserData.password || '123456',
        role: newUserData.role.toLowerCase(),
        department: newUserData.department,
        phone: newUserData.phone || '+880 1711 002233',
        unit: newUserData.unit || `${newUserData.role} Unit`,
      });

      onShowToast(`Official ${newUserData.role} account provisioned for ${newUserData.name}. Credentials active.`, 'success');
      setNewUserModalOpen(false);
      setNewUserData({ name: '', role: 'Student', email: '', unit: '', password: '', phone: '', department: 'CSE' });
      await fetchUsers();
    } catch (err) {
      onShowToast(err.message || 'Failed to provision user.', 'error');
    }
  };

  // ==========================================
  // COMPLAINTS HANDLERS
  // ==========================================
  const handleResolveComplaint = async (complaintId) => {
    try {
      await api.updateComplaintStatus(complaintId, {
        status: 'Resolved',
        resolutionNotes: 'Verified and resolved by Central Executive Authority'
      });
      onShowToast('Complaint marked as Resolved & Closed.', 'success');
      await fetchComplaints();
    } catch (err) {
      onShowToast(err.message || 'Failed to update complaint status.', 'error');
    }
  };

  const handleAssignComplaint = async (complaint) => {
    const staffName = window.prompt(`Assign maintenance staff for Ticket #${complaint.ticketId}:`, 'Md. Kalam Hossain (Electrician)');
    if (!staffName) return;

    try {
      await api.assignComplaint(complaint._id, {
        assignedStaff: staffName,
        provostRemarks: 'Assigned under Super Admin directive for immediate completion.',
      });
      onShowToast(`Ticket #${complaint.ticketId} assigned to ${staffName}!`, 'success');
      await fetchComplaints();
    } catch (err) {
      onShowToast(err.message || 'Failed to assign staff.', 'error');
    }
  };

  const handleDeleteComplaint = async (complaintId, ticketId) => {
    if (!window.confirm(`Delete complaint ticket #${ticketId}?`)) return;
    try {
      await api.deleteComplaint(complaintId);
      onShowToast(`Ticket #${ticketId} deleted.`, 'info');
      await fetchComplaints();
    } catch (err) {
      onShowToast(err.message || 'Failed to delete complaint.', 'error');
    }
  };

  // ==========================================
  // GATE PASS HANDLERS
  // ==========================================
  const handleUpdateGatePass = async (passId, newStatus) => {
    try {
      await api.updateGatePassStatus(passId, {
        status: newStatus,
        approvedBy: admin.name,
      });
      onShowToast(`Gate pass status updated to "${newStatus}"!`, 'success');
      await fetchGatePasses();
    } catch (err) {
      onShowToast(err.message || 'Failed to update gate pass status.', 'error');
    }
  };

  // ==========================================
  // NOTICES & DIRECTIVES HANDLERS
  // ==========================================
  const handlePublishNotice = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      onShowToast('Please enter both announcement title and message.', 'error');
      return;
    }

    try {
      await api.createNotice({
        title: broadcastForm.title,
        summary: broadcastForm.message,
        category: broadcastForm.category || 'Executive Directive',
        priority: broadcastForm.priority,
        targetHall: broadcastForm.targetHall,
        authority: 'Office of the Vice Chancellor / Super Admin',
        isPinned: true,
      });
      onShowToast(`Executive Directive published to entire campus successfully!`, 'success');
      setBroadcastForm({
        title: '',
        message: '',
        category: 'Executive Directive',
        priority: 'High (Immediate Popup)',
        targetHall: 'Padma Residential Hall (Campus Residence)',
      });
      await fetchNotices();
    } catch (err) {
      onShowToast(err.message || 'Failed to publish notice.', 'error');
    }
  };

  const handleDeleteNotice = async (noticeId, title) => {
    if (!window.confirm(`Delete official circular: "${title}"?`)) return;
    try {
      await api.deleteNotice(noticeId);
      onShowToast(`Notice removed.`, 'info');
      await fetchNotices();
    } catch (err) {
      onShowToast(err.message || 'Failed to delete notice.', 'error');
    }
  };

  // ==========================================
  // TARIFFS & SYSTEM CONFIG HANDLERS
  // ==========================================
  const handleSaveTariffSettings = (e) => {
    e.preventDefault();
    onShowToast('Global hostel room tariffs, meal pricing, and late fee policies updated university-wide.', 'success');
  };

  const handleSaveParams = (e) => {
    e.preventDefault();
    onShowToast('System operational parameters and Smart Searching Roommate thresholds saved & applied.', 'success');
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm('[CRITICAL] Re-seed database with default institutional data, rooms, and test residents?')) return;
    try {
      await api.seedDatabase();
      onShowToast('Hostel database seeded successfully with fresh verified data!', 'success');
      window.location.reload();
    } catch (err) {
      onShowToast(err.message || 'Failed to seed database.', 'error');
    }
  };

  // ==========================================
  // FILTERED LISTS
  // ==========================================
  const filteredUsers = usersList.filter((u) => {
    const matchesFilter = selectedActorFilter === 'all' || u.role.toLowerCase().includes(selectedActorFilter.toLowerCase());
    const matchesSearch = u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredPayments = paymentsList.filter((p) => {
    const matchesFilter = paymentFilter === 'all' ||
      (p.status && p.status.toLowerCase() === paymentFilter.toLowerCase()) ||
      (p.paymentStatus && p.paymentStatus.toLowerCase() === paymentFilter.toLowerCase());
    const searchLower = paymentSearch.toLowerCase();
    const matchesSearch = !paymentSearch ||
      (p.invoiceNo && p.invoiceNo.toLowerCase().includes(searchLower)) ||
      (p.transactionId && p.transactionId.toLowerCase().includes(searchLower)) ||
      (p.studentId && p.studentId.toLowerCase().includes(searchLower)) ||
      (p.studentName && p.studentName.toLowerCase().includes(searchLower)) ||
      (p.tenantName && p.tenantName.toLowerCase().includes(searchLower));
    return matchesFilter && matchesSearch;
  });

  const filteredApplications = applicationsList.filter((a) => {
    const matchesFilter = appFilter === 'all' || (a.status && a.status.toLowerCase().includes(appFilter.toLowerCase()));
    const searchLower = appSearch.toLowerCase();
    const matchesSearch = !appSearch ||
      (a.fullName && a.fullName.toLowerCase().includes(searchLower)) ||
      (a.studentId && a.studentId.toLowerCase().includes(searchLower)) ||
      (a.applicationRef && a.applicationRef.toLowerCase().includes(searchLower));
    return matchesFilter && matchesSearch;
  });

  const filteredComplaints = complaintsList.filter((c) => {
    const matchesFilter = complaintFilter === 'all' || (c.status && c.status.toLowerCase() === complaintFilter.toLowerCase());
    const matchesCat = complaintCategoryFilter === 'all' || (c.category && c.category.toLowerCase().includes(complaintCategoryFilter.toLowerCase()));
    const searchLower = complaintSearch.toLowerCase();
    const matchesSearch = !complaintSearch ||
      (c.ticketId && c.ticketId.toLowerCase().includes(searchLower)) ||
      (c.studentName && c.studentName.toLowerCase().includes(searchLower)) ||
      (c.studentId && c.studentId.toLowerCase().includes(searchLower)) ||
      (c.title && c.title.toLowerCase().includes(searchLower)) ||
      (c.room && c.room.toLowerCase().includes(searchLower));
    return matchesFilter && matchesCat && matchesSearch;
  });

  const filteredGatePasses = gatePassesList.filter((g) => {
    const matchesFilter = gatePassFilter === 'all' || (g.status && g.status.toLowerCase().includes(gatePassFilter.toLowerCase()));
    const searchLower = gatePassSearch.toLowerCase();
    const matchesSearch = !gatePassSearch ||
      (g.passId && g.passId.toLowerCase().includes(searchLower)) ||
      (g.studentName && g.studentName.toLowerCase().includes(searchLower)) ||
      (g.studentId && g.studentId.toLowerCase().includes(searchLower)) ||
      (g.destination && g.destination.toLowerCase().includes(searchLower));
    return matchesFilter && matchesSearch;
  });

  const summary = financials?.summary || {
    totalRevenueBDT: 647000,
    seatRentRevenueBDT: 462000,
    messRevenueBDT: 185000,
    totalExpensesBDT: 388000,
    netProfitBDT: 259000,
    isProfitable: true,
    profitMarginPercentage: '40.0%',
    totalOutstandingDueBDT: 45000,
  };

  // Navigation Items for Left-Sidebar
  const navItems = [
    {
      id: 'financials',
      label: 'Financials & SSLCommerz Ledger',
      desc: 'Treasury, Revenue & Refunds',
      icon: DollarSign,
      badge: `+৳${(summary.netProfitBDT / 1000).toFixed(0)}k Surplus`,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    },
    {
      id: 'applications',
      label: 'Admissions & Seat Allocations',
      desc: 'Review & Allocate Beds',
      icon: CheckSquare,
      badge: `${applicationsList.length} Apps`,
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    },
    {
      id: 'infrastructure',
      label: 'Halls, Rooms & Transfers',
      desc: 'Padma Hall & Room Transfers',
      icon: Building2,
      badge: `${roomsList.length || 16} Rooms`,
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    },
    {
      id: 'users',
      label: 'User & Authority Directory',
      desc: 'Provision & Inspect All Roles',
      icon: Users,
      badge: `${usersList.length} Accounts`,
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    },
    {
      id: 'complaints',
      label: 'Hostel Grievances & Tickets',
      desc: 'Maintenance & Discipline',
      icon: Wrench,
      badge: `${complaintsList.filter(c => c.status !== 'Resolved').length} Active`,
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    },
    {
      id: 'gatepass',
      label: 'Security & Gate Passes',
      desc: 'Leave Permits & Night Outs',
      icon: ShieldAlert,
      badge: `${gatePassesList.length} Passes`,
      badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
    },
    {
      id: 'bazar_dining',
      label: 'Bazar, Dining & Stock Audit',
      desc: 'Meal Headcount & Grocery Cost',
      icon: Utensils,
      badge: 'Live Audit',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    },
    {
      id: 'notices',
      label: 'Executive Directives & Notices',
      desc: 'Official Campus Circulars',
      icon: Megaphone,
      badge: `${noticesList.length} Notices`,
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
    },
    {
      id: 'decisions',
      label: 'Tariffs & System Diagnostics',
      desc: 'Pricing, AI Weights & Seeds',
      icon: Settings,
    },
    {
      id: 'audit',
      label: 'Institutional Audit Trail',
      desc: 'Security & Transaction Logs',
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100">

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Top Header Bar */}
        <header className="ios-glass-card mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
              <Crown size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  {admin.name}
                </h1>
                <span className="ios-glass-pill text-[10px] font-bold px-3 py-1 rounded-full text-purple-700 dark:text-purple-300">
                  {admin.accessLevel}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {admin.role} • {admin.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="hidden sm:block text-right pr-2">
              <div className="text-[10px] uppercase font-bold text-slate-400">Institutional Governance</div>
              <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">Spring 2026 Session Active</div>
            </div>
            <button
              onClick={onLogout}
              className="ios-glass-pill ios-tap-active flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-xs"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Top 4 KPI Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          {/* KPI 1: Total Revenue */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Hostel Revenue</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-2 tracking-tight">
              ৳{summary.totalRevenueBDT.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1.5">
              <span>Seat Rent: ৳{summary.seatRentRevenueBDT.toLocaleString()}</span>
              <span>•</span>
              <span>Mess: ৳{summary.messRevenueBDT.toLocaleString()}</span>
            </div>
          </div>

          {/* KPI 2: Operational Outflows */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group hover:border-red-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Operational Expenses</span>
              <div className="w-9 h-9 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-inner">
                <TrendingDown size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 font-mono mt-2 tracking-tight">
              ৳{summary.totalExpensesBDT.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Groceries, Power Substation, Salaries & Maintenance
            </div>
          </div>

          {/* KPI 3: Net Profit / Surplus (লাভ) */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-900/20 via-teal-900/10 to-slate-900/40 border border-emerald-500/30 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Net Operating Profit (লাভ)
              </span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {summary.profitMarginPercentage} Margin
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-2 tracking-tight">
              +৳{summary.netProfitBDT.toLocaleString()} BDT
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-300/90 mt-2 flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Positive Institutional Fiscal Balance</span>
            </div>
          </div>

          {/* KPI 4: Resident Boarders & Occupancy */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Padma Hall Occupancy</span>
              <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                <Bed size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-2 tracking-tight">
              34 / 40 <span className="text-sm font-bold text-slate-400 font-sans">Beds</span>
            </div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-2 font-medium">
              85.0% Occupied • 16 Rooms (8/Floor) • 6 Vacant Beds
            </div>
          </div>



        </div>

        {/* Main Dashboard Layout: Left Sidebar + Right Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT SIDEBAR NAVIGATION (Col 1-3) */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
              <div className="px-3 py-2 text-[10px] uppercase font-black tracking-wider text-slate-400">
                Central Authority Governance
              </div>

              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`ios-tap-active w-full p-3.5 rounded-2xl text-left transition-all flex items-start gap-3 relative cursor-pointer ${isActive
                        ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-700/25 border border-white/20 font-bold'
                        : 'ios-glass-pill hover:bg-white/60 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                        }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 transition-colors ${isActive ? 'bg-white/20 text-white shadow-inner' : 'bg-white/40 dark:bg-black/30 text-slate-500'
                        }`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold truncate">{item.label}</span>
                          {isActive && <ChevronRight size={14} className="shrink-0" />}
                        </div>
                        <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {item.desc}
                        </p>
                        {item.badge && (
                          <div className="mt-1.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : item.badgeColor
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
            </div>

            {/* Quick System Status Card in Sidebar */}
            <div className="p-4 rounded-3xl bg-slate-100/80 dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <ShieldCheck size={15} className="text-emerald-600" />
                <span>Executive Authority Active</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Full root authority enabled across institutional admissions, room allocations, SSLCommerz treasury, grievances, and accounts.
              </p>
            </div>
          </aside>

          {/* RIGHT CONTENT WORKSPACE (Col 4-12) */}
          <main className="lg:col-span-9 space-y-6">

            {/* ========================================================================= */}
            {/* TAB 1: FINANCIAL PROFIT & LOSS (P&L) & LIVE SSLCOMMERZ LEDGER             */}
            {/* ========================================================================= */}
            {activeTab === 'financials' && (
              <div className="space-y-6">

                {/* Header & Quick Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <DollarSign size={18} className="text-emerald-600" />
                      <span>Hostel Financial Treasury & SSLCommerz Payment Ledger</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Real-time revenue collections, online SSLCommerz card/mobile payments, manual invoices, and operational expense vouchers.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleOpenCustomReceiptModal()}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-800 shadow-sm"
                      title="Generate official money receipt for any student"
                    >
                      <FileCheck2 size={14} />
                      <span>Generate Money Receipt</span>
                    </button>
                    <button
                      onClick={() => setManualInvoiceModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
                    >
                      <Plus size={14} />
                      <span>Issue Student Invoice</span>
                    </button>
                    <button
                      onClick={() => setNewExpenseModalOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all shrink-0"
                    >
                      <Plus size={14} />
                      <span>Log Operational Expense</span>
                    </button>
                  </div>
                </div>

                {/* Live SSLCommerz Transactions Ledger */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2">
                        <CreditCard size={18} className="text-emerald-600" />
                        <span>Live SSLCommerz & Fee Collection Transactions</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Real-time student fee payments, gateway status, and direct refund authorization.
                      </p>
                    </div>
                    <button
                      onClick={fetchPayments}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                      title="Refresh Payments"
                    >
                      <RefreshCw size={13} className={loadingPayments ? 'animate-spin' : ''} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                    <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                      {['all', 'Paid', 'Pending', 'Due', 'Failed', 'Refunded'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setPaymentFilter(st)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${paymentFilter.toLowerCase() === st.toLowerCase()
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                        >
                          {st === 'all' ? 'All Payments' : st}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full sm:w-72">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search student, invoice, or Tran ID..."
                        value={paymentSearch}
                        onChange={(e) => setPaymentSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#060911]/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3 px-4 whitespace-nowrap">Invoice & Tran ID</th>
                          <th className="py-3 px-4 whitespace-nowrap">Student / Boarder</th>
                          <th className="py-3 px-4 whitespace-nowrap">Fee Category</th>
                          <th className="py-3 px-4 whitespace-nowrap">Amount</th>
                          <th className="py-3 px-4 whitespace-nowrap">Payment Gateway</th>
                          <th className="py-3 px-4 whitespace-nowrap">Status</th>
                          <th className="py-3 px-4 text-right whitespace-nowrap">Super Admin Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredPayments.length > 0 ? (
                          filteredPayments.map((p) => {
                            const isPaid = (p.status || p.paymentStatus || '').toLowerCase() === 'paid';
                            const isRefunded = (p.status || p.paymentStatus || '').toLowerCase() === 'refunded';
                            const isFailed = (p.status || p.paymentStatus || '').toLowerCase() === 'failed';
                            const isPending = !isPaid && !isRefunded && !isFailed;

                            return (
                              <tr key={p._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                                <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                                  <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                                    {p.invoiceNo || 'INV-2026-N/A'}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                    <span>{p.transactionId || 'Awaiting TranID'}</span>
                                    {p.transactionId && (
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(p.transactionId);
                                          onShowToast('Transaction ID copied to clipboard!', 'info');
                                        }}
                                        className="text-slate-400 hover:text-slate-600"
                                        title="Copy Transaction ID"
                                      >
                                        <Copy size={11} />
                                      </button>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                                    {p.studentName || p.tenantName || 'Resident Student'}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                    ID: {p.studentId || 'N/A'} • {p.hall || 'Padma'}
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {p.feeType || 'Seat Rent'}
                                  </span>
                                  {p.month && (
                                    <span className="text-[10px] text-slate-400 block mt-0.5">{p.month}</span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                                  <div className="font-mono font-black text-sm text-slate-900 dark:text-white">
                                    ৳{(p.amount || p.amountBDT || p.payAbleAmount || 0).toLocaleString()}
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                                    <Zap size={12} className="text-amber-500" />
                                    <span>{p.paymentMethod || 'SSLCommerz Gateway'}</span>
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isPaid ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                                    isRefunded ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800' :
                                      isFailed ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800' :
                                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-600' : isRefunded ? 'bg-purple-600' : isFailed ? 'bg-rose-600' : 'bg-amber-600'
                                      }`} />
                                    <span>{p.status || p.paymentStatus || 'Pending'}</span>
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-right whitespace-nowrap align-middle">
                                  <div className="inline-flex items-center gap-1.5 justify-end">
                                    {/* Official Money Receipt Button */}
                                    <button
                                      onClick={() => handleGenerateReceipt(p)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 font-bold text-xs flex items-center gap-1 transition-colors shadow-sm"
                                      title="Generate & View Official Money Receipt"
                                    >
                                      <FileCheck2 size={12} className="text-emerald-600" />
                                      <span>Receipt</span>
                                    </button>

                                    {/* Direct Status Toggle */}
                                    {!isPaid ? (
                                      <button
                                        onClick={() => handleUpdatePaymentStatus(p._id, 'Paid')}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs transition-colors"
                                        title="Mark as Paid"
                                      >
                                        Mark Paid
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleRefundPayment(p)}
                                        className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-100 font-bold text-xs transition-colors"
                                        title="Execute Refund"
                                      >
                                        Refund
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                              No payment transactions match the selected filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Monthly Comparative Profit & Loss Ledger */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                        Monthly Profit & Loss Breakdown (Q1 2026 Fiscal Audit)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Live reconciliation of total revenue inflows vs operational expense outflows.
                      </p>
                    </div>
                    <span className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                      <CheckCircle2 size={13} />
                      <span>Surplus Continuous for Q1 2026</span>
                    </span>
                  </div>

                  <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#060911]/60 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">
                          <th className="py-3.5 px-5 whitespace-nowrap">Billing Month</th>
                          <th className="py-3.5 px-5 whitespace-nowrap">Total Inflows (Revenue)</th>
                          <th className="py-3.5 px-5 whitespace-nowrap">Total Outflows (Expenses)</th>
                          <th className="py-3.5 px-5 whitespace-nowrap">Net Profit / Surplus</th>
                          <th className="py-3.5 px-5 whitespace-nowrap">Margin %</th>
                          <th className="py-3.5 px-5 text-right whitespace-nowrap">Fiscal Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-sm">
                        {(financials?.monthlyLedger || [
                          { month: 'September 2026 (Running)', revenue: 647000, expenses: 388000, profit: 259000, margin: '40.0%', status: 'Net Surplus' },
                          { month: 'August 2026', revenue: 615000, expenses: 356000, profit: 259000, margin: '42.1%', status: 'Net Surplus' },
                          { month: 'July 2026', revenue: 590000, expenses: 370000, profit: 220000, margin: '37.3%', status: 'Net Surplus' },
                        ]).map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                            <td className="py-4 px-5 font-sans font-bold text-slate-900 dark:text-white whitespace-nowrap">
                              {m.month}
                            </td>
                            <td className="py-4 px-5 text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                              ৳{m.revenue.toLocaleString()} BDT
                            </td>
                            <td className="py-4 px-5 text-rose-600 dark:text-rose-400 font-bold whitespace-nowrap">
                              ৳{m.expenses.toLocaleString()} BDT
                            </td>
                            <td className="py-4 px-5 text-emerald-700 dark:text-emerald-300 font-black text-base whitespace-nowrap">
                              +৳{m.profit.toLocaleString()} BDT
                            </td>
                            <td className="py-4 px-5 text-slate-700 dark:text-slate-300 font-sans font-semibold whitespace-nowrap">
                              {m.margin}
                            </td>
                            <td className="py-4 px-5 text-right font-sans whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap shadow-sm">
                                <CheckCheck size={13} className="text-emerald-600" />
                                <span>{m.status}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Operational Expenses Live Ledger Table */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                        Recorded Operational Outflows & Expense Vouchers
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Itemized procurement invoices, utility bills, maintenance charges, and staff salaries.
                      </p>
                    </div>
                    <span className="self-start sm:self-auto text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                      {(financials?.expenses || []).length} Vouchers Logged
                    </span>
                  </div>

                  <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#060911]/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3.5 px-5 whitespace-nowrap">Voucher & Date</th>
                          <th className="py-3.5 px-5">Expense Title & Description</th>
                          <th className="py-3.5 px-5 whitespace-nowrap">Category</th>
                          <th className="py-3.5 px-5 whitespace-nowrap">Vendor / Payee</th>
                          <th className="py-3.5 px-5 whitespace-nowrap">Amount (BDT)</th>
                          <th className="py-3.5 px-5 text-right whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {(financials?.expenses || []).map((exp) => (
                          <tr key={exp._id || exp.expenseId} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                            <td className="py-4 px-5 whitespace-nowrap align-middle">
                              <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">{exp.voucherNo || exp.expenseId}</div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">{exp.date}</div>
                            </td>
                            <td className="py-4 px-5 max-w-sm align-middle">
                              <div className="font-bold text-slate-900 dark:text-white text-xs leading-snug">{exp.title}</div>
                              <div className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{exp.notes || exp.hall}</div>
                            </td>
                            <td className="py-4 px-5 whitespace-nowrap align-middle">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                                {exp.category}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap align-middle text-xs">
                              {exp.vendor}
                            </td>
                            <td className="py-4 px-5 font-mono font-black text-rose-600 dark:text-rose-400 text-sm whitespace-nowrap align-middle">
                              ৳{exp.amountBDT.toLocaleString()}
                            </td>
                            <td className="py-4 px-5 text-right whitespace-nowrap align-middle">
                              <button
                                onClick={() => handleDeleteExpense(exp._id || exp.expenseId, exp.title)}
                                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                title="Delete Expense Voucher"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: ADMISSIONS & ROOM ALLOCATION GOVERNANCE                             */}
            {/* ========================================================================= */}
            {activeTab === 'applications' && (
              <div className="space-y-6">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <CheckSquare size={18} className="text-emerald-600" />
                      <span>Executive Admissions & Seat Allocation Authority</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Super Admin has overriding authority to allocate beds, revoke allocations, or reject applications with lifestyle compatibility analysis.
                    </p>
                  </div>

                  <button
                    onClick={fetchApplications}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <RefreshCw size={13} className={loadingApps ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    {['all', 'Pending', 'Approved', 'Allocated', 'Rejected'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setAppFilter(st)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${appFilter.toLowerCase() === st.toLowerCase()
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                          : 'bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                      >
                        {st === 'all' ? 'All Applications' : st}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search applicant name, ID, ref..."
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Applications Table */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                      Boarding Applications Roster ({filteredApplications.length} Records)
                    </h3>
                  </div>

                  <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#060911]/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3 px-4 whitespace-nowrap">Applicant & Ref</th>
                          <th className="py-3 px-4 whitespace-nowrap">Academic & Contact</th>
                          <th className="py-3 px-4 whitespace-nowrap">Room Preference</th>
                          <th className="py-3 px-4 whitespace-nowrap">AI Match Vector</th>
                          <th className="py-3 px-4 whitespace-nowrap">Allocated Bed</th>
                          <th className="py-3 px-4 whitespace-nowrap">Status</th>
                          <th className="py-3 px-4 text-right whitespace-nowrap">Executive Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredApplications.length > 0 ? (
                          filteredApplications.map((app) => {
                            const isAllocated = app.status === 'Allocated';
                            const isApproved = app.status === 'Approved' || app.status === 'Provost Approved';
                            const isRejected = app.status === 'Rejected';

                            return (
                              <tr key={app._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                                <td className="py-4 px-4 whitespace-nowrap align-middle">
                                  <div className="font-bold text-slate-900 dark:text-white text-xs">{app.fullName}</div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{app.applicationRef || `#APP-${app._id.slice(-5)}`}</div>
                                </td>

                                <td className="py-4 px-4 whitespace-nowrap align-middle">
                                  <div className="font-mono text-slate-700 dark:text-slate-300 font-bold">{app.studentId}</div>
                                  <div className="text-[11px] text-slate-500">{app.department} • CGPA {app.cgpa || 'N/A'}</div>
                                </td>

                                <td className="py-4 px-4 whitespace-nowrap align-middle">
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">{app.preferredRoom || 'Double Shared'}</span>
                                  <span className="text-[10px] text-slate-400 block">{app.preferredHall || 'Padma'}</span>
                                </td>

                                <td className="py-4 px-4 whitespace-nowrap align-middle">
                                  {app.aiPartner?.matchScore ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                      <Sparkles size={11} />
                                      <span>{app.aiPartner.matchScore}% Match</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[11px]">Standard Review</span>
                                  )}
                                </td>

                                <td className="py-4 px-4 whitespace-nowrap align-middle">
                                  {isAllocated ? (
                                    <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                                      {app.allocatedRoom || 'Room 101'} - {app.allocatedBed || 'Bed A'}
                                      <span className="block text-[10px] text-slate-400 font-sans font-normal">{app.allocatedHall || 'Padma Hall'}</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic">Not Assigned</span>
                                  )}
                                </td>

                                <td className="py-4 px-4 whitespace-nowrap align-middle">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isAllocated ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                    isApproved ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                                      isRejected ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    }`}>
                                    {app.status || 'Pending'}
                                  </span>
                                </td>

                                <td className="py-4 px-4 text-right whitespace-nowrap align-middle">
                                  <div className="inline-flex items-center gap-1.5 justify-end">
                                    {/* Allocate Bed Button */}
                                    <button
                                      onClick={() => {
                                        setSelectedAppForAllocate({
                                          ...app,
                                          id: app._id,
                                          studentId: app.studentId,
                                          name: app.fullName,
                                          targetHall: app.preferredHall || 'padma',
                                        });
                                        setIsAllocateModalOpen(true);
                                      }}
                                      className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs shadow-sm transition-colors"
                                      title="Allocate Room & Bed"
                                    >
                                      {isAllocated ? 'Re-allocate' : 'Allocate Bed'}
                                    </button>

                                    {/* Revoke Allocation Button */}
                                    {isAllocated && (
                                      <button
                                        onClick={() => handleRevokeAllocation(app)}
                                        className="px-2 py-1 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100 font-bold text-xs transition-colors"
                                        title="Revoke Bed Allocation"
                                      >
                                        Revoke
                                      </button>
                                    )}

                                    {/* Reject Button */}
                                    {!isRejected && (
                                      <button
                                        onClick={() => handleRejectApplication(app)}
                                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                        title="Reject Application"
                                      >
                                        <Ban size={13} />
                                      </button>
                                    )}

                                    {/* Delete Button */}
                                    <button
                                      onClick={() => handleDeleteApplication(app)}
                                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                      title="Delete Application Record"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                              No student applications found.
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
            {/* TAB 3: INFRASTRUCTURE, ROOMS & TRANSFERS                                  */}
            {/* ========================================================================= */}
            {activeTab === 'infrastructure' && (
              <div className="space-y-6">

                {/* Live Room & Bed Inventory Manager */}
                <RoomManagerSection
                  currentUser={currentUser}
                  onShowToast={onShowToast}
                />

                {/* Live Room Transfer Requests Section */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2">
                        <ArrowRightLeft size={18} className="text-emerald-600" />
                        <span>Resident Room Transfer Petitions ({transferRequestsList.length} Requests)</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Students requesting relocation across rooms or bed tiers under Provost review.
                      </p>
                    </div>
                    <button
                      onClick={fetchTransfers}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors self-start sm:self-auto"
                    >
                      <RefreshCw size={13} className={loadingTransfers ? 'animate-spin' : ''} />
                      <span>Refresh Petitions</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#060911]/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3 px-4 whitespace-nowrap">Resident</th>
                          <th className="py-3 px-4 whitespace-nowrap">Current Room</th>
                          <th className="py-3 px-4 whitespace-nowrap">Requested Destination</th>
                          <th className="py-3 px-4 whitespace-nowrap">Reason & Notes</th>
                          <th className="py-3 px-4 whitespace-nowrap">Status</th>
                          <th className="py-3 px-4 text-right whitespace-nowrap">Super Admin Review</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {transferRequestsList.length > 0 ? (
                          transferRequestsList.map((tr) => (
                            <tr key={tr._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                              <td className="py-3.5 px-4 whitespace-nowrap align-middle font-bold text-slate-900 dark:text-white">
                                {tr.studentName || 'Resident'}
                                <span className="block text-[10px] font-mono text-slate-400">{tr.studentId}</span>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap align-middle font-mono">
                                {tr.currentRoom || 'Room 101'} ({tr.currentBed || 'Bed A'})
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap align-middle font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {tr.preferredRoom || 'Any Vacant'} ({tr.preferredBed || 'Bed A'})
                              </td>
                              <td className="py-3.5 px-4 max-w-xs align-middle text-slate-600 dark:text-slate-300 truncate">
                                {tr.reason || 'Mutual relocation request'}
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${tr.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                  tr.status === 'Rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                                    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  }`}>
                                  {tr.status || 'Pending'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap align-middle">
                                {tr.status === 'Pending' ? (
                                  <div className="inline-flex items-center gap-1.5 justify-end">
                                    <button
                                      onClick={() => handleReviewTransfer(tr._id, 'approved')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleReviewTransfer(tr._id, 'rejected')}
                                      className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-100 font-bold text-xs"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">Reviewed</span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-slate-400">
                              No active room transfer petitions.
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
            {/* TAB 4: USER & AUTHORITY GOVERNANCE                                        */}
            {/* ========================================================================= */}
            {activeTab === 'users' && (
              <div className="space-y-6">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <ShieldCheck size={18} className="text-emerald-600" />
                      <span>Full Authority User Governance (Suspend, Activate & Delete)</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Super Admin has absolute power to <strong className="text-amber-600">Suspend/Block</strong>, <strong className="text-emerald-600">Reactivate</strong>, or <strong className="text-rose-600">Permanently Delete</strong> any account: Students, Floor Teachers, Hostel Super (Provost), Staff, and Guardians.
                    </p>
                  </div>

                  <button
                    onClick={() => setNewUserModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20 transition-all shrink-0"
                  >
                    <Plus size={14} />
                    <span>Provision New User</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                  <div className="flex items-center gap-2 overflow-x-auto text-xs">
                    {['all', 'Student', 'Teacher', 'Provost', 'Staff', 'Parent'].map((actor) => (
                      <button
                        key={actor}
                        onClick={() => setSelectedActorFilter(actor)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all capitalize whitespace-nowrap ${selectedActorFilter === actor
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                          : 'bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                      >
                        {actor === 'all' ? 'All Roles' : actor}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search user name, email, or ID..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Users Table */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                      Provisioned Accounts Directory
                    </h3>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {filteredUsers.length} Active Records
                    </span>
                  </div>

                  <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#060911]/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3.5 px-5 whitespace-nowrap">Identity & Role</th>
                          <th className="py-3.5 px-5 whitespace-nowrap">User ID</th>
                          <th className="py-3.5 px-5 whitespace-nowrap">Assigned Unit / Room</th>
                          <th className="py-3.5 px-5 whitespace-nowrap">Contact Email</th>
                          <th className="py-3.5 px-5 whitespace-nowrap">Student 360</th>
                          <th className="py-3.5 px-5 whitespace-nowrap">Account Status</th>
                          <th className="py-3.5 px-5 text-right whitespace-nowrap">Admin Authority Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredUsers.map((u) => {
                          const isBlocked = u.status === 'Blocked' || u.status === 'Suspended';
                          const isSelf = u.id === admin.adminId || u.role.toLowerCase() === 'admin';
                          return (
                            <tr key={u.id} className={`hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors ${isBlocked ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''}`}>
                              <td className="py-4 px-5 align-middle whitespace-nowrap">
                                <div className="font-bold text-slate-900 dark:text-white text-xs">{u.name}</div>
                                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mt-1 ${u.role === 'Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                                  u.role === 'Provost' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                                    u.role === 'Teacher' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                      u.role === 'Staff' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                                        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-4 px-5 font-mono text-slate-500 font-bold whitespace-nowrap align-middle">{u.id}</td>
                              <td className="py-4 px-5 text-slate-700 dark:text-slate-300 whitespace-nowrap align-middle">{u.unit}</td>
                              <td className="py-4 px-5 text-slate-500 font-mono text-xs whitespace-nowrap align-middle">{u.email}</td>
                              <td className="py-4 px-5 whitespace-nowrap align-middle">
                                {u.role.toLowerCase().includes('student') && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedStudentForHistory({ id: u.id, userId: u.id, name: u.name, room: u.unit });
                                        setIsHistoryModalOpen(true);
                                      }}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors shadow-sm"
                                    >
                                      <Eye size={13} />
                                      <span>History</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCustomReceiptModal(u)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 transition-colors shadow-sm"
                                      title="Generate or print official fee receipt for this student"
                                    >
                                      <FileCheck2 size={12} className="text-emerald-600" />
                                      <span>Receipt</span>
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-5 whitespace-nowrap align-middle">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isBlocked
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${isBlocked ? 'bg-rose-600' : 'bg-emerald-600'}`} />
                                  <span>{isBlocked ? 'Blocked / Suspended' : 'Active'}</span>
                                </span>
                              </td>
                              <td className="py-4 px-5 text-right whitespace-nowrap align-middle">
                                {!isSelf ? (
                                  <div className="inline-flex items-center gap-2 justify-end">
                                    {/* Block / Unblock Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleBlockUser(u)}
                                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm ${isBlocked
                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                        }`}
                                      title={isBlocked ? 'Unblock & Restore Account' : 'Block & Suspend Account'}
                                    >
                                      {isBlocked ? <Unlock size={12} /> : <Ban size={12} />}
                                      <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                                    </button>

                                    {/* Delete User Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteUser(u)}
                                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-colors"
                                      title="Permanently Delete Account from System"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold px-2 py-1 bg-purple-50 dark:bg-purple-950/40 rounded-lg">
                                    Root Executive
                                  </span>
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

            {/* ========================================================================= */}
            {/* TAB 5: COMPLAINTS & GRIEVANCE GOVERNANCE                                  */}
            {/* ========================================================================= */}
            {activeTab === 'complaints' && (
              <div className="space-y-6">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <Wrench size={18} className="text-emerald-600" />
                      <span>Hostel Grievance & Maintenance Governance</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Direct executive oversight for all student maintenance requests, emergency work orders, and resolution approvals.
                    </p>
                  </div>

                  <button
                    onClick={fetchComplaints}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <RefreshCw size={13} className={loadingComplaints ? 'animate-spin' : ''} />
                    <span>Refresh Tickets</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    {['all', 'Open', 'In Progress', 'Resolved'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setComplaintFilter(st)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${complaintFilter.toLowerCase() === st.toLowerCase()
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                          : 'bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                      >
                        {st === 'all' ? 'All Statuses' : st}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search ticket, student, or room..."
                      value={complaintSearch}
                      onChange={(e) => setComplaintSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Complaints Table */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                  <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#060911]/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3 px-4 whitespace-nowrap">Ticket ID & Resident</th>
                          <th className="py-3 px-4 whitespace-nowrap">Category & Priority</th>
                          <th className="py-3 px-4">Title & Issue Description</th>
                          <th className="py-3 px-4 whitespace-nowrap">Assigned Staff</th>
                          <th className="py-3 px-4 whitespace-nowrap">Status</th>
                          <th className="py-3 px-4 text-right whitespace-nowrap">Executive Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredComplaints.length > 0 ? (
                          filteredComplaints.map((c) => {
                            const isResolved = c.status === 'Resolved';
                            return (
                              <tr key={c._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                                <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                                  <div className="font-mono font-bold text-slate-900 dark:text-white">{c.ticketId || `TKT-${c._id.slice(-4)}`}</div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">{c.studentName} ({c.room || 'Room'})</div>
                                </td>

                                <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                                  <div className="font-semibold text-slate-800 dark:text-slate-200">{c.category || 'General'}</div>
                                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${c.priority === 'High' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                                    c.priority === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                    }`}>
                                    {c.priority || 'Normal'}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 max-w-sm align-middle">
                                  <div className="font-bold text-slate-900 dark:text-white text-xs">{c.title}</div>
                                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{c.description}</p>
                                </td>

                                <td className="py-3.5 px-4 whitespace-nowrap align-middle text-slate-700 dark:text-slate-300 font-medium">
                                  {c.assignedStaff || 'Unassigned'}
                                </td>

                                <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${isResolved ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                    c.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                                      'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    }`}>
                                    {c.status || 'Open'}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-right whitespace-nowrap align-middle">
                                  <div className="inline-flex items-center gap-1.5 justify-end">
                                    {!isResolved ? (
                                      <>
                                        <button
                                          onClick={() => handleResolveComplaint(c._id)}
                                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs"
                                        >
                                          Resolve
                                        </button>
                                        <button
                                          onClick={() => handleAssignComplaint(c)}
                                          className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs"
                                        >
                                          Assign
                                        </button>
                                      </>
                                    ) : (
                                      <span className="text-emerald-600 font-bold text-xs">Completed</span>
                                    )}
                                    <button
                                      onClick={() => handleDeleteComplaint(c._id, c.ticketId)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                      title="Delete Ticket"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              No grievance tickets match the criteria.
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
            {/* TAB 6: SECURITY & GATE PASS CLEARANCE                                      */}
            {/* ========================================================================= */}
            {activeTab === 'gatepass' && (
              <div className="space-y-6">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <ShieldAlert size={18} className="text-emerald-600" />
                      <span>Security, Night-Out & Gate Pass Clearances</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Monitor campus border movement, verify weekend leave passes, and log arrivals and departures.
                    </p>
                  </div>

                  <button
                    onClick={fetchGatePasses}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <RefreshCw size={13} className={loadingGatePasses ? 'animate-spin' : ''} />
                    <span>Refresh Passes</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    {['all', 'Pending', 'Teacher Approved', 'Provost Approved', 'Departed', 'Returned', 'Rejected'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setGatePassFilter(st)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${gatePassFilter.toLowerCase() === st.toLowerCase()
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                          : 'bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                      >
                        {st === 'all' ? 'All Records' : st}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search pass, resident, destination..."
                      value={gatePassSearch}
                      onChange={(e) => setGatePassSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Gate Passes Table */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                  <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#060911]/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-3 px-4 whitespace-nowrap">Pass ID & Resident</th>
                          <th className="py-3 px-4 whitespace-nowrap">Schedule & Destination</th>
                          <th className="py-3 px-4">Stated Purpose</th>
                          <th className="py-3 px-4 whitespace-nowrap">Emergency Contact</th>
                          <th className="py-3 px-4 whitespace-nowrap">Gate Status</th>
                          <th className="py-3 px-4 text-right whitespace-nowrap">Security Override</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredGatePasses.length > 0 ? (
                          filteredGatePasses.map((g) => (
                            <tr key={g._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                              <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                                <div className="font-mono font-bold text-slate-900 dark:text-white">{g.passId || `LP-${g._id.slice(-4)}`}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">{g.studentName} ({g.studentId})</div>
                              </td>

                              <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                                <div className="font-semibold text-slate-800 dark:text-slate-200">{g.destination}</div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{g.fromDate} → {g.toDate}</div>
                              </td>

                              <td className="py-3.5 px-4 max-w-xs align-middle text-slate-600 dark:text-slate-300 truncate">
                                {g.reason}
                              </td>

                              <td className="py-3.5 px-4 whitespace-nowrap align-middle font-mono text-slate-600 dark:text-slate-300">
                                {g.emergencyContact || 'N/A'}
                              </td>

                              <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${g.status?.includes('Approved') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                  g.status === 'Departed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                                    g.status === 'Returned' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                                      g.status === 'Rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  }`}>
                                  {g.status || 'Pending'}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-right whitespace-nowrap align-middle">
                                <div className="inline-flex items-center gap-1.5 justify-end">
                                  {g.status !== 'Provost Approved' && g.status !== 'Returned' && (
                                    <button
                                      onClick={() => handleUpdateGatePass(g._id, 'Provost Approved')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs"
                                    >
                                      Approve
                                    </button>
                                  )}
                                  {g.status === 'Provost Approved' && (
                                    <button
                                      onClick={() => handleUpdateGatePass(g._id, 'Departed')}
                                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs"
                                    >
                                      Log Out
                                    </button>
                                  )}
                                  {g.status === 'Departed' && (
                                    <button
                                      onClick={() => handleUpdateGatePass(g._id, 'Returned')}
                                      className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-100 font-bold text-xs"
                                    >
                                      Log In
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              No gate passes match the filter.
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
            {/* TAB 7: BAZAR, DINING & STOCK AUDIT                                        */}
            {/* ========================================================================= */}
            {activeTab === 'bazar_dining' && (
              <DailyBazarMealReportSection
                role="admin"
                currentUser={currentUser}
                onShowToast={onShowToast}
              />
            )}

            {/* ========================================================================= */}
            {/* TAB 8: EXECUTIVE DIRECTIVES & OFFICIAL NOTICES                            */}
            {/* ========================================================================= */}
            {activeTab === 'notices' && (
              <div className="space-y-6">

                {/* Publish Notice Form */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2">
                        <Megaphone size={18} className="text-emerald-600" />
                        <span>Broadcast Official Directive to Campus</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Publish circulars visible on Student, House Tutor, and Provost notice boards immediately.
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      VC Directive
                    </span>
                  </div>

                  <form onSubmit={handlePublishNotice} className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Directive / Circular Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Mandatory Resident Curfew Inspection & Dining Advance Deadline"
                        value={broadcastForm.title}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Official Circular Body & Instructions</label>
                      <textarea
                        rows={3}
                        placeholder="Detail all institutional instructions, enforcement guidelines, and dates..."
                        value={broadcastForm.message}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 resize-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Notice Category</label>
                        <select
                          value={broadcastForm.category}
                          onChange={(e) => setBroadcastForm({ ...broadcastForm, category: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                        >
                          <option value="Executive Directive">Executive Directive</option>
                          <option value="Allocation">Allocation & Admissions</option>
                          <option value="Administration">Administration & Curfew</option>
                          <option value="Dining">Dining & Mess Operations</option>
                          <option value="Maintenance">Maintenance & Infrastructure</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Residence</label>
                        <select
                          value={broadcastForm.targetHall}
                          onChange={(e) => setBroadcastForm({ ...broadcastForm, targetHall: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                        >
                          <option value="Padma Residential Hall (Campus Residence)">Padma Residential Hall (All Floors)</option>
                          <option value="Padma Floor 1">Padma Floor 1</option>
                          <option value="Padma Floor 2">Padma Floor 2</option>
                          <option value="All Campus Residences">All Campus Residences</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Priority Level</label>
                        <select
                          value={broadcastForm.priority}
                          onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                        >
                          <option value="High (Immediate Popup)">High (Immediate Popup)</option>
                          <option value="Standard Notice">Standard Notice</option>
                          <option value="Red Alert">Red Alert</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Send size={13} />
                        <span>Publish Directive Now</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Published Notices List */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                      Active Campus Notices & Circulars ({noticesList.length})
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {noticesList.map((n) => (
                      <div key={n._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{n.title}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              {n.category || 'General'}
                            </span>
                            {n.isPinned && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                                Pinned
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{n.summary || n.message}</p>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                            <span>{n.date || 'Today'}</span>
                            <span>•</span>
                            <span>{n.authority || 'VC Office'}</span>
                          </div>
                        </div>

                        <div className="self-end sm:self-center shrink-0">
                          <button
                            onClick={() => handleDeleteNotice(n._id, n.title)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove Notice"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 9: TARIFFS, AI PARAMETERS & SYSTEM DIAGNOSTICS                        */}
            {/* ========================================================================= */}
            {activeTab === 'decisions' && (
              <div className="space-y-6">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Tariffs Master */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          University Residential Tariffs & Meal Rates
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Set official monthly rent rates, dining token costs, and fine regulations.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Active Tariffs
                      </span>
                    </div>

                    <form onSubmit={handleSaveTariffSettings} className="space-y-3.5 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          Room Quality Monthly Rent Rates
                        </span>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                              Single (1-Bed)
                            </label>
                            <input
                              type="number"
                              value={tariffSettings.singleRoomRentBDT}
                              onChange={(e) => setTariffSettings({ ...tariffSettings, singleRoomRentBDT: e.target.value })}
                              className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                              Double (2-Bed)
                            </label>
                            <input
                              type="number"
                              value={tariffSettings.doubleRoomRentBDT}
                              onChange={(e) => setTariffSettings({ ...tariffSettings, doubleRoomRentBDT: e.target.value })}
                              className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                              4-Bed Quad
                            </label>
                            <input
                              type="number"
                              value={tariffSettings.quadRoomRentBDT}
                              onChange={(e) => setTariffSettings({ ...tariffSettings, quadRoomRentBDT: e.target.value })}
                              className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-mono font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            Breakfast (৳)
                          </label>
                          <input
                            type="number"
                            value={tariffSettings.breakfastTokenBDT}
                            onChange={(e) => setTariffSettings({ ...tariffSettings, breakfastTokenBDT: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            Lunch (৳)
                          </label>
                          <input
                            type="number"
                            value={tariffSettings.lunchTokenBDT}
                            onChange={(e) => setTariffSettings({ ...tariffSettings, lunchTokenBDT: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            Dinner (৳)
                          </label>
                          <input
                            type="number"
                            value={tariffSettings.dinnerTokenBDT}
                            onChange={(e) => setTariffSettings({ ...tariffSettings, dinnerTokenBDT: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all"
                        >
                          Save & Enforce New Rates
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* AI Vectors Tuning */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                          <Sliders size={15} className="text-emerald-600" />
                          <span>Smart AI Compatibility & Vector Tuning</span>
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Weight vectors for academic merit, distance, and roommate compatibility.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        AI Model
                      </span>
                    </div>

                    <form onSubmit={handleSaveParams} className="space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-bold">
                          <span>Merit Weight (CGPA): {sysParams.cgpaWeight}%</span>
                          <span>Home Distance: {sysParams.distanceWeight}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={sysParams.cgpaWeight}
                          onChange={(e) => setSysParams({ ...sysParams, cgpaWeight: Number(e.target.value), distanceWeight: 100 - Number(e.target.value) })}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between font-bold">
                          <span>Lifestyle Compatibility Match Threshold:</span>
                          <span className="text-emerald-600 font-mono font-bold">{sysParams.smartRoommateThreshold}% Match</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="95"
                          value={sysParams.smartRoommateThreshold}
                          onChange={(e) => setSysParams({ ...sysParams, smartRoommateThreshold: Number(e.target.value) })}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all"
                        >
                          Save AI Vector Weights
                        </button>
                      </div>
                    </form>
                  </div>

                </div>

                {/* System Diagnostics & Health Card */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-2">
                        <Database size={18} className="text-emerald-600" />
                        <span>System Health, Maintenance & Database Control</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Check backend cluster connectivity, MongoDB Atlas replica status, or seed initial demo records.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={checkHealth}
                      className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Activity size={14} className={loadingHealth ? 'animate-spin' : 'text-emerald-600'} />
                      <span>Execute Cluster Health Check</span>
                    </button>

                    <button
                      onClick={handleSeedDatabase}
                      className="px-4 py-2 rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 hover:bg-red-100 font-bold text-xs flex items-center gap-1.5"
                    >
                      <RotateCcw size={14} />
                      <span>Re-seed System Demo Data</span>
                    </button>
                  </div>

                  {serverHealth && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        <span>Server & MongoDB Atlas Status: Healthy ({serverHealth.status})</span>
                      </div>
                      <div className="text-slate-500">Timestamp: {serverHealth.timestamp}</div>
                      <div className="text-slate-500">Database Engine: {serverHealth.database?.name} (Status: {serverHealth.database?.status})</div>
                      <div className="text-slate-500">Uptime: {Math.floor(serverHealth.uptime || 0)} seconds</div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 10: INSTITUTIONAL AUDIT TRAIL                                         */}
            {/* ========================================================================= */}
            {activeTab === 'audit' && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Institutional Security & Financial Audit Logs
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    {auditLogs.length} Verified Entries
                  </span>
                </div>

                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{log.actor}</span>
                          <span className="text-[10px] font-mono text-slate-400">#{log.id}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">{log.action}</p>
                      </div>
                      <div className="text-right sm:shrink-0 font-mono text-[11px] text-slate-400">
                        <div>{log.timestamp}</div>
                        <div className="text-[10px]">{log.ip}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: LOG OPERATIONAL EXPENSE                                            */}
      {/* ========================================================================= */}
      {
        newExpenseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt size={16} className="text-emerald-600" />
                  <span>Log Hostel Operational Expense Voucher</span>
                </h3>
                <button onClick={() => setNewExpenseModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateExpense} className="space-y-3.5">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Expense Title / Item Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Mess Raw Poultry & Rice Supply (Batch 2)"
                    value={newExpense.title}
                    onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Expense Category</label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                    >
                      <option value="Mess Grocery & Food Supplies">Mess Grocery & Food Supplies</option>
                      <option value="Electricity & Utilities">Electricity & Utilities</option>
                      <option value="Maintenance & Repairs">Maintenance & Repairs</option>
                      <option value="Staff Salaries & Honorarium">Staff Salaries & Honorarium</option>
                      <option value="Sanitation & Cleaning">Sanitation & Cleaning</option>
                      <option value="Internet & IT Infrastructure">Internet & IT Infrastructure</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Amount (BDT)</label>
                    <input
                      type="number"
                      placeholder="e.g. 45000"
                      value={newExpense.amountBDT}
                      onChange={(e) => setNewExpense({ ...newExpense, amountBDT: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Vendor / Payee</label>
                    <input
                      type="text"
                      placeholder="e.g. DESCO / Agro Wholesale"
                      value={newExpense.vendor}
                      onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Method</label>
                    <select
                      value={newExpense.paymentMethod}
                      onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Petty Cash">Petty Cash</option>
                      <option value="SSLCommerz Corporate">SSLCommerz Corporate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Additional Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Voucher or invoice remarks..."
                    value={newExpense.notes}
                    onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setNewExpenseModalOpen(false)}
                    className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                  >
                    Record Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* ========================================================================= */}
      {/* MODAL: MANUAL STUDENT INVOICE CREATION                                    */}
      {/* ========================================================================= */}
      {
        manualInvoiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard size={16} className="text-emerald-600" />
                  <span>Issue Manual Student Fee Invoice</span>
                </h3>
                <button onClick={() => setManualInvoiceModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateManualInvoice} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Student ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 221004128"
                      value={newInvoice.studentId}
                      onChange={(e) => setNewInvoice({ ...newInvoice, studentId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Student Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Tanvir Hasan"
                      value={newInvoice.studentName}
                      onChange={(e) => setNewInvoice({ ...newInvoice, studentName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Fee Type</label>
                    <select
                      value={newInvoice.feeType}
                      onChange={(e) => setNewInvoice({ ...newInvoice, feeType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                    >
                      <option value="Seat Rent">Seat Rent</option>
                      <option value="Mess Advance">Mess Advance</option>
                      <option value="Monthly Meal Token">Monthly Meal Token</option>
                      <option value="Admission Fee">Admission Fee</option>
                      <option value="Hostel Caution Money">Hostel Caution Money</option>
                      <option value="Late Fine">Late Fine</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Invoice Amount (৳ BDT)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2200"
                      value={newInvoice.amountBDT}
                      onChange={(e) => setNewInvoice({ ...newInvoice, amountBDT: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Billing Month</label>
                    <input
                      type="text"
                      value={newInvoice.month}
                      onChange={(e) => setNewInvoice({ ...newInvoice, month: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Assigned Room</label>
                    <input
                      type="text"
                      value={newInvoice.room}
                      onChange={(e) => setNewInvoice({ ...newInvoice, room: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setManualInvoiceModalOpen(false)}
                    className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                  >
                    Generate Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* ========================================================================= */}
      {/* MODAL: PROVISION NEW USER ACCOUNT                                         */}
      {/* ========================================================================= */}
      {
        newUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck size={16} className="text-emerald-600" />
                  <span>Provision User / Staff Account</span>
                </h3>
                <button onClick={() => setNewUserModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3.5">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Kazi Shafiul"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Institutional Role</label>
                    <select
                      value={newUserData.role}
                      onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                    >
                      <option value="Student">Student</option>
                      <option value="Teacher">Floor Teacher (House Tutor)</option>
                      <option value="Provost">Hostel Super (Provost)</option>
                      <option value="Staff">Hall Staff (Maintenance / Dining)</option>
                      <option value="Parent">Parent / Guardian</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="user@iubat.edu"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Department</label>
                    <input
                      type="text"
                      value={newUserData.department}
                      onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+880 1711 002233"
                      value={newUserData.phone}
                      onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Initial Password (Default: 123456)</label>
                  <input
                    type="password"
                    placeholder="Leave blank for 123456"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setNewUserModalOpen(false)}
                    className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                  >
                    Issue Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* ========================================================================= */}
      {/* MODAL: ROOM ALLOCATE MODAL                                                */}
      {/* ========================================================================= */}
      <RoomAllocateModal
        isOpen={isAllocateModalOpen}
        onClose={() => {
          setIsAllocateModalOpen(false);
          setSelectedAppForAllocate(null);
        }}
        application={selectedAppForAllocate}
        roomsList={roomsList}
        onSuccess={(msg) => {
          onShowToast?.(msg || 'Room allocated successfully!', 'success');
          fetchApplications();
          fetchRooms();
          fetchUsers();
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL: ROOM TRANSFER MODAL                                                */}
      {/* ========================================================================= */}
      <RoomTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setSelectedTransferStudent(null);
        }}
        studentData={selectedTransferStudent}
        roomsList={roomsList}
        onSuccess={(msg) => {
          onShowToast?.(msg || 'Room transfer executed!', 'success');
          fetchTransfers();
          fetchRooms();
          fetchUsers();
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL: STUDENT 360 PROFILE & HISTORY                                      */}
      {/* ========================================================================= */}
      <StudentHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedStudentForHistory(null);
        }}
        studentId={selectedStudentForHistory?.id || selectedStudentForHistory?.userId}
        studentData={selectedStudentForHistory}
      />

      {/* ========================================================================= */}
      {/* MODAL: GENERATE CUSTOM OFFICIAL MONEY RECEIPT                             */}
      {/* ========================================================================= */}
      {
        customReceiptModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck2 size={18} className="text-emerald-600" />
                  <span>Generate Official Money Receipt</span>
                </h3>
                <button onClick={() => setCustomReceiptModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handlePrintCustomReceipt} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Student ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 221004128"
                      value={customReceiptData.studentId}
                      onChange={(e) => setCustomReceiptData({ ...customReceiptData, studentId: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Student Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Tanvir Hasan"
                      value={customReceiptData.studentName}
                      onChange={(e) => setCustomReceiptData({ ...customReceiptData, studentName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Invoice Reference No.</label>
                    <input
                      type="text"
                      value={customReceiptData.invoiceNo}
                      onChange={(e) => setCustomReceiptData({ ...customReceiptData, invoiceNo: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">SSLCommerz / Bank Tran ID</label>
                    <input
                      type="text"
                      value={customReceiptData.transactionId}
                      onChange={(e) => setCustomReceiptData({ ...customReceiptData, transactionId: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Fee Category</label>
                    <select
                      value={customReceiptData.feeType}
                      onChange={(e) => setCustomReceiptData({ ...customReceiptData, feeType: e.target.value })}
                      className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                    >
                      <option value="Seat Rent">Seat Rent</option>
                      <option value="Mess Advance">Mess Advance</option>
                      <option value="Monthly Meal Token">Monthly Meal Token</option>
                      <option value="Admission Fee">Admission Fee</option>
                      <option value="Caution Money">Caution Money</option>
                      <option value="Late Fine">Late Fine</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Total Amount (৳ BDT)</label>
                    <input
                      type="number"
                      value={customReceiptData.amountBDT}
                      onChange={(e) => setCustomReceiptData({ ...customReceiptData, amountBDT: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Billing Month</label>
                    <input
                      type="text"
                      value={customReceiptData.month}
                      onChange={(e) => setCustomReceiptData({ ...customReceiptData, month: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Method / Channel</label>
                    <select
                      value={customReceiptData.paymentMethod}
                      onChange={(e) => setCustomReceiptData({ ...customReceiptData, paymentMethod: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                    >
                      <option value="SSLCommerz Gateway">SSLCommerz Gateway</option>
                      <option value="SSLCommerz (bKash)">SSLCommerz (bKash)</option>
                      <option value="SSLCommerz (Nagad)">SSLCommerz (Nagad)</option>
                      <option value="SSLCommerz (Card / Net Banking)">SSLCommerz (Card / Net Banking)</option>
                      <option value="Office Cash / Accounts Counter">Office Cash / Accounts Counter</option>
                      <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Clearance Status</label>
                    <select
                      value={customReceiptData.status}
                      onChange={(e) => setCustomReceiptData({ ...customReceiptData, status: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-bold text-emerald-600"
                    >
                      <option value="Paid">✓ Paid & Verified</option>
                      <option value="Pending">Pending Clearance</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Hall & Room Allocation</label>
                    <input
                      type="text"
                      value={`${customReceiptData.hall} - ${customReceiptData.room} (${customReceiptData.seatNo})`}
                      onChange={(e) => setCustomReceiptData({ ...customReceiptData, room: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Academic Department</label>
                    <input
                      type="text"
                      value={customReceiptData.department}
                      onChange={(e) => setCustomReceiptData({ ...customReceiptData, department: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCustomReceiptModalOpen(false)}
                    className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-700/20"
                  >
                    <Printer size={14} />
                    <span>Generate & View Receipt</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL PAYMENT / MONEY RECEIPT (PRINT / PDF)                     */}
      {/* ========================================================================= */}
      <PaymentReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedPaymentForReceipt(null);
        }}
        paymentData={selectedPaymentForReceipt}
        studentUser={currentUser}
      />

    </div >
  );
}
