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
    <header className="sticky top-0 z-50 ios-glass-nav transition-all">
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
              <span>User Portals</span>
            </a>
            <a href="#services" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Hostel Services
            </a>
            <a href="#notices" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Notices & Announcements
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
            className="ios-glass-pill ios-tap-active flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
            title={darkMode ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)'}
            aria-label="Toggle Day and Night Mode"
          >
            {darkMode ? (
              <>
                <Sun size={14} className="text-amber-400 animate-spin-slow" />
                <span className="text-[11px] font-medium">Day</span>
              </>
            ) : (
              <>
                <Moon size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-[11px] font-medium">Night</span>
              </>
            )}
          </button>

          {/* Register Button */}
          <button
            onClick={() => onOpenPortalModal('student', 'register')}
            className="ios-glass-pill ios-tap-active px-4 py-2 text-xs font-bold rounded-full text-slate-800 dark:text-slate-100 cursor-pointer"
          >
            Register
          </button>

          {/* Portal Login CTA */}
          <button
            onClick={() => onOpenPortalModal('student', 'login')}
            className="ios-tap-active flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-700/25 border border-white/25 cursor-pointer"
          >
            <LogIn size={14} />
            <span>Portal Login</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="ios-glass-pill ios-tap-active p-2 rounded-full text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-600" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ios-glass-pill ios-tap-active p-2 rounded-full text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 py-4 border-t border-slate-200/60 dark:border-slate-800/60 ios-glass space-y-3 animate-fade-in">
          <a
            href="#vacancy"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 py-1"
          >
            Seat Vacancy
          </a>
          <a
            href="#portals"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 py-1"
          >
            User Portals
          </a>
          <a
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 py-1"
          >
            Hostel Services
          </a>
          <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPortalModal('student', 'register');
              }}
              className="ios-glass-pill ios-tap-active flex-1 py-2 text-xs font-bold rounded-full text-slate-900 dark:text-white text-center cursor-pointer"
            >
              Register
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPortalModal('student', 'login');
              }}
              className="ios-tap-active flex-1 py-2 text-xs font-bold rounded-full bg-emerald-600 text-white text-center shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              Portal Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
