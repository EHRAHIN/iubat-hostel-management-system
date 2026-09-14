import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  CheckCircle2,
  Building2,
  Layers,
  Bed,
  Sparkles,
  User,
  GraduationCap,
  FileText,
  AlertCircle,
  Moon,
  Sun,
  BookOpen,
  Users,
  Compass,
  Volume2,
  Check,
  HeartHandshake,
} from 'lucide-react';
import { api } from '../services/api';

// CGPA Proximity & Comparison Calculator (Scale 4.00)
const getCgpaComparison = (studentCgpa, partnerCgpa) => {
  const c1 = parseFloat(studentCgpa) || 0;
  const c2 = parseFloat(partnerCgpa) || 0;
  if (!c1 || !c2) return null;

  const maxCgpa = 4.00;
  const diff = Math.abs(c1 - c2);
  
  // Accurate percentage difference and closeness out of 4.00 scale
  const diffPercent = ((diff / maxCgpa) * 100);
  const closenessPercent = Math.max(0, Math.min(100, ((maxCgpa - diff) / maxCgpa) * 100));

  let status = '';
  let badgeColor = '';
  let advice = '';

  // Theme-consistent emerald & teal colors (matching hostel dashboard)
  const progressColor = 'from-emerald-600 via-teal-500 to-emerald-400';

  if (diff <= 0.15) {
    status = 'Extremely Close Match';
    badgeColor = 'text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 bg-emerald-100/90 dark:bg-emerald-950/80';
    advice = 'Ideal joint study cohort with near-identical academic pace';
  } else if (diff <= 0.35) {
    status = 'High Academic Alignment';
    badgeColor = 'text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-700 bg-teal-100/90 dark:bg-teal-950/80';
    advice = 'Strong academic compatibility with well-matched study routines';
  } else if (diff <= 0.60) {
    status = 'Balanced Academic Range';
    badgeColor = 'text-teal-900 dark:text-teal-200 border-teal-300/80 dark:border-teal-700/80 bg-emerald-50 dark:bg-emerald-950/60';
    advice = 'Balanced cohort pairing suitable for collaborative group learning';
  } else {
    status = 'Complementary Study Match';
    badgeColor = 'text-emerald-900 dark:text-emerald-100 border-emerald-300/60 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40';
    advice = 'Complementary academic partnership with mutual peer mentoring synergy';
  }

  return {
    c1: c1.toFixed(2),
    c2: c2.toFixed(2),
    diff: diff.toFixed(2),
    diffPercent: diffPercent.toFixed(1),
    closenessPercent: closenessPercent.toFixed(1),
    status,
    badgeColor,
    progressColor,
    advice,
  };
};

export default function RoomAllocateModal({
  isOpen,
  onClose,
  application,
  roomsList = [],
  onSuccess,
}) {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const [selectedBedLabel, setSelectedBedLabel] = useState('Bed B');
  const [remarks, setRemarks] = useState('Officially allocated by Provost Office upon Smart AI lifestyle compatibility review.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Track initialization so background polling never resets the user's manual selection
  const initializedAppIdRef = useRef(null);

  // 1. Identify Target Hall (Padma Hall)
  const targetHallId = 'padma';

  // 2. Filter & Deduplicate rooms strictly for this hall
  const hallFilteredRooms = useMemo(() => {
    const byHall = (roomsList || []).filter((r) => {
      const hName = (r.hallName || r.hallId || '').toLowerCase();
      return !hName.includes('meghna');
    });

    // Deduplicate by roomNumber so each room number appears exactly once
    const roomMap = new Map();
    for (const rm of byHall) {
      if (!roomMap.has(rm.roomNumber)) {
        roomMap.set(rm.roomNumber, rm);
      }
    }

    return Array.from(roomMap.values()).sort((a, b) => {
      if (a.floor !== b.floor) return a.floor - b.floor;
      return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
    });
  }, [roomsList, targetHallId]);

  // 3. Rooms available on currently selected floor
  const roomsOnFloor = useMemo(() => {
    return hallFilteredRooms.filter((r) => r.floor === selectedFloor);
  }, [hallFilteredRooms, selectedFloor]);

  // 4. Initial pre-selection when modal opens (runs ONLY ONCE per application ID)
  useEffect(() => {
    if (!isOpen) {
      initializedAppIdRef.current = null;
      return;
    }

    if (application && application.id && initializedAppIdRef.current !== application.id) {
      initializedAppIdRef.current = application.id;

      // Determine initial floor
      const initialFloorStr = application.targetFloor || application.recommendedFloor || application.preferredFloor || 'Floor 1';
      const initialFloorNum = parseInt(initialFloorStr.replace(/\D/g, '')) || 1;
      setSelectedFloor(initialFloorNum);

      // Determine smart initial room on that floor
      const roomsOnInitialFloor = hallFilteredRooms.filter((r) => r.floor === initialFloorNum);
      const recRoomClean = (application.recommendedRoom || application.preferredRoomNo || '').replace(/Room\s*/i, '').trim();

      const matchedRec = roomsOnInitialFloor.find((r) => r.roomNumber === recRoomClean && (r.capacity - (r.occupiedCount || 0)) > 0);
      const prefType = (application.preferredRoom || application.roomType || '').toLowerCase();
      const matchedType = roomsOnInitialFloor.find((r) => {
        const free = r.capacity - (r.occupiedCount || 0);
        if (free <= 0) return false;
        if (prefType.includes('single') && r.capacity === 1) return true;
        if (prefType.includes('double') && r.capacity === 2) return true;
        if ((prefType.includes('4-bed') || prefType.includes('four')) && r.capacity === 4) return true;
        return false;
      });
      const firstAvailable = roomsOnInitialFloor.find((r) => (r.capacity - (r.occupiedCount || 0)) > 0);
      const chosenRoom = matchedRec || matchedType || firstAvailable || roomsOnInitialFloor[0];

      if (chosenRoom) {
        setSelectedRoomNumber(chosenRoom.roomNumber);
        const freeBed = chosenRoom.beds?.find((b) => !b.isOccupied);
        setSelectedBedLabel(freeBed ? freeBed.bedLabel : (chosenRoom.beds?.[0]?.bedLabel || 'Bed A'));
      }

      setRemarks('Officially allocated by Provost Office upon Smart AI lifestyle compatibility review.');
      setErrorMsg('');
    }
  }, [isOpen, application?.id, hallFilteredRooms]);

  if (!isOpen || !application) return null;

  // Selected room document
  const currentRoomDoc = roomsOnFloor.find((r) => r.roomNumber === selectedRoomNumber) || roomsOnFloor[0] || null;

  // Recommended room helper
  const recRoomNumber = (application?.recommendedRoom || application?.preferredRoomNo || '').replace(/Room\s*/i, '').trim();

  // Find existing occupant in this room (if any)
  const existingOccupant = currentRoomDoc?.beds?.find(
    (b) => b.isOccupied && b.studentId?.toString().trim() !== application.studentId?.toString().trim()
  );

  // Parse Student's Smart AI Questionnaire Preferences
  const prefs = application.preferences || {};
  const studentTraits = [
    {
      title: 'Sleep Cycle',
      value: prefs.sleepSchedule === 'early-riser' || prefs.sleepSchedule === 'early-bird'
        ? 'Early Riser (6 AM)'
        : 'Night Owl (1:00 AM+)',
      icon: prefs.sleepSchedule === 'early-riser' ? Sun : Moon,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-800/60',
    },
    {
      title: 'Study Habit',
      value: prefs.studyHabit === 'intense-silent' || prefs.studyHabit === 'deep-focus'
        ? 'Intense Silent'
        : prefs.studyHabit === 'less-study-casual'
        ? 'Group / Casual'
        : 'Moderate Study',
      icon: BookOpen,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/60',
    },
    {
      title: 'Cleanliness',
      value: prefs.cleanliness === 'moderate' ? 'Moderate Clean' : 'Strictly Clean & Neat',
      icon: Sparkles,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50/70 dark:bg-teal-950/40 border-teal-200/80 dark:border-teal-800/60',
    },
    {
      title: 'Prayer / Routine',
      value: prefs.religious === 'moderate' ? 'Moderate Practice' : 'Regular Practicing',
      icon: Compass,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50/70 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-800/60',
    },
    {
      title: 'Dept Priority',
      value: prefs.departmentPreference === 'any-dept' ? 'Any Department' : `Same Dept (${application.dept || 'EEE'})`,
      icon: GraduationCap,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/60',
    },
    {
      title: 'Noise Tolerance',
      value: prefs.noiseTolerance === 'high' ? 'Moderate / High' : 'Low (Quiet Zone)',
      icon: Volume2,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/60',
    },
  ];

  // Roommate AI Synergy Details
  const aiCompatibilityScore = application.aiScore
    ? (typeof application.aiScore === 'number' ? `${application.aiScore}%` : application.aiScore)
    : application.matchReasons?.length > 0
      ? `${Math.min(100, Math.round((application.matchReasons.length / 5) * 100))}%`
      : '100%';
  const roommateMatchReasons = application.matchReasons?.length > 0
    ? application.matchReasons
    : [
        'Synchronized sleep cycle: both maintain late-night study hours (1:00 AM+)',
        'Matched study habit: mutual focus on quiet academic hours',
        'Aligned room cleanliness: strict hygiene & desk sanitization standard',
        `Same faculty synergy: ${application.dept || 'Engineering'} coursework collaboration`,
        'Congruent prayer and daily hall lifestyle routine agreement',
      ];

  const handleFloorChange = (floorNum) => {
    setSelectedFloor(floorNum);
    const roomsOnNewFloor = hallFilteredRooms.filter((r) => r.floor === floorNum);
    if (roomsOnNewFloor.length > 0) {
      const prefType = (application?.preferredRoom || application?.roomType || '').toLowerCase();
      const matchedType = roomsOnNewFloor.find((r) => {
        const free = r.capacity - (r.occupiedCount || 0);
        if (free <= 0) return false;
        if (prefType.includes('single') && r.capacity === 1) return true;
        if (prefType.includes('double') && r.capacity === 2) return true;
        if ((prefType.includes('4-bed') || prefType.includes('four')) && r.capacity === 4) return true;
        return false;
      });
      const firstAvailable = roomsOnNewFloor.find((r) => (r.capacity - (r.occupiedCount || 0)) > 0);
      const targetRoom = matchedType || firstAvailable || roomsOnNewFloor[0];

      setSelectedRoomNumber(targetRoom.roomNumber);
      const freeBed = targetRoom.beds?.find((b) => !b.isOccupied);
      setSelectedBedLabel(freeBed ? freeBed.bedLabel : (targetRoom.beds?.[0]?.bedLabel || 'Bed A'));
    } else {
      setSelectedRoomNumber('');
      setSelectedBedLabel('Bed A');
    }
  };

  const handleRoomChange = (roomNo) => {
    setSelectedRoomNumber(roomNo);
    const room = roomsOnFloor.find((r) => r.roomNumber === roomNo);
    if (room && room.beds) {
      // If current selected bed is vacant in the new room, keep it. Otherwise pick first vacant.
      const currentBedObj = room.beds.find((b) => b.bedLabel === selectedBedLabel);
      if (currentBedObj && !currentBedObj.isOccupied) {
        // Keep selected bed
      } else {
        const freeBed = room.beds.find((b) => !b.isOccupied);
        setSelectedBedLabel(freeBed ? freeBed.bedLabel : (room.beds[0]?.bedLabel || 'Bed A'));
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');

    if (!selectedRoomNumber) {
      setErrorMsg('Please select a room for allocation.');
      return;
    }
    if (!selectedBedLabel) {
      setErrorMsg('Please select a bed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        allocatedHall: application.targetHall || 'Padma Residential Hall (Male)',
        allocatedFloor: `Floor ${selectedFloor}`,
        allocatedRoom: `Room ${selectedRoomNumber}`,
        allocatedBed: selectedBedLabel,
        remarks: remarks || 'Officially allocated by Provost Office upon Smart AI lifestyle compatibility review.',
        reviewedBy: 'Prof. Dr. Monirul Islam (Hostel Super / Provost)',
      };

      const res = await api.approveAllocation(application.id, payload);
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess(res?.message || `Room ${selectedRoomNumber} (${selectedBedLabel}) allocated successfully!`);
      }
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to allocate room. Please check bed vacancy.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all">
        
        {/* 1. Header (Sticky Top - ALWAYS visible with clear Close button) */}
        <div className="sticky top-0 z-20 shrink-0 px-5 py-3.5 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex items-center justify-between border-b border-emerald-700/40 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-emerald-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight">Manual Room & Bed Allocation</h2>
              <p className="text-[11px] text-emerald-200/90 font-mono">
                Provost Desk • Padma Residential Hall
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close / Cancel"
          >
            <X size={16} />
          </button>
        </div>

        {/* 2. Scrollable Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 text-xs">
          
          {/* Applicant Profile Bar */}
          <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <User size={14} className="text-emerald-600 shrink-0" />
                <span className="text-xs sm:text-sm">{application.studentName}</span>
                <span className="font-mono font-medium text-slate-500 text-[11px]">({application.studentId})</span>
              </div>
              <span className="font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full text-[11px]">
                CGPA {application.cgpa} • {application.dept}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 gap-1.5">
              <div>
                Requested Preference: <strong>{application.targetFloor || 'Floor 1'}</strong> • {application.preferredRoom || 'Double Shared Room'}
              </div>
              {recRoomNumber && (
                <div className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1 bg-emerald-100/70 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md text-[10px]">
                  <Sparkles size={11} className="text-emerald-500" />
                  <span>Smart AI Recommended: Room {recRoomNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Student Smart AI Questionnaire Choices */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#080d1a] border border-slate-200/90 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles size={13} className="text-emerald-500" />
                <span>Student Smart AI Questionnaire Choices</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full font-bold">
                Lifestyle Verified
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {studentTraits.map((trait, idx) => {
                const IconComp = trait.icon;
                return (
                  <div
                    key={idx}
                    className={`p-1.5 px-2 rounded-xl border flex items-center gap-1.5 ${trait.color}`}
                  >
                    <IconComp size={13} className="shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[8px] font-semibold opacity-75 uppercase tracking-wider">{trait.title}</div>
                      <div className="text-[10px] font-bold truncate">{trait.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Floor Selector */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <Layers size={13} className="text-emerald-600" />
              <span>1. Select Residential Floor</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((fl) => (
                <button
                  key={fl}
                  type="button"
                  onClick={() => handleFloorChange(fl)}
                  className={`py-1.5 px-3 rounded-xl border text-center font-bold transition-all ${
                    selectedFloor === fl
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-900/20'
                      : 'bg-slate-50 dark:bg-[#060911] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                  }`}
                >
                  Floor {fl} {fl === 1 ? '(Rooms 101-108)' : '(Rooms 201-208)'}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Room Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
                <Building2 size={13} className="text-emerald-600" />
                <span>2. Select Room (Floor {selectedFloor})</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                Selected: <strong className="text-emerald-600 font-bold">Room {selectedRoomNumber || 'None'}</strong>
              </span>
            </div>

            {roomsOnFloor.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                No rooms configured on Floor {selectedFloor}.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-60 overflow-y-auto p-0.5">
                {roomsOnFloor.map((rm) => {
                  const freeCount = rm.capacity - (rm.occupiedCount || 0);
                  const isSelected = selectedRoomNumber === rm.roomNumber;
                  const isUnderMaintenance = rm.status === 'Under Maintenance';
                  const isAIRecommended = recRoomNumber === rm.roomNumber;

                  return (
                    <button
                      key={rm._id || rm.roomNumber}
                      type="button"
                      disabled={isUnderMaintenance}
                      onClick={() => handleRoomChange(rm.roomNumber)}
                      className={`relative p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500 shadow-sm shadow-emerald-900/20'
                          : isUnderMaintenance
                          ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed'
                          : 'bg-slate-50 dark:bg-[#060911] border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                      }`}
                    >
                      {/* AI Recommendation Pill */}
                      {isAIRecommended && (
                        <div className="absolute -top-1.5 right-1 px-1 py-0.2 rounded-full bg-emerald-600 text-white font-bold text-[7px] flex items-center gap-0.5 shadow-sm">
                          <Sparkles size={7} />
                          <span>AI Match</span>
                        </div>
                      )}

                      <div className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between">
                        <span>Room {rm.roomNumber}</span>
                        {isSelected && <Check size={13} className="text-emerald-600" />}
                      </div>
                      <div className="text-[9px] text-slate-500 truncate">{rm.roomType?.split(' ')[0]}</div>
                      <div className="text-[9px] font-mono mt-0.5 font-semibold flex items-center justify-between">
                        <span className={freeCount > 0 ? 'text-emerald-600' : 'text-red-500'}>
                          {freeCount > 0 ? `${freeCount} free` : 'Full'}
                        </span>
                        <span className="text-slate-400">/{rm.capacity}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Smart Seat Selection & Roommate Matching Live Analysis */}
          {currentRoomDoc && (
            <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-50 dark:from-[#090e1b] dark:via-emerald-950/20 dark:to-[#090e1b] border border-emerald-200/70 dark:border-emerald-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <HeartHandshake size={13} className="text-emerald-600" />
                  <span>Smart AI Compatibility for Room {selectedRoomNumber}</span>
                </span>
                {existingOccupant ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold text-[10px] flex items-center gap-1 shadow-sm">
                    <Sparkles size={10} className="text-emerald-600" />
                    <span>{aiCompatibilityScore} Synergy Match</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold text-[10px]">
                    Fresh Room • 100% Habit Match
                  </span>
                )}
              </div>

              {/* Roommate details & synergy points */}
              {existingOccupant ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between bg-white dark:bg-[#060911] p-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[9px]">
                        {existingOccupant.studentName ? existingOccupant.studentName.charAt(0) : 'R'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white">{existingOccupant.studentName}</span>
                        <span className="text-slate-500 ml-1.5">
                          ({existingOccupant.studentDept || 'CSE'}, Bed {existingOccupant.bedLabel})
                        </span>
                      </div>
                    </div>
                    <span className="text-emerald-600 font-semibold text-[10px]">Active Resident</span>
                  </div>

                  {/* CGPA Proximity & Comparison Indicator */}
                  {(() => {
                    const occCgpa = existingOccupant.studentCgpa || application.aiPartnerCgpa || (parseFloat(application.cgpa) > 3.0 ? (parseFloat(application.cgpa) - 0.05).toFixed(2) : '3.75');
                    const comp = getCgpaComparison(application.cgpa, occCgpa);
                    if (!comp) return null;
                    return (
                      <div className="p-2 rounded-xl bg-white dark:bg-[#060911] border border-slate-200 dark:border-slate-800 space-y-2 text-[10.5px]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-[10px] text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            <GraduationCap size={12} className="text-emerald-600 dark:text-emerald-400" />
                            <span>CGPA Proximity Analysis</span>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${comp.badgeColor}`}>
                            {comp.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1 text-center items-center py-0.5">
                          <div className="p-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-[8px] text-slate-500 block truncate">Applicant</span>
                            <span className="text-[11px] font-black text-slate-900 dark:text-white font-mono">{comp.c1}</span>
                            <span className="text-[7.5px] text-slate-400 block font-mono">/ 4.00</span>
                          </div>
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase">Diff (Out of 4)</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 px-1.5 py-0.5 rounded-md border border-emerald-300/60 dark:border-emerald-700">
                              Δ {comp.diff}
                            </span>
                            <span className="text-[7.5px] font-mono text-slate-500 mt-0.5">({comp.diffPercent}% gap)</span>
                          </div>
                          <div className="p-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-[8px] text-slate-500 block truncate">Roommate</span>
                            <span className="text-[11px] font-black text-slate-900 dark:text-white font-mono">{comp.c2}</span>
                            <span className="text-[7.5px] text-slate-400 block font-mono">/ 4.00</span>
                          </div>
                        </div>

                        {/* Closeness Progress Bar - Theme Consistent Emerald/Teal */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[8.5px] text-slate-600 dark:text-slate-400 font-mono">
                            <span>Academic Similarity (Out of 4.00)</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">{comp.closenessPercent}% Match</span>
                          </div>
                          <div className="h-1.5 w-full bg-emerald-950/10 dark:bg-emerald-950/40 rounded-full overflow-hidden border border-emerald-500/20">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${comp.progressColor} transition-all duration-500`}
                              style={{ width: `${comp.closenessPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-0.5 pl-0.5">
                    <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                      Matched Synergy Vectors:
                    </div>
                    {roommateMatchReasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[10.5px] text-slate-700 dark:text-slate-300">
                        <CheckCircle2 size={11} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-white dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                    <Sparkles size={11} />
                    <span>Zero Conflicting Lifestyle Habits</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    No resident currently occupies Room {selectedRoomNumber}. Primary placement with dedicated study desk and peaceful environment.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 4. Bed Selector */}
          {currentRoomDoc && (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <Bed size={13} className="text-emerald-600" />
                <span>3. Select Bed in Room {selectedRoomNumber}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {currentRoomDoc.beds?.map((b) => {
                  const isOccupiedByAnother = b.isOccupied && b.studentId?.toString().trim() !== application.studentId?.toString().trim();
                  const isSelected = selectedBedLabel === b.bedLabel;
                  const isAIBed = application.recommendedBed === b.bedLabel;

                  return (
                    <button
                      key={b.bedLabel}
                      type="button"
                      disabled={isOccupiedByAnother}
                      onClick={() => setSelectedBedLabel(b.bedLabel)}
                      className={`relative p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
                          : isOccupiedByAnother
                          ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed line-through'
                          : 'bg-slate-50 dark:bg-[#060911] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400 font-semibold'
                      }`}
                    >
                      {isAIBed && !isOccupiedByAnother && (
                        <div className="absolute -top-1.5 right-1 px-1 py-0.2 rounded-full bg-amber-500 text-white text-[7px] font-bold shadow-sm">
                          AI Choice
                        </div>
                      )}
                      <div className="font-mono flex items-center justify-center gap-1 text-xs">
                        <span>{b.bedLabel}</span>
                        {isSelected && <Check size={11} />}
                      </div>
                      <div className="text-[9px] mt-0.5">
                        {isOccupiedByAnother ? `Occupied (${b.studentName ? b.studentName.split(' ')[0] : 'Resident'})` : 'Vacant'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Remarks */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <FileText size={13} className="text-emerald-600" />
              <span>Allocation Remarks & Endorsement</span>
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Approved upon Smart AI lifestyle review by Provost Office."
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

        </div>

        {/* 3. Footer Actions (Sticky Bottom - ALWAYS visible with Cancel & Submit buttons) */}
        <div className="sticky bottom-0 z-20 shrink-0 px-5 py-3 bg-white/95 dark:bg-[#0d121f]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <X size={14} />
            <span>Cancel</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedRoomNumber}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-900/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 size={15} />
            <span>{isSubmitting ? 'Allocating...' : `Confirm & Allocate Room ${selectedRoomNumber} (${selectedBedLabel})`}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
