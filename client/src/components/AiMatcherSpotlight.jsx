import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Zap, 
  Brain, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  BedDouble, 
  HelpCircle,
  ThumbsUp
} from 'lucide-react';

export default function AiMatcherSpotlight() {
  // Student 1 Profile State
  const [s1, setS1] = useState({
    name: 'Tanvir Hasan',
    dept: 'CSE',
    sleep: 'night-owl',
    study: 'silent',
    cleanliness: 9,
    social: 'introvert',
  });

  // Student 2 Profile State
  const [s2, setS2] = useState({
    name: 'Candidate Roommate',
    dept: 'EEE',
    sleep: 'night-owl',
    study: 'silent',
    cleanliness: 8,
    social: 'introvert',
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState({
    score: 94.8,
    tier: 'Optimal Match',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/10',
    reasoning: 'Exceptional lifestyle alignment: Matching night-owl schedules (1:00 AM - 8:30 AM), synchronized high study silence preference, and identical cleanliness habits. Very low conflict probability.',
    recommendedRoom: 'Padma Hall • Room 304 (Double Deluxe)',
  });

  const calculateCompatibility = () => {
    setIsCalculating(true);
    setTimeout(() => {
      let score = 70;

      // Sleep alignment
      if (s1.sleep === s2.sleep) score += 15;
      else score -= 20;

      // Study alignment
      if (s1.study === s2.study) score += 10;
      else score -= 12;

      // Cleanliness diff
      const cleanDiff = Math.abs(s1.cleanliness - s2.cleanliness);
      if (cleanDiff <= 1) score += 10;
      else if (cleanDiff <= 3) score += 4;
      else score -= 15;

      // Social alignment
      if (s1.social === s2.social) score += 5;

      // Bound between 35 and 99
      score = Math.min(Math.max(score, 38), 98.6);

      let tier = 'Optimal Match';
      let color = 'text-emerald-400';
      let borderColor = 'border-emerald-500/30';
      let bgColor = 'bg-emerald-500/10';
      let reasoning = '';

      if (score >= 85) {
        tier = 'Optimal Roommate Match';
        color = 'text-emerald-400';
        borderColor = 'border-emerald-500/30';
        bgColor = 'bg-emerald-500/10';
        reasoning = `High harmony score. Both students share compatible sleep schedules (${s1.sleep.replace('-', ' ')}), identical study noise requirements, and close cleanliness expectations. Minimal friction predicted.`;
      } else if (score >= 65) {
        tier = 'Moderate Compatibility';
        color = 'text-amber-400';
        borderColor = 'border-amber-500/30';
        bgColor = 'bg-amber-500/10';
        reasoning = `Good baseline compatibility, though slight differences in routine or cleanliness tolerances exist. Recommended with floor tutor orientation.`;
      } else {
        tier = 'Potential Conflict Risk';
        color = 'text-red-400';
        borderColor = 'border-red-500/30';
        bgColor = 'bg-red-500/10';
        reasoning = `Major lifestyle discrepancy: Divergent sleep cycles (${s1.sleep} vs ${s2.sleep}) and contrasting study habits. High likelihood of sleep disruption and academic interference. Pairing not recommended.`;
      }

      setResult({
        score: parseFloat(score.toFixed(1)),
        tier,
        color,
        borderColor,
        bgColor,
        reasoning,
        recommendedRoom: score >= 65 ? 'Padma Hall • Room 304 (Double Shared)' : 'Alternative Pairing Advised',
      });
      setIsCalculating(false);
    }, 600);
  };

  return (
    <section id="ai-matcher" className="py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
            <Sparkles size={14} className="text-pink-400" />
            <span>Roommate Compatibility</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-['Outfit'] mb-3">
            Roommate Compatibility <span className="gradient-text">Finder</span>
          </h2>
          <p className="text-sm md:text-base text-slate-300">
            Say goodbye to random room assignments and roommate conflicts. Students are matched based on lifestyle, study habits, and sleep schedules for a comfortable hostel experience.
          </p>
        </div>

        {/* Live Simulator Card */}
        <div className="rounded-3xl bg-slate-900/90 border border-white/15 p-6 md:p-8 backdrop-blur-2xl shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Brain size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Roommate Compatibility Calculator</h3>
                <p className="text-xs text-slate-400">Compare preferences between two students to check how well they can live together</p>
              </div>
            </div>

            <button
              onClick={calculateCompatibility}
              disabled={isCalculating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={isCalculating ? 'spin' : ''} />
              <span>{isCalculating ? 'Checking Match...' : 'Check Compatibility'}</span>
            </button>
          </div>

          {/* Form Columns: Student 1 vs Candidate */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Applicant 1 */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Applicant A (You)</div>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded">Dept: CSE</span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Sleep Schedule</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setS1({ ...s1, sleep: 'night-owl' })}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                      s1.sleep === 'night-owl' 
                        ? 'bg-indigo-600/30 border-indigo-500 text-white' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🌙 Night Owl (Late)
                  </button>
                  <button
                    type="button"
                    onClick={() => setS1({ ...s1, sleep: 'early-bird' })}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                      s1.sleep === 'early-bird' 
                        ? 'bg-indigo-600/30 border-indigo-500 text-white' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ☀️ Early Bird (6 AM)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Study Environment</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setS1({ ...s1, study: 'silent' })}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                      s1.study === 'silent' 
                        ? 'bg-indigo-600/30 border-indigo-500 text-white' 
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    🤫 Absolute Quiet
                  </button>
                  <button
                    type="button"
                    onClick={() => setS1({ ...s1, study: 'group' })}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                      s1.study === 'group' 
                        ? 'bg-indigo-600/30 border-indigo-500 text-white' 
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    👥 Group / Casual
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>Cleanliness & Organization</span>
                  <span className="text-indigo-400 font-bold">{s1.cleanliness}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={s1.cleanliness}
                  onChange={(e) => setS1({ ...s1, cleanliness: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Applicant 2 (Candidate) */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Candidate Roommate B</div>
                <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded">Dept: EEE</span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Sleep Schedule</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setS2({ ...s2, sleep: 'night-owl' })}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                      s2.sleep === 'night-owl' 
                        ? 'bg-purple-600/30 border-purple-500 text-white' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🌙 Night Owl (Late)
                  </button>
                  <button
                    type="button"
                    onClick={() => setS2({ ...s2, sleep: 'early-bird' })}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                      s2.sleep === 'early-bird' 
                        ? 'bg-purple-600/30 border-purple-500 text-white' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ☀️ Early Bird (6 AM)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Study Environment</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setS2({ ...s2, study: 'silent' })}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                      s2.study === 'silent' 
                        ? 'bg-purple-600/30 border-purple-500 text-white' 
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    🤫 Absolute Quiet
                  </button>
                  <button
                    type="button"
                    onClick={() => setS2({ ...s2, study: 'group' })}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                      s2.study === 'group' 
                        ? 'bg-purple-600/30 border-purple-500 text-white' 
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    👥 Group / Casual
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>Cleanliness & Organization</span>
                  <span className="text-purple-400 font-bold">{s2.cleanliness}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={s2.cleanliness}
                  onChange={(e) => setS2({ ...s2, cleanliness: parseInt(e.target.value) })}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Real-time Roommate Compatibility Result Card */}
            <div className={`lg:col-span-4 p-5 rounded-2xl ${result.bgColor} border ${result.borderColor} space-y-4 transition-all duration-300`}>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-200">
                  <Cpu size={14} className="text-purple-400" />
                  <span>Compatibility Result</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${result.color} ${result.borderColor}`}>
                  {result.tier}
                </span>
              </div>

              {/* Big Score Meter */}
              <div className="text-center py-2">
                <div className={`text-4xl font-black ${result.color} font-['Outfit'] tracking-tight`}>
                  {result.score}%
                </div>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                  Match Score
                </div>
              </div>

              {/* Reasoning */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/10 text-xs">
                <div className="flex items-center gap-1 text-slate-300 font-bold text-[11px] mb-1">
                  <Sparkles size={12} className="text-purple-400" />
                  <span>Why They Match:</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {result.reasoning}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1">
                  <BedDouble size={13} className="text-indigo-400" />
                  <span>{result.recommendedRoom}</span>
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
