import React, { useState } from 'react';
import { Calendar, Download, FileText } from 'lucide-react';

export default function NoticeBoardSection() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const notices = [
    {
      id: 1,
      title: 'Spring 2026 Residential Hall Seat Application Schedule and Deadline',
      date: 'February 18, 2026',
      category: 'Allocation',
      refNo: 'IUBAT/RO/2026/042',
      summary: 'All eligible students seeking hostel accommodation for the upcoming semester must complete online submissions before March 15, 2026.',
      authority: 'Office of the Provost',
    },
    {
      id: 2,
      title: 'Standard Operating Procedure: Night Attendance and 10:00 PM Curfew Timing',
      date: 'February 12, 2026',
      category: 'Administration',
      refNo: 'IUBAT/HD/2026/019',
      summary: 'Floor teachers will conduct scheduled digital roll call at 10:00 PM daily. Unapproved absences will generate automatic guardian alerts.',
      authority: 'Hostel Disciplinary Committee',
    },
    {
      id: 3,
      title: 'Monthly Mess Billing and Dining Token Clearance for March 2026',
      date: 'February 05, 2026',
      category: 'Dining',
      refNo: 'IUBAT/MC/2026/008',
      summary: 'Students may recharge dining allowances and verify monthly token counts via the Student Portal by the 5th of every month.',
      authority: 'Hostel Mess Management Committee',
    },
    {
      id: 4,
      title: 'Scheduled Network Maintenance and High-Speed LAN Upgrade in Padma Hall',
      date: 'January 28, 2026',
      category: 'Maintenance',
      refNo: 'IUBAT/IT/2026/011',
      summary: 'IT infrastructure maintenance will take place on Saturday between 09:00 AM and 01:00 PM. Minimal internet disruption is expected.',
      authority: 'Estate and IT Services',
    },
  ];

  const filtered = selectedCategory === 'all'
    ? notices
    : notices.filter((n) => n.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <section id="notices" className="py-12 md:py-16 bg-slate-50 dark:bg-[#060911] border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
              Official Communications
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Notices and Administrative Circulars
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Official circulars and policy directives issued by the IUBAT Hostel Administration.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full">
            {['all', 'Allocation', 'Administration', 'Dining', 'Maintenance'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All Notices' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((notice) => (
            <div 
              key={notice.id}
              className="saas-card rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/80 text-[11px]">
                  <span className="font-mono text-slate-500 font-semibold">
                    Ref: {notice.refNo}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar size={12} />
                    <span>{notice.date}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {notice.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 font-normal">
                  {notice.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{notice.authority}</span>
                </span>
                <button
                  onClick={() => alert(`Downloading official circular: ${notice.title}`)}
                  className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-bold"
                >
                  <Download size={13} />
                  <span>Download Circular</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
