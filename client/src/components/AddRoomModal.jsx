import React, { useState, useEffect } from 'react';
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
  currentUser,
}) {
  const isAdmin = currentUser?.role === 'admin';
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [roomType, setRoomType] = useState('Double Shared Room');
  const [capacity, setCapacity] = useState(2);
  const [monthlyRent, setMonthlyRent] = useState(3500);
  const [hasAC, setHasAC] = useState(false);
  const [hasBalcony, setHasBalcony] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tariffRates, setTariffRates] = useState({
    single: 5500,
    double: 3500,
    quad: 2500,
  });

  useEffect(() => {
    if (!isOpen) return;
    const loadRates = async () => {
      try {
        const res = await api.getRooms();
        if (res?.data) {
          const single = res.data.find(r => r.roomType?.includes('Single'))?.monthlyRent || 5500;
          const double = res.data.find(r => r.roomType?.includes('Double'))?.monthlyRent || 3500;
          const quad = res.data.find(r => r.roomType?.includes('4-Bed') || r.roomType?.includes('Quad'))?.monthlyRent || 2500;
          setTariffRates({ single, double, quad });
          if (roomType === 'Single Deluxe Room') setMonthlyRent(single);
          else if (roomType === '4-Bed Standard Room') setMonthlyRent(quad);
          else setMonthlyRent(double);
        }
      } catch (e) {}
    };
    loadRates();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRoomTypeChange = (type) => {
    setRoomType(type);
    if (type === 'Single Deluxe Room') {
      setCapacity(1);
      setMonthlyRent(tariffRates.single);
      setHasAC(true);
    } else if (type === 'Double Shared Room') {
      setCapacity(2);
      setMonthlyRent(tariffRates.double);
    } else if (type === '4-Bed Standard Room') {
      setCapacity(4);
      setMonthlyRent(tariffRates.quad);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!roomNumber.trim()) {
      setErrorMsg('Please enter a room number (e.g. 109, 209).');
      return;
    }

    // Strict Capacity Validation before submission
    if (roomType === 'Single Deluxe Room' && Number(capacity) !== 1) {
      setErrorMsg('Single room is strictly limited to 1 bed.');
      return;
    }
    if (roomType === 'Double Shared Room' && Number(capacity) !== 2) {
      setErrorMsg('Double room is strictly limited to 2 beds (cannot make 3 beds).');
      return;
    }
    if (roomType === '4-Bed Standard Room' && Number(capacity) !== 4) {
      setErrorMsg('4-Bed room is strictly limited to 4 beds (cannot make 5 beds).');
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
        userRole: currentUser?.role || 'admin',
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
              <p className="text-xs text-emerald-200/90 font-mono">
                {isAdmin ? '👑 Super Admin Room & Tariff Provisioning' : '🏛️ Hostel Super (Provost) Inventory Setup'}
              </p>
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
              <span>Room Quality & Layout (Strict Bed Rule)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Single Deluxe Room', label: 'Single (Strict 1-Bed)', rent: `৳${(tariffRates.single || 5500).toLocaleString()}`, cap: 1 },
                { id: 'Double Shared Room', label: 'Double (Strict 2-Bed)', rent: `৳${(tariffRates.double || 3500).toLocaleString()}`, cap: 2 },
                { id: '4-Bed Standard Room', label: '4-Bed Quad (Strict 4-Bed)', rent: `৳${(tariffRates.quad || 2500).toLocaleString()}`, cap: 4 },
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
            {/* Bed Capacity - STRICTLY LOCKED BY ROOM TYPE */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Bed size={13} className="text-emerald-600" />
                  <span>Bed Capacity (Fixed)</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                  Strict Rule
                </span>
              </label>
              <div className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold flex items-center justify-between">
                <span>{capacity} {capacity === 1 ? 'Bed' : 'Beds'}</span>
                <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold">
                  {roomType === 'Single Deluxe Room' ? 'Max 1 Bed' : roomType === 'Double Shared Room' ? 'Max 2 Beds (Cannot be 3)' : 'Max 4 Beds (Cannot be 5)'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {roomType === 'Double Shared Room'
                  ? '⚠️ Double rooms are strictly fixed to 2 beds (A, B). Cannot be made 3.'
                  : roomType === '4-Bed Standard Room'
                  ? '⚠️ 4-Bed rooms are strictly fixed to 4 beds (A, B, C, D). Cannot be made 5.'
                  : '⚠️ Single rooms are strictly fixed to 1 bed (A). Cannot be made double.'}
              </span>
            </div>

            {/* Monthly Rent - Editable by Admin only */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <DollarSign size={13} className="text-emerald-600" />
                  <span>Monthly Rent (BDT)</span>
                </span>
                {isAdmin ? (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                    Admin Editable
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">
                    Official Tariff
                  </span>
                )}
              </label>
              <input
                type="number"
                value={monthlyRent}
                readOnly={!isAdmin}
                disabled={!isAdmin}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-xl border text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isAdmin
                    ? 'bg-slate-50 dark:bg-[#060911] border-slate-200 dark:border-slate-800'
                    : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-85'
                }`}
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {isAdmin
                  ? 'Admin can customize this room price or keep standard tariff.'
                  : 'Tariff is fixed by university policy. Only Super Admin can change room prices.'}
              </span>
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
