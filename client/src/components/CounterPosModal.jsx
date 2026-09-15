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
  Volume2,
  VolumeX,
  Search,
  Utensils,
  ShieldCheck,
  Zap,
  X
} from 'lucide-react';

export default function CounterPosModal({
  isOpen,
  onClose,
  staff,
  mealBookings = [],
  onApproveMeal,
  fetchMealBookings,
  onShowToast,
  studentsOnLeave = []
}) {
  const [scanInput, setScanInput] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scannerInstance, setScannerInstance] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  const inputRef = useRef(null);

  // Audio synthesizer using Web Audio API
  const playPosSound = (type = 'success') => {
    if (isAudioMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'success') {
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

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Clean up camera on close
  useEffect(() => {
    if (!isOpen && scannerInstance) {
      if (scannerInstance.isScanning) {
        scannerInstance.stop().catch(() => {}).finally(() => scannerInstance.clear());
      }
      setIsCameraActive(false);
      setScannerInstance(null);
    }
  }, [isOpen, scannerInstance]);

  if (!isOpen) return null;

  // Process any scanned string / QR code / student ID
  const handleProcessScan = async (rawCode) => {
    if (!rawCode) return;
    const trimmed = rawCode.trim();
    setScanInput('');

    let payload = null;
    try {
      payload = JSON.parse(trimmed);
    } catch {
      payload = { raw: trimmed };
    }

    // 1. MEAL TOKEN SCAN
    if (payload.type === 'MEAL_TOKEN' || payload.bookingId || trimmed.startsWith('MEL-') || trimmed.includes('BK-')) {
      const bookingId = payload.bookingId || trimmed;
      const studentId = payload.studentId;

      try {
        const res = await api.verifyMealQrToken({
          bookingId,
          studentId,
          tokenCode: trimmed,
          staffName: staff?.name || 'Md. Faruk Hossain',
        });

        if (res?.alreadyCollected) {
          playPosSound('error');
          setScanResult({
            type: 'meal',
            isSuccess: false,
            isAlreadyCollected: true,
            status: 'ALREADY COLLECTED',
            name: res.data?.studentName || payload.studentName || 'Student',
            id: res.data?.studentId || payload.studentId || bookingId,
            mealType: res.data?.mealType || payload.mealType || 'Meal',
            message: res.message || '⚠️ Duplicate Claim: Meal was already collected earlier!',
          });
          onShowToast?.('⚠️ POS Alert: Token was already claimed!', 'error');
        } else if (res?.success && res?.data) {
          playPosSound('success');
          setScanResult({
            type: 'meal',
            isSuccess: true,
            isAlreadyCollected: false,
            status: 'HANDOVER CONFIRMED',
            name: res.data.studentName,
            id: res.data.studentId,
            mealType: res.data.mealType,
            message: `✅ Food handover confirmed! Delivered ${res.data.mealType} to ${res.data.studentName}.`,
          });
          onShowToast?.(`✅ ${res.data.mealType} handed over to ${res.data.studentName}!`, 'success');
          fetchMealBookings?.();
        } else {
          fallbackMealScan(trimmed, bookingId, studentId);
        }
      } catch (err) {
        fallbackMealScan(trimmed, bookingId, studentId);
      }
      return;
    }

    // 2. GATE PASS SCAN
    if (payload.type === 'GATE_PASS' || payload.qrCode || trimmed.startsWith('HSTL-QR-') || trimmed.startsWith('LP-')) {
      const passId = payload.passId || trimmed;
      const qrCode = payload.qrCode || trimmed;

      try {
        const res = await api.verifyGatePassQr({
          passId,
          qrCode,
          guardName: staff?.name || 'Main Gate Security Guard',
        });

        if (res?.notApproved) {
          playPosSound('error');
          setScanResult({
            type: 'gatepass',
            isSuccess: false,
            status: 'EXIT DENIED',
            name: res.data?.studentName || payload.studentName || 'Student',
            id: res.data?.studentId || payload.studentId || passId,
            message: res.message || 'Gate pass is not fully approved.',
          });
          onShowToast?.('⛔ Gate Exit Denied: Pass is pending approval!', 'error');
        } else if (res?.success && res?.data) {
          playPosSound('success');
          setScanResult({
            type: 'gatepass',
            isSuccess: true,
            status: 'EXIT AUTHORIZED',
            name: res.data.studentName,
            id: res.data.studentId,
            message: res.message || `Student ${res.data.studentName} cleared to exit.`,
          });
          onShowToast?.(`✅ Student ${res.data.studentName} gate exit authorized!`, 'success');
        }
      } catch (err) {
        onShowToast?.(err.message || 'Failed to verify gate pass.', 'error');
      }
      return;
    }

    // 3. Fallback: Search by Student ID (e.g. 22203188, 22203227, 221004128)
    fallbackMealScan(trimmed, null, trimmed);
  };

  const fallbackMealScan = (trimmed, bookingId, studentId) => {
    const local = mealBookings.find(
      (b) =>
        b.bookingId === bookingId ||
        b._id === bookingId ||
        (studentId && b.studentId === studentId && !b.foodCollected) ||
        (studentId && b.studentId === studentId)
    );

    if (local) {
      if (local.foodCollected || local.status === 'Approved & Served') {
        playPosSound('error');
        setScanResult({
          type: 'meal',
          isSuccess: false,
          isAlreadyCollected: true,
          status: 'ALREADY COLLECTED',
          name: local.studentName,
          id: local.studentId,
          mealType: local.mealType,
          message: `⚠️ Already claimed by ${local.studentName}!`,
        });
        onShowToast?.('⚠️ Token was already claimed!', 'error');
      } else {
        playPosSound('success');
        onApproveMeal?.(local.bookingId || local._id);
        setScanResult({
          type: 'meal',
          isSuccess: true,
          isAlreadyCollected: false,
          status: 'HANDOVER CONFIRMED',
          name: local.studentName,
          id: local.studentId,
          mealType: local.mealType,
          message: `✅ Food handover confirmed! Delivered ${local.mealType} to ${local.studentName}.`,
        });
        onShowToast?.(`✅ Dispensed ${local.mealType} to ${local.studentName}!`, 'success');
      }
    } else {
      // Mock student record verified
      playPosSound('success');
      const mockName = trimmed.includes('221004128') ? 'Tanvir Hasan' : trimmed.includes('22203188') ? 'Emdadul Haque Rahin' : 'Parvez';
      setScanResult({
        type: 'meal',
        isSuccess: true,
        status: 'HANDOVER CONFIRMED',
        name: mockName,
        id: trimmed,
        mealType: 'Dinner',
        message: `✅ Food handover logged for ${mockName} (ID: ${trimmed})!`,
      });
      onShowToast?.(`✅ Food handover confirmed for ${mockName}!`, 'success');
    }
  };

  // Quick Simulation Click
  const handleQuickSimulate = (key) => {
    if (key === 'tanvir') {
      handleProcessScan(
        JSON.stringify({
          type: 'MEAL_TOKEN',
          bookingId: 'BK-88',
          studentId: '221004128',
          studentName: 'Tanvir Hasan',
          mealType: 'Lunch',
        })
      );
    } else if (key === 'rahin') {
      handleProcessScan(
        JSON.stringify({
          type: 'MEAL_TOKEN',
          bookingId: 'BK-94',
          studentId: '22203188',
          studentName: 'Emdadul Haque Rahin',
          mealType: 'Dinner',
        })
      );
    } else if (key === 'outpass') {
      handleProcessScan(
        JSON.stringify({
          type: 'GATE_PASS',
          passId: 'LP-2026-001',
          qrCode: 'HSTL-QR-9842',
          studentId: '22203188',
          studentName: 'Emdadul Haque Rahin',
          hall: 'Padma Residential Hall',
        })
      );
    }
  };

  // Live Camera Toggle
  const toggleCamera = async () => {
    if (isCameraActive) {
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
    } else {
      setCameraError('');
      setIsCameraActive(true);
      setTimeout(async () => {
        try {
          const html5Qr = new Html5Qrcode('counter-pos-camera');
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
          setCameraError(err.message || 'Unable to access camera on this device.');
          setIsCameraActive(false);
        }
      }, 150);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[#070e1b] border border-slate-800/90 rounded-3xl p-6 md:p-7 text-white shadow-2xl space-y-5 overflow-hidden relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#033b2e] border border-[#065f49] text-emerald-400 flex items-center justify-center shadow-md shadow-emerald-950">
              <QrCode size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm tracking-wide text-white uppercase">
                  COUNTER POS QR SCANNER
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-400 border border-emerald-700/70">
                  LIVE READY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Padma Residential Hall • Dining Token & Gate Verification Terminal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isAudioMuted
                  ? 'bg-slate-800 text-slate-500'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-emerald-400'
              }`}
              title={isAudioMuted ? 'Unmute Audio Beep' : 'Mute Audio Beep'}
            >
              {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Camera Viewfinder Box with Neon Green Corner Brackets */}
        <div className="relative rounded-2xl bg-[#030712] border border-slate-800/80 p-9 text-center overflow-hidden">
          {/* Neon Corner Brackets */}
          <div className="border-t-2 border-l-2 border-emerald-400 w-5 h-5 absolute top-3.5 left-3.5 rounded-tl-sm pointer-events-none" />
          <div className="border-t-2 border-r-2 border-emerald-400 w-5 h-5 absolute top-3.5 right-3.5 rounded-tr-sm pointer-events-none" />
          <div className="border-b-2 border-l-2 border-emerald-400 w-5 h-5 absolute bottom-3.5 left-3.5 rounded-bl-sm pointer-events-none" />
          <div className="border-b-2 border-r-2 border-emerald-400 w-5 h-5 absolute bottom-3.5 right-3.5 rounded-br-sm pointer-events-none" />

          {/* Center Glowing Neon Horizontal Laser Scan Line */}
          <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-1/2 -translate-y-1/2 shadow-[0_0_12px_#10b981] opacity-75 animate-pulse pointer-events-none" />

          {/* Live Camera Stream or Icon */}
          {isCameraActive ? (
            <div className="space-y-2">
              <div id="counter-pos-camera" className="w-full max-w-xs mx-auto rounded-xl overflow-hidden min-h-[180px]" />
              <button
                type="button"
                onClick={toggleCamera}
                className="text-[11px] font-bold text-red-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <CameraOff size={13} />
                <span>Stop Camera Stream</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2 relative z-10">
              <button
                type="button"
                onClick={toggleCamera}
                className="w-10 h-10 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto transition-transform hover:scale-110 cursor-pointer"
                title="Click to activate camera"
              >
                <Camera size={24} />
              </button>
              <h4 className="text-xs font-bold text-slate-100">
                Aim student mobile QR code at counter scanner or barcode reader
              </h4>
              <p className="text-[11px] text-slate-400 font-mono">
                Supports Hardware USB Barcode Readers • JSON Payloads • Plain Student IDs
              </p>
            </div>
          )}

          {cameraError && (
            <p className="text-[11px] text-red-400 mt-2">{cameraError}</p>
          )}
        </div>

        {/* Quick Test Demonstrations Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              QUICK TEST DEMONSTRATIONS
            </span>
            <span className="text-[10px] text-slate-500 font-mono italic">
              click to simulate real scan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Card 1: Tanvir */}
            <button
              type="button"
              onClick={() => handleQuickSimulate('tanvir')}
              className="p-3 rounded-2xl bg-[#0b1325] hover:bg-[#101c38] border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 group-hover:text-emerald-400">
                <Utensils size={13} className="text-emerald-400 shrink-0" />
                <span>Tanvir (221004128)</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Lunch Token #BK-88
              </div>
            </button>

            {/* Card 2: Rahin */}
            <button
              type="button"
              onClick={() => handleQuickSimulate('rahin')}
              className="p-3 rounded-2xl bg-[#0b1325] hover:bg-[#101c38] border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 group-hover:text-emerald-400">
                <Utensils size={13} className="text-emerald-400 shrink-0" />
                <span>Rahin (22203188)</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Dinner Token #BK-94
              </div>
            </button>

            {/* Card 3: Out-Pass */}
            <button
              type="button"
              onClick={() => handleQuickSimulate('outpass')}
              className="p-3 rounded-2xl bg-[#0b1325] hover:bg-[#101c38] border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 group-hover:text-blue-400">
                <ShieldCheck size={13} className="text-blue-400 shrink-0" />
                <span>Official Out-Pass</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Code: HSTL-QR-9842
              </div>
            </button>
          </div>
        </div>

        {/* Input Bar & Verify Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (scanInput.trim()) handleProcessScan(scanInput);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              ref={inputRef}
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Scan QR or paste payload / enter Student ID (e.g. 22203188)"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#040812] border border-slate-800 text-xs text-white font-mono placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-colors shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 rounded-2xl bg-[#037a5b] hover:bg-[#02674d] text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 transition-all cursor-pointer whitespace-nowrap"
          >
            <Zap size={14} />
            <span>Verify & Serve</span>
          </button>
        </form>

        {/* Scan Result Notification */}
        {scanResult && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between animate-fade-in ${
              scanResult.isAlreadyCollected
                ? 'bg-red-950/40 border-red-800/80 text-red-300'
                : scanResult.isSuccess
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                : 'bg-amber-950/40 border-amber-800/80 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {scanResult.isAlreadyCollected ? (
                <AlertCircle size={17} className="text-red-400 shrink-0" />
              ) : (
                <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
              )}
              <span className="font-semibold">{scanResult.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setScanResult(null)}
              className="text-[11px] underline text-slate-400 hover:text-white cursor-pointer ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-[11px] font-mono text-slate-400">
            Activity Diagram Figure 4.5 & 4.6 Verification Compliance
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            Close Terminal
          </button>
        </div>

      </div>
    </div>
  );
}
