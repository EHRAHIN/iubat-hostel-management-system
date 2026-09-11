import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRightLeft,
  Building2,
  Layers,
  Bed,
  User,
  AlertCircle,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';

export default function RoomTransferModal({
  isOpen,
  onClose,
  studentData,
  roomsList = [],
  onSuccess,
}) {
  const [destFloor, setDestFloor] = useState(1);
  const [destRoomNumber, setDestRoomNumber] = useState('');
  const [destBedLabel, setDestBedLabel] = useState('');
  const [reason, setReason] = useState('Administrative room re-allocation requested & approved by Provost/Admin.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (studentData) {
      // Parse preferred or current floor
      const prefFloorNum = studentData.preferredFloor ? Number(studentData.preferredFloor.toString().replace(/\D/g, '')) : null;
      const curFloorNum = prefFloorNum || (studentData.floor?.toString().includes('2') || studentData.room?.toString().startsWith('2') ? 2 : 1);
      setDestFloor(curFloorNum);

      const availableOnFloor = roomsList.filter((r) => r.floor === curFloorNum);
      if (availableOnFloor.length > 0) {
        let pickedRoom = null;
        if (studentData.preferredRoom) {
          const prefClean = studentData.preferredRoom.toString().replace(/Room\s*/i, '').trim();
          pickedRoom = availableOnFloor.find((r) => r.roomNumber === prefClean);
        }
        if (!pickedRoom) {
          const curRoomClean = (studentData.room || '').replace(/Room\s*/i, '').trim();
          pickedRoom = availableOnFloor.find((r) => r.roomNumber !== curRoomClean) || availableOnFloor[0];
        }
        setDestRoomNumber(pickedRoom.roomNumber);

        let freeBed = null;
        if (studentData.preferredBed) {
          freeBed = pickedRoom.beds?.find((b) => b.bedLabel.toLowerCase() === studentData.preferredBed.toLowerCase() && !b.isOccupied);
        }
        if (!freeBed) {
          freeBed = pickedRoom.beds?.find((b) => !b.isOccupied);
        }
        setDestBedLabel(freeBed ? freeBed.bedLabel : 'Bed A');
      }

      if (studentData.reason) {
        setReason(`[Student Reason]: ${studentData.reason}`);
      } else {
        setReason('Administrative room re-allocation requested & approved by Hostel Super.');
      }
      setErrorMsg('');
    }
  }, [studentData, roomsList]);

  if (!isOpen || !studentData) return null;

  const roomsOnFloor = roomsList.filter((r) => r.floor === destFloor);
  const currentDestRoom = roomsOnFloor.find((r) => r.roomNumber === destRoomNumber) || roomsOnFloor[0];

  const handleFloorChange = (floorNum) => {
    setDestFloor(floorNum);
    const roomsOnNewFloor = roomsList.filter((r) => r.floor === floorNum);
    if (roomsOnNewFloor.length > 0) {
      setDestRoomNumber(roomsOnNewFloor[0].roomNumber);
      const freeBed = roomsOnNewFloor[0].beds?.find((b) => !b.isOccupied);
      setDestBedLabel(freeBed ? freeBed.bedLabel : 'Bed A');
    } else {
      setDestRoomNumber('');
      setDestBedLabel('');
    }
  };

  const handleRoomChange = (roomNo) => {
    setDestRoomNumber(roomNo);
    const room = roomsOnFloor.find((r) => r.roomNumber === roomNo);
    if (room && room.beds) {
      const freeBed = room.beds.find((b) => !b.isOccupied);
      setDestBedLabel(freeBed ? freeBed.bedLabel : (room.beds[0]?.bedLabel || 'Bed A'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!destRoomNumber) {
      setErrorMsg('Please select a destination room.');
      return;
    }
    if (!destBedLabel) {
      setErrorMsg('Please select a destination bed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const studentId = studentData.userId || studentData.studentId || studentData.id;
      let res;
      if (studentData.transferRequestId) {
        // Approving student room transfer request directly
        res = await api.reviewRoomTransferRequest(studentData.transferRequestId, {
          action: 'approve',
          targetRoomNumber: destRoomNumber,
          targetFloor: destFloor,
          targetBedLabel: destBedLabel,
          reviewRemarks: reason,
          reviewedBy: 'Hostel Super',
        });
      } else {
        const payload = {
          studentId: studentId?.toString().trim(),
          targetRoomNumber: destRoomNumber,
          targetFloor: destFloor,
          targetBedLabel: destBedLabel,
          reason,
          reviewedBy: 'Hostel Super / Provost / Admin Operations',
        };
        res = await api.transferStudentRoom(payload);
      }

      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess(res?.message || `Successfully transferred to Room ${destRoomNumber} (${destBedLabel})!`);
      }
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to transfer room. Target bed may already be occupied.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl my-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between border-b border-blue-600/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <ArrowRightLeft size={20} className="text-blue-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Student Room Transfer & Reallocation</h2>
              <p className="text-xs text-blue-200/90 font-mono">Provost & Admin Desk • Reassignment Controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Current Allocation Card */}
        <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-900/40 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <User size={14} className="text-blue-600" />
              <span>{studentData.name || studentData.studentName}</span>
              <span className="font-mono font-medium text-slate-500">({studentData.userId || studentData.studentId || studentData.id})</span>
            </div>
            <span className="font-semibold text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2.5 py-0.5 rounded-full">
              {studentData.department || studentData.dept || 'Resident'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#060911]/80 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between font-mono text-[11px]">
            <span className="text-slate-500">Currently Assigned:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {studentData.room || 'Room Unassigned'} • {studentData.seatNo || studentData.seat || 'Bed A'} ({studentData.floor || 'Floor 1'})
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Destination Floor */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
              <Layers size={14} className="text-blue-600" />
              <span>1. Target Floor</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((fl) => (
                <button
                  key={fl}
                  type="button"
                  onClick={() => handleFloorChange(fl)}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                    destFloor === fl
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-900/20'
                      : 'bg-slate-50 dark:bg-[#060911] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500'
                  }`}
                >
                  Floor {fl} {fl === 1 ? '(Rooms 101-108)' : '(Rooms 201-208)'}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Destination Room */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
              <Building2 size={14} className="text-blue-600" />
              <span>2. Target Destination Room (Floor {destFloor})</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              {roomsOnFloor.map((rm) => {
                const freeCount = rm.capacity - (rm.occupiedCount || 0);
                const isSelected = destRoomNumber === rm.roomNumber;
                const isUnderMaintenance = rm.status === 'Under Maintenance';

                return (
                  <button
                    key={rm._id || rm.roomNumber}
                    type="button"
                    disabled={isUnderMaintenance}
                    onClick={() => handleRoomChange(rm.roomNumber)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/30'
                        : isUnderMaintenance
                        ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed'
                        : 'bg-slate-50 dark:bg-[#060911] border-slate-200 dark:border-slate-800 hover:border-blue-400'
                    }`}
                  >
                    <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      Room {rm.roomNumber}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{rm.roomType?.split(' ')[0]}</div>
                    <div className="text-[10px] font-mono mt-1 font-semibold flex items-center justify-between">
                      <span className={freeCount > 0 ? 'text-emerald-600' : 'text-red-500'}>
                        {freeCount > 0 ? `${freeCount} free` : 'Full'}
                      </span>
                      <span className="text-slate-400">/{rm.capacity}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Destination Bed */}
          {currentDestRoom && (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                <Bed size={14} className="text-blue-600" />
                <span>3. Target Bed Slot in Room {destRoomNumber}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {currentDestRoom.beds?.map((b) => {
                  const studentIdClean = (studentData.userId || studentData.studentId || studentData.id)?.toString().trim();
                  const isOccupiedByOther = b.isOccupied && b.studentId?.toString().trim() !== studentIdClean;
                  const isSelected = destBedLabel === b.bedLabel;

                  return (
                    <button
                      key={b.bedLabel}
                      type="button"
                      disabled={isOccupiedByOther}
                      onClick={() => setDestBedLabel(b.bedLabel)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-md'
                          : isOccupiedByOther
                          ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed line-through'
                          : 'bg-slate-50 dark:bg-[#060911] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400 font-semibold'
                      }`}
                    >
                      <div className="font-mono">{b.bedLabel}</div>
                      <div className="text-[10px] mt-0.5">
                        {isOccupiedByOther ? `Held (${b.studentName ? b.studentName.split(' ')[0] : 'Occupied'})` : 'Vacant'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <FileText size={14} className="text-blue-600" />
              <span>Transfer Justification & Reason</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Mutual room transfer requested / Academic study synergy."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !destRoomNumber}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Transferring...' : `Execute Transfer to Room ${destRoomNumber}`}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
