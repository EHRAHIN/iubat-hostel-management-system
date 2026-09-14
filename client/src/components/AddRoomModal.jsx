import React, { useState } from 'react';
import {
  X,
  Plus,
  Building2,
  Layers,
  Bed,
  DollarSign,
  Wind,
  Sun,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';

export default function AddRoomModal({
  isOpen,
  onClose,
  onSuccess,
}) {
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [roomType, setRoomType] = useState('Double Shared Room');
  const [capacity, setCapacity] = useState(2);
  const [monthlyRent, setMonthlyRent] = useState(2200);
  const [hasAC, setHasAC] = useState(false);
  const [hasBalcony, setHasBalcony] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRoomTypeChange = (type) => {
    setRoomType(type);
    if (type === 'Single Deluxe Room') {
      setCapacity(1);
      setMonthlyRent(3500);
      setHasAC(true);
    } else if (type === 'Double Shared Room') {
      setCapacity(2);
      setMonthlyRent(2200);
    } else if (type === '4-Bed Standard Room') {
      setCapacity(4);
      setMonthlyRent(1400);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!roomNumber.trim()) {
      setErrorMsg('Please enter a room number (e.g. 109, 209).');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        roomNumber: roomNumber.trim().replace(/Room\s*/i, ''),
        hallId: 'padma',
        hallName: 'Padma Residential Hall (Male)',
        floor: Number(floor),
        roomType,
        capacity: Number(capacity),
        monthlyRent: Number(monthlyRent),
        hasAC: Boolean(hasAC),
        hasBalcony: Boolean(hasBalcony),
        status: 'Available',
      };

      const res = await api.createRoom(payload);
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess(res?.message || `Room ${roomNumber} successfully created!`);
      }
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to create room. Room number may already exist.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl my-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between border-b border-emerald-700/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Plus size={20} className="text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Add New Residential Room</h2>
              <p className="text-xs text-emerald-200/90 font-mono">Padma Residential Hall Inventory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Room Number */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <Building2 size={13} className="text-emerald-600" />
                <span>Room Number *</span>
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. 109 or 209"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Floor */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <Layers size={13} className="text-emerald-600" />
                <span>Floor Level *</span>
              </label>
              <select
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={1}>Floor 1 (Ground / Wing 1)</option>
                <option value={2}>Floor 2 (Upper / Wing 2)</option>
              </select>
            </div>
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <Bed size={13} className="text-emerald-600" />
              <span>Room Quality & Layout</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Single Deluxe Room', label: 'Single (1-Bed)', rent: '৳3,500' },
                { id: 'Double Shared Room', label: 'Double (2-Bed)', rent: '৳2,200' },
                { id: '4-Bed Standard Room', label: '4-Bed Quad', rent: '৳1,400' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleRoomTypeChange(t.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    roomType === t.id
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-md'
                      : 'bg-slate-50 dark:bg-[#060911] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                  }`}
                >
                  <div className="font-semibold text-xs">{t.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">{t.rent}/mo</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Bed Capacity */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <Bed size={13} className="text-emerald-600" />
                <span>Bed Capacity</span>
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Generates Bed A, Bed B... automatically</span>
            </div>

            {/* Monthly Rent */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <DollarSign size={13} className="text-emerald-600" />
                <span>Monthly Rent (BDT)</span>
              </label>
              <input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Amenities Toggles */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 flex items-center justify-around">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAC}
                onChange={(e) => setHasAC(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <Wind size={13} className="text-blue-500" />
                <span>Air Conditioned</span>
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasBalcony}
                onChange={(e) => setHasBalcony(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <Sun size={13} className="text-amber-500" />
                <span>Balcony Attached</span>
              </span>
            </label>
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
              disabled={isSubmitting || !roomNumber.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Creating...' : 'Create Room'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
