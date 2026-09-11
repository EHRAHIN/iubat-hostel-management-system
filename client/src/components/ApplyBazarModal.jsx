import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ShoppingCart,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Building,
  Sparkles,
  Utensils,
  Package,
} from 'lucide-react';
import { api } from '../services/api';
import {
  WEEKLY_MESS_ROSTER,
  MONTHLY_BULK_STAPLES,
  getRosterForDate,
} from '../constants/messMenuRoster';

export default function ApplyBazarModal({
  isOpen,
  onClose,
  staffName = 'Md. Kalam Hossain (Dining Staff In-Charge)',
  assignedHall = 'Padma Residential Hall (Male)',
  initialType = 'Daily Next-Day Bazar',
  onSuccess,
}) {
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  const [requisitionType, setRequisitionType] = useState(initialType || 'Daily Next-Day Bazar'); // 'Daily Next-Day Bazar' | 'Monthly Big Bazar'
  const [targetDate, setTargetDate] = useState(tomorrowStr);

  const currentRoster = getRosterForDate(tomorrowStr);
  const [title, setTitle] = useState(`Daily Kitchen Market (${currentRoster.dayFull}: ${currentRoster.lunch} & ${currentRoster.dinner})`);
  const [items, setItems] = useState(currentRoster.dailyBazarItems.map((it) => ({ ...it })));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [markAsAlreadyPurchased, setMarkAsAlreadyPurchased] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialType === 'Monthly Big Bazar') {
        setRequisitionType('Monthly Big Bazar');
        const monthYear = new Date(targetDate).toLocaleString('en-US', { month: 'long', year: 'numeric' });
        setTitle(`Monthly Bulk Grocery & Pantry Stock Procurement (${monthYear})`);
        setItems(MONTHLY_BULK_STAPLES.map((it) => ({ ...it })));
      } else {
        setRequisitionType('Daily Next-Day Bazar');
        const roster = getRosterForDate(targetDate);
        setTitle(`Daily Kitchen Market (${roster.dayFull}: ${roster.lunch} & ${roster.dinner})`);
        setItems(roster.dailyBazarItems.map((it) => ({ ...it })));
      }
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const handleDateChange = (dateVal) => {
    setTargetDate(dateVal);
    if (requisitionType === 'Daily Next-Day Bazar') {
      const roster = getRosterForDate(dateVal);
      setTitle(`Daily Kitchen Market (${roster.dayFull}: ${roster.lunch} & ${roster.dinner})`);
      setItems(roster.dailyBazarItems.map((it) => ({ ...it })));
    }
  };

  const handleTypeChange = (type) => {
    setRequisitionType(type);
    if (type === 'Monthly Big Bazar') {
      setTitle(`Monthly Bulk Grocery & Pantry Stock Procurement (${new Date(targetDate).toLocaleString('en-US', { month: 'long', year: 'numeric' })})`);
      setItems(MONTHLY_BULK_STAPLES.map((it) => ({ ...it })));
    } else {
      const roster = getRosterForDate(targetDate);
      setTitle(`Daily Kitchen Market (${roster.dayFull}: ${roster.lunch} & ${roster.dinner})`);
      setItems(roster.dailyBazarItems.map((it) => ({ ...it })));
    }
  };

  const handleSelectRosterDay = (rDay) => {
    const current = new Date(targetDate + 'T12:00:00');
    const currentDay = isNaN(current.getDay()) ? 0 : current.getDay();
    const diff = (rDay.dayIndex - currentDay + 7) % 7;
    current.setDate(current.getDate() + (diff === 0 ? 0 : diff));
    const nextDateStr = current.toISOString().split('T')[0];

    setTargetDate(nextDateStr);
    setTitle(`Daily Kitchen Market (${rDay.dayFull}: ${rDay.lunch} & ${rDay.dinner})`);
    setItems(rDay.dailyBazarItems.map((it) => ({ ...it })));
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { name: '', quantity: 1, unit: 'kg', estimatedRate: 50, estimatedTotal: 50, category: 'Vegetables & Spices' },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === 'quantity' || field === 'estimatedRate') {
      const q = Number(updated[index].quantity) || 0;
      const r = Number(updated[index].estimatedRate) || 0;
      updated[index].estimatedTotal = Math.round(q * r);
    }
    setItems(updated);
  };

  const totalEstimatedCost = items.reduce((sum, item) => sum + (Number(item.estimatedTotal) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.some((it) => !it.name || !it.quantity || it.quantity <= 0)) {
      setErrorMsg('Please ensure all grocery item names and valid quantities are entered.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        requisitionType,
        targetDate,
        title: title || `${requisitionType} for ${targetDate}`,
        hall: assignedHall,
        items,
        totalEstimatedCost,
        submittedBy: staffName,
        isAlreadyPurchased: markAsAlreadyPurchased,
        actualCost: markAsAlreadyPurchased ? totalEstimatedCost : 0,
      };

      const res = await api.createBazarRequisition(payload);
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess(res?.message || (markAsAlreadyPurchased ? 'Bazar completed and kitchen pantry stock updated immediately!' : 'Bazar requisition submitted to Hostel Super for approval!'));
      }
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to submit bazar requisition.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all">
        
        {/* Header */}
        <div className="sticky top-0 z-20 shrink-0 px-5 py-3.5 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex items-center justify-between border-b border-emerald-700/40 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <ShoppingCart size={18} className="text-emerald-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight">Apply Bazar Requisition</h2>
              <p className="text-[11px] text-emerald-200/90 font-mono">
                Submit List to Hostel Super • {assignedHall}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Requisition Type Selector */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
              Select Requisition Type
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleTypeChange('Daily Next-Day Bazar')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  requisitionType === 'Daily Next-Day Bazar'
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/40 font-bold text-emerald-900 dark:text-emerald-200'
                    : 'bg-slate-50 dark:bg-[#070b14] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                }`}
              >
                <div className="text-xs font-bold">🛒 Daily Next-Day Bazar</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Chicken, Fish, Eggs & Vegetables needed for tomorrow's dining meals.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('Monthly Big Bazar')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  requisitionType === 'Monthly Big Bazar'
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/40 font-bold text-emerald-900 dark:text-emerald-200'
                    : 'bg-slate-50 dark:bg-[#070b14] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                }`}
              >
                <div className="text-xs font-bold">📦 Monthly Big Bazar</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Bulk wholesale rice bags, oil tins, dal, spices for whole month.
                </div>
              </button>
            </div>
          </div>

          {/* Target Date & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-emerald-600" />
                <span>Target Date (When items are needed)</span>
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Requisition Title / Memo
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Daily Market for Tomorrow"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Roster-based Quick Actions & Menu Banner */}
          {requisitionType === 'Daily Next-Day Bazar' ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🍲</span>
                  <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                    Weekly Roster for {getRosterForDate(targetDate).dayFull}:
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDateChange(targetDate)}
                  className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
                >
                  <Sparkles size={11} />
                  <span>Auto-Fill {getRosterForDate(targetDate).day} Menu Items</span>
                </button>
              </div>

              {/* Day Dishes Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#070b14] border border-emerald-200/70 dark:border-emerald-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">☀️ Lunch Menu:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{getRosterForDate(targetDate).lunch}</strong>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                    Lunch
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#070b14] border border-emerald-200/70 dark:border-emerald-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">🌙 Dinner Menu:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{getRosterForDate(targetDate).dinner}</strong>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                    Dinner
                  </span>
                </div>
              </div>

              {/* Quick Weekday Switcher */}
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Or pick a weekday roster directly:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  {WEEKLY_MESS_ROSTER.map((r) => {
                    const isCurrent = getRosterForDate(targetDate).dayIndex === r.dayIndex;
                    return (
                      <button
                        key={r.day}
                        type="button"
                        onClick={() => handleSelectRosterDay(r)}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all shrink-0 cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-400'
                            : 'bg-white dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                        }`}
                      >
                        <span>{r.day}</span>: <span className="font-normal opacity-90">{r.lunch}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-2">
              <div className="flex items-center justify-between text-purple-950 dark:text-purple-200 font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <Package size={14} className="text-purple-600" />
                  <span>Monthly Bulk Grocery & Stock Procurement (Covers 30 Days Roster)</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTitle(`Monthly Bulk Grocery & Pantry Stock Procurement (${new Date(targetDate).toLocaleString('en-US', { month: 'long', year: 'numeric' })})`);
                    setItems(MONTHLY_BULK_STAPLES.map((it) => ({ ...it })));
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10.5px] font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
                >
                  <Sparkles size={11} />
                  <span>Auto-Fill 30-Day Bulk Staples</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Bulk procurement of Miniket Rice (50kg bags), Fortified Soybean Oil (16L tins), Masoor Dal, Wholesale Onions, Polao Rice, and Curry Spices to supply all 7 days of weekly mess meals.
              </p>
            </div>
          )}

          {/* Item List Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-900 dark:text-white">
                Bazar Grocery Items ({items.length} Items)
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-100 transition-colors"
              >
                <Plus size={12} />
                <span>Add More Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 grid grid-cols-12 gap-2 items-center"
                >
                  <div className="col-span-4">
                    <input
                      type="text"
                      required
                      placeholder="Item Name (e.g. Rice / Chicken)"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[11px] outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[11px] font-mono outline-none text-center"
                    />
                  </div>

                  <div className="col-span-2">
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full px-1.5 py-1.5 rounded-lg bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[11px] outline-none"
                    >
                      <option value="kg">kg</option>
                      <option value="Liters">Liters</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Bags">Bags</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="Rate ৳"
                      value={item.estimatedRate}
                      onChange={(e) => handleItemChange(idx, 'estimatedRate', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[11px] font-mono outline-none text-right"
                    />
                  </div>

                  <div className="col-span-2 flex items-center justify-between font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                    <span>৳{item.estimatedTotal}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Summary Ribbon */}
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 block font-semibold">
                Total Estimated Requisition Budget:
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300">
                To be officially vetted and approved by Hostel Super / Provost Desk.
              </span>
            </div>
            <span className="text-base font-black text-emerald-700 dark:text-emerald-300 font-mono">
              ৳{totalEstimatedCost.toLocaleString()} BDT
            </span>
          </div>

          {/* Instant Stock Option */}
          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="instantStockCheck"
                checked={markAsAlreadyPurchased}
                onChange={(e) => setMarkAsAlreadyPurchased(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="instantStockCheck" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                Bazar already purchased? Add items to Kitchen Stock immediately
              </label>
            </div>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold shrink-0">
              {markAsAlreadyPurchased ? '✓ Stock updates instantly' : 'Requires approval first'}
            </span>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || totalEstimatedCost <= 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-md shadow-emerald-900/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>
                {isSubmitting
                  ? 'Processing...'
                  : markAsAlreadyPurchased
                  ? 'Complete Purchase & Update Stock'
                  : 'Submit to Hostel Super'}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
