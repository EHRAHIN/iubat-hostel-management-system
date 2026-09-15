import React from 'react';
import { 
  Printer, 
  X, 
  FileText 
} from 'lucide-react';

export default function OfficialCircularModal({ notice, onClose }) {
  if (!notice) return null;

  const handlePrint = () => {
    window.print();
  };

  const circularPrintRef = React.useRef(null);

  // Check if content has standard curfew/attendance text to expand with complete institutional directives
  const isNightCurfewNotice = 
    notice.refNo === 'HSTL/HD/2026/019' || 
    (notice.title && notice.title.toLowerCase().includes('curfew')) ||
    (notice.title && notice.title.toLowerCase().includes('night attendance'));

  const rawText = notice.content || notice.summary || '';
  const paragraphs = rawText.split('\n').filter(p => p.trim().length > 0);

  return (
    <div
      id="printable-circular-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto print:p-0 print:bg-white print:static"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl max-h-[96vh] flex flex-col print:max-w-none print:max-h-none">
        
        {/* ACTION / PRINT BAR (Hidden on Print) */}
        <div className="mb-3 px-5 py-3 bg-slate-900/90 backdrop-blur-md text-white rounded-2xl border border-slate-700/60 shadow-xl flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-xs tracking-wide">Official Institutional Circular</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">• Hall Directorate Public Release</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Printer size={14} />
              <span>Print / Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* AUTHENTIC PRINTABLE INSTITUTIONAL GAZETTE / CIRCULAR DOCUMENT */}
        <div 
          ref={circularPrintRef}
          className="relative bg-white text-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 md:p-12 border border-slate-200 overflow-y-auto print:overflow-visible print:border-none print:shadow-none print:p-8 print:m-0 print:rounded-none"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {/* Subtle Security Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.028]">
            <div className="text-center transform -rotate-30">
              <div className="w-64 h-64 border-8 border-emerald-950 rounded-full flex flex-col items-center justify-center p-4">
                <span className="font-serif font-black text-4xl tracking-widest text-emerald-950">HOSTEL</span>
                <span className="font-serif font-bold text-xs tracking-wider text-emerald-950 uppercase mt-2">Residential Hall</span>
                <span className="font-sans font-bold text-[10px] tracking-widest text-slate-800 mt-1">OFFICIAL GAZETTE</span>
              </div>
            </div>
          </div>

          {/* DOCUMENT HEADER */}
          <div className="relative z-10">
            {/* University Crest & Monogram */}
            <div className="flex flex-col items-center text-center pb-3">
              {/* Monogram / Crest SVG */}
              <div className="mb-2">
                <div className="w-14 h-14 rounded-full border-2 border-emerald-900 bg-emerald-50 p-1 flex items-center justify-center shadow-sm">
                  <div className="w-full h-full rounded-full border border-emerald-800 flex flex-col items-center justify-center text-emerald-950">
                    <svg className="w-7 h-7 text-emerald-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 3L2 8l10 5 10-5-10-5z" />
                      <path d="M6 10.5V16c0 2 3 3.5 6 3.5s6-1.5 6-3.5v-5.5" />
                      <line x1="21" y1="12" x2="21" y2="18" />
                    </svg>
                    <span className="text-[7px] font-sans font-extrabold tracking-tighter text-emerald-900 leading-none mt-0.5">ESTD 1991</span>
                  </div>
                </div>
              </div>

              {/* University Title */}
              <h1 className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-wider text-emerald-950 font-serif leading-tight">
                Hostel Seat Allocation Management System
              </h1>
              <p className="text-[11px] font-sans uppercase tracking-widest font-semibold text-slate-600 mt-0.5">
                Centralized Residential Hall Directorate
              </p>

              {/* Department & Hall */}
              <div className="mt-2.5 space-y-0.5">
                <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 font-serif">
                  Office of the Provost & Residential Hall Administration
                </h2>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-900 font-serif">
                  Padma Residential Hall
                </h3>
                <p className="text-[10px] font-sans text-slate-600 font-medium">
                  4 Embankment Drive Road, Sector 10, Uttara Model Town, Dhaka-1230, Bangladesh
                </p>
                <p className="text-[9.5px] font-sans text-slate-500 font-mono tracking-tight">
                  Phone: +880 2 55091801-5 | Email: provost@hostel.edu | Web: www.hostel.edu
                </p>
              </div>
            </div>

            {/* Classical Academic Dual Dividing Line */}
            <div className="mt-2 mb-4">
              <div className="border-t-2 border-emerald-950"></div>
              <div className="border-t border-emerald-900/40 mt-0.5"></div>
            </div>

            {/* Official Authority and Date Line */}
            <div className="flex items-center justify-between text-xs font-sans text-slate-800 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="font-bold text-slate-900">Issued by:</span>
                <span className="text-emerald-950 font-bold">Office of the Provost</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="font-bold text-slate-900">Date of Issue:</span>
                <span className="font-serif font-bold text-slate-900">
                  {notice.date || '12 September 2026'}
                </span>
              </div>
            </div>

            {/* Formal Centered Banner: CIRCULAR / NOTICE */}
            <div className="text-center my-5">
              <span className="inline-block border-b-2 border-slate-900 pb-0.5 font-serif font-bold text-sm sm:text-base uppercase tracking-widest text-slate-900">
                OFFICIAL CIRCULAR
              </span>
            </div>

            {/* Subject and Target Memo Line */}
            <div className="space-y-1.5 mb-5 text-xs sm:text-sm font-sans">
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 shrink-0 w-20">Subject:</span>
                <span className="font-serif font-bold text-slate-950 text-sm sm:text-base leading-snug">
                  {notice.title}
                </span>
              </div>

              <div className="flex items-start gap-2 text-xs">
                <span className="font-bold text-slate-600 shrink-0 w-20">Distribution:</span>
                <span className="text-slate-700 font-medium">
                  {notice.targetAudienceLabel || 'All Resident Students, Floor Tutors & Hall Staff Members'}
                </span>
              </div>

              {notice.category && (
                <div className="flex items-start gap-2 text-xs">
                  <span className="font-bold text-slate-600 shrink-0 w-20">Directorate:</span>
                  <span className="text-slate-700 font-medium">
                    {notice.category} Affairs & Hall Governance
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 mb-5"></div>

            {/* Circular Body / Clauses */}
            <div className="space-y-3.5 text-xs sm:text-[13px] leading-relaxed text-slate-800 text-justify">
              <p className="font-serif">
                This is for the information and strict compliance of all concerned that under the authority vested in the Office of the Provost, the following institutional standard operating procedures and residential guidelines shall remain in full effect for Padma Residential Hall:
              </p>

              {/* If Curfew/Night Attendance notice, render structured clauses */}
              {isNightCurfewNotice ? (
                <div className="space-y-3 pl-1 font-serif">
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-900 shrink-0">1.0</span>
                    <div>
                      <strong className="text-slate-950">Mandatory 10:00 PM Digital Roll Call:</strong> Floor teachers and assistant wardens will conduct scheduled digital biometric and room attendance roll calls promptly at 10:00 PM daily. Every resident student must be present in their assigned room during roll call.
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="font-bold text-slate-900 shrink-0">2.0</span>
                    <div>
                      <strong className="text-slate-950">Automated Guardian Alert Protocol:</strong> Any unauthorized absence, late check-in, or failure to answer roll call will automatically trigger instantaneous SMS and digital alerts to registered parents/guardians, followed by an immediate incident log.
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="font-bold text-slate-900 shrink-0">3.0</span>
                    <div>
                      <strong className="text-slate-950">Hall Gate Closure & Entry Lockdown:</strong> Main entrance gates of Padma Hall will be securely locked at 10:00 PM. No resident will be allowed entry or departure post-curfew without a verified emergency authorization.
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="font-bold text-slate-900 shrink-0">4.0</span>
                    <div>
                      <strong className="text-slate-950">Prior Out-Pass Verification:</strong> Students requiring late arrival due to scheduled academic laboratory work, hospital clinical rotations, or emergency family obligations must submit a digital Out-Pass with Guardian Verification at least 6 hours in advance via the Student Portal.
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="font-bold text-slate-900 shrink-0">5.0</span>
                    <div>
                      <strong className="text-slate-950">Disciplinary Enforcement:</strong> Habitual non-compliance with curfew rules constitutes a violation of Hall Rules and will be referred immediately to the Hostel Disciplinary Committee for forfeiture of residential seat privileges.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 font-serif">
                  {paragraphs.map((para, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="font-bold text-slate-900 shrink-0">{idx + 1}.0</span>
                      <p>{para}</p>
                    </div>
                  ))}
                </div>
              )}

              <p className="font-serif pt-2">
                All residents and floor staff are directed to adhere strictly to the aforementioned regulations. Cooperation of all residents is solicited to ensure a disciplined, safe, and productive academic living environment.
              </p>
            </div>

            {/* SIGNATORY & SEAL BLOCK */}
            <div className="mt-10 pt-4 flex items-end justify-between gap-6">
              {/* Left: Authentic Circular Seal */}
              <div className="flex items-center gap-3">
                <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-emerald-900/80 p-1 flex flex-col items-center justify-center text-center select-none bg-emerald-50/20">
                  <div className="w-full h-full rounded-full border border-emerald-800 flex flex-col items-center justify-center p-1">
                    <div className="text-[6px] font-sans font-black tracking-widest text-emerald-950 uppercase leading-tight">
                      OFFICE OF THE PROVOST
                    </div>
                    <div className="w-6 h-0.5 bg-emerald-900/40 my-0.5"></div>
                    <div className="text-[5.5px] font-sans font-bold text-slate-800 tracking-tight">
                      PADMA RESIDENTIAL HALL
                    </div>
                    <div className="text-[5px] font-serif font-black text-emerald-900 mt-0.5">
                      HSTL
                    </div>
                    <div className="text-[5px] font-mono text-slate-500 mt-0.5 font-bold">
                      VERIFIED 2026
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-sans text-slate-500 space-y-0.5 hidden sm:block">
                  <div className="font-bold text-slate-800">Officially Sealed & Approved</div>
                  <div>Issued under executive authority</div>
                  <div className="text-[9.5px] text-slate-400">
                    Padma Residential Hall Directorate
                  </div>
                </div>
              </div>

              {/* Right: Authentic Signature & Designation Block */}
              <div className="text-right font-sans space-y-0.5">
                {/* Pen Signature Vector */}
                <div className="flex justify-end pb-1">
                  <svg className="w-36 h-10 text-blue-950" viewBox="0 0 160 45" fill="none">
                    <path
                      d="M10 32 C25 15, 35 12, 45 28 C50 35, 55 18, 65 22 C75 26, 80 14, 90 28 C95 35, 105 10, 120 18 C130 24, 140 12, 150 25 M30 38 L145 34"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="font-serif font-bold text-sm text-slate-950">
                  (Prof. Dr. Monirul Islam)
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {notice.authority || 'Provost & Hostel Super'}
                </div>
                <div className="text-[11px] text-slate-600">
                  Padma Residential Hall
                </div>
                <div className="text-[10px] text-slate-500">
                  Hostel Seat Allocation Management System • Residential Hall Directorate
                </div>
              </div>
            </div>

            {/* DISTRIBUTION / CARBON COPY (C.C.) LIST */}
            <div className="mt-8 pt-3 border-t border-slate-300 font-sans text-[10px] text-slate-600">
              <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Distribution / Copy forwarded for kind information and necessary action to:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5 leading-tight font-mono text-[9.5px]">
                <div>1. Office of the Vice-Chancellor (for kind appraisal of the Hon'ble VC)</div>
                <div>2. Office of the Registrar</div>
                <div>3. Office of the Proctor</div>
                <div>4. All Floor House Tutors & Assistant Wardens, Padma Hall</div>
                <div>5. Security & Gate Protocol Command Desk (Padma Hall)</div>
                <div>6. Hall Notice Boards (Ground Floor & Dining Hall) & Student Web Portal</div>
                <div>7. Office Guard File / Archive</div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Close Bar (Hidden on Print) */}
        <div className="mt-3 px-5 py-2.5 bg-slate-900/90 text-white rounded-2xl border border-slate-700/60 shadow-xl flex items-center justify-between text-xs print:hidden">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>Padma Residential Hall</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Official Notice</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer border border-slate-700"
          >
            Close Document
          </button>
        </div>

      </div>
    </div>
  );
}
