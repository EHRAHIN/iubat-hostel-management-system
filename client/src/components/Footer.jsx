import React from 'react';
import { Building2, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-[#060911]/90 backdrop-blur-xl py-12 text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-200/80 dark:border-slate-800/80">
          
          {/* Institution Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-emerald-900/20">
                <Building2 size={18} />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                  IUBAT Hostel Seat Management System
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Residential Services & Seat Allocation
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              International University of Business Agriculture and Technology residential hall administration, AI roommate pairing, and multi-tier governance platform.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>All Systems Operational (12ms)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Official Residential Halls
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#vacancy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Padma Residential Hall (Male • Floor 1 & 2)</a></li>
              <li><a href="#vacancy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Meghna Residential Hall (Female • Floor 1 & 2)</a></li>
              <li><a href="#portals" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Floor Teachers (4 House Tutors)</a></li>
              <li><a href="#portals" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Provost & Chief Warden Office</a></li>
            </ul>
          </div>

          {/* Institutional Services */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Core Capabilities
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#services" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Smart Searching Roommate</a></li>
              <li><a href="#services" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">4-Tier Maintenance Chain</a></li>
              <li><a href="#services" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Night Roll-Call Roster</a></li>
              <li><a href="#services" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Mess & Dining Tokens</a></li>
            </ul>
          </div>

          {/* Contact & Campus Address */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Campus Location
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>4 Embankment Drive Road, Sector 10, Uttara Model Town, Dhaka-1230, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>+880 2 55091801-5</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>provost@iubat.edu</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Metadata */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© 2026 IUBAT Hostel Seat Management System. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="font-mono">MERN Stack Enterprise Architecture</span>
            <span>•</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">MongoDB Atlas Live</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
