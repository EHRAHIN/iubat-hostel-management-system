import React from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  Building2,
  Calendar,
  Utensils,
  Receipt,
  Clock,
} from 'lucide-react';

export default function StudentMealReceiptModal({
  isOpen,
  onClose,
  student,
  mealSummary,
  month = 'September 2026',
}) {
  if (!isOpen) return null;

  const receiptNo = `MEAL-REC-${student?.id || '22203188'}-${Date.now().toString().slice(-4)}`;
  const applications = mealSummary?.recentApplications || [];
  const totalCostBDT = mealSummary?.totalCostBDT || '0 BDT';
  const totalMeals = mealSummary?.totalConsumedMeals || 0;

  // Meal breakdown
  const breakfasts = applications.filter((a) => a.mealType === 'Breakfast').length;
  const lunches = applications.filter((a) => a.mealType === 'Lunch').length;
  const dinners = applications.filter((a) => a.mealType === 'Dinner').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[85vh] flex flex-col bg-white dark:bg-[#0d121f] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        
        {/* Pinned Top Header Bar (Close button ALWAYS visible) */}
        <div className="shrink-0 px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between print:hidden z-10 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Receipt size={16} />
            </span>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Monthly Meal Bill & Attendance Receipt
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Invoice Ref: #{receiptNo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer size={12} />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close Receipt"
              className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs print:p-0 print:overflow-visible">
          
          {/* Institutional Letterhead */}
          <div className="text-center pb-3 border-b-2 border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] tracking-wider uppercase">
              <Building2 size={14} />
              <span>IUBAT — International University of Business Agriculture and Technology</span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Padma Residential Dining Services
            </h1>
            <p className="text-[11px] text-slate-500">
              Monthly Student Meal Attendance & Mess Expenditure Statement
            </p>
            <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[10.5px] font-mono font-bold text-emerald-800 dark:text-emerald-300">
              BILLING PERIOD: {month.toUpperCase()}
            </div>
          </div>

          {/* Student Profile Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-100 dark:border-slate-800">
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Student Name</span>
              <span className="font-bold text-slate-900 dark:text-white truncate block">
                {student?.name || 'Resident Student'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-100 dark:border-slate-800">
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Student ID</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {student?.id || '22203188'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-100 dark:border-slate-800">
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Room & Hall</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                {student?.room || 'Room 104'} ({student?.hall || 'Padma Hall'})
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-100 dark:border-slate-800">
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Department</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                {student?.dept || 'Engineering'}
              </span>
            </div>
          </div>

          {/* Total Summary Banner */}
          <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                Total Monthly Meal Dues
              </span>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                Total: <strong>{totalMeals} Meals</strong> (🍳 {breakfasts} Breakfast, 🍛 {lunches} Lunch, 🍲 {dinners} Dinner)
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                {totalCostBDT}
              </span>
              <span className="text-[9px] text-slate-500 block">
                Due at month-end with hall rent
              </span>
            </div>
          </div>

          {/* Detailed Itemized Dates Table */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Itemized Daily Meal Log & Token Register ({applications.length} Records)
            </span>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 dark:bg-[#070b14] border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-2 px-2.5">Date</th>
                    <th className="py-2 px-2.5">Token Ref</th>
                    <th className="py-2 px-2.5">Meal Slot</th>
                    <th className="py-2 px-2.5">Diet Description</th>
                    <th className="py-2 px-2.5 text-right">Charge</th>
                    <th className="py-2 px-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-3 text-center text-slate-400">
                        No meal tokens applied for this billing period.
                      </td>
                    </tr>
                  ) : (
                    applications.map((b, idx) => {
                      const isCollected = Boolean(b.foodCollected || b.status === 'Approved & Served');
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <td className="py-2 px-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {b.date || 'Today'}
                          </td>
                          <td className="py-2 px-2.5 font-mono text-slate-500">
                            #{b.bookingId}
                          </td>
                          <td className="py-2 px-2.5 font-semibold text-slate-900 dark:text-white">
                            {b.mealType}
                          </td>
                          <td className="py-2 px-2.5 text-slate-600 dark:text-slate-400 max-w-xs truncate text-[10.5px]">
                            {b.diet || 'Standard Meal'}
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ৳{b.tokenCostBDT || 50}
                          </td>
                          <td className="py-2 px-2.5 text-right">
                            {isCollected ? (
                              <span className="text-emerald-600 font-bold inline-flex items-center gap-1 text-[10px]">
                                <CheckCircle2 size={11} />
                                <span>Collected</span>
                              </span>
                            ) : (
                              <span className="text-blue-600 font-semibold text-[10px]">
                                Active
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Signatures & Verification */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 text-[10.5px]">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Prepared By</span>
              <div className="font-bold text-slate-900 dark:text-white">Central Dining In-Charge</div>
              <p className="text-[9.5px] text-slate-500">Padma Hall Mess Committee</p>
              <div className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Meal Count Verified
              </div>
            </div>

            <div className="space-y-0.5 text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Endorsed By</span>
              <div className="font-bold text-slate-900 dark:text-white">Hostel Super / Provost Office</div>
              <p className="text-[9.5px] text-slate-500">IUBAT Hostels Directorate</p>
              <div className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ Official Student Record
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-[#070b14] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] print:hidden">
          <span className="text-slate-400">
            Official monthly meal bill receipt generated by IUBAT Hall ERP.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Close Receipt
          </button>
        </div>

      </div>
    </div>
  );
}
