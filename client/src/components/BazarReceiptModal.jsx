import React from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  Utensils,
  ShieldCheck,
  Package,
} from 'lucide-react';

export default function BazarReceiptModal({ isOpen, onClose, requisition, isMonthlyConsolidated = false }) {
  if (!isOpen || !requisition) return null;

  const voucherNo = requisition.voucherNo || `VOUCH-BZR-${requisition._id?.slice(-6).toUpperCase() || '891024'}`;
  const actualCost = requisition.totalActualCost || requisition.approvedBudget || requisition.totalEstimatedCost || 0;
  const items = requisition.items || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    >
      {/* Modal Box with compact viewport height so Close Bar is ALWAYS pinned and visible */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[85vh] flex flex-col bg-white dark:bg-[#0d121f] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        
        {/* Pinned Top Header Controls Bar (ALWAYS VISIBLE, never scrolls away) */}
        <div className="shrink-0 px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between print:hidden z-10 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileText size={16} />
            </span>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {isMonthlyConsolidated ? 'Monthly Consolidated Bazar Receipt' : 'Official Bazar Voucher & Receipt'}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Ref: {requisition.requisitionId || voucherNo}
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

        {/* Scrollable Receipt Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs print:p-0 print:overflow-visible">
          
          {/* Institutional Letterhead */}
          <div className="text-center pb-3 border-b-2 border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] tracking-wider uppercase">
              <Building2 size={14} />
              <span>Hostel Seat Allocation Management System • Residential Hall Directorate</span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Padma Residential Dining Governance
            </h1>
            <p className="text-[11px] text-slate-500">
              Kitchen Pantry Procurement & Daily Commercial Expense Voucher
            </p>
            <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
              OFFICIAL CASH VOUCHER #{voucherNo}
            </div>
          </div>

          {/* Meta Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-100 dark:border-slate-800">
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Voucher Date</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {requisition.targetDate || 'Today'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-100 dark:border-slate-800">
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Category</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 truncate block">
                {requisition.requisitionType || 'Daily Next-Day Bazar'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-100 dark:border-slate-800">
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Residential Unit</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                {requisition.hall || 'Padma Hall'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-100 dark:border-slate-800">
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>Purchased & Stocked</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="text-[11px]">
            <span className="font-bold text-slate-700 dark:text-slate-300">Procurement Objective: </span>
            <span className="text-slate-600 dark:text-slate-400">
              {requisition.title || 'Central Kitchen Food Supplies & Ingredients'}
            </span>
          </div>

          {/* Itemized Purchase Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 dark:bg-[#070b14] border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-2 px-2.5">SL</th>
                  <th className="py-2 px-2.5">Item Description</th>
                  <th className="py-2 px-2.5 text-right">Quantity</th>
                  <th className="py-2 px-2.5 text-right">Est. Rate</th>
                  <th className="py-2 px-2.5 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-3 text-center text-slate-400">
                      General Kitchen Market Supplies
                    </td>
                  </tr>
                ) : (
                  items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <td className="py-2 px-2.5 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-2.5 font-bold text-slate-900 dark:text-white">
                        {it.name}
                        {it.category && (
                          <span className="text-[9.5px] text-slate-400 font-normal block">
                            {it.category}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        {it.quantity} {it.unit}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono text-slate-500">
                        ৳{it.estimatedRate || Math.round((it.estimatedTotal || 0) / (it.quantity || 1))}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ৳{(it.estimatedTotal || (it.quantity * (it.estimatedRate || 0))).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Grand Total Financial Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                Total Expenditure Incurred
              </span>
              <span className="text-[10.5px] text-slate-600 dark:text-slate-400">
                Channel: <strong>Dining Petty Cash / Local Wholesale Arat</strong>
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                ৳{actualCost.toLocaleString()} BDT
              </span>
              <div className="text-[9.5px] text-slate-500 font-mono">
                Approved Budget: ৳{(requisition.approvedBudget || actualCost).toLocaleString()} BDT
              </div>
            </div>
          </div>

          {/* Authorizations & Verification Seals */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 text-[10.5px]">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Purchased & Submitted By</span>
              <div className="font-bold text-slate-900 dark:text-white">
                {requisition.submittedBy || 'Md. Kalam Hossain (Dining Staff In-Charge)'}
              </div>
              <p className="text-[9.5px] text-slate-500">Central Mess Staff In-Charge</p>
              <div className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Items Received & Counted
              </div>
            </div>

            <div className="space-y-0.5 text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Authorized & Sanctioned By</span>
              <div className="font-bold text-slate-900 dark:text-white">
                {requisition.approvedBy || 'Prof. Dr. Monirul Islam (Hostel Super)'}
              </div>
              <p className="text-[9.5px] text-slate-500">Hostel Residential Directorate</p>
              <div className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ Expense Verified & Approved
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-[#070b14] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] print:hidden">
          <span className="text-slate-400">
            Official digital receipt generated by Hostel Hall ERP.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
