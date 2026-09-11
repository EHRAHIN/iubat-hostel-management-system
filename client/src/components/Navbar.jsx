import React, { useState } from 'react';
import { 
  Building2, 
  Sun, 
  Moon, 
  LogIn, 
  Menu, 
  X, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Activity
} from 'lucide-react';

export default function Navbar({ 
  darkMode, 
  onToggleTheme, 
  onOpenPortalModal, 
  onOpenApplyModal,
  currentView,
  onNavigateHome
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 dark:bg-[#060911]/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Institution OS */}
        <button 
          onClick={onNavigateHome}
          className="flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 font-bold text-sm group-hover:scale-105 transition-transform">
            <Building2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                IUBAT
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                Hostel System
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>IUBAT Hostel Seat Management System</span>
            </p>
          </div>
        </button>

        {/* Navigation Links */}
        {currentView === 'home' ? (
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#vacancy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
              <span>Seat Vacancy</span>
            </a>
            <a href="#portals" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
              <span>6 Institutional Portals</span>
            </a>
            <a href="#services" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Services & AI Engine
            </a>
            <a href="#notices" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Notices & Circulars
            </a>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onNavigateHome}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Back to Public Overview</span>
            </button>
          </div>
        )}

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          
          {/* Day / Night Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold transition-colors"
            title={darkMode ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)'}
            aria-label="Toggle Day and Night Mode"
          >
            {darkMode ? (
              <>
                <Sun size={15} className="text-amber-400 animate-spin-slow" />
                <span className="text-[11px]">Day</span>
              </>
            ) : (
              <>
                <Moon size={15} className="text-slate-600" />
                <span className="text-[11px]">Night</span>
              </>
            )}
          </button>

          {/* Register Button */}
          <button
            onClick={() => onOpenPortalModal('student', 'register')}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all hover:scale-[1.02]"
          >
            Register
          </button>

          {/* Portal Login CTA */}
          <button
            onClick={() => onOpenPortalModal('student', 'login')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-900/20 transition-all hover:shadow-lg hover:shadow-emerald-900/30 hover:scale-[1.02]"
          >
            <LogIn size={14} />
            <span>Portal Login</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          >
            {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 py-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#060911]/95 backdrop-blur-xl space-y-3">
          <a 
            href="#vacancy" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 py-1"
          >
            Seat Vacancy Radar
          </a>
          <a 
            href="#portals" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 py-1"
          >
            6 Institutional Portals
          </a>
          <a 
            href="#services" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 py-1"
          >
            System Capabilities
          </a>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPortalModal('student', 'register');
              }}
              className="flex-1 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-center"
            >
              Register
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPortalModal('student', 'login');
              }}
              className="flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white text-center"
            >
              Portal Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
