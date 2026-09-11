import React from 'react';
import { Bed, Users, Building, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

export default function StatsBar() {
  const stats = [
    {
      label: 'Campus Residence',
      value: '1 Hall',
      subtext: 'Padma Residential Hall (Male)',
      badge: '2 Floors Each',
      icon: Building,
      badgeColor: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    },
    {
      label: 'Total Verified Capacity',
      value: '160 Beds',
      subtext: 'Floor 1 (101–108) & Floor 2 (201–208)',
      badge: '32 Rooms Total',
      icon: Bed,
      badgeColor: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    },
    {
      label: 'Active Residents',
      value: '132 Seats',
      subtext: '82.5% live confirmed hostel occupancy',
      badge: '96.4% Match Rate',
      icon: Users,
      badgeColor: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    },
    {
      label: 'Live Available Vacancies',
      value: '28 Beds',
      subtext: 'Open for instant online allocation',
      badge: 'Live Radar Active',
      icon: CheckCircle2,
      badgeColor: 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx}
              className="saas-card rounded-2xl p-5 hover:scale-[1.02] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon size={16} />
                  </div>
                </div>

                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {stat.subtext}
                </p>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${stat.badgeColor}`}>
                  {stat.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
