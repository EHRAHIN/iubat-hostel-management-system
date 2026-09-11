import React from 'react';
import { FileText, Cpu, CheckCircle2, KeyRound, ArrowRight } from 'lucide-react';

export default function ProcessFlowSection() {
  const steps = [
    {
      step: '01',
      title: 'Submit Application & Survey',
      desc: 'Students submit academic credentials (CGPA, Department, Year) and answer the 5-minute Smart Searching Roommate questionnaire.',
      icon: FileText,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      step: '02',
      title: 'AI Multi-Factor Matching',
      desc: 'Smart Searching Roommate vector engine compares applicant habits (sleep cycle, study noise, cleanliness) to recommend optimal roommate pairs.',
      icon: Cpu,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      step: '03',
      title: 'Provost / Super Approval',
      desc: 'Hostel Super reviews AI suggestions, verifies merit and quota rules, and officially locks the seat allocation on the dashboard.',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      step: '04',
      title: 'Digital Onboarding & Keys',
      desc: 'Staff hands over physical keys, logs inventory check, floor teacher conducts attendance check-in, and mess dining tokens are activated.',
      icon: KeyRound,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
  ];

  return (
    <section id="process" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-3">
            <span>Seamless 4-Step Pipeline</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-['Outfit'] mb-3">
            How The Allocation <span className="gradient-text">Lifecycle Works</span>
          </h2>
          <p className="text-sm md:text-base text-slate-300">
            From initial seat application to room check-in, the entire workflow is automated, transparent, and verified at every step.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="relative rounded-3xl bg-slate-900/70 border border-white/10 p-6 backdrop-blur-xl flex flex-col justify-between hover:border-white/20 transition-all group"
              >
                <div>
                  {/* Step Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-black text-slate-400 font-mono">
                      STEP {item.step}
                    </span>
                    <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} border ${item.border} flex items-center justify-center`}>
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 font-['Outfit'] group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center text-[11px] font-semibold text-slate-500 group-hover:text-indigo-400 transition-colors">
                  <span>Automated Workflow</span>
                  <ArrowRight size={12} className="ml-1" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
