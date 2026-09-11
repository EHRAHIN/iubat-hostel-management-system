import React, { useState, useEffect } from 'react';
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
  UserPlus
} from 'lucide-react';
import { api } from '../services/api';
import StudentHistoryModal from '../components/StudentHistoryModal';
import RoomManagerSection from '../components/RoomManagerSection';
import DailyBazarMealReportSection from '../components/DailyBazarMealReportSection';

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

  // 1. Financial Profit & Loss State
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

  // 2. Student History Modal State
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // 3. Infrastructure: Single Hall (Padma Residential Hall) with Floor 1 & Floor 2 (8 Rooms each, 3 Room Qualities)
  const [hallsData, setHallsData] = useState([
    {
      id: 'padma',
      name: 'Padma Residential Hall',
      gender: 'Campus Residence',
      totalRooms: 16, // 8 on Floor 1 + 8 on Floor 2
      totalBeds: 40,  // 20 on Floor 1 + 20 on Floor 2
      occupiedBeds: 34,
      status: 'Active',
      floors: [
        {
          floorNumber: 1,
          floorName: 'Padma Floor 1 (Ground & First Wing)',
          roomRange: 'Rooms 101 - 108',
          roomsCount: 8, // 8 rooms total
          beds: 20,      // 2 Single (2) + 3 Double (6) + 3 Quad (12) = 20 beds
          occupied: 17,
          houseTutor: 'Dr. Tariqul Islam',
          tutorDept: 'Dept. of CSE',
          tutorPhone: '+880 1712 110022',
          tutorEmail: 'tutor.padma1@iubat.edu',
          rooms: [
            { roomNo: '101', quality: 'Single (1-Bed)', capacity: 1, occupied: 1, rate: 5500 },
            { roomNo: '102', quality: 'Single (1-Bed)', capacity: 1, occupied: 1, rate: 5500 },
            { roomNo: '103', quality: 'Double (2-Bed)', capacity: 2, occupied: 2, rate: 3500 },
            { roomNo: '104', quality: 'Double (2-Bed)', capacity: 2, occupied: 2, rate: 3500 },
            { roomNo: '105', quality: 'Double (2-Bed)', capacity: 2, occupied: 2, rate: 3500 },
            { roomNo: '106', quality: '4-Bed Room (Quad)', capacity: 4, occupied: 4, rate: 2500 },
            { roomNo: '107', quality: '4-Bed Room (Quad)', capacity: 4, occupied: 3, rate: 2500 },
            { roomNo: '108', quality: '4-Bed Room (Quad)', capacity: 4, occupied: 2, rate: 2500 },
          ],
        },
        {
          floorNumber: 2,
          floorName: 'Padma Floor 2 (Upper Residential Wing)',
          roomRange: 'Rooms 201 - 208',
          roomsCount: 8, // 8 rooms total
          beds: 20,      // 2 Single (2) + 3 Double (6) + 3 Quad (12) = 20 beds
          occupied: 17,
          houseTutor: 'Prof. Anisur Rahman',
          tutorDept: 'Dept. of EEE',
          tutorPhone: '+880 1712 110023',
          tutorEmail: 'tutor.padma2@iubat.edu',
          rooms: [
            { roomNo: '201', quality: 'Single (1-Bed)', capacity: 1, occupied: 1, rate: 5500 },
            { roomNo: '202', quality: 'Single (1-Bed)', capacity: 1, occupied: 1, rate: 5500 },
            { roomNo: '203', quality: 'Double (2-Bed)', capacity: 2, occupied: 2, rate: 3500 },
            { roomNo: '204', quality: 'Double (2-Bed)', capacity: 2, occupied: 2, rate: 3500 },
            { roomNo: '205', quality: 'Double (2-Bed)', capacity: 2, occupied: 2, rate: 3500 },
            { roomNo: '206', quality: '4-Bed Room (Quad)', capacity: 4, occupied: 4, rate: 2500 },
            { roomNo: '207', quality: '4-Bed Room (Quad)', capacity: 4, occupied: 3, rate: 2500 },
            { roomNo: '208', quality: '4-Bed Room (Quad)', capacity: 4, occupied: 2, rate: 2500 },
          ],
        },
      ],
    },
  ]);

  // 4. Global Tariffs & Executive Decisions State (with 3 Room Qualities)
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

  // 5. User Governance State
  const [selectedActorFilter, setSelectedActorFilter] = useState('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [usersList, setUsersList] = useState([]);
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

  // 6. System Configuration & AI Parameters State
  const [sysParams, setSysParams] = useState({
    activeSession: 'Spring 2026',
    applicationOpen: true,
    cgpaWeight: 60,
    distanceWeight: 40,
    smartRoommateThreshold: 85,
    autoAssignRoommate: true,
    curfewCutoffTime: '22:00',
  });

  // 7. Audit Trail State
  const [auditLogs, setAuditLogs] = useState([
    { id: 'AUD-9915', timestamp: 'Today at 02:40 PM', actor: 'Super Admin Prof. Dr. Abdur Rob', action: 'Approved Emergency Grocery Procurement Voucher (৳72,500 BDT)', ip: '10.10.1.1', severity: 'Info' },
    { id: 'AUD-9914', timestamp: 'Today at 01:15 PM', actor: 'Hostel Super Prof. Monirul Islam', action: 'Direct Approved Leave Pass LP-2026-506 for Tanvir Hasan', ip: '192.168.10.22', severity: 'Info' },
    { id: 'AUD-9913', timestamp: 'Today at 12:45 PM', actor: 'Floor Teacher Dr. Tariqul Islam', action: 'Endorsed Roll-Call Sheet for Padma Floor 1 (15 Boarders)', ip: '192.168.10.45', severity: 'Low' },
    { id: 'AUD-9912', timestamp: 'Yesterday at 06:30 PM', actor: 'Parent Md. Rafiqul Hasan', action: 'Paid Monthly Mess Bill via SSLCommerz Gateway (৳2,450 BDT)', ip: '103.114.98.12', severity: 'Security' },
    { id: 'AUD-9911', timestamp: 'Yesterday at 03:00 PM', actor: 'Staff Md. Kalam Hossain', action: 'Executed Plumbing Work Order #WRK-089 (Water Pump Filter)', ip: '192.168.10.88', severity: 'Low' },
  ]);

  // Emergency Broadcast Form
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    targetHall: 'All Halls (Padma & Meghna)',
    priority: 'High (Immediate Popup)',
  });

  // Fetch Financials & Expenses
  const fetchFinancialData = async () => {
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
  };

  // Fetch Users
  const fetchUsers = async () => {
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
          raw: u,
        })));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchFinancialData();
    fetchUsers();
  }, []);

  // Handlers for User Governance
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
    if (!window.confirm(`[ADMIN OVERRIDE] Permanently delete account for "${user.name}" (${user.role} - ID: ${user.id}) from the database? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteUser(user.id || user._id);
      setUsersList((prev) => prev.filter((u) => u.id !== user.id && u._id !== user._id));
      onShowToast(`Account for ${user.name} (${user.role}) permanently removed.`, 'info');
    } catch (err) {
      onShowToast(err.message || 'Failed to delete user.', 'error');
    }
  };

  // Handlers
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

  const handleSaveTariffSettings = (e) => {
    e.preventDefault();
    onShowToast('Global hostel room tariffs, meal pricing, and late fee policies updated university-wide.', 'success');
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      onShowToast('Please enter both announcement title and message.', 'error');
      return;
    }
    onShowToast(`Executive Directive broadcasted to all residents and tutors of ${broadcastForm.targetHall}!`, 'success');
    setBroadcastForm({
      title: '',
      message: '',
      targetHall: 'Padma Residential Hall (Campus Residence)',
      priority: 'High (Immediate Popup)',
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email) return;

    try {
      await api.provisionUser({
        name: newUserData.name,
        email: newUserData.email,
        password: newUserData.password || '123456',
        role: newUserData.role.toLowerCase(),
        department: newUserData.department,
        phone: newUserData.phone || '+880 1711 002233',
        unit: newUserData.unit,
      });

      onShowToast(`Official ${newUserData.role} account provisioned for ${newUserData.name}. Credentials active.`, 'success');
      setNewUserModalOpen(false);
      setNewUserData({ name: '', role: 'Student', email: '', unit: '', password: '', phone: '', department: 'CSE' });
      await fetchUsers();
    } catch (err) {
      onShowToast(err.message || 'Failed to provision user.', 'error');
    }
  };

  const handleSaveParams = (e) => {
    e.preventDefault();
    onShowToast('System operational parameters and Smart Searching Roommate thresholds saved & applied.', 'success');
  };

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    const matchesFilter = selectedActorFilter === 'all' || u.role.toLowerCase().includes(selectedActorFilter.toLowerCase());
    const matchesSearch = u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                          u.id.toLowerCase().includes(userSearchQuery.toLowerCase());
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
      label: 'Financial P&L & Profit/Loss',
      desc: 'Revenues, Outflows & Profit',
      icon: DollarSign,
      badge: `+৳${(summary.netProfitBDT / 1000).toFixed(0)}k Surplus`,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    },
    {
      id: 'decisions',
      label: 'Executive Decisions & Tariffs',
      desc: 'Pricing, Curfew & Broadcasts',
      icon: Crown,
    },
    {
      id: 'infrastructure',
      label: 'Halls & Floor Architecture',
      desc: 'Padma Residential Hall (Floor 1 & 2)',
      icon: Building2,
      badge: '1 Hall • 2 Floors',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
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
      id: 'parameters',
      label: 'AI Roommate Tuning',
      desc: 'Merit & Compatibility Weights',
      icon: Sliders,
    },
    {
      id: 'audit',
      label: 'Institutional Audit Trail',
      desc: 'Live Security & Transaction Logs',
      icon: Activity,
    },
    {
      id: 'bazar_dining',
      label: 'Bazar, Dining & Stock Audit',
      desc: 'Date-wise Headcount & Grocery Cost',
      icon: Utensils,
      badge: 'Bazar Audit',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#060911] text-slate-900 dark:text-slate-100">
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Top Header Bar */}
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
              <Crown size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  {admin.name}
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
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
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/60 dark:hover:text-red-300 text-slate-700 dark:text-slate-300 transition-all shadow-sm"
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
                Governance Navigation
              </div>

              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-start gap-3 relative ${
                        isActive
                          ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-700/20 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
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
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              isActive ? 'bg-white/20 text-white' : item.badgeColor
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
                Full authority override enabled for room allocations, expense disbursements, and staff provisioning.
              </p>
            </div>
          </aside>

          {/* RIGHT CONTENT WORKSPACE (Col 4-12) */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* ========================================================================= */}
            {/* TAB 1: FINANCIAL PROFIT & LOSS (P&L) & EXPENSE LEDGER                     */}
            {/* ========================================================================= */}
            {activeTab === 'financials' && (
              <div className="space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                      Hostel Institutional Financial Ledger & Profit/Loss Audit
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Comprehensive financial ledger tracking revenue collections against operational expenditures.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setNewExpenseModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all shrink-0"
                  >
                    <Plus size={14} />
                    <span>Log Operational Expense</span>
                  </button>
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
                          { month: 'March 2026 (Running)', revenue: 647000, expenses: 388000, profit: 259000, margin: '40.0%', status: 'Net Surplus' },
                          { month: 'February 2026', revenue: 615000, expenses: 356000, profit: 259000, margin: '42.1%', status: 'Net Surplus' },
                          { month: 'January 2026', revenue: 590000, expenses: 370000, profit: 220000, margin: '37.3%', status: 'Net Surplus' },
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
            {/* TAB 2: EXECUTIVE DECISIONS & TARIFFS                                      */}
            {/* ========================================================================= */}
            {activeTab === 'decisions' && (
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Global Pricing & Fee Structure Master */}
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
                              Single Room (1-Bed)
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
                              Double Room (2-Bed)
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
                              4-Bed Quad Room
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

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Late Payment Fine (BDT/Day)
                        </label>
                        <input
                          type="number"
                          value={tariffSettings.lateFeePerDayBDT}
                          onChange={(e) => setTariffSettings({ ...tariffSettings, lateFeePerDayBDT: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-mono font-bold"
                        />
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
                            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-mono font-bold"
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
                            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-mono font-bold"
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
                            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-mono font-bold"
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

                  {/* Emergency Directives & Campus Broadcast */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                          <Megaphone size={15} className="text-emerald-600" />
                          <span>Emergency Directive & Hall Broadcast</span>
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Broadcast executive orders, emergency curfews, or inspection schedules.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                        VC Directive
                      </span>
                    </div>

                    <form onSubmit={handleSendBroadcast} className="space-y-3.5 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Announcement Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Special Night Inspection & Curfew Enforcement"
                          value={broadcastForm.title}
                          onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 font-bold"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Directive Message</label>
                        <textarea
                          rows={3}
                          placeholder="Provide full directive details for residents and House Tutors..."
                          value={broadcastForm.message}
                          onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Audience</label>
                          <select
                            value={broadcastForm.targetHall}
                            onChange={(e) => setBroadcastForm({ ...broadcastForm, targetHall: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                          >
                            <option value="Padma Residential Hall (Campus Residence)">Padma Residential Hall (All Floors)</option>
                            <option value="Padma Floor 1">Padma Floor 1 (Ground & First Wing)</option>
                            <option value="Padma Floor 2">Padma Floor 2 (Upper Wing)</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Broadcast Priority</label>
                          <select
                            value={broadcastForm.priority}
                            onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800"
                          >
                            <option value="High (Immediate Popup)">High (Immediate Popup)</option>
                            <option value="Standard Notice">Standard Notice</option>
                            <option value="Red Alert (Curfew Lockdown)">Red Alert (Curfew Lockdown)</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md transition-all"
                        >
                          Broadcast Directive Now
                        </button>
                      </div>
                    </form>
                  </div>

                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: COMPLETE PADMA RESIDENTIAL HALL (FLOORS 1 & 2) ARCHITECTURE        */}
            {/* ========================================================================= */}
            {activeTab === 'infrastructure' && (
              <div className="space-y-6">
                
                {/* Live Room & Bed Inventory Manager */}
                <RoomManagerSection
                  currentUser={currentUser}
                  onShowToast={onShowToast}
                />
                
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                        Padma Residential Hall Infrastructure & Floor Architecture
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Campus residential wing with 16 Rooms total across 2 Floors (8 Rooms per Floor) featuring 3 distinct room qualities.
                      </p>
                    </div>

                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      2 Floors • 16 Rooms • 40 Beds Total
                    </span>
                  </div>
                </div>

                {/* 3 Room Qualities Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#0d121f] border border-purple-200/80 dark:border-purple-900/40 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Quality 1</span>
                      <span className="text-[11px] font-mono font-black text-purple-700 dark:text-purple-300">৳5,500/mo</span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">Single Room (1-Bed)</div>
                    <div className="text-xs text-slate-500">
                      4 Rooms (101, 102, 201, 202) • 4 Beds Total • Premium Individual Living
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#0d121f] border border-blue-200/80 dark:border-blue-900/40 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Quality 2</span>
                      <span className="text-[11px] font-mono font-black text-blue-700 dark:text-blue-300">৳3,500/mo</span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">Double Room (2-Bed)</div>
                    <div className="text-xs text-slate-500">
                      6 Rooms (103-105, 203-205) • 12 Beds Total • Bed A & Bed B Shared
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#0d121f] border border-emerald-200/80 dark:border-emerald-900/40 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Quality 3</span>
                      <span className="text-[11px] font-mono font-black text-emerald-700 dark:text-emerald-300">৳2,500/mo</span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">4-Bed Room (Quad)</div>
                    <div className="text-xs text-slate-500">
                      6 Rooms (106-108, 206-208) • 24 Beds Total • Beds A, B, C, D Economy
                    </div>
                  </div>
                </div>

                {/* Hall Overview Card */}
                <div className="space-y-6">
                  {hallsData.map((hall) => {
                    const hallOccupancy = ((hall.occupiedBeds / hall.totalBeds) * 100).toFixed(1);
                    return (
                      <div key={hall.id} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
                        
                        {/* Hall Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xl">
                              <Building2 size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">{hall.name}</h3>
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                  Campus Residence
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                2 Residential Floors • 16 Rooms Total (8 Rooms / Floor) • 40 Beds Capacity
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-right">
                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800">
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Hall Occupancy</span>
                              <span className="text-base font-mono font-black text-emerald-600 dark:text-emerald-400">
                                {hall.occupiedBeds}/{hall.totalBeds} Beds ({hallOccupancy}%)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Floors Grid for this Hall (Floor 1 & Floor 2) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {hall.floors.map((fl) => {
                            const flPct = ((fl.occupied / fl.beds) * 100).toFixed(0);
                            return (
                              <div key={fl.floorNumber} className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 space-y-4 hover:border-emerald-500/50 transition-all">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                                      <Layers size={15} className="text-emerald-600" />
                                      <span>Floor {fl.floorNumber}</span>
                                    </h4>
                                    <span className="text-xs text-slate-500 font-mono font-bold">{fl.roomRange} (8 Rooms Total)</span>
                                  </div>
                                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                    {fl.occupied}/{fl.beds} Beds ({flPct}%)
                                  </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${flPct}%` }} />
                                </div>

                                {/* 8 Individual Room Badges Grid */}
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                                    8 Rooms Layout & Quality Specifications
                                  </span>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {fl.rooms?.map((rm) => {
                                      const isSingle = rm.quality.includes('Single');
                                      const isDouble = rm.quality.includes('Double');
                                      return (
                                        <div
                                          key={rm.roomNo}
                                          className={`p-2.5 rounded-xl border text-center transition-all ${
                                            isSingle
                                              ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/60'
                                              : isDouble
                                              ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60'
                                              : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                                          }`}
                                        >
                                          <div className="font-mono font-black text-xs text-slate-900 dark:text-white">
                                            Room {rm.roomNo}
                                          </div>
                                          <div className={`text-[9px] font-bold truncate mt-0.5 ${
                                            isSingle ? 'text-purple-700 dark:text-purple-300' : isDouble ? 'text-blue-700 dark:text-blue-300' : 'text-emerald-700 dark:text-emerald-300'
                                          }`}>
                                            {isSingle ? 'Single' : isDouble ? 'Double' : '4-Bed'}
                                          </div>
                                          <div className="text-[10px] font-mono text-slate-500 font-semibold mt-1">
                                            {rm.occupied}/{rm.capacity} Beds
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Designated House Tutor Card */}
                                <div className="p-3.5 rounded-xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                                  <div className="text-[10px] uppercase font-bold text-slate-400">Designated House Tutor</div>
                                  <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                    <span>{fl.houseTutor}</span>
                                    <span className="text-[10px] font-mono text-emerald-600 font-semibold">{fl.tutorDept}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/60 flex-wrap">
                                    <span className="flex items-center gap-1 font-mono"><Phone size={11} /> {fl.tutorPhone}</span>
                                    <span className="flex items-center gap-1"><Mail size={11} /> {fl.tutorEmail}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                      </div>
                    );
                  })}
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
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all capitalize whitespace-nowrap ${
                          selectedActorFilter === actor
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
                                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mt-1 ${
                                  u.role === 'Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
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
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedStudentForHistory({ id: u.id, userId: u.id, name: u.name, room: u.unit });
                                      setIsHistoryModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors shadow-sm"
                                  >
                                    <Eye size={13} />
                                    <span>Full History</span>
                                  </button>
                                )}
                              </td>
                              <td className="py-4 px-5 whitespace-nowrap align-middle">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                  isBlocked
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
                                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                                        isBlocked
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
            {/* TAB 5: AI ROOMMATE TUNING                                                 */}
            {/* ========================================================================= */}
            {activeTab === 'parameters' && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Smart Searching Roommate & Seat Allocation Vectors
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure weight vectors for academic merit, distance, and study compatibility.
                  </p>
                </div>

                <form onSubmit={handleSaveParams} className="space-y-6 text-xs max-w-xl">
                  <div className="space-y-2">
                    <div className="flex justify-between font-bold">
                      <span>Academic Merit Weight (CGPA): {sysParams.cgpaWeight}%</span>
                      <span>Home Distance Weight: {sysParams.distanceWeight}%</span>
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

                  <div className="space-y-2">
                    <div className="flex justify-between font-bold">
                      <span>Roommate Compatibility Match Threshold:</span>
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

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all"
                    >
                      Save AI Vector Weights
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 6: SECURITY AUDIT TRAIL                                               */}
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

          </main>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: LOG OPERATIONAL EXPENSE                                            */}
      {/* ========================================================================= */}
      {newExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-xs">
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
      )}

      {/* ========================================================================= */}
      {/* MODAL: PROVISION NEW USER ACCOUNT                                         */}
      {/* ========================================================================= */}
      {newUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-xs">
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
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Assigned Department</label>
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
      )}

      {/* ========================================================================= */}
      {/* COMPREHENSIVE STUDENT 360 PROFILE & HISTORY MODAL                         */}
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

    </div>
  );
}
