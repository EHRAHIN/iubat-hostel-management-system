import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  UserCheck, 
  Wrench, 
  Users, 
  Crown, 
  ArrowRight, 
  Check, 
  Sparkles,
  Layers
} from 'lucide-react';

export default function ActorPortalsSection({ onSelectRole }) {
  const actors = [
    {
      role: 'student',
      title: 'Student Resident Portal',
      subtitle: 'Primary Resident User Workspace',
      icon: GraduationCap,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      glow: 'hover:border-emerald-500/50',
      badge: 'Resident Self-Service',
      features: [
        'Apply for room with 7-question lifestyle survey',
        'Smart Searching Roommate pairing & vector match',
        'Digital leave pass & emergency out-pass submission',
        'Report electrical & plumbing repair tickets',
        'Daily meal token booking & dining status',
      ],
    },
    {
      role: 'teacher',
      title: 'Floor Teacher / House Tutor',
      subtitle: 'Physical Floor Inspection & Welfare',
      icon: UserCheck,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20',
      glow: 'hover:border-teal-500/50',
      badge: 'Floor Guardian',
      features: [
        'Conduct scheduled 10:00 PM digital night roll-call',
        'Verify room maintenance tickets on-site',
        'Review & recommend student out-pass applications',
        'Log room cleanliness & curfew violation incidents',
        'Direct communication with students & Provost',
      ],
    },
    {
      role: 'super',
      title: 'Hostel Super / Provost Console',
      subtitle: 'Chief Residential Authority & Governance',
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      glow: 'hover:border-emerald-500/50',
      badge: 'Provost Authority',
      features: [
        'Review Smart Searching Roommate pairs & approve seats',
        'Final digital endorsement for student out-passes',
        'Assign repair tickets to hall maintenance staff',
        'Broadcast administrative notices to student feeds',
        'Supervise 4 floor teachers and 4 hall staff',
      ],
    },
    {
      role: 'staff',
      title: 'Hall Staff (Maintenance & Dining)',
      subtitle: 'Facilities & Daily Mess Operations',
      icon: Wrench,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      glow: 'hover:border-amber-500/50',
      badge: 'Operations Desk',
      features: [
        'Receive Provost-delegated repair work orders',
        'Execute electrical, plumbing & furniture repairs',
        'Confirm work completion with on-site verification',
        'Validate daily student meal tokens at dining counters',
        'Campus Residence: Padma Hall Operations Staff',
      ],
    },
    {
      role: 'parent',
      title: 'Parent & Guardian Portal',
      subtitle: 'Real-Time Transparency & Ward Safety',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      glow: 'hover:border-blue-500/50',
      badge: 'Guardian Access',
      features: [
        'Track student ward residence status and room slot',
        'Verify house tutor name and direct contact phone',
        'One-click digital consent for student out-passes',
        'Real-time night roll-call attendance logs',
        'Automated SMS notifications for curfew alerts',
      ],
    },
    {
      role: 'admin',
      title: 'Super Administrator Console',
      subtitle: 'System Architecture & Enterprise IT',
      icon: Crown,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      glow: 'hover:border-indigo-500/50',
      badge: 'Root Access',
      features: [
        'Manage 2 halls, 4 floors, 32 rooms, 160 beds',
        'Role-Based Access Control (RBAC) credential management',
        'System audit logs, health telemetry & MongoDB metrics',
        'Academic semester session resets & database backup',
        'Override and force-clearance administrative actions',
      ],
    },
  ];

  return (
    <section id="portals" className="py-16 md:py-24 bg-slate-50/50 dark:bg-[#060911]/50 border-t border-slate-200/80 dark:border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3">
            <Layers size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>Role-Based Access Control (RBAC) Architecture</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            6 Institutional <span className="saas-gradient-text">Portal Gateways</span>
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">
            Engineered with strict institutional separation of duties. Every university stakeholder possesses a dedicated, real-time authenticated console.
          </p>
        </div>

        {/* 6 Actor Cards Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actors.map((actor) => {
            const Icon = actor.icon;
            return (
              <div
                key={actor.role}
                className="saas-card rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${actor.bg} ${actor.color} border ${actor.border} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {actor.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {actor.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 font-medium">
                    {actor.subtitle}
                  </p>

                  {/* Feature Checklist */}
                  <ul className="space-y-2 mb-6 text-xs text-slate-600 dark:text-slate-300">
                    {actor.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check size={14} className={`${actor.color} shrink-0 mt-0.5`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Footer Action */}
                <button
                  onClick={() => onSelectRole(actor.role)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-600 text-xs font-bold transition-all shadow-xs"
                >
                  <span>Launch {actor.title.split('(')[0]}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
