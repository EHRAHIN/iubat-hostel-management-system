import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Volume2,
  VolumeX,
  Sparkles,
  Search,
  User,
  Hash,
  Utensils,
  Sun,
  Moon,
  Coffee,
  RotateCcw,
  Zap,
  Check,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function DiningPosTerminal({
  staff,
  mealBookings = [],
  onApproveMeal,
  fetchMealBookings,
  onShowToast,
  studentsOnLeave = []
}) {
  // POS Terminal Operational State
  const [activeMealWindow, setActiveMealWindow] = useState('Lunch');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [scanInput, setScanInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scannerInstance, setScannerInstance] = useState(null);

  // Current live POS scan result & printable slip
  const [posResult, setPosResult] = useState(null);
  const [recentPosLogs, setRecentPosLogs] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Input ref to keep focus for barcode/QR scanner gun
  const inputRef = useRef(null);
  const slipPrintRef = useRef(null);

  // Live Clock & Auto-detect meal slot
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
      const hours = now.getHours();
      if (hours >= 6 && hours < 11) setActiveMealWindow('Breakfast');
      else if (hours >= 11 && hours < 17) setActiveMealWindow('Lunch');
      else setActiveMealWindow('Dinner');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio API POS sound synthesizer (No external audio files needed)
  const playPosSound = (type = 'success') => {
    if (!isAudioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'success') {
        // High-pitched cheerful POS Beep-Beep (880Hz then 1320Hz)
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);
        gain1.gain.setValueAtTime(0.15, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.1);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1320, now + 0.12);
        gain2.gain.setValueAtTime(0.18, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.25);
      } else {
        // Low double buzz error warning (220Hz)
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  };

  // Keep scanner gun input focused
  useEffect(() => {
    if (!isCameraActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [posResult, isCameraActive]);

  // Main POS Dispatch & Handover Handler
  const handleProcessScan = async (rawString) => {
    if (!rawString) return;
    const trimmed = rawString.trim();
    setScanInput('');

    let payload = null;
    try {
      payload = JSON.parse(trimmed);
    } catch {
      payload = { raw: trimmed };
    }

    const bookingId = payload.bookingId || trimmed;
    const studentId = payload.studentId || (trimmed.match(/^\d{6,10}$/) ? trimmed : null);

    try {
      const res = await api.verifyMealQrToken({
        bookingId,
        studentId,
        tokenCode: trimmed,
        staffName: staff.name,
      });

      if (res?.alreadyCollected) {
        playPosSound('error');
        const errObj = {
          isSuccess: false,
          isAlreadyCollected: true,
          status: 'ALREADY COLLECTED',
          name: res.data?.studentName || payload.studentName || 'Student',
          id: res.data?.studentId || payload.studentId || bookingId,
          mealType: res.data?.mealType || payload.mealType || activeMealWindow,
          date: res.data?.date || payload.date || 'Today',
          time: res.data?.collectedAt ? new Date(res.data.collectedAt).toLocaleTimeString() : 'Earlier Today',
          serverStaff: res.data?.collectedByStaff || 'Dining Staff',
          message: res.message || 'Warning: Meal token already claimed!',
        };
        setPosResult(errObj);
        onShowToast('⚠️ POS Alert: Token was already claimed!', 'error');
      } else if (res?.success && res?.data) {
        playPosSound('success');
        const successObj = {
          isSuccess: true,
          isAlreadyCollected: false,
          status: 'HANDOVER CONFIRMED',
          bookingId: res.data.bookingId,
          name: res.data.studentName,
          id: res.data.studentId,
          mealType: res.data.mealType,
          date: res.data.date || 'Today',
          diet: res.data.diet || 'Standard Meal',
          tokenCostBDT: res.data.tokenCostBDT || (res.data.mealType === 'Breakfast' ? 30 : 50),
          time: new Date().toLocaleTimeString(),
          serverStaff: staff.name,
          counter: 'Counter #1 (Main Serving Line)',
          message: `Food handover logged! Delivered ${res.data.mealType} to ${res.data.studentName}.`,
        };
        setPosResult(successObj);
        setRecentPosLogs((prev) => [successObj, ...prev.slice(0, 9)]);
        onShowToast(`✅ Dispensed ${res.data.mealType} to ${res.data.studentName}!`, 'success');
        if (fetchMealBookings) fetchMealBookings();
      } else {
        // Try fallback
        handleFallbackLocalScan(trimmed, bookingId, studentId);
      }
    } catch (err) {
      handleFallbackLocalScan(trimmed, bookingId, studentId);
    }
  };

  const handleFallbackLocalScan = (trimmed, bookingId, studentId) => {
    const local = mealBookings.find(
      (b) =>
        b.bookingId === bookingId ||
        b._id === bookingId ||
        (studentId && b.studentId === studentId && b.mealType === activeMealWindow) ||
        (studentId && b.studentId === studentId && !b.foodCollected)
    );

    if (local) {
      if (local.foodCollected || local.status === 'Approved & Served') {
        playPosSound('error');
        const errObj = {
          isSuccess: false,
          isAlreadyCollected: true,
          status: 'ALREADY COLLECTED',
          name: local.studentName,
          id: local.studentId,
          mealType: local.mealType,
          date: local.date || 'Today',
          time: local.collectedAt ? new Date(local.collectedAt).toLocaleTimeString() : 'Earlier Today',
          serverStaff: local.collectedByStaff || staff.name,
          message: `⚠️ Already claimed by ${local.studentName}!`,
        };
        setPosResult(errObj);
        onShowToast('⚠️ Token was already claimed!', 'error');
      } else {
        playPosSound('success');
        if (onApproveMeal) onApproveMeal(local.bookingId || local._id);
        const successObj = {
          isSuccess: true,
          isAlreadyCollected: false,
          status: 'HANDOVER CONFIRMED',
          bookingId: local.bookingId,
          name: local.studentName,
          id: local.studentId,
          mealType: local.mealType,
          date: local.date || 'Today',
          diet: local.diet || 'Standard Meal',
          tokenCostBDT: local.tokenCostBDT || 50,
          time: new Date().toLocaleTimeString(),
          serverStaff: staff.name,
          counter: 'Counter #1 (Main Serving Line)',
          message: `Food handover logged! Delivered ${local.mealType} to ${local.studentName}.`,
        };
        setPosResult(successObj);
        setRecentPosLogs((prev) => [successObj, ...prev.slice(0, 9)]);
        onShowToast(`✅ Dispensed ${local.mealType} to ${local.studentName}!`, 'success');
      }
    } else {
      playPosSound('error');
      onShowToast(`No matching meal token found for '${trimmed}'.`, 'error');
    }
  };

  // Touch Numpad Tap
  const handleNumpadPress = (val) => {
    if (val === 'CLEAR') {
      setScanInput('');
    } else if (val === 'ENTER') {
      if (scanInput.trim()) handleProcessScan(scanInput);
    } else {
      setScanInput((prev) => prev + val);
    }
  };

  // Camera Scanner Setup
  const startCameraScanner = async () => {
    setCameraError('');
    setIsCameraActive(true);
    setTimeout(async () => {
      try {
        const html5Qr = new Html5Qrcode('pos-qr-reader');
        setScannerInstance(html5Qr);
        await html5Qr.start(
          { facingMode: 'environment' },
          { fps: 12, qrbox: { width: 220, height: 220 } },
          (decoded) => {
            handleProcessScan(decoded);
          },
          () => {}
        );
      } catch (err) {
        setCameraError(err.message || 'Camera access not available on this device.');
        setIsCameraActive(false);
      }
    }, 150);
  };

  const stopCameraScanner = async () => {
    if (scannerInstance) {
      try {
        if (scannerInstance.isScanning) await scannerInstance.stop();
        scannerInstance.clear();
      } catch (e) {
        console.warn(e);
      }
      setScannerInstance(null);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (scannerInstance && scannerInstance.isScanning) {
        scannerInstance.stop().catch(() => {}).finally(() => scannerInstance.clear());
      }
    };
  }, [scannerInstance]);

  // Counts for POS counter header
  const todayServedCount = mealBookings.filter((b) => b.foodCollected || b.status === 'Approved & Served').length;
  const pendingInQueue = mealBookings.filter((b) => !b.foodCollected && b.status !== 'Approved & Served');

  return (
    <div className="space-y-6">
      
      {/* 1. POS Terminal Top Dashboard Header Bar */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-2xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
            POS
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Dining Hall Counter POS Terminal</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                  ● LIVE SERVING LINE
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Padma Residential Hall • Counter #1 • In-Charge: <strong className="text-white">{staff.name}</strong>
            </p>
          </div>
        </div>

        {/* Live POS Clock & Meal Window Switcher */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Audio Beep Switch */}
          <button
            type="button"
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isAudioEnabled
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={isAudioEnabled ? 'POS Audio Beep is ON' : 'POS Audio Muted'}
          >
            {isAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Time Pill */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 font-mono font-bold text-amber-400">
            ⏱ {currentTime}
          </div>

          {/* Active Serving Slot Selector */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            {['Breakfast', 'Lunch', 'Dinner'].map((slot) => {
              const isActive = activeMealWindow === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setActiveMealWindow(slot)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {slot === 'Breakfast' ? '🍳 Breakfast' : slot === 'Lunch' ? '🍛 Lunch' : '🍲 Dinner'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Three POS Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-medium">Meals Served Today</span>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-0.5">
              {todayServedCount} Plates
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
              ✓ Food Handed Over
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-medium">Pending in Counter Queue</span>
            <div className="text-2xl font-black text-amber-600 font-mono mt-0.5">
              {pendingInQueue.length} Students
            </div>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
              ⏳ Awaiting Collection
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-medium">Active Dining Shift</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {activeMealWindow} Line
            </div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
              Counter #1 • Open Access
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <Utensils size={20} />
          </div>
        </div>
      </div>

      {/* 3. Main Counter Workspace: Left Side (Scanner Gun & Numpad) + Right Side (POS Food Slip & Result) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: POS Scanner Inputs (8 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            {/* Auto-focused Barcode / QR Scanner Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-500 animate-bounce" />
                  <span>USB Laser Gun / High-Speed POS Barcode Scanner</span>
                </label>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                  AUTO-FOCUS ACTIVE
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (scanInput.trim()) handleProcessScan(scanInput);
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="Scan Student QR Code or Type Token Ref (e.g. MEL-104 / 22203188)..."
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#060911] border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-sm outline-none focus:border-amber-500 transition-all shadow-inner"
                  />
                  <Search size={18} className="absolute left-3.5 top-4 text-slate-400" />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-600/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  Confirm & Serve
                </button>
              </form>
              <p className="text-[11px] text-slate-400">
                Point any hardware laser barcode scanner at student's mobile screen or enter code and press Enter.
              </p>
            </div>

            {/* Camera Scanner Toggle Option */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">Device Webcam Option:</span>
              {!isCameraActive ? (
                <button
                  type="button"
                  onClick={startCameraScanner}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera size={14} />
                  <span>Start Camera Scanner</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCameraScanner}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CameraOff size={14} />
                  <span>Stop Camera</span>
                </button>
              )}
            </div>

            {isCameraActive && (
              <div className="p-3 bg-slate-950 rounded-2xl border-2 border-emerald-500 shadow-inner overflow-hidden max-w-sm mx-auto space-y-2">
                <div id="pos-qr-reader" className="w-full rounded-xl overflow-hidden min-h-[220px]"></div>
                <p className="text-[10px] text-emerald-400 font-mono text-center animate-pulse">
                  📷 POS Camera Active • Hold QR Code in Front of Camera
                </p>
              </div>
            )}

            {cameraError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 text-xs">
                {cameraError}
              </div>
            )}

            {/* Rapid On-Screen Touch Numpad (For Touchscreen POS Monitors) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Touch Numpad (Quick Student ID Entry):
              </span>
              <div className="grid grid-cols-6 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'CLEAR', 'ENTER'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleNumpadPress(key)}
                    className={`py-2 rounded-xl font-bold font-mono text-xs transition-all cursor-pointer ${
                      key === 'ENTER'
                        ? 'col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        : key === 'CLEAR'
                        ? 'bg-red-50 dark:bg-red-950/50 text-red-600 border border-red-200 dark:border-red-800'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Fast-Track Counter Queue Table (1-Click Serve for Presentation / Viva) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Next Students in Queue (Instant 1-Click Dispense):</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {pendingInQueue.length} waiting
                </span>
              </div>

              {pendingInQueue.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#060911] text-center text-xs text-slate-500">
                  🎉 Counter queue is empty! All applied tokens have been served.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {pendingInQueue.slice(0, 5).map((b) => (
                    <div
                      key={b._id || b.bookingId}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {b.studentName}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px] ml-1.5">
                          ID: {b.studentId} • {b.mealType}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleProcessScan(
                            JSON.stringify({
                              type: 'MEAL_TOKEN',
                              bookingId: b.bookingId,
                              studentId: b.studentId,
                              studentName: b.studentName,
                              mealType: b.mealType,
                              date: b.date,
                            })
                          )
                        }
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-colors cursor-pointer"
                      >
                        ⚡ Dispense Plate
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: POS Slip & Receipt Output (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Printer size={15} className="text-slate-500" />
                <span>POS Kitchen Food Handover Slip</span>
              </h3>
              {posResult?.isSuccess && (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                >
                  <Printer size={12} />
                  <span>Print Slip</span>
                </button>
              )}
            </div>

            {/* Dynamic POS Slip Preview */}
            {!posResult ? (
              <div className="py-16 text-center space-y-2 text-slate-400 text-xs">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <QrCode size={24} />
                </div>
                <p className="font-semibold text-slate-500">Counter Waiting for Scan...</p>
                <p className="text-[11px] text-slate-400">
                  Scan a QR code or student token to generate the official dining handover voucher.
                </p>
              </div>
            ) : posResult.isAlreadyCollected ? (
              <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 space-y-3 animate-shake">
                <div className="flex items-center gap-2">
                  <AlertCircle size={24} className="text-red-600 shrink-0" />
                  <div>
                    <h4 className="font-black text-sm text-red-700 dark:text-red-300">
                      DUPLICATE CLAIM DETECTED!
                    </h4>
                    <p className="text-[11px] text-red-600 dark:text-red-400">
                      This token has already been served and cannot be reused.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/60 dark:bg-black/30 font-mono text-xs space-y-1">
                  <div>Student: <strong>{posResult.name}</strong> ({posResult.id})</div>
                  <div>Meal: <strong>{posResult.mealType}</strong> ({posResult.date})</div>
                  <div>Previously Served At: <strong>{posResult.time}</strong></div>
                  <div>Processed By: <strong>{posResult.serverStaff}</strong></div>
                </div>
              </div>
            ) : (
              /* Realistic Thermal POS Food Slip */
              <div
                ref={slipPrintRef}
                className="p-5 rounded-2xl bg-amber-50/50 dark:bg-[#060911] border-2 border-dashed border-amber-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs space-y-3 shadow-inner"
              >
                <div className="text-center pb-2 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-0.5">
                  <div className="font-black text-sm tracking-wider">IUBAT DINING HALL POS</div>
                  <div className="text-[10px] text-slate-500">PADMA RESIDENTIAL FOOD SERVICE</div>
                  <div className="text-[10px] text-emerald-600 font-bold">*** MEAL DISPENSED ***</div>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Token Ref:</span>
                    <strong>#{posResult.bookingId || 'MEL-AUTO'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Student:</span>
                    <strong>{posResult.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Student ID:</span>
                    <strong>{posResult.id}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Meal Slot:</span>
                    <strong className="text-amber-600 dark:text-amber-400">
                      {posResult.mealType}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Diet Items:</span>
                    <span>{posResult.diet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Counter:</span>
                    <span>{posResult.counter}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dispense Time:</span>
                    <span>{posResult.time}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-dashed border-slate-300 dark:border-slate-700 font-bold">
                    <span>Dining Charge:</span>
                    <span className="text-emerald-600">৳{posResult.tokenCostBDT} BDT (PAID)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 text-center text-[10px] text-slate-500 space-y-1">
                  <div>Server Staff: {posResult.serverStaff}</div>
                  <div className="font-bold tracking-widest text-[9px] uppercase">
                    ||||| | ||||| ||| |||| | |||||
                  </div>
                  <div>Thank you! Please present slip at plate pickup.</div>
                </div>
              </div>
            )}

            {/* Recent POS Serving Transaction Stream */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Recent Handover Log (This Counter Session):
              </span>
              {recentPosLogs.length === 0 ? (
                <p className="text-[11px] text-slate-400">No meals dispensed yet this session.</p>
              ) : (
                <div className="space-y-1 text-xs">
                  {recentPosLogs.slice(0, 4).map((log, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-500 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {log.name}
                        </span>
                        <span className="text-slate-400 font-mono">({log.mealType})</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px]">{log.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
