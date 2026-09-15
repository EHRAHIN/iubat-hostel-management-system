import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRightLeft,
  Building2,
  Bed,
  FileText,
  AlertCircle,
  Sparkles,
  Send,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';

export default function StudentRoomTransferModal({
  isOpen,
  onClose,
  studentUser,
  onSuccess,
  prefillData,
}) {
  const [preferredFloor, setPreferredFloor] = useState(prefillData?.targetFloor || 'Floor 1');
  const [preferredRoomType, setPreferredRoomType] = useState(prefillData?.targetRoomType || 'Double Shared Room');
  const [preferredRoom, setPreferredRoom] = useState(prefillData?.targetRoom || '');
  const [preferredBed, setPreferredBed] = useState(prefillData?.targetBed || '');
  const [reasonCategory, setReasonCategory] = useState(prefillData?.reasonCategory || 'Sleep Cycle & Lifestyle Harmony');
  const [detailedReason, setDetailedReason] = useState(prefillData?.detailedReason || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (prefillData && isOpen) {
      if (prefillData.targetFloor) setPreferredFloor(prefillData.targetFloor);
      if (prefillData.targetRoomType) setPreferredRoomType(prefillData.targetRoomType);
      if (prefillData.targetRoom) setPreferredRoom(prefillData.targetRoom);
      if (prefillData.targetBed) setPreferredBed(prefillData.targetBed);
      if (prefillData.reasonCategory) setReasonCategory(prefillData.reasonCategory);
      if (prefillData.detailedReason) setDetailedReason(prefillData.detailedReason);
    }
  }, [prefillData, isOpen]);

  if (!isOpen || !studentUser) return null;

  const currentRoom = studentUser.room || 'Room 101';
  const currentBed = studentUser.seatNo || studentUser.seat || 'Bed A';
  const currentHall = studentUser.hall || 'Padma Residential Hall (Male)';
  const currentFloor = studentUser.floor || 'Floor 1';

  const reasonPresets = [
    'Academic Focus & Study Synchronicity',
    'Medical & Health Ground (Needs Lower Floor / Quiet Room)',
    'Coursework Collaboration with Department Cohort',
    'Sleep Cycle & Lifestyle Harmony',
    'Room Maintenance / Environmental Factor',
    'Other Personal Reason',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const fullReason = `${reasonCategory}: ${detailedReason}`.trim();
    if (!detailedReason.trim()) {
      setErrorMsg('Please describe the specific reason for your room transfer request.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        studentId: studentUser.userId || studentUser.id || '221004128',
        studentName: studentUser.name || 'Student Resident',
        department: studentUser.department || studentUser.dept || 'CSE',
        cgpa: parseFloat(studentUser.cgpa) || 3.5,
        phone: studentUser.phone || '',
        currentHall,
        currentFloor,
        currentRoom,
        currentBed,
        preferredHall: currentHall,
        preferredFloor,
        preferredRoomType,
        preferredRoom: preferredRoom.trim(),
        preferredBed: preferredBed.trim(),
        reason: fullReason,
      };

      const res = await api.createRoomTransferRequest(payload);
      setIsSubmitting(false);

      if (onSuccess) {
        onSuccess(res?.message || 'Your room transfer application has been submitted to the Hostel Super for review!');
      }
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to submit room transfer request. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl my-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all text-xs">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between border-b border-emerald-600/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <ArrowRightLeft size={20} className="text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Apply for Room Transfer</h2>
              <p className="text-[11px] text-emerald-200/90 font-mono">
                Hostel Super Review • Official Room Change Request
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Current Placement Snapshot */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Current Room & Bed:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {currentRoom} — {currentBed}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {currentFloor} • {currentHall}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
              Active Resident
            </span>
          </div>

          {/* Preferences for New Placement */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={13} className="text-emerald-600" />
              <span>Target Room Preferences</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Preferred Floor</label>
                <select
                  value={preferredFloor}
                  onChange={(e) => setPreferredFloor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                >
                  <option value="Floor 1">Floor 1 (Ground / Lower)</option>
                  <option value="Floor 2">Floor 2 (Upper Floor)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Room Sharing Type</label>
                <select
                  value={preferredRoomType}
                  onChange={(e) => setPreferredRoomType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                >
                  <option value="Double Shared Room">Double Shared (2 Persons)</option>
                  <option value="Single Deluxe Room">Single Deluxe (1 Person)</option>
                  <option value="4-Bed Standard Room">4-Bed Standard (4 Persons)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Specific Room (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Room 102 or leave blank"
                  value={preferredRoom}
                  onChange={(e) => setPreferredRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Preferred Bed (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Bed A or Any"
                  value={preferredBed}
                  onChange={(e) => setPreferredBed(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Reason for Transfer (Mandatory) */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={13} className="text-emerald-600" />
              <span>Reason for Room Transfer Request <strong className="text-red-500">*</strong></span>
            </label>

            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Primary Category</label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600"
              >
                {reasonPresets.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Detailed Explanation for Hostel Super</label>
              <textarea
                rows={3}
                value={detailedReason}
                onChange={(e) => setDetailedReason(e.target.value)}
                placeholder="Explain clearly why you need this room transfer (e.g. medical doctor's advice, differing sleep study schedule, academic study group requirements)..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-600 resize-none"
                required
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold flex items-center gap-2 shadow-md shadow-emerald-900/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send size={13} />
              <span>{isSubmitting ? 'Submitting to Provost...' : 'Submit Transfer Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
