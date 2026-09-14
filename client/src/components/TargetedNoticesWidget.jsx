import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  Eye, 
  Download, 
  Users, 
  Bell, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  ShieldCheck 
} from 'lucide-react';
import { api } from '../services/api';
import OfficialCircularModal from './OfficialCircularModal';

export default function TargetedNoticesWidget({
  role = 'student',
  floor = '',
  title = 'Official Provost Circulars & Directives',
  subtitle = 'Official administrative directives and circulars issued to you by the Hostel Super / Provost Office.',
}) {
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [copiedRef, setCopiedRef] = useState('');

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const res = await api.getNotices({ role, floor });
      if (res?.data) {
        setNotices(res.data);
      }
    } catch (err) {
      console.log('Error fetching targeted notices:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [role, floor]);

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

  const getCategoryStyles = (category = '') => {
    const cat = category.toLowerCase();
    if (cat.includes('allocat')) {
      return {
        badge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        accentBorder: 'border-l-emerald-600',
        dot: 'bg-emerald-500',
        icon: '🎓',
      };
    }
    if (cat.includes('admin') || cat.includes('curfew')) {
      return {
        badge: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
        accentBorder: 'border-l-indigo-600',
        dot: 'bg-indigo-500',
        icon: '🏛️',
      };
    }
    if (cat.includes('din') || cat.includes('meal') || cat.includes('mess')) {
      return {
        badge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        accentBorder: 'border-l-amber-500',
        dot: 'bg-amber-500',
        icon: '🍛',
      };
    }
    if (cat.includes('maint') || cat.includes('lan') || cat.includes('net')) {
      return {
        badge: 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800',
        accentBorder: 'border-l-sky-500',
        dot: 'bg-sky-500',
        icon: '🛠️',
      };
    }
    return {
      badge: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      accentBorder: 'border-l-rose-500',
      dot: 'bg-rose-500',
      icon: '⚖️',
    };
  };

  const handleCopyRef = (refNo, e) => {
    e.stopPropagation();
    if (refNo) {
      navigator.clipboard.writeText(refNo);
      setCopiedRef(refNo);
      setTimeout(() => setCopiedRef(''), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell size={18} className="text-emerald-600 dark:text-emerald-400" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto font-semibold">
          {notices.length} Directive{notices.length === 1 ? '' : 's'} Active
        </span>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400">
          Loading official circulars...
        </div>
      ) : notices.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
            <FileText size={18} />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">No New Circulars</h4>
          <p className="text-[11px] text-slate-500">You are all caught up with official hostel notices.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notices.map((n) => {
            const dateInfo = parseNoticeDate(n.date);
            const catStyles = getCategoryStyles(n.category);
            const isCopied = copiedRef === n.refNo;

            return (
              <div
                key={n._id || n.id || n.refNo}
                onClick={() => setSelectedNotice(n)}
                className={`p-5 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm text-xs flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all space-y-3 cursor-pointer border-l-4 ${catStyles.accentBorder}`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {/* Academic Date Stamp Tile */}
                      <div className="flex flex-col items-center justify-center w-11 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 text-center shrink-0">
                        <span className="text-[8px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                          {dateInfo.month}
                        </span>
                        <span className="text-sm font-black text-slate-900 dark:text-white leading-none font-mono">
                          {dateInfo.day}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[9.5px] border ${catStyles.badge}`}>
                            <span>{catStyles.icon}</span>
                            <span>{n.category || 'Gazette'}</span>
                          </span>
                          {n.isPinned && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 uppercase">
                              Priority
                            </span>
                          )}
                          {n.targetAudienceLabel && (
                            <span className="text-[9px] text-slate-500 font-medium">
                              • {n.targetAudienceLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 font-semibold">
                      {dateInfo.year}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                      {n.title}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1.5 leading-relaxed line-clamp-3">
                      {n.content || n.summary}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium truncate max-w-[180px]">
                    {n.authority || 'Office of the Provost'}
                  </span>
                  <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold hover:text-emerald-800 transition-colors">
                    <span>View Circular</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedNotice && (
        <OfficialCircularModal
          notice={selectedNotice}
          onClose={() => setSelectedNotice(null)}
        />
      )}
    </div>
  );
}
