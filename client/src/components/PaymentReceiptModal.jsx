import React from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  Building2,
  CheckCircle2,
  QrCode,
  FileCheck2,
} from 'lucide-react';

export default function PaymentReceiptModal({
  isOpen,
  onClose,
  paymentData,
  studentUser,
}) {
  if (!isOpen || !paymentData) return null;

  const invoiceNo = paymentData.invoiceNo || 'INV-2026-0318';
  const tranId = paymentData.transactionId || 'SSL-TXN-2026-8912';
  const bankTranId = paymentData.bankTranId || 'BANK-781923';
  const valId = paymentData.valId || 'VAL-891234';
  const paidDate = paymentData.paidAt ? new Date(paymentData.paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const amountBDT = paymentData.amountBDT || 2200;
  const feeType = paymentData.feeType || 'Seat Rent';
  const month = paymentData.month || 'March 2026';
  const paymentMethod = paymentData.paymentMethod || 'SSLCommerz (bKash)';
  
  const studentName = paymentData.studentName || studentUser?.name || 'Tanvir Hasan';
  const studentId = paymentData.studentId || studentUser?.userId || studentUser?.id || '221004128';
  const department = paymentData.department || studentUser?.department || 'Department of Computer Science & Engineering (CSE)';
  const hall = paymentData.hall || studentUser?.hall || 'Padma Residential Hall (Male)';
  const room = paymentData.room || studentUser?.room || 'Room 101';
  const seatNo = paymentData.seatNo || studentUser?.seatNo || 'Bed A';

  const breakdown = paymentData.breakdown && paymentData.breakdown.length > 0 ? paymentData.breakdown : [
    { label: `${feeType} - Regular Billing (${month})`, amount: amountBDT - 400 },
    { label: 'High-Speed Wi-Fi & Generator Facility', amount: 250 },
    { label: 'Hall Common Service & Maintenance', amount: 150 },
  ];

  // Number to Words Converter helper (BDT)
  const numberToWordsBDT = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim() + ' Taka Only';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm print:p-0 print:bg-white animate-fade-in"
    >
      {/* Container Box - Compact size and max height so Cross Bar is ALWAYS pinned and visible */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:max-h-none print:rounded-none border border-slate-200"
      >
        {/* Pinned Top Controls Bar (NEVER scrolls away) */}
        <div className="shrink-0 px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between print:hidden z-10 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileCheck2 size={16} />
            </span>
            <div>
              <span className="font-bold text-xs uppercase tracking-wider block">
                Official Money Receipt
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Invoice: #{invoiceNo}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Printer size={13} />
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

        {/* Scrollable Printable Official Receipt Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 print:p-6 text-slate-900 bg-white" id="printable-receipt">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
            <div className="inline-flex items-center justify-center gap-2 mb-1">
              <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-serif font-black text-lg">
                I
              </div>
              <div className="text-left">
                <h1 className="text-base sm:text-lg font-black tracking-tight uppercase text-emerald-950 font-serif leading-none">
                  International University of Business Agriculture and Technology
                </h1>
                <p className="text-[10px] uppercase font-bold text-slate-600 tracking-widest mt-0.5">
                  Office of the Comptroller & Residential Hall Directorate
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              4 Embankment Drive Road, Sector 10, Uttara Model Town, Dhaka-1230, Bangladesh
            </p>
            <div className="pt-2">
              <span className="px-4 py-1 rounded-full bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest inline-block shadow-sm">
                Official Money & Dining Receipt
              </span>
            </div>
          </div>

          {/* Receipt Top Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div>
                <span className="text-slate-500 text-[11px]">Invoice No:</span>{' '}
                <strong className="font-mono text-slate-900">{invoiceNo}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">SSLCommerz TXN ID:</span>{' '}
                <strong className="font-mono text-emerald-700">{tranId}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Bank Ref ID:</span>{' '}
                <strong className="font-mono text-slate-800">{bankTranId}</strong>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div>
                <span className="text-slate-500 text-[11px]">Date & Time:</span>{' '}
                <strong className="text-slate-900">{paidDate}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Payment Gateway:</span>{' '}
                <strong className="text-emerald-700">{paymentMethod}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Clearance Status:</span>{' '}
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase">
                  ✓ 100% Paid & Verified
                </span>
              </div>
            </div>
          </div>

          {/* Resident Student Identification Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-bold uppercase tracking-wider text-[10px] text-slate-500 pb-1 border-b border-slate-200 flex items-center justify-between">
              <span>Resident Identification</span>
              <span>Semester: Spring 2026</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <div>
                <span className="text-slate-500">Student Name:</span>{' '}
                <strong className="text-slate-900">{studentName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Student ID:</span>{' '}
                <strong className="font-mono text-slate-900">{studentId}</strong>
              </div>
              <div>
                <span className="text-slate-500">Department:</span>{' '}
                <strong className="text-slate-900">{department}</strong>
              </div>
              <div>
                <span className="text-slate-500">Allocated Space:</span>{' '}
                <strong className="text-emerald-800">{hall} • {room} ({seatNo})</strong>
              </div>
            </div>
          </div>

          {/* Itemized Billing Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Fee Category & Description</th>
                  <th className="p-3">Billing Cycle</th>
                  <th className="p-3 text-right">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {breakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-800">{item.label}</td>
                    <td className="p-3 text-slate-500">{month}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      ৳{item.amount?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-xs">
                <tr>
                  <td colSpan={3} className="p-3 text-right uppercase tracking-wider text-slate-600">
                    Total Amount Paid:
                  </td>
                  <td className="p-3 text-right font-black text-sm font-mono text-emerald-700">
                    ৳{amountBDT.toLocaleString()} BDT
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in Words */}
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-xs text-emerald-950">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
              Amount in Words:
            </span>
            <strong className="font-serif italic text-emerald-900">
              {numberToWordsBDT(amountBDT)}
            </strong>
          </div>

          {/* Official Verification Seal & Signatures Footer */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 items-end text-center text-xs">
            {/* Left QR & Barcode */}
            <div className="space-y-1 text-left">
              <div className="inline-flex items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <QrCode size={36} className="text-slate-800" />
                <div className="text-[8px] font-mono leading-tight text-slate-500">
                  VERIFIED-BY<br />SSLCOMMERZ<br />IUBAT-HOSTEL
                </div>
              </div>
              <p className="text-[9px] text-slate-400 font-mono">
                Digitally cryptographed on IUBAT Server
              </p>
            </div>

            {/* Center Official Stamp */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-700 flex flex-col items-center justify-center text-[8px] font-black text-emerald-800 uppercase tracking-tighter transform -rotate-12 bg-emerald-50/40 shadow-inner">
                <span>IUBAT</span>
                <span>ACCOUNTS</span>
                <span>PAID</span>
              </div>
              <span className="text-[9px] text-slate-500 font-bold mt-1">Institutional Seal</span>
            </div>

            {/* Right Provost / Comptroller Signature */}
            <div className="text-right space-y-1">
              <div className="text-xs font-serif italic text-slate-700 font-bold border-b border-slate-400 pb-1 inline-block">
                Prof. Dr. Monirul Islam
              </div>
              <div className="text-[10px] font-bold text-slate-800">
                Hostel Super / Provost
              </div>
              <div className="text-[9px] text-slate-500">
                Residential Hall Directorate, IUBAT
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
