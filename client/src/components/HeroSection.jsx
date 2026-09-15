import React, { useState, useEffect } from 'react';
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
import { api } from '../services/api';

export default function HeroSection({ rooms: initialRooms = [], onOpenApplyModal, onScrollToVacancy }) {
  // Interactive SaaS Terminal Preview Tab
  const [activeHeroTab, setActiveHeroTab] = useState('radar'); // 'radar' | 'ai' | 'workflow'
  const [liveRooms, setLiveRooms] = useState(initialRooms || []);

  useEffect(() => {
    if (initialRooms && initialRooms.length > 0) {
      setLiveRooms(initialRooms);
    } else {
      api.getRooms()
        .then((res) => {
          if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
            setLiveRooms(res.data);
          }
        })
        .catch((err) => console.log('Error loading rooms in HeroSection:', err.message));
    }
  }, [initialRooms]);

  const roomsList = liveRooms && liveRooms.length > 0 ? liveRooms : (initialRooms || []);

  // Dynamic Live Vacancy Calculations from Database
  const padmaRooms = roomsList && roomsList.length > 0
    ? roomsList.filter((r) => (r.hallName || r.hallId || '').toLowerCase().includes('padma'))
    : [];

  const padmaCapacity = padmaRooms.length > 0
    ? padmaRooms.reduce((sum, r) => sum + (r.capacity || (r.beds ? r.beds.length : 0)), 0)
    : 34;

  const padmaOccupied = padmaRooms.length > 0
    ? padmaRooms.reduce((sum, r) => sum + (r.beds ? r.beds.filter((b) => b.isOccupied).length : (r.occupiedCount || 0)), 0)
    : 4;

  const padmaVacant = Math.max(0, padmaCapacity - padmaOccupied);
  const padmaOccupancyPct = padmaCapacity > 0 ? ((padmaOccupied / padmaCapacity) * 100).toFixed(1) : '11.8';
  const padmaRoomsCount = padmaRooms.length > 0 ? padmaRooms.length : 16;

  // Real occupant for live Smart Searching Roommate showcase
  const occupiedRoomWithStudent = roomsList.find(r => r.beds && r.beds.some(b => b.isOccupied && b.studentName));
  const activeStudentOccupant = occupiedRoomWithStudent?.beds?.find(b => b.isOccupied && b.studentName);

  const matchedStudentName = activeStudentOccupant?.studentName || 'Sadiya Afrin';
  const matchedStudentDept = activeStudentOccupant?.studentDept || 'BBA';
  const matchedRoomNo = occupiedRoomWithStudent?.roomNumber || '105';
  const matchedBed = activeStudentOccupant?.bedLabel || 'Bed A';
  const matchedTutor = occupiedRoomWithStudent?.assignedHouseTutor || 'Prof. Anisur Rahman';

  return (
    <section className="relative overflow-hidden py-14 md:py-24 saas-dot-grid saas-mesh-gradient border-b border-slate-200/80 dark:border-slate-800/80 transition-all">
      {/* Decorative ambient glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent blur-[140px] pointer-events-none rounded-full animate-pulse-glow" />

      {/* Ambient decorative glow orbs */}
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: SaaS Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Announcement Pill */}
            <div className="ios-glass-pill ios-tap-active inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-emerald-800 dark:text-emerald-300 text-xs font-semibold cursor-pointer">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Student Residential Portal • Spring 2026</span>
              <ChevronRight size={13} className="text-emerald-500" />
            </div>

            {/* Main Software Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              Hostel <span className="saas-gradient-text">Seat Allocation Management System</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              A centralized digital platform for students and hostel administration. Easily check room vacancies, apply for available seats, request out-passes, find compatible roommates, and manage mess billing.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => onOpenApplyModal()}
                className="ios-tap-active flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs md:text-sm shadow-lg shadow-emerald-700/25 border border-white/20 transition-all cursor-pointer"
              >
                <span>Apply for Available Seat</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={onScrollToVacancy}
                className="ios-glass-pill ios-tap-active flex items-center gap-2 px-5 py-3.5 rounded-full text-slate-800 dark:text-slate-200 font-semibold text-xs md:text-sm cursor-pointer"
              >
                <Bed size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>View Room Vacancies</span>
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
                <span>Real-time Bed Vacancy</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Roommate Matching</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Quick Maintenance Support</span>
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
                  <span className="ml-2 text-[10px] font-mono text-slate-400">hostel-allocation-system/live</span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>99.98% Synced</span>
                </div>
              </div>

              {/* Segmented Control Switcher */}
              <div className="ios-glass-pill grid grid-cols-3 gap-1.5 p-1 rounded-2xl mb-4 text-[11px] font-semibold">
                <button
                  onClick={() => setActiveHeroTab('radar')}
                  className={`ios-tap-active py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeHeroTab === 'radar'
                      ? 'bg-white/90 dark:bg-emerald-600 text-emerald-800 dark:text-white font-bold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 size={12} />
                  <span>Room Vacancy</span>
                </button>

                <button
                  onClick={() => setActiveHeroTab('ai')}
                  className={`ios-tap-active py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeHeroTab === 'ai'
                      ? 'bg-white/90 dark:bg-emerald-600 text-emerald-800 dark:text-white font-bold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles size={12} />
                  <span>Roommate Match</span>
                </button>

                <button
                  onClick={() => setActiveHeroTab('workflow')}
                  className={`ios-tap-active py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeHeroTab === 'workflow'
                      ? 'bg-white/90 dark:bg-emerald-600 text-emerald-800 dark:text-white font-bold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Layers size={12} />
                  <span>Approval Flow</span>
                </button>
              </div>

              {/* TAB 1: LIVE SEAT RADAR VIEW */}
              {activeHeroTab === 'radar' && (
                <div className="space-y-3 animate-fade-in text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#060911]/80 border border-slate-200/60 dark:border-slate-800/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">Padma Residential Hall (Campus Male Residence)</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                        {padmaVacant} Vacant Beds
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${padmaOccupancyPct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Floor 1 & 2 • {padmaRoomsCount} Rooms</span>
                      <span>{padmaOccupancyPct}% Occupancy ({padmaOccupied}/{padmaCapacity} Beds)</span>
                    </div>
                  </div>

                  <div className="pt-1 text-[11px]">
                    <button
                      onClick={() => onOpenApplyModal('Padma Residential Hall')}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors text-center shadow-sm"
                    >
                      Book Padma Hall Seat ({padmaVacant} Available) →
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: ROOMMATE MATCH PREVIEW */}
              {activeHeroTab === 'ai' && (
                <div className="space-y-3 animate-fade-in text-xs">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
                        <span>Roommate Compatibility Match:</span>
                      </span>
                      <span className="font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full text-[11px]">
                        96% Match
                      </span>
                    </div>

                    <div className="text-slate-700 dark:text-slate-300 text-[11px] space-y-1">
                      <div>Paired Roommate: <strong className="text-slate-900 dark:text-white">{matchedStudentName} ({matchedStudentDept})</strong></div>
                      <div>Room Allocation: <strong className="text-emerald-700 dark:text-emerald-300">Padma Hall • Room {matchedRoomNo} ({matchedBed})</strong></div>
                      <div>House Tutor: <strong className="text-slate-900 dark:text-white">{matchedTutor}</strong></div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 grid grid-cols-2 gap-1 text-[10px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Check size={12} className="text-emerald-600" />
                        <span>Night Study Hours</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check size={12} className="text-emerald-600" />
                        <span>Quiet Study Habit</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check size={12} className="text-emerald-600" />
                        <span>Clean Living Habit</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check size={12} className="text-emerald-600" />
                        <span>Regular Schedule</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 text-center">
                    Simple lifestyle and study habit preferences help pair compatible roommates.
                  </div>
                </div>
              )}

              {/* TAB 3: 4-TIER GOVERNANCE WORKFLOW */}
              {activeHeroTab === 'workflow' && (
                <div className="space-y-3 animate-fade-in text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-[#060911]/80 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                    <span className="font-bold text-slate-900 dark:text-white block text-xs">
                      Simple 4-Step Maintenance & Repair Process
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
                </div>
              )}

              {/* Live Status Bar */}
              <div className="mt-4 pt-3.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Terminal size={13} className="text-slate-400" />
                  <span>Hostel Seat Allocation Management System</span>
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
