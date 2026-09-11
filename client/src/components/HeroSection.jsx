import React, { useState } from 'react';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Bed, 
  Users, 
  ShieldCheck,
  Sparkles,
  Wifi,
  Zap,
  Layers,
  ChevronRight,
  Activity,
  Terminal,
  Clock,
  Wrench,
  Check
} from 'lucide-react';

export default function HeroSection({ onOpenApplyModal, onScrollToVacancy }) {
  // Interactive SaaS Terminal Preview Tab
  const [activeHeroTab, setActiveHeroTab] = useState('radar'); // 'radar' | 'ai' | 'workflow'

  return (
    <section className="relative overflow-hidden py-14 md:py-24 saas-dot-grid saas-mesh-gradient border-b border-slate-200/80 dark:border-slate-800/80 transition-all">
      {/* Decorative ambient glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent blur-[140px] pointer-events-none rounded-full animate-pulse-glow" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: SaaS Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs hover:border-emerald-500/40 transition-all cursor-pointer">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Smart Searching Roommate 2.0 • 4-Tier Automated Housing Workflow</span>
              <ChevronRight size={13} className="text-emerald-500" />
            </div>

            {/* Main Software Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              IUBAT Hostel <span className="saas-gradient-text">Seat Management System</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              A centralized digital platform engineered for IUBAT residential operations. Streamlining merit-based seat allocations, real-time vacancy monitoring, digital out-passes, Smart Searching Roommate pairing, and multi-tier governance.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => onOpenApplyModal()}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs md:text-sm shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/30 hover:scale-[1.02] transition-all"
              >
                <span>Apply for Available Seat</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={onScrollToVacancy}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl saas-card hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs md:text-sm transition-all hover:scale-[1.02]"
              >
                <Bed size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>Explore Live Seat Radar</span>
              </button>
            </div>

            {/* Institutional Compliance Checklist */}
            <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>2 Halls • 2 Floors Each</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Live Vacant Bed Radar</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Smart Searching Roommate</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>4-Tier Maintenance Chain</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive SaaS Command Center */}
          <div className="lg:col-span-5">
            <div className="saas-card rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden transition-all border-emerald-500/20">
              
              {/* Terminal Window Chrome Bar */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200/60 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                  <span className="ml-2 text-[10px] font-mono text-slate-400">iubat-hostel-system/live</span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>99.98% Synced</span>
                </div>
              </div>

              {/* Segmented Control Switcher */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-4 text-[11px] font-semibold">
                <button
                  onClick={() => setActiveHeroTab('radar')}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    activeHeroTab === 'radar'
                      ? 'bg-white dark:bg-[#0d121f] text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 size={12} />
                  <span>Seat Radar</span>
                </button>

                <button
                  onClick={() => setActiveHeroTab('ai')}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    activeHeroTab === 'ai'
                      ? 'bg-white dark:bg-[#0d121f] text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles size={12} />
                  <span>Smart Match</span>
                </button>

                <button
                  onClick={() => setActiveHeroTab('workflow')}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    activeHeroTab === 'workflow'
                      ? 'bg-white dark:bg-[#0d121f] text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Layers size={12} />
                  <span>4-Tier Flow</span>
                </button>
              </div>

              {/* TAB 1: LIVE SEAT RADAR VIEW */}
              {activeHeroTab === 'radar' && (
                <div className="space-y-3 animate-fade-in text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#060911]/80 border border-slate-200/60 dark:border-slate-800/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">Padma Residential Hall (Campus Male Residence)</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">28 Vacant Beds</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all" style={{ width: '82.5%' }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Floor 1 & 2 • Rooms 101–208</span>
                      <span>82.5% Occupancy</span>
                    </div>
                  </div>

                  <div className="pt-1 text-[11px]">
                    <button
                      onClick={() => onOpenApplyModal('Padma Residential Hall')}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors text-center shadow-sm"
                    >
                      Book Padma Hall Seat →
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: SMART SEARCHING ROOMMATE MATCH PREVIEW */}
              {activeHeroTab === 'ai' && (
                <div className="space-y-3 animate-fade-in text-xs">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
                        <span>Live AI Compatibility Match:</span>
                      </span>
                      <span className="font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full text-[11px]">
                        96.4% Match
                      </span>
                    </div>

                    <div className="text-slate-700 dark:text-slate-300 text-[11px] space-y-1">
                      <div>Paired Roommate: <strong>Real Registered Student Occupant</strong></div>
                      <div>Proposed Slot: <strong>Padma Hall, Floor 1 • Room 101 (Bed A)</strong></div>
                      <div>House Tutor: <strong>Dr. Tariqul Islam</strong></div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 grid grid-cols-2 gap-1 text-[10px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Check size={12} className="text-emerald-600" />
                        <span>Night Owl Synergized</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check size={12} className="text-emerald-600" />
                        <span>Silent Study Aligned</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check size={12} className="text-emerald-600" />
                        <span>Strict Cleanliness</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check size={12} className="text-emerald-600" />
                        <span>Prayer Routine Matched</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 text-center">
                    Instant 7-question lifestyle questionnaire runs after student registration.
                  </div>
                </div>
              )}

              {/* TAB 3: 4-TIER GOVERNANCE WORKFLOW */}
              {activeHeroTab === 'workflow' && (
                <div className="space-y-3 animate-fade-in text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-[#060911]/80 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                    <span className="font-bold text-slate-900 dark:text-white block text-xs">
                      End-to-End Governance Chain of Custody
                    </span>

                    <div className="space-y-2 text-[11px]">
                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 font-medium">
                        <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                        <span>Student: Submits maintenance ticket</span>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 font-medium">
                        <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                        <span>Floor Teacher: Inspects room & verifies</span>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 font-medium">
                        <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                        <span>Hostel Super (Provost): Delegates to staff</span>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 font-medium">
                        <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                        <span>Staff: Executes repair & confirms complete</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                      ✓ Real-time MongoDB synchronization across all 4 stakeholders
                    </span>
                  </div>
                </div>
              )}

              {/* Live Status Bar */}
              <div className="mt-4 pt-3.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Terminal size={13} className="text-slate-400" />
                  <span>IUBAT Hostel Seat Management System</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                  <span>Spring 2026 Live Session</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
