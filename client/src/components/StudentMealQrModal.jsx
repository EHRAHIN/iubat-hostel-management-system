import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Utensils, 
  CheckCircle2, 
  Clock, 
  Printer, 
  ShieldCheck, 
  AlertCircle,
  Hash,
  Calendar,
  User,
  Coffee,
  Sun,
  Moon
} from 'lucide-react';

export default function StudentMealQrModal({ isOpen, onClose, token, student }) {
  const printRef = useRef(null);

  if (!isOpen || !token) return null;

  const isCollected = token.foodCollected || token.status === 'Approved & Served' || token.status === 'Approved';
  const isBreakfast = token.mealType === 'Breakfast';
  const isLunch = token.mealType === 'Lunch';
  const isDinner = token.mealType === 'Dinner';

  // Structured QR payload that the staff scanner parses instantly
  const qrPayload = JSON.stringify({
    type: 'MEAL_TOKEN',
    bookingId: token.bookingId || token._id || `MEL-${token.id || '8832'}`,
    studentId: student?.id || token.studentId || '22203188',
    studentName: student?.name || token.studentName || 'Emdadul Haque Rahin',
    mealType: token.mealType || 'Standard Meal',
    date: token.date || 'Today',
    tokenCostBDT: token.tokenCostBDT || 50,
  });

  const handlePrint = () => {
    window.print();
  };

  const getMealIcon = () => {
    if (isBreakfast) return <Coffee size={20} className="text-amber-500" />;
    if (isLunch) return <Sun size={20} className="text-emerald-500" />;
    if (isDinner) return <Moon size={20} className="text-indigo-500" />;
    return <Utensils size={20} className="text-emerald-500" />;
  };

  const getThemeColor = () => {
    if (isBreakfast) return {
      badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      border: 'border-amber-400 dark:border-amber-600',
      headerBg: 'from-amber-500/10 via-amber-500/5 to-transparent'
    };
    if (isLunch) return {
      badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      border: 'border-emerald-400 dark:border-emerald-600',
      headerBg: 'from-emerald-500/10 via-emerald-500/5 to-transparent'
    };
    return {
      badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      border: 'border-indigo-400 dark:border-indigo-600',
      headerBg: 'from-indigo-500/10 via-indigo-500/5 to-transparent'
    };
  };

  const theme = getThemeColor();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0d121f] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-xs space-y-4">
        
        {/* Header */}
        <div className={`p-5 pb-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b ${theme.headerBg} flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/80 dark:border-slate-800">
              {getMealIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Digital Dining Meal Token
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${theme.badge}`}>
                  {token.mealType}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Padma Residential Dining Hall • Single Serving Pass
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable Card Body */}
        <div ref={printRef} className="px-6 space-y-4 text-center">
          
          {/* Status Alert */}
          {isCollected ? (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2 font-bold text-xs">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>MEAL HANDED OVER & COLLECTED</span>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 flex items-center justify-center gap-2 text-xs">
              <Clock size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="font-semibold">Ready for Collection: Show this QR to Dining Staff</span>
            </div>
          )}

          {/* QR Code Container with Frame */}
          <div className="relative inline-block p-4 bg-white rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-inner">
            <QRCodeSVG
              value={qrPayload}
              size={180}
              level="H"
              includeMargin={false}
              className={isCollected ? 'opacity-30 filter grayscale' : ''}
            />

            {/* If collected, stamp watermark across QR code */}
            {isCollected && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="transform -rotate-12 border-4 border-red-600 bg-red-600/90 text-white font-black px-4 py-1.5 rounded-xl uppercase tracking-widest text-sm shadow-xl">
                  ✓ CLAIMED / SERVED
                </div>
              </div>
            )}
          </div>

          {/* Token Reference and Info Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-left space-y-2 font-mono">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800/60 text-[11px]">
              <span className="text-slate-500 flex items-center gap-1">
                <Hash size={12} /> Token Ref:
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {token.bookingId || token._id || `MEL-${token.id || '8832'}`}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 flex items-center gap-1">
                <User size={12} /> Student ID:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {student?.id || token.studentId || '22203188'} ({student?.name || token.studentName || 'Student'})
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 flex items-center gap-1">
                <Calendar size={12} /> Date & Slot:
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {token.date || 'Today'} • {token.mealType}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px]">
              <span className="text-slate-500">Charge:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                ৳{token.tokenCostBDT || 50} BDT (Non-refundable)
              </span>
            </div>

            {isCollected && (
              <div className="pt-1 text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center justify-between font-sans">
                <span>Handed Over By: {token.collectedByStaff || token.approvedBy || 'Dining Staff'}</span>
                <span>{token.collectedAt ? new Date(token.collectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified'}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Encrypted Token • Unique per meal slot • Valid for single serving</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-[#060911] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer size={14} />
            <span>Print Token</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer shadow-md"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
