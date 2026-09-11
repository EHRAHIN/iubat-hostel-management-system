import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Utensils,
  ShoppingCart,
  Package,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Check,
  X,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  ChevronRight,
  Sparkles,
  Printer,
  User,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import ApplyBazarModal from './ApplyBazarModal';
import BazarReceiptModal from './BazarReceiptModal';
import {
  WEEKLY_MESS_ROSTER,
  MONTHLY_BULK_STAPLES,
  getRosterForDate,
  getStockUsageForRoster,
} from '../constants/messMenuRoster';

export default function DailyBazarMealReportSection({
  role = 'super', // 'staff' | 'super' | 'admin'
  currentUser,
  onShowToast,
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.slice(0, 7); // 'YYYY-MM'

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [activeSubTab, setActiveSubTab] = useState('daily-report'); // 'daily-report' | 'monthly-report' | 'requisitions' | 'stock' | 'student-lookup'
  const [stockCategoryFilter, setStockCategoryFilter] = useState('all'); // 'all' | 'daily' | 'monthly' | 'low'
  const [applyModalInitialType, setApplyModalInitialType] = useState('Daily Next-Day Bazar');
  
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState('');
  const [reportData, setReportData] = useState(null);
  const [monthlyReportData, setMonthlyReportData] = useState(null);
  const [requisitions, setRequisitions] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Receipt Modal State
  const [selectedReceiptReq, setSelectedReceiptReq] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Student ID Lookup State
  const [lookupStudentId, setLookupStudentId] = useState('');
  const [studentLookupData, setStudentLookupData] = useState(null);
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);

  // Requisitions Filter State
  const [bazarStatusFilter, setBazarStatusFilter] = useState('all'); // 'all' | 'purchased' | 'approved' | 'pending'

  // Approval Modal State (for Hostel Super / Admin)
  const [selectedReqForAction, setSelectedReqForAction] = useState(null);
  const [approvalBudget, setApprovalBudget] = useState(0);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Fetch Daily Report
  const fetchDailyReport = async (date = selectedDate) => {
    try {
      setIsLoading(true);
      const res = await api.getDailyBazarMealReport({ date });
      if (res?.data) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Error fetching daily meal report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Monthly Report
  const fetchMonthlyReport = async (month = selectedMonth) => {
    try {
      setIsLoadingMonthly(true);
      const res = await api.getMonthlyBazarReport({ month });
      if (res?.data) {
        setMonthlyReportData(res.data);
      }
    } catch (err) {
      console.error('Error fetching monthly bazar report:', err);
    } finally {
      setIsLoadingMonthly(false);
    }
  };

  // Fetch Requisitions
  const fetchRequisitions = async () => {
    try {
      const res = await api.getBazarRequisitions();
      if (res?.data) {
        setRequisitions(res.data);
      }
    } catch (err) {
      console.error('Error fetching requisitions:', err);
    }
  };

  // Fetch Stock
  const fetchStock = async () => {
    try {
      const res = await api.getBazarStock();
      if (res?.data) {
        setStockList(res.data);
      }
    } catch (err) {
      console.error('Error fetching stock:', err);
    }
  };

  // Lookup Student Meal History by ID
  const handleLookupStudent = async (studentIdToSearch) => {
    const sId = (studentIdToSearch || lookupStudentId).trim();
    if (!sId) {
      onShowToast?.('Please enter a valid Student ID', 'error');
      return;
    }
    setIsSearchingStudent(true);
    try {
      const res = await api.getStudentMealSummary(sId);
      if (res?.data) {
        setStudentLookupData(res.data);
      } else {
        onShowToast?.(`No meal records found for Student ID ${sId}`, 'info');
      }
    } catch (err) {
      onShowToast?.(err.message || 'Failed to fetch student meal history', 'error');
    } finally {
      setIsSearchingStudent(false);
    }
  };

  useEffect(() => {
    fetchDailyReport(selectedDate);
    fetchMonthlyReport(selectedMonth);
    fetchRequisitions();
    fetchStock();
  }, [selectedDate, selectedMonth]);

  // Handle Hostel Super Approval
  const handleApproveRequisition = async (reqId) => {
    setIsProcessingAction(true);
    try {
      const res = await api.approveBazarRequisition(reqId, {
        approvedBy: currentUser?.name || 'Prof. Dr. Monirul Islam (Hostel Super / Provost)',
        approvedBudget: approvalBudget || undefined,
        approvalRemarks: approvalRemarks || 'Approved for dining procurement upon reviewing stock & headcount.',
      });
      onShowToast?.(res.message || 'Bazar requisition approved!', 'success');
      setSelectedReqForAction(null);
      await fetchRequisitions();
      await fetchDailyReport(selectedDate);
      await fetchMonthlyReport(selectedMonth);
    } catch (err) {
      onShowToast?.(err.message || 'Failed to approve requisition', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handle Requisition Rejection
  const handleRejectRequisition = async (reqId) => {
    setIsProcessingAction(true);
    try {
      const res = await api.rejectBazarRequisition(reqId, {
        approvedBy: currentUser?.name || 'Hostel Super',
        remarks: approvalRemarks || 'Requisition rejected. Please adjust item quantities.',
      });
      onShowToast?.(res.message || 'Bazar requisition rejected.', 'info');
      setSelectedReqForAction(null);
      await fetchRequisitions();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to reject requisition', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handle Mark as Purchased / Bazar Complete by Dining Staff or Hostel Super
  const handleMarkPurchased = async (reqId, estimatedCost) => {
    try {
      const res = await api.purchaseBazarRequisition(reqId, {
        actualCost: estimatedCost,
        voucherNo: `VOUCH-BZR-${Math.floor(100000 + Math.random() * 900000)}`,
        completedBy: currentUser?.name || (role === 'super' ? 'Hostel Super' : 'Dining Staff In-Charge'),
      });
      onShowToast?.(res.message || 'Bazar complete! Kitchen pantry stock updated immediately.', 'success');
      await Promise.all([
        fetchRequisitions(),
        fetchStock(),
        fetchDailyReport(selectedDate),
        fetchMonthlyReport(selectedMonth),
      ]);

      // Open receipt immediately for verification
      if (res?.data) {
        setSelectedReceiptReq(res.data);
        setIsReceiptModalOpen(true);
      }
    } catch (err) {
      onShowToast?.(err.message || 'Failed to update purchase', 'error');
    }
  };

  const summary = reportData?.summary || {
    totalServedMeals: 0,
    breakfastCount: 0,
    lunchCount: 0,
    dinnerCount: 0,
    totalBazarCostBDT: 0,
    costPerMealBDT: 0,
  };

  const attendees = reportData?.attendees || [];
  const dayRequisitions = reportData?.requisitions || [];
  const lowStockCount = stockList.filter((item) => item.quantity <= item.minThreshold).length;

  // Open Daily Receipt for Selected Date
  const handleOpenDailyReceipt = () => {
    const existingReq = dayRequisitions.find((r) => r.status === 'Purchased & Stocked' || r.status === 'Purchased') || dayRequisitions[0];
    if (existingReq) {
      setSelectedReceiptReq(existingReq);
    } else {
      setSelectedReceiptReq({
        requisitionId: `BZR-DAILY-${selectedDate.replace(/-/g, '')}`,
        title: `Daily Kitchen Market & Food Procurement (${selectedDate})`,
        requisitionType: 'Daily Next-Day Bazar',
        status: 'Purchased & Stocked',
        targetDate: selectedDate,
        voucherNo: `VOUCH-${selectedDate.replace(/-/g, '')}-DLY`,
        totalActualCost: summary.totalBazarCostBDT || 0,
        approvedBudget: summary.totalBazarCostBDT || 0,
        hall: currentUser?.hall || 'Padma Residential Hall',
        items: (reportData?.bazarBreakdown && reportData.bazarBreakdown.length > 0)
          ? reportData.bazarBreakdown.map((b) => ({
              name: b.name || b.itemName || 'Daily Pantry Staples',
              quantity: b.quantity || 1,
              unit: b.unit || 'Lot',
              estimatedRate: b.rate || b.cost || summary.totalBazarCostBDT,
              estimatedTotal: b.total || b.cost || summary.totalBazarCostBDT,
            }))
          : [
              {
                name: 'Fresh Vegetables, Poultry & Central Mess Grocery',
                quantity: 1,
                unit: 'Daily Lot',
                estimatedRate: summary.totalBazarCostBDT || 0,
                estimatedTotal: summary.totalBazarCostBDT || 0,
              },
            ],
      });
    }
    setIsReceiptModalOpen(true);
  };

  // Open Monthly Consolidated Receipt for Selected Month
  const handleOpenMonthlyConsolidatedReceipt = () => {
    const totalCost = monthlyReportData?.totalMonthlyCostBDT || 0;
    const allReqs = monthlyReportData?.allRequisitions || [];
    
    const consolidatedItems = allReqs.length > 0
      ? allReqs.map((req) => ({
          name: `${req.title} (${req.targetDate})`,
          quantity: req.items?.length || 1,
          unit: 'Lot',
          estimatedRate: req.totalActualCost || req.approvedBudget || req.totalEstimatedCost || 0,
          estimatedTotal: req.totalActualCost || req.approvedBudget || req.totalEstimatedCost || 0,
        }))
      : [
          {
            name: `Whole Month Kitchen Provisions & Market Procurement (${selectedMonth})`,
            quantity: 1,
            unit: 'Monthly Batch',
            estimatedRate: totalCost,
            estimatedTotal: totalCost,
          },
        ];

    setSelectedReceiptReq({
      requisitionId: `BZR-MONTHLY-${selectedMonth.replace(/-/g, '')}`,
      title: `Consolidated Monthly Mess Kitchen Expenditure (${selectedMonth})`,
      requisitionType: 'Monthly Consolidated Kitchen Bazar',
      status: 'Purchased & Stocked',
      targetDate: `Whole Month: ${selectedMonth}`,
      voucherNo: `VOUCH-MTH-${selectedMonth.replace(/-/g, '')}-EXP`,
      totalActualCost: totalCost,
      approvedBudget: totalCost,
      hall: currentUser?.hall || 'Padma Residential Hall',
      isMonthlyConsolidated: true,
      items: consolidatedItems,
      submittedBy: 'Md. Kalam Hossain (Dining Staff In-Charge)',
      approvedBy: 'Prof. Dr. Monirul Islam (Hostel Super)',
    });
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Utensils size={18} />
            </span>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Dining Attendance, Daily Bazar & Kitchen Inventory
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Real-time tracking of student meal headcounts, date-wise & monthly bazar expenditure, official receipts, and pantry stock levels.
          </p>
        </div>

        {/* Date / Month Picker & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {activeSubTab === 'monthly-report' ? (
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-xs">
              <Calendar size={14} className="text-emerald-600 ml-1.5" />
              <span className="font-bold text-slate-600 dark:text-slate-400">Month:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-mono font-bold outline-none cursor-pointer pr-2"
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-xs">
              <Calendar size={14} className="text-emerald-600 ml-1.5" />
              <span className="font-bold text-slate-600 dark:text-slate-400">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-mono font-bold outline-none cursor-pointer pr-2"
              />
            </div>
          )}

          {/* Quick Receipt View Button */}
          {activeSubTab === 'monthly-report' ? (
            <button
              type="button"
              onClick={handleOpenMonthlyConsolidatedReceipt}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title={`View Full Month Total Expenditure Receipt for ${selectedMonth}`}
            >
              <FileText size={14} />
              <span>Full Month Receipt</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenDailyReceipt}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800 transition-colors cursor-pointer"
              title={`View Daily Bazar Receipt for ${selectedDate}`}
            >
              <FileText size={14} />
              <span>Daily Bazar Receipt</span>
            </button>
          )}

          {role === 'staff' && (
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/20 transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Apply for Bazar</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Analytics Metric Cards for Selected Date */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Meals Eaten */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Meals Served ({selectedDate})</span>
            <Utensils size={15} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {summary.totalServedMeals}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-0.5 font-mono">
            <span>B: {summary.breakfastCount}</span> •
            <span>L: {summary.lunchCount}</span> •
            <span>D: {summary.dinnerCount}</span>
          </div>
        </div>

        {/* Bazar Cost for Date */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Bazar Expense ({selectedDate})</span>
            <ShoppingCart size={15} className="text-teal-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            ৳{summary.totalBazarCostBDT.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="text-slate-500">Procurement Cost</span>
            <button
              type="button"
              onClick={handleOpenDailyReceipt}
              className="font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
            >
              <FileText size={11} />
              <span>View Receipt</span>
            </button>
          </div>
        </div>

        {/* Avg Cost per Meal */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Average Food Cost / Meal</span>
            <TrendingUp size={15} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            ৳{summary.costPerMealBDT}
          </div>
          <div className="text-[11px] text-slate-500">
            Based on {summary.totalServedMeals} served student portions
          </div>
        </div>

        {/* Kitchen Stock Status */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Pantry Grocery Items</span>
            <Package size={15} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono flex items-center justify-between">
            <span>{stockList.length} Items</span>
            {lowStockCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                {lowStockCount} Low Stock
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500">
            Tracked in Central Hall Kitchen
          </div>
        </div>
      </div>

      {/* Weekly Residential Mess Roster (Padma Hall Dining) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Utensils size={16} className="text-emerald-600" />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Weekly Residential Mess Roster (Padma Hall Dining)
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Daily fresh bazar and monthly bulk pantry stock are calculated directly from this active dining menu.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
            <span className="text-[10.5px] font-mono text-slate-500">Updated for March 2026</span>
            {role === 'staff' && (
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus size={13} />
                <span>Apply for Bazar</span>
              </button>
            )}
          </div>
        </div>

        {/* 7 Days Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
          {WEEKLY_MESS_ROSTER.map((m) => {
            const isToday = getRosterForDate(todayStr).dayIndex === m.dayIndex;
            const isSelectedDateDay = getRosterForDate(selectedDate).dayIndex === m.dayIndex;

            return (
              <div
                key={m.day}
                onClick={() => {
                  const current = new Date(selectedDate + 'T12:00:00');
                  const currentDay = current.getDay();
                  const diff = (m.dayIndex - currentDay + 7) % 7;
                  current.setDate(current.getDate() + diff);
                  const newDate = current.toISOString().split('T')[0];
                  setSelectedDate(newDate);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                  isSelectedDateDay
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-[#060911] border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{m.day}</span>
                  {isToday ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-xs">
                      Today
                    </span>
                  ) : (
                    <span className="text-[9.5px] font-mono text-slate-400">
                      {m.dayFull.slice(0, 3)}
                    </span>
                  )}
                </div>
                <div className="text-[10.5px] text-slate-500">
                  L: <strong className="text-slate-800 dark:text-slate-200">{m.lunch}</strong>
                </div>
                <div className="text-[10.5px] text-slate-500">
                  D: <strong className="text-slate-800 dark:text-slate-200">{m.dinner}</strong>
                </div>
                <div className="pt-1.5 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between text-[9.5px]">
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">🛒 Daily Bazar</span>
                  <span className="text-slate-400 font-mono">{m.dailyBazarItems.length} items</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('daily-report')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'daily-report'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Utensils size={14} />
          <span>Daily Meal Attendance & Date Receipts ({attendees.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('monthly-report')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'monthly-report'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar size={14} />
          <span>Monthly Bazar Receipts & Expenditure</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('requisitions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'requisitions'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShoppingCart size={14} />
          <span>Live Bazar List & Requisitions ({requisitions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('stock')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'stock'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Package size={14} />
          <span>Kitchen Grocery Stock ({stockList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('student-lookup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'student-lookup'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Search size={14} />
          <span>Student ID Meal History Lookup</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* SUB-TAB 1: DAILY MEAL ATTENDANCE & TODAY'S BAZAR RECEIPTS    */}
      {/* ============================================================ */}
      {activeSubTab === 'daily-report' && (
        <div className="space-y-5">
          
          {/* Today's Bazar Vouchers & Receipts Box */}
          {dayRequisitions.length > 0 && (
            <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                    Bazar Purchases & Expense Receipts for {selectedDate} ({dayRequisitions.length})
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  Total Spent: ৳{dayRequisitions.reduce((sum, r) => sum + (r.totalActualCost || r.approvedBudget || r.totalEstimatedCost || 0), 0).toLocaleString()} BDT
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dayRequisitions.map((req) => (
                  <div
                    key={req._id}
                    className="p-3.5 rounded-xl bg-white dark:bg-[#0d121f] border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                        {req.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Voucher: #{req.voucherNo || `VOUCH-${req._id?.slice(-6)}`} • <strong>৳{(req.totalActualCost || req.approvedBudget || req.totalEstimatedCost).toLocaleString()} BDT</strong>
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                        ✓ {req.status}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReceiptReq(req);
                        setIsReceiptModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-sm transition-colors"
                    >
                      <FileText size={12} />
                      <span>View Receipt</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Headcount Table for Selected Date */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Student Eaters List on {selectedDate} ({attendees.length} Counted)
                </h4>
                <p className="text-xs text-slate-500">
                  Every booked meal is automatically counted in daily dining attendance whether physically collected or not.
                </p>
              </div>

              {/* Search Attendee */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student ID, name or room..."
                  value={attendeeSearchQuery}
                  onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-xs outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {attendees.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-1">
                <Utensils size={28} className="mx-auto text-slate-400 opacity-60 mb-2" />
                <p className="font-semibold">No student meal applications recorded for {selectedDate}.</p>
                <p className="text-[11px] text-slate-400">Select another date or verify student meal applications.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
                      <th className="pb-3">Booking ID</th>
                      <th className="pb-3">Student Name & ID</th>
                      <th className="pb-3">Room / Bed</th>
                      <th className="pb-3">Meal Category</th>
                      <th className="pb-3">Diet Menu</th>
                      <th className="pb-3">Token Cost</th>
                      <th className="pb-3">Count Status</th>
                      <th className="pb-3 text-right">Food Collection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {(() => {
                      const q = attendeeSearchQuery.toLowerCase().trim();
                      const filtered = attendees.filter((att) => {
                        if (!q) return true;
                        return (
                          (att.studentId && att.studentId.toLowerCase().includes(q)) ||
                          (att.studentName && att.studentName.toLowerCase().includes(q)) ||
                          (att.bookingId && att.bookingId.toLowerCase().includes(q)) ||
                          (att.room && att.room.toLowerCase().includes(q))
                        );
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={8} className="py-6 text-center text-slate-400">
                              No student matches "{attendeeSearchQuery}" in today's meal attendance.
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((att, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {att.bookingId}
                          </td>
                          <td className="py-3">
                            <div className="font-bold text-slate-900 dark:text-white">{att.studentName}</div>
                            <div className="font-mono text-[10px] text-slate-500 font-bold">{att.studentId}</div>
                          </td>
                          <td className="py-3 font-mono text-slate-600 dark:text-slate-400">
                            {att.room || 'Room 101'}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              att.mealType === 'Breakfast'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : att.mealType === 'Lunch'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            }`}>
                              {att.mealType === 'Breakfast' ? '🍳 Breakfast' : att.mealType === 'Lunch' ? '🍛 Lunch' : att.mealType === 'Dinner' ? '🍲 Dinner' : att.mealType}
                            </span>
                          </td>
                          <td className="py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate text-[11px]" title={att.diet}>
                            {att.diet}
                          </td>
                          <td className="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ৳{att.tokenCostBDT}
                          </td>
                          <td className="py-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                              <CheckCircle2 size={10} />
                              <span>Counted in Bill</span>
                            </span>
                          </td>
                          <td className="py-3 text-right font-mono text-[11px]">
                            {att.foodCollected ? (
                              <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                <span>Food Collected</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 font-semibold">
                                ⏳ Not Collected Yet
                              </span>
                            )}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 2: MONTHLY BAZAR EXPENDITURE & DATE-WISE RECEIPTS    */}
      {/* ============================================================ */}
      {activeSubTab === 'monthly-report' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>Monthly Bazar Procurement & Official Receipts ({selectedMonth})</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold">
                  ৳{(monthlyReportData?.totalMonthlyCostBDT || 0).toLocaleString()} BDT Total
                </span>
              </h4>
              <p className="text-xs text-slate-500">
                Detailed date-wise breakdown of all kitchen markets and bazar vouchers conducted in {selectedMonth}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenMonthlyConsolidatedReceipt}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <FileText size={13} />
                <span>📑 Full Month Consolidated Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => fetchMonthlyReport(selectedMonth)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1"
              >
                <RefreshCw size={12} />
                <span>Refresh Month</span>
              </button>
            </div>
          </div>

          {/* Monthly Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800">
              <span className="text-[10.5px] uppercase font-bold text-slate-400 block">Total Monthly Spend</span>
              <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                ৳{(monthlyReportData?.totalMonthlyCostBDT || 0).toLocaleString()} BDT
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800">
              <span className="text-[10.5px] uppercase font-bold text-slate-400 block">Total Bazar Days</span>
              <span className="text-lg font-black font-mono text-slate-800 dark:text-slate-200">
                {monthlyReportData?.dateWiseBreakdown?.length || 0} Dates
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800">
              <span className="text-[10.5px] uppercase font-bold text-slate-400 block">Total Requisitions</span>
              <span className="text-lg font-black font-mono text-slate-800 dark:text-slate-200">
                {monthlyReportData?.totalRequisitionsCount || 0} Vouchers
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800">
              <span className="text-[10.5px] uppercase font-bold text-slate-400 block">Monthly Served Meals</span>
              <span className="text-lg font-black font-mono text-blue-600 dark:text-blue-400">
                {monthlyReportData?.totalMonthlyMeals || 0} Portions
              </span>
            </div>
          </div>

          {/* Date-wise Receipts Table */}
          {(!monthlyReportData?.allRequisitions || monthlyReportData.allRequisitions.length === 0) ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-1">
              <FileText size={28} className="mx-auto text-slate-400 opacity-60 mb-2" />
              <p className="font-semibold">No bazar purchases found for {selectedMonth}.</p>
              <p className="text-[11px] text-slate-400">Select another month or submit a new bazar requisition.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
                    <th className="pb-3">Date of Bazar</th>
                    <th className="pb-3">Voucher Ref</th>
                    <th className="pb-3">Bazar Type & Title</th>
                    <th className="pb-3">Items Purchased</th>
                    <th className="pb-3 font-mono">Amount Spent</th>
                    <th className="pb-3">Sanctioned By</th>
                    <th className="pb-3 text-right">Official Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {monthlyReportData.allRequisitions.map((req) => {
                    const cost = req.status === 'Purchased & Stocked' && req.totalActualCost > 0
                      ? req.totalActualCost
                      : (req.approvedBudget || req.totalEstimatedCost);

                    return (
                      <tr key={req._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                          {req.targetDate}
                        </td>
                        <td className="py-3 font-mono text-slate-600 dark:text-slate-400">
                          {req.voucherNo || `VOUCH-${req._id?.slice(-6)}`}
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-slate-900 dark:text-white">{req.title}</div>
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {req.requisitionType}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate text-[11px]">
                          {req.items?.map((it) => `${it.name} (${it.quantity} ${it.unit})`).join(', ') || 'General Staples'}
                        </td>
                        <td className="py-3 font-mono font-black text-emerald-600 dark:text-emerald-400">
                          ৳{cost.toLocaleString()} BDT
                        </td>
                        <td className="py-3 text-slate-500 text-[11px]">
                          {req.approvedBy || 'Hostel Super'}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReceiptReq(req);
                              setIsReceiptModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                          >
                            <FileText size={12} />
                            <span>View Receipt</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 3: LIVE BAZAR LIST & REQUISITIONS                    */}
      {/* ============================================================ */}
      {activeSubTab === 'requisitions' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Live Bazar List & Procurement Requisitions
              </h4>
              <p className="text-xs text-slate-500">
                Applied by Dining Staff, approved by Hostel Super, and automatically listed in live Bazar List once completed.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'all', label: 'All Bazars' },
                { id: 'purchased', label: 'Completed (Live Bazar List)' },
                { id: 'approved', label: 'Approved by Super' },
                { id: 'pending', label: 'Pending Approval' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setBazarStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    bazarStatusFilter === tab.id
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {requisitions
              .filter((req) => {
                if (bazarStatusFilter === 'purchased') return req.status === 'Purchased & Stocked';
                if (bazarStatusFilter === 'approved') return req.status === 'Approved by Hostel Super';
                if (bazarStatusFilter === 'pending') return req.status === 'Pending Super Approval';
                return true;
              })
              .map((req) => {
                const isPending = req.status === 'Pending Super Approval';
                const isApproved = req.status === 'Approved by Hostel Super';
                const isPurchased = req.status === 'Purchased & Stocked';

                return (
                  <div
                    key={req._id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          req.requisitionType === 'Monthly Big Bazar'
                            ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}>
                          {req.requisitionType}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          {req.requisitionId} • Date: <strong>{req.targetDate}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isPurchased
                            ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                            : isApproved
                            ? 'bg-blue-500/15 text-blue-600 border border-blue-500/30'
                            : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                        }`}>
                          {req.status}
                        </span>
                        <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                          ৳{(req.totalActualCost || req.approvedBudget || req.totalEstimatedCost).toLocaleString()} BDT
                        </span>
                      </div>
                    </div>

                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                      {req.title}
                    </h5>

                    {/* Items Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {req.items?.map((it, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-[10.5px] font-mono text-slate-700 dark:text-slate-300"
                        >
                          {it.name}: <strong>{it.quantity} {it.unit}</strong> (~৳{it.estimatedTotal || (it.quantity * (it.estimatedRate || 0))})
                        </span>
                      ))}
                    </div>

                    {/* Approval / Purchase Meta */}
                    {req.approvedBy && (
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span>Approved By: <strong>{req.approvedBy}</strong></span>
                          {req.approvalRemarks && <span className="ml-2 italic text-slate-500">"{req.approvalRemarks}"</span>}
                        </div>
                        <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          Budget: ৳{(req.approvedBudget || req.totalEstimatedCost).toLocaleString()} BDT
                        </div>
                      </div>
                    )}

                    {/* Action Buttons for Super and Staff */}
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200/60 dark:border-slate-800">
                      {/* View Receipt for completed bazar */}
                      {(isPurchased || req.voucherNo) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReceiptReq(req);
                            setIsReceiptModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText size={13} />
                          <span>View Receipt</span>
                        </button>
                      )}

                      {/* Super / Admin Actions */}
                      {(role === 'super' || role === 'admin') && isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReqForAction(req);
                              setApprovalBudget(req.totalEstimatedCost);
                              setApprovalRemarks(`Approved for ${req.targetDate} dining procurement.`);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            <Check size={13} />
                            <span>Approve Budget</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectRequisition(req._id)}
                            className="px-3.5 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-semibold text-xs"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* Mark Purchased / Bazar Complete & Update Stock Button */}
                      {!isPurchased && (
                        <button
                          type="button"
                          onClick={() => handleMarkPurchased(req._id, req.approvedBudget || req.totalEstimatedCost)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:from-emerald-700 hover:to-teal-700 cursor-pointer transition-all"
                          title="Finish Bazar: Instantly updates kitchen pantry stock levels and creates expense voucher"
                        >
                          <ShoppingCart size={14} />
                          <span>Complete Bazar & Update Stock</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 4: KITCHEN GROCERY & PANTRY STOCK TRACKER            */}
      {/* ============================================================ */}
      {activeSubTab === 'stock' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          {/* Header & Quick Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Package size={18} className="text-amber-500" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Live Kitchen Pantry & Grocery Inventory Stock
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Every grocery ingredient is synchronized with the 7-day Weekly Roster & 30-Day Bulk Dining Staples.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {role === 'staff' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setApplyModalInitialType('Daily Next-Day Bazar');
                      setIsApplyModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>+ Requisition Daily Bazar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setApplyModalInitialType('Monthly Big Bazar');
                      setIsApplyModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-300 dark:border-purple-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Package size={13} />
                    <span>+ Requisition Monthly Stock</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={fetchStock}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>Refresh Stock</span>
              </button>
            </div>
          </div>

          {/* Stock Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setStockCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                stockCategoryFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              All Pantry Items ({stockList.length})
            </button>
            <button
              type="button"
              onClick={() => setStockCategoryFilter('daily')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                stockCategoryFilter === 'daily'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 hover:bg-amber-100'
              }`}
            >
              Daily Perishables (Daily Bazar)
            </button>
            <button
              type="button"
              onClick={() => setStockCategoryFilter('monthly')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                stockCategoryFilter === 'monthly'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 hover:bg-purple-100'
              }`}
            >
              Monthly Bulk Staples (Monthly Stock)
            </button>
            <button
              type="button"
              onClick={() => setStockCategoryFilter('low')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                stockCategoryFilter === 'low'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-800/60 hover:bg-red-100'
              }`}
            >
              <AlertTriangle size={12} />
              <span>Low Stock Alerts ({lowStockCount})</span>
            </button>
          </div>

          {/* Stock Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="pb-3">Item Description</th>
                  <th className="pb-3">Procurement Type</th>
                  <th className="pb-3">Current Stock</th>
                  <th className="pb-3">Safety Min</th>
                  <th className="pb-3">Weekly Roster Meal Usage</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Last Restocked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {stockList
                  .filter((item) => {
                    const usage = getStockUsageForRoster(item.itemName);
                    if (stockCategoryFilter === 'daily') return usage.procurementType === 'Daily Bazar';
                    if (stockCategoryFilter === 'monthly') return usage.procurementType === 'Monthly Stock';
                    if (stockCategoryFilter === 'low') return item.quantity <= item.minThreshold;
                    return true;
                  })
                  .map((item) => {
                    const isLow = item.quantity <= item.minThreshold;
                    const usage = getStockUsageForRoster(item.itemName);
                    const stockPercentage = Math.min(100, Math.round((item.quantity / Math.max(item.minThreshold * 2, item.quantity)) * 100));

                    return (
                      <tr key={item._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 font-bold text-slate-900 dark:text-white">
                          <div>{item.itemName}</div>
                          <span className="text-[10px] text-slate-400 font-normal">{item.category}</span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${usage.categoryBadge}`}>
                            {usage.procurementType}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="font-mono font-black text-sm text-slate-800 dark:text-slate-200">
                            {item.quantity} {item.unit}
                          </div>
                          <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${
                                isLow ? 'bg-red-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${stockPercentage}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 font-mono text-slate-500">
                          {item.minThreshold} {item.unit}
                        </td>
                        <td className="py-3 max-w-xs text-[11px] text-slate-600 dark:text-slate-300">
                          <div className="leading-snug">{usage.dishes}</div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isLow
                              ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                              : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          }`}>
                            {isLow ? 'Low Stock - Reorder' : 'In Stock'}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono text-[11px] text-slate-500">
                          {item.lastRestockedDate || 'Recent'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 5: STUDENT ID-WISE MEAL HISTORY LOOKUP               */}
      {/* ============================================================ */}
      {activeSubTab === 'student-lookup' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <User size={16} className="text-emerald-600" />
              <span>Student ID-wise Meal Consumption & Date History Lookup</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Hostel Super and Dining Staff can search any student by ID to view all past and scheduled meal dates and billing totals.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Student ID (e.g. 22203188, 221004128)..."
                value={lookupStudentId}
                onChange={(e) => setLookupStudentId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookupStudent()}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-xs font-mono outline-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500"
              />
            </div>
            <button
              type="button"
              disabled={isSearchingStudent}
              onClick={() => handleLookupStudent()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Search size={14} />
              <span>{isSearchingStudent ? 'Searching...' : 'Lookup Student History'}</span>
            </button>
          </div>

          {/* Quick Click Samples */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
            <span className="font-semibold">Quick Sample IDs:</span>
            {['22203188', '221004128', '221004129'].map((sId) => (
              <button
                key={sId}
                type="button"
                onClick={() => {
                  setLookupStudentId(sId);
                  handleLookupStudent(sId);
                }}
                className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 font-mono transition-colors cursor-pointer"
              >
                #{sId}
              </button>
            ))}
          </div>

          {/* Lookup Result Panel */}
          {studentLookupData && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#070b14] border border-emerald-200 dark:border-emerald-800/60 space-y-4 animate-fade-in">
              {/* Student Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Student ID: {studentLookupData.studentId}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Active Resident
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Found <strong>{studentLookupData.recentApplications?.length || 0}</strong> meal token record(s) on file.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Consumed Meals</span>
                    <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {studentLookupData.totalConsumedMeals} Meals ({studentLookupData.totalCostBDT})
                    </span>
                  </div>
                </div>
              </div>

              {/* Date-wise Meals Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d121f]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 dark:bg-[#070b14]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Token Ref</th>
                      <th className="py-2.5 px-3">Meal Category</th>
                      <th className="py-2.5 px-3">Diet Details</th>
                      <th className="py-2.5 px-3">Fee</th>
                      <th className="py-2.5 px-3">Food Handover Status</th>
                      <th className="py-2.5 px-3 text-right">Staff Approver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {(!studentLookupData.recentApplications || studentLookupData.recentApplications.length === 0) ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          No meal records found for this student.
                        </td>
                      </tr>
                    ) : (
                      studentLookupData.recentApplications.map((b) => {
                        const isHandedOver = Boolean(b.foodCollected || b.status === 'Approved & Served');
                        const isBreakfast = b.mealType === 'Breakfast';
                        const isLunch = b.mealType === 'Lunch';
                        const isDinner = b.mealType === 'Dinner';

                        return (
                          <tr key={b._id || b.bookingId} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                              {b.date || 'Today'}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">
                              #{b.bookingId}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                isBreakfast
                                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200'
                                  : isLunch
                                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200'
                                  : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200'
                              }`}>
                                {isBreakfast ? '🍳 Breakfast' : isLunch ? '🍛 Lunch' : isDinner ? '🍲 Dinner' : b.mealType}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate text-[11px]">
                              {b.diet || 'Standard Meal'}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              ৳{b.tokenCostBDT || 50}
                            </td>
                            <td className="py-2.5 px-3">
                              {isHandedOver ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                                  <CheckCircle2 size={10} />
                                  <span>Food Handed Over</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 inline-flex items-center gap-1">
                                  <Clock size={10} />
                                  <span>Ready at Counter</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-500 text-[11px]">
                              {b.approvedBy || (isHandedOver ? 'Dining Staff' : 'Awaiting Collection')}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Requisition Application Modal (Dining Staff) */}
      <ApplyBazarModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        initialType={applyModalInitialType}
        staffName={currentUser?.name || 'Md. Kalam Hossain (Dining Staff In-Charge)'}
        assignedHall={currentUser?.assignedHall || 'Padma Residential Hall (Male)'}
        onSuccess={(msg) => {
          onShowToast?.(msg, 'success');
          fetchRequisitions();
          fetchStock();
          fetchDailyReport(selectedDate);
        }}
      />

      {/* Official Bazar Receipt Modal */}
      <BazarReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedReceiptReq(null);
        }}
        requisition={selectedReceiptReq}
        isMonthlyConsolidated={Boolean(selectedReceiptReq?.isMonthlyConsolidated)}
      />

      {/* Hostel Super Approval Modal */}
      {selectedReqForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Approve Bazar Budget ({selectedReqForAction.requisitionId})
              </h4>
              <button
                type="button"
                onClick={() => setSelectedReqForAction(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Endorse the dining staff's procurement requisition for <strong>{selectedReqForAction.targetDate}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Approved Budget Amount (BDT)
                </label>
                <input
                  type="number"
                  value={approvalBudget}
                  onChange={(e) => setApprovalBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Provost / Super Endorsement Remarks
                </label>
                <input
                  type="text"
                  value={approvalRemarks}
                  onChange={(e) => setApprovalRemarks(e.target.value)}
                  placeholder="e.g. Approved upon checking student headcount."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedReqForAction(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => handleApproveRequisition(selectedReqForAction._id)}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                {isProcessingAction ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
