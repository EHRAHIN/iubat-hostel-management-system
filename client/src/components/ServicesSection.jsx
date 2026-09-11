import React from 'react';
import { 
  Building2, 
  FileCheck, 
  CalendarCheck, 
  Wrench, 
  CreditCard, 
  ShieldAlert,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function ServicesSection() {
  const services = [
    {
      title: 'Smart Searching Roommate',
      description: 'Multi-vector lifestyle matching evaluating sleep schedules, study intensity, cleanliness, religious routines, and department preferences.',
      icon: Sparkles,
      tag: 'AI Algorithm',
    },
    {
      title: '4-Tier Maintenance Chain',
      description: 'Zero-drop ticket custody from student submission to House Tutor physical inspection, Provost delegation, and staff work order resolution.',
      icon: Wrench,
      tag: 'Governance',
    },
    {
      title: 'Digital Leave & Out-Pass',
      description: 'Online workflow for weekend leave and emergency night passes with automated guardian consent, QR gate passes, and SMS verification.',
      icon: FileCheck,
      tag: 'Security',
    },
    {
      title: 'Night Roll-Call Roster',
      description: 'House tutors conduct scheduled 10:00 PM digital attendance, ensuring resident safety with automated absent alerts to guardians.',
      icon: CalendarCheck,
      tag: 'Daily Curfew',
    },
    {
      title: 'Mess & Dining Accounting',
      description: 'Integrated daily meal token booking (Breakfast, Lunch, Dinner), staff queue approvals, and automated billing ledgers.',
      icon: CreditCard,
      tag: 'Dining OS',
    },
    {
      title: 'Provost Oversight Console',
      description: 'Executive dashboards with institutional occupancy analytics, disciplinary notice issuance, and staff shift supervision.',
      icon: ShieldAlert,
      tag: 'Administration',
    },
  ];

  return (
    <section id="services" className="py-16 md:py-24 bg-white dark:bg-[#060911] border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-2">
            Engineered for Higher Education Housing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Institutional Management <span className="saas-gradient-text">Superpowers</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Structured administrative modules supporting all stakeholders across IUBAT residential operations with real-time accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <div 
                key={i}
                className="saas-card rounded-3xl p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {svc.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {svc.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Explore Workflow</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
