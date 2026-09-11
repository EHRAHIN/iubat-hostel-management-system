import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getToastStyle = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200';
      case 'error':
        return 'bg-red-950/90 border-red-500/40 text-red-200';
      default:
        return 'bg-slate-900/90 border-indigo-500/40 text-slate-200';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle size={18} className="text-red-400 shrink-0" />;
      default:
        return <Info size={18} className="text-indigo-400 shrink-0" />;
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl max-w-sm transition-all duration-300 animate-fade-in ${getToastStyle()}`}>
      {getIcon()}
      <p className="text-xs font-medium flex-1">{toast.message}</p>
      <button 
        className="p-1 rounded-md hover:bg-white/10 opacity-75 hover:opacity-100 transition-opacity" 
        onClick={onClose}
        aria-label="Close notification"
      >
        <X size={13} />
      </button>
    </div>
  );
}
