import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DailyBazarMealReportSection from '../components/DailyBazarMealReportSection';
import { 
  Wrench, 
  Utensils, 
  Key, 
  ClipboardCheck, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Check, 
  Plus, 
  Layers, 
  Building2, 
  Package, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  QrCode,
  DollarSign,
  Truck,
  RotateCcw,
  Zap,
  Droplets,
  Wifi,
  ShoppingBag,
  Activity,
  X,
  Sliders,
  Trash2,
  Receipt,
  FileText,
  CalendarCheck,
  UserX,
  ShieldAlert
} from 'lucide-react';

export default function StaffDashboard({ currentUser, onLogout, onShowToast }) {
  // Determine role & hall from login session
  const isDiningStaff = Boolean(
    currentUser?.department?.toLowerCase().includes('dining') ||
    currentUser?.department?.toLowerCase().includes('mess') ||
    currentUser?.email?.includes('dining') ||
    currentUser?.userId?.includes('DIN')
  );

  const staff = {
    name: currentUser?.name || (isDiningStaff ? 'Md. Faruk Hossain' : 'Md. Kalam Hossain'),
    role: currentUser?.department || `Padma Hall ${isDiningStaff ? 'Dining Staff' : 'Maintenance Staff'} In-Charge`,
    assignedHall: 'Padma Residential Hall',
    staffId: currentUser?.userId || (isDiningStaff ? 'STF-DIN-PAD-001' : 'STF-MNT-PAD-001'),
    isDining: isDiningStaff,
  };

  const isDining = Boolean(
    currentUser?.staffSubtype === 'dining' ||
    currentUser?.department?.toLowerCase().includes('dining') ||
    currentUser?.department?.toLowerCase().includes('mess') ||
    currentUser?.email?.includes('dining') ||
    currentUser?.userId?.includes('DIN') ||
    isDiningStaff
  );

  const [workspaceMode] = useState(() => (isDining ? 'dining' : 'maintenance'));

  // Main active tab: 'maintenance', 'meals-queue', 'handover', 'bazar', 'bazar-history', 'token'
  const [activeTab, setActiveTab] = useState(() => (isDining ? 'meals-queue' : 'maintenance'));

  useEffect(() => {
    if (workspaceMode === 'maintenance' && !['maintenance', 'handover'].includes(activeTab)) {
      setActiveTab('maintenance');
    } else if (workspaceMode === 'dining' && !['meals-queue', 'student-leaves', 'bazar', 'bazar-history'].includes(activeTab)) {
      setActiveTab('meals-queue');
    }
  }, [workspaceMode, activeTab]);

  // -------------------------------------------------------------
  // 1. LIVE MAINTENANCE WORK ORDERS (Electricity, Net, Plumbing, Furniture)
  // -------------------------------------------------------------
  const [issueFilter, setIssueFilter] = useState('all');
  const [newIssueModalOpen, setNewIssueModalOpen] = useState(false);
  const [newIssueForm, setNewIssueForm] = useState({
    title: '',
    category: 'Electrical',
    location: 'Padma Hall Floor 1 • Room 104',
    priority: 'Normal',
    description: '',
    materialsNeeded: '',
  });

  const [workOrders, setWorkOrders] = useState([]);
  const [isLoadingWorkOrders, setIsLoadingWorkOrders] = useState(false);
  const [materialRequisitions, setMaterialRequisitions] = useState([
    { id: 'REQ-2026-01', item: 'LED Tube Lights 20W', qty: '12 Pcs', priority: 'High', status: 'Pending Delivery' },
    { id: 'REQ-2026-02', item: 'RJ45 Cat6 Connectors & LAN Cables', qty: '1 Roll', priority: 'Normal', status: 'Approved' },
    { id: 'REQ-2026-03', item: 'Door Lock Latches & Screws', qty: '5 Sets', priority: 'Urgent', status: 'In Transit' },
  ]);

  const fetchWorkOrders = async () => {
    setIsLoadingWorkOrders(true);
    try {
      const res = await api.getComplaints();
      if (res?.data) {
        setWorkOrders(res.data);
      }
    } catch (err) {
      console.log('Error fetching work orders for staff:', err.message);
    } finally {
      setIsLoadingWorkOrders(false);
    }
  };

  // -------------------------------------------------------------
  // 2. LIVE STUDENT MEAL APPLICATIONS & APPROVALS ("Dining staff approve korbe")
  // -------------------------------------------------------------
  const [mealBookings, setMealBookings] = useState([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);

  const fetchMealBookings = async () => {
    setIsLoadingMeals(true);
    try {
      const res = await api.getMealBookings();
      if (res?.data) {
        setMealBookings(res.data);
      }
    } catch (err) {
      console.log('Error fetching meal applications for staff:', err.message);
    } finally {
      setIsLoadingMeals(false);
    }
  };

  // -------------------------------------------------------------
  // 2.5 LIVE STUDENTS ON APPROVED LEAVE / OUT-PASS (AUTOMATIC MEAL OFF)
  // -------------------------------------------------------------
  const [studentsOnLeave, setStudentsOnLeave] = useState([]);
  const [mealSearchQuery, setMealSearchQuery] = useState('');
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(false);

  const fetchStudentsOnLeave = async () => {
    setIsLoadingLeaves(true);
    try {
      const res = await api.getGatePasses();
      if (res?.data && res.data.length > 0) {
        // STRICT FILTER: Only fully approved active passes count as being on leave!
        // If Guardian rejected, Floor Teacher rejected, or consent declined -> NOT ON LEAVE!
        const approvedOnly = res.data.filter((p) => {
          const st = (p.status || '').toLowerCase();
          const isRejected = st.includes('reject') || 
                             p.guardianConsent === 'Declined' || 
                             p.floorTeacherStatus === 'Rejected';
          const isApproved = st.includes('approved') || st === 'on approved leave' || st.includes('completed');
          return isApproved && !isRejected;
        });

        const liveMapped = approvedOnly.map((p) => ({
          id: p.passId || p._id,
          studentId: p.studentId,
          studentName: p.studentName,
          hall: p.hall || staff.assignedHall,
          room: p.room || 'Room 104',
          passType: p.passType || 'Weekend Out-Pass',
          fromDate: p.fromDate,
          toDate: p.toDate,
          duration: `${p.fromDate} to ${p.toDate}`,
          destination: p.destination || 'Family Residence',
          emergencyContact: p.emergencyContact || '+880 1711 000000',
          reason: p.reason || 'Personal / Family Visit',
          status: p.status || 'On Approved Leave',
          mealStatus: 'Auto OFF (Student on Approved Leave)',
          approvedBy: p.approvedBy || 'House Tutor Approved',
        }));

        setStudentsOnLeave(liveMapped);
      } else {
        setStudentsOnLeave([]);
      }
    } catch (err) {
      console.log('Error fetching live gate passes for dining staff:', err.message);
    } finally {
      setIsLoadingLeaves(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
    fetchMealBookings();
    fetchStudentsOnLeave();
  }, []);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!newIssueForm.description.trim()) {
      onShowToast('Please provide an issue description.', 'error');
      return;
    }

    try {
      const res = await api.createComplaint({
        studentId: staff.staffId,
        studentName: `${staff.name} (Direct Staff Entry)`,
        hall: staff.assignedHall,
        floor: 'Floor 1',
        room: newIssueForm.location,
        category: newIssueForm.category,
        priority: newIssueForm.priority,
        title: newIssueForm.title || `${newIssueForm.category} Repair at ${newIssueForm.location}`,
        description: newIssueForm.description,
      });

      if (res?.data) {
        setWorkOrders([res.data, ...workOrders]);
        setNewIssueModalOpen(false);
        setNewIssueForm({
          title: '',
          category: 'Electrical',
          location: 'Padma Hall Floor 1 • Room 104',
          priority: 'Normal',
          description: '',
          materialsNeeded: '',
        });
        onShowToast(res.message || 'Maintenance ticket created and logged for immediate action.', 'success');
      }
    } catch (err) {
      onShowToast(err.message || 'Failed to log maintenance problem.', 'error');
    }
  };

  const handleUpdateTicketStatus = async (ticketId, nextStatus) => {
    try {
      const res = await api.updateComplaintStatus(ticketId, {
        status: nextStatus,
        resolutionNotes: `Work order completed and verified on-site by ${staff.name}.`,
      });

      setWorkOrders((prev) =>
        prev.map((t) =>
          (t.ticketId === ticketId || t._id === ticketId || t.id === ticketId)
            ? { ...t, status: nextStatus }
            : t
        )
      );
      onShowToast(res.message || `Work order #${ticketId} updated to: ${nextStatus}.`, 'success');
    } catch (err) {
      onShowToast(err.message || 'Failed to update ticket status.', 'error');
    }
  };

  // Staff Approves Student Meal Application & Confirms Food Handover
  const handleApproveMeal = async (bookingId) => {
    try {
      const res = await api.approveMealBooking(bookingId, { staffName: staff.name });
      setMealBookings((prev) =>
        prev.map((b) =>
          (b.bookingId === bookingId || b._id === bookingId || b.id === bookingId)
            ? { ...b, status: 'Approved & Served', foodCollected: true, collectedAt: new Date(), approvedBy: staff.name, approvedAt: new Date() }
            : b
        )
      );
      onShowToast(res.message || `Meal #${bookingId} approved & handed over!`, 'success');
      fetchMealBookings();
    } catch (err) {
      onShowToast(err.message || 'Failed to approve meal application.', 'error');
    }
  };

  // -------------------------------------------------------------
  // 3. ROOM HANDOVER & INVENTORY CHECKLIST
  // -------------------------------------------------------------
  const [handoverList, setHandoverList] = useState([
    {
      id: 'HO-2026-019',
      studentName: 'Tanvir Hasan',
      studentId: '221004128',
      room: 'Padma Hall Room 104 (Bed B)',
      type: 'Check-In Clearance',
      date: 'Jan 15, 2026',
      items: { roomKey: true, bedFrame: true, studyTable: true, wardrobeLock: true, mattress: true },
      status: 'Handover Completed',
    },
    {
      id: 'HO-2026-022',
      studentName: 'Emdadul Haque Rahin',
      studentId: '22203188',
      room: 'Padma Hall Room 104 (Bed B)',
      type: 'Room Key & Furniture Issuance',
      date: 'Pending Inspection',
      items: { roomKey: false, bedFrame: true, studyTable: true, wardrobeLock: false, mattress: true },
      status: 'Awaiting Student Signature',
    },
  ]);

  const handleCompleteHandover = (handoverId) => {
    setHandoverList((prev) =>
      prev.map((h) =>
        h.id === handoverId
          ? { ...h, status: 'Handover Completed', items: { roomKey: true, bedFrame: true, studyTable: true, wardrobeLock: true, mattress: true } }
          : h
      )
    );
    onShowToast(`Room inventory handover #${handoverId} completed.`, 'success');
  };

  // -------------------------------------------------------------
  // 4. DAILY BAZAR OPERATIONS
  // -------------------------------------------------------------
  const [bazarList, setBazarList] = useState([
    { id: 'BAZ-01', item: 'Miniket Rice (Medium Grain)', qtyNeeded: '35 kg', category: 'Grains & Staple', estRate: '72 BDT/kg', estTotal: 2520, source: 'Kawran Bazar Wholesale', status: 'Ready for Purchase' },
    { id: 'BAZ-02', item: 'Fresh Broiler Chicken', qtyNeeded: '28 kg', category: 'Poultry & Meat', estRate: '210 BDT/kg', estTotal: 5880, source: 'Uttara Local Wholesale Market', status: 'Ready for Purchase' },
    { id: 'BAZ-03', item: 'Rui / Pangas Fish (Cleaned Cut)', qtyNeeded: '20 kg', category: 'Fish & Seafood', estRate: '240 BDT/kg', estTotal: 4800, source: 'Abdullahpur Fish Arat', status: 'Ready for Purchase' },
    { id: 'BAZ-04', item: 'Masur Lentils (Dal)', qtyNeeded: '8 kg', category: 'Pulses', estRate: '140 BDT/kg', estTotal: 1120, source: 'Kawran Bazar Wholesale', status: 'Ready for Purchase' },
    { id: 'BAZ-05', item: 'Soybean Cooking Oil', qtyNeeded: '6 Liters', category: 'Oils & Ghee', estRate: '175 BDT/L', estTotal: 1050, source: 'Depot Supply', status: 'In Stock' },
    { id: 'BAZ-06', item: 'Potatoes & Fresh Seasonal Veggies', qtyNeeded: '25 kg', category: 'Vegetables', estRate: '40 BDT/kg', estTotal: 1000, source: 'Uttara Morning Bazar', status: 'Ready for Purchase' },
    { id: 'BAZ-07', item: 'Onions, Ginger, Garlic & Spices', qtyNeeded: '6 kg Assorted', category: 'Spices', estRate: '120 BDT/kg', estTotal: 720, source: 'Local Wholesale', status: 'Ready for Purchase' },
    { id: 'BAZ-08', item: 'Farm Fresh Eggs', qtyNeeded: '200 Pieces', category: 'Eggs & Dairy', estRate: '11.5 BDT/pc', estTotal: 2300, source: 'Poultry Farm Direct', status: 'Ready for Purchase' },
  ]);

  const totalEstimatedBazarCost = bazarList.reduce((acc, curr) => acc + curr.estTotal, 0);

  // Log Daily Bazar Expense Modal
  const [bazarExpenseModalOpen, setBazarExpenseModalOpen] = useState(false);
  const [bazarExpenseForm, setBazarExpenseForm] = useState({
    voucherNo: `VCH-${Math.floor(1000 + Math.random() * 9000)}`,
    actualAmount: totalEstimatedBazarCost,
    marketVendor: 'Uttara Wholesale & Kawran Bazar Arat',
    remarks: `Morning Bazar for ${staff.assignedHall} Central Kitchen`,
  });

  const [bazarHistory, setBazarHistory] = useState([
    { voucher: 'VCH-8812', date: 'Feb 28, 2026', items: 'Chicken, Rice, Dal, Veggies', totalAmount: '15,450 BDT', auditedBy: 'Provost Office', status: 'Approved & Reconciled' },
    { voucher: 'VCH-8790', date: 'Feb 27, 2026', items: 'Fish, Rice, Soybean Oil, Eggs', totalAmount: '14,880 BDT', auditedBy: 'Provost Office', status: 'Approved & Reconciled' },
  ]);

  const handleSaveBazarExpense = (e) => {
    e.preventDefault();
    const newEntry = {
      voucher: bazarExpenseForm.voucherNo,
      date: 'Today (Aug 30, 2026)',
      items: 'Chicken, Fish, Rice, Veggies, Eggs & Spices',
      totalAmount: `${bazarExpenseForm.actualAmount.toLocaleString()} BDT`,
      auditedBy: 'Submitted to Provost Office',
      status: 'Pending Voucher Clearance',
    };
    setBazarHistory([newEntry, ...bazarHistory]);
    setBazarExpenseModalOpen(false);
    onShowToast(`Daily Bazar Expense of ${bazarExpenseForm.actualAmount} BDT logged under Voucher #${bazarExpenseForm.voucherNo}!`, 'success');
  };

  // Token Search State
  const [tokenSearchId, setTokenSearchId] = useState('');
  const [tokenVerifyResult, setTokenVerifyResult] = useState(null);

  const handleVerifyStudentToken = (e) => {
    e.preventDefault();
    if (!tokenSearchId.trim()) return;

    const query = tokenSearchId.trim();
    const studentApp = mealBookings.find(b => b.studentId === query && b.status === 'Approved & Served');

    setTokenVerifyResult({
      name: studentApp?.studentName || (query === '22203188' ? 'Emdadul Haque Rahin' : 'Tanvir Hasan'),
      id: query,
      hall: staff.assignedHall,
      status: studentApp ? 'Approved Meal Token Active' : 'Valid Dining Resident Pass',
      monthlyClearance: 'Paid in Full (Clearance Active)',
    });
    onShowToast(`Student Token verified for ${query}.`, 'success');
  };

  const pendingMealCount = mealBookings.filter(b => b.status === 'Pending Approval').length;
  const approvedMealCount = mealBookings.filter(b => b.status === 'Approved & Served').length;

  const relevantLeaves = studentsOnLeave;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      
      {/* 1. Header Profile Banner & Workspace Switcher */}
      <div className="rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200/90 dark:border-slate-800/90 p-6 md:p-8 shadow-xl mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              🏛️ {staff.assignedHall}
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              workspaceMode === 'dining'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}>
              {workspaceMode === 'dining' ? '🍲 Central Dining & Mess Staff Division' : '🛠️ Hall Maintenance & Engineering Division'}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{staff.name}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {staff.role} • Official Staff ID: <span className="font-mono font-semibold">{staff.staffId}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {workspaceMode === 'maintenance' ? (
            <button
              onClick={() => setNewIssueModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition-colors"
            >
              <Plus size={14} />
              <span>+ Log Maintenance Repair</span>
            </button>
          ) : (
            <button
              onClick={() => setBazarExpenseModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition-colors"
            >
              <Receipt size={14} />
              <span>+ Log Daily Bazar Expense</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/60 dark:hover:text-red-300 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Overview Cards tailored for active Workspace */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {workspaceMode === 'maintenance' ? (
          <>
            {/* 1. Open Repair Tickets */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Wrench size={15} className="text-emerald-600" />
                  <span>Open Maintenance Tickets</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Active
                </span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {workOrders.filter(w => !w.status?.includes('Resolved')).length} Tickets
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Electricity, Net/LAN, Plumbing
              </p>
            </div>

            {/* 2. Tutor Verified Complaints */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>Tutor Inspected</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Verified
                </span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {workOrders.filter(w => w.tutorStatus?.includes('Verified') || w.status?.includes('Verified')).length} Verified
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Forwarded by House Tutors
              </p>
            </div>

            {/* 3. Materials Needed */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Layers size={15} className="text-indigo-600" />
                  <span>Requisitions</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Inventory
                </span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {materialRequisitions.length} Pending
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Spare parts & repair items
              </p>
            </div>

            {/* 4. Shift Handover */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Clock size={15} className="text-purple-600" />
                  <span>Shift Logs</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Duty
                </span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {handoverList.length} Notes
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Maintenance shift handovers
              </p>
            </div>
          </>
        ) : (
          <>
            {/* 1. Pending Meal Approvals */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Clock size={15} className="text-amber-600" />
                  <span>Pending Meal Queue</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Action Required
                </span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {pendingMealCount} App(s)
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Awaiting staff approval
              </p>
            </div>

            {/* 2. Approved & Consumed Meals */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>Served Meals</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Verified
                </span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {approvedMealCount} Served
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Confirmed meal tokens
              </p>
            </div>

            {/* 3. Students On Approved Leave (Auto Meal-Off) */}
            <div 
              onClick={() => setActiveTab('student-leaves')}
              className="p-4 rounded-3xl bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 shadow-sm cursor-pointer hover:border-red-400 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
                  <LogOut size={15} className="text-red-600" />
                  <span>Students On Leave</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700">
                  Meal OFF
                </span>
              </div>
              <div className="text-xl font-black text-red-700 dark:text-red-400 font-mono">
                {relevantLeaves.length} On Leave
              </div>
              <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 font-semibold">
                🔴 Meal auto-disabled
              </p>
            </div>

            {/* 4. Dining & Daily Bazar Budget */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <ShoppingBag size={15} className="text-amber-600" />
                  <span>Daily Bazar Budget</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Requisition
                </span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {totalEstimatedBazarCost.toLocaleString()} BDT
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Morning market budget
              </p>
            </div>
          </>
        )}
      </div>

      {/* Navigation Tabs tailored per Workspace */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto text-xs font-semibold mb-6">
        {workspaceMode === 'maintenance' ? (
          <>
            <button
              onClick={() => { setActiveTab('maintenance'); setIssueFilter('all'); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'maintenance'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wrench size={15} />
              <span>🛠️ All Maintenance Work Orders ({workOrders.filter(w => !w.status?.includes('Resolved')).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('handover')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'handover'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock size={15} />
              <span>🔄 Shift Handover & Material Requisitions ({handoverList.length})</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('meals-queue')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'meals-queue'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Utensils size={15} />
              <span>🍲 Student Meal Token Queue ({pendingMealCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('student-leaves')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'student-leaves'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogOut size={15} />
              <span>🔴 Students On Leave & Auto Meal-Off ({relevantLeaves.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('bazar')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'bazar'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShoppingBag size={15} />
              <span>🛒 Daily Bazar & Kitchen Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('bazar-history')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'bazar-history'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Receipt size={15} />
              <span>🧾 Daily Bazar Expense Logs ({bazarHistory.length})</span>
            </button>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WORK ORDERS & MAINTENANCE RESOLUTION                               */}
      {/* ========================================================================= */}
      {workspaceMode === 'maintenance' && activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {staff.assignedHall} Maintenance Work Orders
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All student technical complaints (Electricity, Net/LAN, Plumbing, Furniture) routed directly to your desk.
              </p>
            </div>
            
            <button
              onClick={() => setNewIssueModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-md transition-all shrink-0"
            >
              <Plus size={14} />
              <span>+ Log Work Order</span>
            </button>
          </div>

          {(() => {
            const delegatedTickets = workOrders.filter((w) => {
              const isAssigned = w.assignedStaff && !w.assignedStaff.includes('Pending');
              return isAssigned && (issueFilter === 'all' || w.category === issueFilter);
            });

            if (delegatedTickets.length === 0) {
              return (
                <div className="p-12 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <Wrench size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Delegated Work Orders in Queue</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    When a student submits a problem, the Floor Teacher verifies it and the Hostel Super (Provost) assigns it to your desk, it will appear here for you to execute and complete.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {delegatedTickets.map((ticket) => {
                  const ticketId = ticket.ticketId || ticket.id || ticket._id;
                  const isResolved = ticket.status?.includes('Resolved');
                  const isElectrical = ticket.category === 'Electrical';
                  const isNet = ticket.category?.includes('Net') || ticket.category?.includes('Wi-Fi');
                  const isWater = ticket.category?.includes('Water');

                  return (
                    <div 
                      key={ticketId}
                      className="p-5 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3.5 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between pb-2 border-b border-slate-100 dark:border-slate-800 gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isElectrical
                                ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                : isNet
                                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                                : isWater
                                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                : 'bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                            }`}>
                              {isElectrical && <Zap size={17} />}
                              {isNet && <Wifi size={17} />}
                              {isWater && <Droplets size={17} />}
                              {!isElectrical && !isNet && !isWater && <Key size={17} />}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white text-sm block">
                                {ticket.title || ticket.category}
                              </span>
                              <span className="text-slate-500 font-mono text-[11px]">{ticket.room || ticket.location} • {ticket.hall || staff.assignedHall}</span>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 border ${
                            isResolved
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : ticket.priority === 'Urgent'
                              ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>

                        <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                          {ticket.description}
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
                          <div><strong>Reported By:</strong> {ticket.studentName || ticket.reportedBy} ({ticket.studentId || 'Resident'})</div>
                          <div><strong>Tutor Verification:</strong> {ticket.tutorStatus || 'Verified'}</div>
                          <div><strong>Assigned To:</strong> {ticket.assignedStaff || staff.name}</div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="font-mono text-slate-400 text-[11px]">Ticket #{ticketId}</span>
                        <div className="flex items-center gap-2">
                          {!isResolved && !ticket.status?.includes('In Progress') && (
                            <button
                              onClick={() => handleUpdateTicketStatus(ticketId, 'In Progress')}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 font-semibold text-xs hover:bg-amber-100 transition-colors"
                            >
                              Start Repair
                            </button>
                          )}
                          {!isResolved && (
                            <button
                              onClick={() => handleUpdateTicketStatus(ticketId, 'Resolved and Verified')}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition-colors"
                            >
                              <Check size={13} />
                              <span>Confirm Work Complete & Fixed</span>
                            </button>
                          )}
                          {isResolved && (
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1">
                              <CheckCircle2 size={13} />
                              <span>Resolved & Closed</span>
                            </span>
                          )}
                        </div>
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
      {/* TAB 2: STUDENT MEAL APPLICATIONS APPROVAL QUEUE ("Dining staff approve")  */}
      {/* ========================================================================= */}
      {workspaceMode === 'dining' && activeTab === 'meals-queue' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Utensils size={18} className="text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Student Daily Meal Applications Approval Queue
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review and approve student meal token requests. Approving increments the student's live consumed meal count ("kotogulo khaise").
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {pendingMealCount} Pending Applications
            </span>
          </div>

          {/* Instant Student ID Counter Verification & Search Bar */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={mealSearchQuery}
                  onChange={(e) => setMealSearchQuery(e.target.value)}
                  placeholder="🔍 Search / Verify by Student ID (e.g. 22203188), Student Name, or Token #"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors shadow-inner"
                />
                {mealSearchQuery && (
                  <button
                    onClick={() => setMealSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono">
                  {mealBookings.length} Applied & Counted
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-mono">
                  {mealBookings.filter(b => b.foodCollected || b.status === 'Approved & Served').length} Collected
                </span>
              </div>
            </div>

            {/* Instant Counter Verification Result Box (When searching by ID) */}
            {mealSearchQuery.trim() && (
              <div className="mt-2 animate-fade-in">
                {(() => {
                  const q = mealSearchQuery.toLowerCase().trim();
                  const matches = mealBookings.filter(b => 
                    (b.studentId && b.studentId.toLowerCase().includes(q)) ||
                    (b.studentName && b.studentName.toLowerCase().includes(q)) ||
                    (b.bookingId && b.bookingId.toLowerCase().includes(q))
                  );

                  if (matches.length > 0) {
                    const firstStudent = matches[0];
                    const pendingCount = matches.filter(m => !m.foodCollected && m.status !== 'Approved & Served').length;
                    const collectedCount = matches.filter(m => m.foodCollected || m.status === 'Approved & Served').length;

                    return (
                      <div className="p-5 rounded-2xl bg-white dark:bg-[#0d121f] border-2 border-emerald-500/80 text-xs shadow-lg space-y-4">
                        {/* Header with Student Identity */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">
                                {firstStudent.studentName}
                              </span>
                              <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                ID: {firstStudent.studentId}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                • {firstStudent.room || 'Room 104'} • {firstStudent.hall || 'Padma Residential Hall'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Found <strong>{matches.length}</strong> active meal token(s). Staff can approve each meal individually as the student arrives at the counter.
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {pendingCount} Pending Pickup
                            </span>
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {collectedCount} Handed Over
                            </span>
                          </div>
                        </div>

                        {/* Separate Clean Meal Cards for the 3 meals */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {matches.map((m) => {
                            const mId = m.bookingId || m.id || m._id;
                            const isHandedOver = Boolean(m.foodCollected || m.status === 'Approved & Served');
                            const isBreakfast = m.mealType === 'Breakfast';
                            const isLunch = m.mealType === 'Lunch';
                            const isDinner = m.mealType === 'Dinner';

                            return (
                              <div
                                key={mId}
                                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                                  isHandedOver
                                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                                    : 'bg-slate-50 dark:bg-[#060911] border-slate-200 dark:border-slate-800 hover:border-emerald-400 shadow-sm'
                                }`}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1 ${
                                      isBreakfast
                                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                                        : isLunch
                                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                                        : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800'
                                    }`}>
                                      {isBreakfast ? '🍳 Breakfast' : isLunch ? '🍛 Lunch' : isDinner ? '🍲 Dinner' : m.mealType}
                                    </span>
                                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                      ৳{m.tokenCostBDT || (isBreakfast ? 30 : 50)} BDT
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                                    <span>Token: #{m.bookingId || mId}</span>
                                    <span>{m.date || 'Today'}</span>
                                  </div>

                                  <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                                    {isBreakfast ? '⏰ 07:30 AM - 09:30 AM' : isLunch ? '⏰ 01:00 PM - 02:30 PM' : '⏰ 08:30 PM - 10:00 PM'}
                                  </div>

                                  <p className="text-[10px] text-slate-400 line-clamp-2" title={m.diet}>
                                    {m.diet || 'Standard Hall Diet'}
                                  </p>

                                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                    ✅ Counted in Monthly Mess Bill
                                  </div>
                                </div>

                                <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                                  {isHandedOver ? (
                                    <div className="w-full py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5">
                                      <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                                      <span>Food Handed Over</span>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleApproveMeal(mId)}
                                      className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                      <Utensils size={13} />
                                      <span>Handover {m.mealType}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                        <AlertCircle size={16} className="text-amber-600 shrink-0" />
                        <span>
                          <strong>No Booking Found:</strong> Student ID or Name "<strong>{mealSearchQuery}</strong>" has <strong>NOT</strong> applied for any meals on this schedule. Cannot issue food without booking.
                        </span>
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </div>

          {mealBookings.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Utensils size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Meal Applications Pending</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                When students apply for daily breakfast, lunch, or dinner from their portal, their applications will appear here for one-click approval.
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px] uppercase">
                      <th className="py-2.5 px-3">Token Ref</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Student ID</th>
                      <th className="py-2.5 px-3">Room</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Meal Type</th>
                      <th className="py-2.5 px-3">Token Fee</th>
                      <th className="py-2.5 px-3">Bill Status</th>
                      <th className="py-2.5 px-3 text-right">Food Handover</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {(() => {
                      const q = mealSearchQuery.toLowerCase().trim();
                      const listToRender = mealBookings.filter((b) => {
                        if (!q) return true;
                        return (
                          (b.studentId && b.studentId.toLowerCase().includes(q)) ||
                          (b.studentName && b.studentName.toLowerCase().includes(q)) ||
                          (b.bookingId && b.bookingId.toLowerCase().includes(q)) ||
                          (b.room && b.room.toLowerCase().includes(q)) ||
                          (b.mealType && b.mealType.toLowerCase().includes(q))
                        );
                      });

                      if (listToRender.length === 0) {
                        return (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-slate-400">
                              No meal bookings match your search query "{mealSearchQuery}".
                            </td>
                          </tr>
                        );
                      }

                      return listToRender.map((b) => {
                        const bookingId = b.bookingId || b.id || b._id;
                        const isHandedOver = Boolean(b.foodCollected || b.status === 'Approved & Served');
                        const isCounted = b.status !== 'Rejected';

                        return (
                          <tr key={bookingId} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30">
                            <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                              #{bookingId}
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                              <div className="flex items-center gap-1.5">
                                <span>{b.studentName}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-500 font-bold">{b.studentId}</td>
                            <td className="py-3 px-3 text-slate-500">{b.room || 'Room 104'}</td>
                            <td className="py-3 px-3 font-mono text-slate-500">{b.date}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
                                b.mealType === 'Breakfast'
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                  : b.mealType === 'Lunch'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : b.mealType === 'Dinner'
                                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}>
                                {b.mealType === 'Breakfast' ? '🍳 Breakfast' : b.mealType === 'Lunch' ? '🍛 Lunch' : b.mealType === 'Dinner' ? '🍲 Dinner' : b.mealType}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                              ৳{b.tokenCostBDT || (b.mealType === 'Breakfast' ? 30 : 50)} BDT
                            </td>
                            <td className="py-3 px-3">
                              {isCounted ? (
                                <div>
                                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                                    <CheckCircle2 size={11} className="text-emerald-600" />
                                    <span>Counted in Bill</span>
                                  </span>
                                  <span className="text-[9px] text-slate-400 block mt-0.5">
                                    Counted whether collected or not
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200">
                                  Cancelled
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {isHandedOver ? (
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                                  <CheckCircle2 size={13} />
                                  <span>Food Handed Over ({b.approvedBy || staff.name})</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleApproveMeal(bookingId)}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-all inline-flex items-center gap-1 cursor-pointer active:scale-95"
                                >
                                  <Utensils size={13} />
                                  <span>Handover {b.mealType}</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: STUDENTS ON APPROVED LEAVE & AUTOMATIC MEAL OFF DIRECTORY             */}
      {/* ========================================================================= */}
      {activeTab === 'student-leaves' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <LogOut size={18} className="text-red-600 dark:text-red-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Students On Approved Leave & Automatic Meal-Off Directory
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
                  Automated Mess Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                When students are granted leave by the House Tutor / Provost, their meal status is automatically turned OFF to prevent food waste and unnecessary charges.
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-red-500" />
              <span>{relevantLeaves.length} Active Out-Pass Student(s)</span>
            </span>
          </div>

          {/* 3 Summary Banner Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0d121f] border border-red-200 dark:border-red-900/60 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 font-bold">
                <UserX size={20} />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Students Currently On Leave</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {relevantLeaves.length} Students Away
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0d121f] border border-amber-200 dark:border-amber-900/60 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold">
                <Utensils size={20} />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Daily Mess Preparation Adjustment</span>
                <div className="text-lg font-bold text-amber-700 dark:text-amber-400 font-mono">
                  -{relevantLeaves.length} Meals/Day Auto-Reduced
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0d121f] border border-emerald-200 dark:border-emerald-900/60 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                <ShieldCheck size={20} />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">House Tutor & Provost Approval</span>
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  100% Out-Pass Verified
                </div>
              </div>
            </div>
          </div>

          {/* Leave Roster Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={16} className="text-red-500" />
                <span>Dining Staff Leave & Auto Meal-Off Roster ({staff.assignedHall})</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Auto-synced with Out-Pass Register</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px] uppercase">
                    <th className="py-2.5 px-3">Pass Ref</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Student ID</th>
                    <th className="py-2.5 px-3">Room</th>
                    <th className="py-2.5 px-3">Pass Type</th>
                    <th className="py-2.5 px-3">Leave Duration</th>
                    <th className="py-2.5 px-3">Destination / Contact</th>
                    <th className="py-2.5 px-3">Mess Meal Status</th>
                    <th className="py-2.5 px-3 text-right">Approval Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {relevantLeaves.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                        {l.id}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        {l.studentName}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">{l.studentId}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">{l.room}</td>
                      <td className="py-3 px-3 font-semibold text-amber-700 dark:text-amber-400">{l.passType}</td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">{l.duration}</td>
                      <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                        <div>{l.destination}</div>
                        <div className="font-mono text-[10px] text-slate-400">{l.emergencyContact}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 inline-flex items-center gap-1">
                          🔴 Meal Auto-OFF
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-[11px] text-slate-500 font-medium">
                        {l.approvedBy}
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
      {/* TAB 3: SMART DAILY BAZAR & KITCHEN COOKING PLANNER ("Bazar ki lagbe")     */}
      {/* ========================================================================= */}
      {activeTab === 'bazar' && (
        <div className="space-y-6">
          {/* Requisition, Daily Date Attendance & Bazar Cost, and Kitchen Stock Section */}
          <DailyBazarMealReportSection
            role="staff"
            currentUser={currentUser}
            onShowToast={onShowToast}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DAILY BAZAR EXPENSE LOGS                                           */}
      {/* ========================================================================= */}
      {activeTab === 'bazar-history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Bazar Purchase Vouchers & Expense Logs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Financial records submitted to Provost Office for morning market reconciliation.
              </p>
            </div>
            <button
              onClick={() => setBazarExpenseModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Receipt size={14} />
              <span>+ Log Today's Bazar Voucher</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bazarHistory.map((bh, i) => (
              <div key={i} className="p-5 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{bh.voucher}</span>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {bh.status}
                  </span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-xs">
                  <strong>Date:</strong> {bh.date} • <strong>Items:</strong> {bh.items}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500">Total Spent:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-sm">{bh.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ROOM HANDOVER & INVENTORY CHECKLIST                                */}
      {/* ========================================================================= */}
      {activeTab === 'handover' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Student Room Check-In & Furniture Handover Clearance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Issue brass room keys, inspect study desks, wardrobe locks, and register verified check-in inventory sheets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {handoverList.map((ho) => (
              <div key={ho.id} className="p-5 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{ho.studentName}</span>
                    <span className="text-slate-500 ml-2 font-mono">ID: {ho.studentId}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    ho.status === 'Handover Completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}>
                    {ho.status}
                  </span>
                </div>

                <div className="text-slate-600 dark:text-slate-300 font-medium">
                  Allocated Room & Bed: <span className="font-bold text-slate-900 dark:text-white">{ho.room}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Physical Inventory Checklist:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className={ho.items.roomKey ? 'text-emerald-600' : 'text-slate-400'} />
                      <span>Brass Room Key</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className={ho.items.bedFrame ? 'text-emerald-600' : 'text-slate-400'} />
                      <span>Bed Frame & Board</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className={ho.items.studyTable ? 'text-emerald-600' : 'text-slate-400'} />
                      <span>Study Table & Chair</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className={ho.items.wardrobeLock ? 'text-emerald-600' : 'text-slate-400'} />
                      <span>Wardrobe Locker Key</span>
                    </div>
                  </div>
                </div>

                {ho.status !== 'Handover Completed' ? (
                  <button
                    onClick={() => handleCompleteHandover(ho.id)}
                    className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Check size={14} />
                    <span>Issue Keys & Complete Handover</span>
                  </button>
                ) : (
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                    <span>Clearance Ref: {ho.id}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Verified on {ho.date}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: DINING TOKEN SCANNER                                               */}
      {/* ========================================================================= */}
      {activeTab === 'token' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
              <QrCode size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Dining Hall Entry Token Scanner
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter Student ID or scan student digital meal token at entrance.
              </p>
            </div>

            <form onSubmit={handleVerifyStudentToken} className="flex gap-2">
              <input
                type="text"
                value={tokenSearchId}
                onChange={(e) => setTokenSearchId(e.target.value)}
                placeholder="Enter Student ID (e.g. 22203188)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-amber-600 text-xs font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-md transition-colors"
              >
                Verify Token
              </button>
            </form>

            {tokenVerifyResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left space-y-2 text-xs animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{tokenVerifyResult.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-700 text-white">
                    {tokenVerifyResult.status}
                  </span>
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  ID: <strong>{tokenVerifyResult.id}</strong> • {tokenVerifyResult.hall}
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
                  {tokenVerifyResult.monthlyClearance}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LOG NEW MAINTENANCE PROBLEM TICKET                                  */}
      {/* ========================================================================= */}
      {newIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench size={18} className="text-blue-600" />
                  <span>Log Hall Maintenance Work Order</span>
                </h2>
                <p className="text-slate-500 mt-0.5">
                  Record on-site problem for Electricity, Net/LAN, Plumbing, or Furniture.
                </p>
              </div>
              <button
                onClick={() => setNewIssueModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Issue Category</label>
                <select
                  value={newIssueForm.category}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="Electrical">⚡ Electricity (Fan Regulator, LED, Switchboard)</option>
                  <option value="Internet & Network">🌐 Internet & Network (Wi-Fi drop, LAN cable)</option>
                  <option value="Water Pump & Plumbing">🚰 Water Pump & Plumbing (Pump motor, Tap, Basin)</option>
                  <option value="Furniture & Hardware">🚪 Furniture & Hardware (Bed frame, Table, Lock)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Problem Title</label>
                <input
                  type="text"
                  value={newIssueForm.title}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, title: e.target.value })}
                  placeholder="e.g. Room 104 Bed B Fan Speed Regulator Sparking"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Specific Location</label>
                  <input
                    type="text"
                    value={newIssueForm.location}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, location: e.target.value })}
                    placeholder="e.g. Floor 1 • Room 104"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Priority</label>
                  <select
                    value={newIssueForm.priority}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent / Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={newIssueForm.description}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, description: e.target.value })}
                  placeholder="Describe electrical fault, pipe leakage, or broken woodwork..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Required Spare Parts / Materials</label>
                <input
                  type="text"
                  value={newIssueForm.materialsNeeded}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, materialsNeeded: e.target.value })}
                  placeholder="e.g. 1x Dimmer Regulator, 2m Wire, 1x Tape"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewIssueModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-md"
                >
                  Log & Dispatch Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LOG DAILY BAZAR EXPENSE VOUCHER                                     */}
      {/* ========================================================================= */}
      {bazarExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt size={18} className="text-amber-600" />
                  <span>Log Daily Bazar Expense Voucher</span>
                </h2>
                <p className="text-slate-500 mt-0.5">
                  Submit actual morning market expenditure for Provost financial audit.
                </p>
              </div>
              <button
                onClick={() => setBazarExpenseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBazarExpense} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Voucher Tracking No.</label>
                  <input
                    type="text"
                    value={bazarExpenseForm.voucherNo}
                    onChange={(e) => setBazarExpenseForm({ ...bazarExpenseForm, voucherNo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-amber-600"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Actual Amount Spent (BDT)</label>
                  <input
                    type="number"
                    value={bazarExpenseForm.actualAmount}
                    onChange={(e) => setBazarExpenseForm({ ...bazarExpenseForm, actualAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-amber-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Wholesale Market / Supplier</label>
                <input
                  type="text"
                  value={bazarExpenseForm.marketVendor}
                  onChange={(e) => setBazarExpenseForm({ ...bazarExpenseForm, marketVendor: e.target.value })}
                  placeholder="e.g. Uttara Morning Bazar / Kawran Bazar Arat"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-amber-600"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Purchased Items & Meal Details</label>
                <textarea
                  rows={3}
                  value={bazarExpenseForm.remarks}
                  onChange={(e) => setBazarExpenseForm({ ...bazarExpenseForm, remarks: e.target.value })}
                  placeholder="e.g. Purchased 35kg Miniket Rice, 28kg Chicken, 8kg Dal, 25kg Seasonal Veggies for daily hall meals"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-amber-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setBazarExpenseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold shadow-md"
                >
                  Submit Voucher to Provost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
