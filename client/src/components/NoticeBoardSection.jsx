import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Download, 
  FileText, 
  Eye, 
  Users, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  Search, 
  Copy, 
  Check, 
  Pin, 
  Clock, 
  ArrowRight, 
  Award,
  X,
  Printer
} from 'lucide-react';
import { api } from '../services/api';
import OfficialCircularModal from './OfficialCircularModal';

export default function NoticeBoardSection() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoticeForModal, setSelectedNoticeForModal] = useState(null);
  const [liveNotices, setLiveNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedRef, setCopiedRef] = useState('');

  const fallbackNotices = [
    {
      _id: 'not-01',
      title: 'Spring 2026 Residential Hall Seat Application Schedule and Deadline',
      date: 'September 12, 2026',
      category: 'Allocation',
      refNo: 'IUBAT/RO/2026/042',
      summary: 'All eligible students seeking hostel accommodation for the upcoming semester must complete online seat submissions before the final deadline. Late submissions will be waitlisted automatically under provost regulations.',
      content: 'All eligible students seeking hostel accommodation for the upcoming semester must complete online seat submissions before the final deadline. Late submissions will be waitlisted automatically under provost regulations.\n\nRoom assignments are evaluated via academic CGPA merit and distance parameters. Floor assignments will be confirmed by respective House Tutors upon physical verification.',
      authority: 'Office of the Provost',
      targetAudience: 'all',
      targetAudienceLabel: 'All Residents & Applicants',
      isPinned: true,
    },
    {
      _id: 'not-02',
      title: 'Standard Operating Procedure: Night Attendance and 10:00 PM Curfew Timing',
      date: 'September 08, 2026',
      category: 'Administration',
      refNo: 'IUBAT/HD/2026/019',
      summary: 'Floor teachers will conduct scheduled digital roll call at 10:00 PM daily. Unapproved absences or late entries will trigger automated SMS notifications to registered guardians.',
      content: 'Floor teachers will conduct scheduled digital roll call at 10:00 PM daily. Unapproved absences or late entries will trigger automated SMS notifications to registered guardians.\n\nStudents requiring late entry for verified university labs or clinical duties must submit a digital Out-Pass with Guardian Authorization 6 hours in advance.',
      authority: 'Hostel Disciplinary Committee',
      targetAudience: 'students',
      targetAudienceLabel: 'Students & House Tutors',
      isPinned: false,
    },
    {
      _id: 'not-03',
      title: 'Monthly Mess Billing and Dining Token Clearance for September 2026',
      date: 'September 02, 2026',
      category: 'Dining',
      refNo: 'IUBAT/MC/2026/008',
      summary: 'Students may recharge dining balances and claim daily meal tokens via the Student Portal by the 5th of every month. Unconsumed tokens rollover to semester meal ledger.',
      content: 'Students may recharge dining balances and claim daily meal tokens via the Student Portal by the 5th of every month. Unconsumed tokens rollover to semester meal ledger.\n\nUnder university policy, mess billing is transparently tracked via daily market bazaar vouchers verified by Dining Staff In-Charge.',
      authority: 'Hostel Mess Management Committee',
      targetAudience: 'students',
      targetAudienceLabel: 'Students Only',
      isPinned: false,
    },
    {
      _id: 'not-04',
      title: 'Scheduled Network Maintenance and High-Speed LAN Upgrade in Padma Hall',
      date: 'August 28, 2026',
      category: 'Maintenance',
      refNo: 'IUBAT/IT/2026/011',
      summary: 'IT infrastructure maintenance and Wi-Fi access point upgrades will take place on Saturday between 09:00 AM and 01:00 PM. High-speed gigabit fiber will be deployed across all rooms.',
      content: 'IT infrastructure maintenance and Wi-Fi access point upgrades will take place on Saturday between 09:00 AM and 01:00 PM. High-speed gigabit fiber will be deployed across all rooms.\n\nTechnicians will test room-level LAN ports under House Tutor supervision.',
      authority: 'Estate and IT Services',
      targetAudience: 'all',
      targetAudienceLabel: 'Padma Hall Residents',
      isPinned: false,
    },
    {
      _id: 'not-05',
      title: 'Code of Residential Conduct: Electrical Appliances & Safety Regulations',
      date: 'August 18, 2026',
      category: 'Discipline',
      refNo: 'IUBAT/DC/2026/005',
      summary: 'High-wattage heating coils, electric stoves, and unauthorized high-power appliances are strictly prohibited inside student rooms. Certified room heaters require written Provost clearance.',
      content: 'High-wattage heating coils, electric stoves, and unauthorized high-power appliances are strictly prohibited inside student rooms. Certified room heaters require written Provost clearance.\n\nSafety inspections will be conducted periodically by Floor Teachers to ensure compliance with university fire safety standards.',
      authority: 'Hostel Disciplinary Committee',
      targetAudience: 'students',
      targetAudienceLabel: 'All Hall Residents',
      isPinned: false,
    }
  ];

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const res = await api.getNotices();
      if (res?.data && res.data.length > 0) {
        setLiveNotices(res.data);
      } else {
        setLiveNotices(fallbackNotices);
      }
    } catch (err) {
      console.log('Error fetching live notices:', err.message);
      setLiveNotices(fallbackNotices);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const noticesToDisplay = liveNotices.length > 0 ? liveNotices : fallbackNotices;

  // Filter notices based on category & search query
  const filtered = useMemo(() => {
    return noticesToDisplay.filter((notice) => {
      const matchCat =
        selectedCategory === 'all' ||
        (notice.category || '').toLowerCase() === selectedCategory.toLowerCase();

      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (notice.title || '').toLowerCase().includes(q) ||
        (notice.summary || '').toLowerCase().includes(q) ||
        (notice.refNo || '').toLowerCase().includes(q) ||
        (notice.authority || '').toLowerCase().includes(q) ||
        (notice.category || '').toLowerCase().includes(q)
      );
    });
  }, [noticesToDisplay, selectedCategory, searchQuery]);

  // Notices for the grid
  const gridNotices = useMemo(() => {
    return filtered;
  }, [filtered]);

  const handleCopyRef = (refNo, e) => {
    e.stopPropagation();
    if (refNo) {
      navigator.clipboard.writeText(refNo);
      setCopiedRef(refNo);
      setTimeout(() => setCopiedRef(''), 2000);
    }
  };

  // Helper to extract structured Month and Day for academic calendar badges
  const parseNoticeDate = (dateStr) => {
    if (!dateStr) return { month: 'SEP', day: '12', year: '2026' };
    const parts = dateStr.replace(',', '').split(' ');
    if (parts.length >= 2) {
      const month = parts[0].slice(0, 3).toUpperCase();
      const day = parts[1].padStart(2, '0');
      const year = parts[2] || '2026';
      return { month, day, year };
    }
    return { month: 'SEP', day: '12', year: '2026' };
  };

  // Category visual metadata helper
  const getCategoryStyles = (category = '') => {
    const cat = category.toLowerCase();
    if (cat.includes('allocat')) {
      return {
        badge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        accentBorder: 'border-l-emerald-600',
        dot: 'bg-emerald-500',
        icon: '🎓',
        label: 'Seat Allocation',
      };
    }
    if (cat.includes('admin') || cat.includes('curfew')) {
      return {
        badge: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
        accentBorder: 'border-l-indigo-600',
        dot: 'bg-indigo-500',
        icon: '🏛️',
        label: 'Administration',
      };
    }
    if (cat.includes('din') || cat.includes('meal') || cat.includes('mess')) {
      return {
        badge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        accentBorder: 'border-l-amber-500',
        dot: 'bg-amber-500',
        icon: '🍛',
        label: 'Dining & Mess',
      };
    }
    if (cat.includes('maint') || cat.includes('lan') || cat.includes('net')) {
      return {
        badge: 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800',
        accentBorder: 'border-l-sky-500',
        dot: 'bg-sky-500',
        icon: '🛠️',
        label: 'Maintenance & IT',
      };
    }
    return {
      badge: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      accentBorder: 'border-l-rose-500',
      dot: 'bg-rose-500',
      icon: '⚖️',
      label: 'Discipline & Conduct',
    };
  };

  const categories = [
    { id: 'all', label: 'All Directives', icon: '📜' },
    { id: 'Allocation', label: 'Seat Allocation', icon: '🎓' },
    { id: 'Administration', label: 'Administration & SOP', icon: '🏛️' },
    { id: 'Dining', label: 'Dining & Mess', icon: '🍛' },
    { id: 'Maintenance', label: 'Maintenance & IT', icon: '🛠️' },
    { id: 'Discipline', label: 'Conduct & Safety', icon: '⚖️' },
  ];

  return (
    <section id="notices" className="py-16 md:py-24 bg-slate-50 dark:bg-[#060911] border-t border-slate-200/80 dark:border-slate-800/80 transition-colors relative overflow-hidden">
      
      {/* Decorative ambient background mesh */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. INSTITUTIONAL HEADER & AUDIT METRICS                                   */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide">
              <Building2 size={13} className="text-emerald-700 dark:text-emerald-400" />
              <span className="uppercase tracking-wider">Office of the Provost & Hostel Directorate</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Spring 2026 In Effect</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Hostel Notices & Official Announcements
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Official announcements, seat allocation updates, dining guidelines, and hostel rules for Padma Residential Hall residents.
            </p>
          </div>

          {/* Institutional Compliance Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="ios-glass-pill flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-slate-700 dark:text-slate-300">
              <FileText size={13} className="text-emerald-600" />
              <span className="font-bold text-slate-900 dark:text-white">{noticesToDisplay.length}</span>
              <span className="text-slate-500 text-[11px]">Active Notices</span>
            </div>
            <div className="ios-glass-pill flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-slate-700 dark:text-slate-300">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">Verified Guidelines</span>
            </div>
            <div className="ios-glass-pill flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-slate-700 dark:text-slate-300">
              <Award size={13} className="text-amber-500" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">Provost Approved</span>
            </div>
          </div>
        </div>



        {/* ========================================================================= */}
        {/* 3. SEARCH & CATEGORY FILTER CONTROL BAR                                   */}
        {/* ========================================================================= */}
        <div className="ios-glass flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-2.5 rounded-3xl">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const count = cat.id === 'all'
                ? noticesToDisplay.length
                : noticesToDisplay.filter(n => (n.category || '').toLowerCase() === cat.id.toLowerCase()).length;
              
              const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`ios-tap-active flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Real-time Search Input */}
          <div className="relative min-w-[240px] lg:min-w-[280px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notices, announcements, topics..."
              className="w-full pl-9 pr-8 py-2 rounded-2xl text-xs bg-white/70 dark:bg-black/30 border border-slate-200/60 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors backdrop-blur-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. PROFESSIONAL CIRCULARS GRID                                           */}
        {/* ========================================================================= */}
        {gridNotices.length === 0 ? (
          <div className="ios-glass-card p-12 rounded-3xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <FileText size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Matching Circulars Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No official gazettes match your current filter criteria. Reset the category or search keywords to view all directives.
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="ios-tap-active px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all cursor-pointer shadow-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            {gridNotices.map((notice) => {
              const dateInfo = parseNoticeDate(notice.date);
              const catStyles = getCategoryStyles(notice.category);
              const isCopied = copiedRef === notice.refNo;

              return (
                <div 
                  key={notice._id || notice.id || notice.refNo}
                  onClick={() => setSelectedNoticeForModal(notice)}
                  className={`ios-glass-card ios-tap-active rounded-3xl p-5 md:p-6 flex flex-col justify-between group cursor-pointer relative overflow-hidden border-l-4 ${catStyles.accentBorder}`}
                >
                  <div className="space-y-3.5">
                    
                    {/* Card Top: Academic Date Stamp + Metadata Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Elegant Date Block */}
                        <div className="flex flex-col items-center justify-center w-12 h-13 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-center shrink-0 group-hover:border-emerald-500/40 transition-colors">
                          <span className="text-[8.5px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                            {dateInfo.month}
                          </span>
                          <span className="text-base font-black text-slate-900 dark:text-white leading-none font-mono">
                            {dateInfo.day}
                          </span>
                        </div>

                        {/* Category & Audience Pills */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[10px] border ${catStyles.badge}`}>
                              <span>{catStyles.icon}</span>
                              <span>{notice.category || 'Gazette'}</span>
                            </span>

                            {notice.isPinned && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[9.5px] font-bold">
                                <Pin size={9} className="fill-amber-700 dark:fill-amber-400" />
                                <span>Priority</span>
                              </span>
                            )}
                          </div>

                          {notice.targetAudienceLabel && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              Audience: {notice.targetAudienceLabel}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Year Indicator */}
                      <span className="text-[10px] font-mono text-slate-400 font-semibold shrink-0">
                        {dateInfo.year}
                      </span>
                    </div>

                    {/* Notice Title */}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {notice.title}
                    </h3>

                    {/* Notice Content / Summary */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal line-clamp-3">
                      {notice.summary || notice.content}
                    </p>
                  </div>

                  {/* Card Bottom: Authority Signature Stamp & View Action */}
                  <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate max-w-[210px]">
                      <span className={`w-1.5 h-1.5 rounded-full ${catStyles.dot} shrink-0`} />
                      <span className="truncate font-medium">{notice.authority || 'Office of the Provost'}</span>
                    </div>

                    <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 font-bold text-xs">
                      <span>View Circular</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. MODAL: OFFICIAL CIRCULAR LETTERHEAD VIEW & A4 PRINT                    */}
        {/* ========================================================================= */}
        {selectedNoticeForModal && (
          <OfficialCircularModal
            notice={selectedNoticeForModal}
            onClose={() => setSelectedNoticeForModal(null)}
          />
        )}

      </div>
    </section>
  );
}
