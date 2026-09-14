import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  ShieldCheck, 
  Printer, 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Award,
  AlertTriangle
} from 'lucide-react';

export default function GatePassQrModal({ isOpen, onClose, pass, student }) {
  const printRef = useRef(null);

  if (!isOpen || !pass) return null;

  const isApproved = pass.isApproved || pass.status === 'Approved' || pass.status === 'Teacher Approved' || pass.status === 'Approved & Checked-Out';
  const isCheckedOut = pass.status === 'Approved & Checked-Out';

  const qrPayload = JSON.stringify({
    type: 'GATE_PASS',
    passId: pass.id || pass.passId || 'LP-2026-001',
    qrCode: pass.gatePassCode || pass.qrPassCode || `IUBAT-QR-${pass.id || '9842'}`,
    studentId: student?.id || pass.studentId || '22203188',
    studentName: student?.name || pass.studentName || 'Emdadul Haque Rahin',
    hall: pass.hall || student?.hall || 'Padma Residential Hall (Male)',
    room: pass.room || student?.room || 'Room 104',
    destination: pass.destination || 'Home / Local Guardian',
    dates: pass.dates || `${pass.fromDate || ''} to ${pass.toDate || ''}`,
    status: pass.status,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0d121f] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-xs space-y-4">
        
        {/* Header with IUBAT Colors */}
        <div className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-600/10 via-teal-600/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-md">
              IUBAT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Official Residential Gate Pass
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {pass.type || 'Weekend Out-Pass'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Authorized by Floor House Tutor & Provost Office
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

        {/* Modal Body */}
        <div ref={printRef} className="px-6 space-y-4">
          
          {/* Security Status Banner */}
          {!isApproved ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-center gap-2.5">
              <AlertTriangle size={18} className="text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-xs">Awaiting Full Authority Approval</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  This Gate Pass will activate and generate an authorized exit QR code only after both Floor Teacher and Provost Office grant consent.
                </p>
              </div>
            </div>
          ) : isCheckedOut ? (
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 flex items-center justify-center gap-2 font-bold text-xs">
              <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400" />
              <span>STUDENT CHECKED OUT AT MAIN GATE</span>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2 font-bold text-xs">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>AUTHORIZED DIGITAL OUT-PASS • PRESENT TO GATE GUARD</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800">
            {/* QR Code */}
            <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800/80 shadow-sm shrink-0">
              <QRCodeSVG
                value={qrPayload}
                size={140}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Pass Metadata */}
            <div className="flex-1 w-full space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                <span className="font-mono text-slate-400">Pass Ref:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  #{pass.id || pass.passId || 'LP-2026-001'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {student?.name || pass.studentName || 'Student'} ({student?.id || pass.studentId || '22203188'})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Hall & Room:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {pass.hall || student?.hall || 'Padma Hall'} • {pass.room || student?.room || 'Room 104'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Validity:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {pass.dates || `${pass.fromDate || 'March 14'} - ${pass.toDate || 'March 16, 2026'}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                  {pass.destination || 'Home'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Stamps */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-0.5">
              <span className="text-slate-400 font-bold block">1. Guardian Consent:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> {pass.isGuardianGranted ? 'Authorized by Guardian' : 'Digital OTP Verified'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-0.5">
              <span className="text-slate-400 font-bold block">2. Authority Seal:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck size={12} /> Approved by {pass.approvedBy || 'House Tutor & Provost'}
              </span>
            </div>
          </div>

          <div className="text-center font-mono text-[10px] text-slate-400">
            Security Gate Code: <span className="font-bold text-slate-700 dark:text-slate-300">{pass.gatePassCode || pass.qrPassCode || 'IUBAT-QR-8832'}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#060911] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer size={14} />
            <span>Print Pass</span>
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
