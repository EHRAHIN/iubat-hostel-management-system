import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Wrench,
  Users,
  Crown,
  LogIn,
  UserPlus,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building2,
  Building,
  Check,
  Lock,
  Mail,
  Phone,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';

export default function PortalLoginModal({
  isOpen,
  onClose,
  defaultRole = 'student',
  defaultMode = 'login', // 'login' or 'register'
  onLoginSuccess,
  onOpenSmartAssign,
}) {
  const [authMode, setAuthMode] = useState(defaultMode); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login Form State
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    rememberMe: true,
  });

  // Register Form State
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    userId: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: 'CSE',
    cgpa: '',
    phone: '',
    preferredHall: 'Padma Residential Hall',
    preferredCapacity: 2, // 1 | 2 | 4 persons
    guardianName: '',
    guardianPhone: '',
    agreeTerms: true,
  });

  // Dynamic Room Tariffs State & Sync
  const [roomTariffs, setRoomTariffs] = useState(() => {
    try {
      const saved = localStorage.getItem('hostel_tariff_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          single: Number(parsed.singleRoomRentBDT) || 5500,
          double: Number(parsed.doubleRoomRentBDT) || 3500,
          quad: Number(parsed.quadRoomRentBDT) || 2500,
        };
      }
    } catch (e) {}
    return { single: 5500, double: 3500, quad: 2500 };
  });

  useEffect(() => {
    if (isOpen) {
      setAuthMode(defaultMode || 'login');
      setSelectedRole(defaultRole || 'student');
      setErrorMsg('');
      setSuccessMsg('');

      const loadTariffs = async () => {
        try {
          const saved = localStorage.getItem('hostel_tariff_settings');
          if (saved) {
            const parsed = JSON.parse(saved);
            setRoomTariffs({
              single: Number(parsed.singleRoomRentBDT) || 5500,
              double: Number(parsed.doubleRoomRentBDT) || 3500,
              quad: Number(parsed.quadRoomRentBDT) || 2500,
            });
          }
          const res = await api.getRooms();
          if (res?.data && res.data.length > 0) {
            const s = res.data.find((r) => r.roomType?.includes('Single'))?.monthlyRent;
            const d = res.data.find((r) => r.roomType?.includes('Double'))?.monthlyRent;
            const q = res.data.find((r) => r.roomType?.includes('4-Bed') || r.roomType?.includes('Quad'))?.monthlyRent;
            setRoomTariffs((prev) => ({
              single: s || prev.single,
              double: d || prev.double,
              quad: q || prev.quad,
            }));
          }
        } catch (e) {}
      };

      loadTariffs();

      const handleTariffsUpdated = (e) => {
        if (e.detail?.singleRent || e.detail?.doubleRent || e.detail?.quadRent) {
          setRoomTariffs({
            single: Number(e.detail.singleRent) || 5500,
            double: Number(e.detail.doubleRent) || 3500,
            quad: Number(e.detail.quadRent) || 2500,
          });
        } else {
          loadTariffs();
        }
      };

      window.addEventListener('hostel_tariffs_updated', handleTariffsUpdated);
      return () => window.removeEventListener('hostel_tariffs_updated', handleTariffsUpdated);
    }
  }, [isOpen, defaultRole, defaultMode]);

  if (!isOpen) return null;

  // Institutional Roles Config
  const roles = [
    {
      id: 'student',
      name: 'Student',
      badge: 'Resident',
      icon: GraduationCap,
      email: '',
      desc: 'Roommate Matcher, Dining, Leave & Seat Allocation',
      placeholder: 'Enter Student Email or Student ID (e.g. 221004128)',
      label: 'Student Institutional Email or Student ID',
      hint: 'Enter your student ID or email and password',
    },
    {
      id: 'parent',
      name: 'Guardian / Parent',
      badge: 'Parent',
      icon: Users,
      email: '',
      desc: 'Log in with Student’s Email to view Attendance, Invoices & Safety',
      placeholder: 'Enter Student Ward ID (e.g. 221004128) or Email',
      label: 'Student Ward’s Institutional Email or Student ID',
      hint: 'Enter your student ward’s ID or email',
    },
    {
      id: 'teacher',
      name: 'Floor Teacher',
      badge: 'House Tutor',
      icon: UserCheck,
      email: '',
      desc: 'Daily Roll Call, Attendance & Leave Approvals',
      placeholder: 'tutor.padma1@hostel.edu or Tutor ID',
      label: 'Teacher Institutional Email / Tutor ID',
      hint: 'House Tutor credentials',
    },
    {
      id: 'staff',
      name: 'Staff (Dining / Mnt)',
      badge: 'Operations',
      icon: Wrench,
      email: '',
      desc: 'Repairs, Electricity, Net, Plumbing, Daily Bazar & Meal Approvals',
      placeholder: 'maintenance.padma@hostel.edu or Staff ID',
      label: 'Staff Institutional Email / Staff ID',
      hint: 'Maintenance / Dining staff credentials',
    },
    {
      id: 'super',
      name: 'Hostel Super',
      badge: 'Provost',
      icon: ShieldCheck,
      email: '',
      desc: 'Provost Approvals, Quotas & Hall Administration',
      placeholder: 'hostelsuper, provost@hostel.edu, or PRV-001',
      label: 'Hostel Super ID or Provost Email',
      hint: 'Provost office credentials',
    },
    {
      id: 'admin',
      name: 'Super Admin',
      badge: 'Root IT',
      icon: Crown,
      email: '',
      desc: 'Full Infrastructure, Hall Matrix & Audit Logs',
      placeholder: 'admin, admin.it@hostel.edu, or ADM-001',
      label: 'Admin ID or IT Administrator Email',
      hint: 'Central IT Division credentials',
    },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setErrorMsg('');
    setCredentials({ username: '', password: '', rememberMe: true });
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 6) strength += 25;
    if (pass.length >= 8) strength += 25;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    return Math.min(strength, 100);
  };

  const passwordStrength = getPasswordStrength(registerData.password);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await api.login({
        username: credentials.username,
        password: credentials.password,
        role: selectedRole,
      });

      setIsLoading(false);
      setSuccessMsg(response?.message || 'Authenticated successfully! Entering workspace...');

      setTimeout(() => {
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess(response.user?.role || selectedRole, response.user);
        }
      }, 500);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Authentication failed. Please check credentials or use default password: 123456');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!registerData.name || !registerData.email || !registerData.userId || !registerData.password) {
      setErrorMsg('Full Name, Email, Student ID, and Password are required.');
      return;
    }

    if (!registerData.guardianName || !registerData.guardianName.trim() || !registerData.guardianPhone || !registerData.guardianPhone.trim()) {
      setErrorMsg('Guardian Name and Guardian Emergency Phone are mandatory fields.');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    if (registerData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.register({
        name: registerData.name.trim(),
        email: registerData.email.trim(),
        userId: registerData.userId.trim(),
        password: registerData.password,
        department: registerData.department,
        cgpa: registerData.cgpa ? Number(registerData.cgpa) : 3.25,
        phone: registerData.phone ? registerData.phone.trim() : '',
        preferredHall: registerData.preferredHall,
        preferredCapacity: Number(registerData.preferredCapacity) || 2,
        preferredRoom:
          Number(registerData.preferredCapacity) === 1
            ? 'Single Deluxe Room'
            : Number(registerData.preferredCapacity) === 4
            ? '4-Bed Standard Room'
            : 'Double Shared Room',
        guardianName: registerData.guardianName ? registerData.guardianName.trim() : '',
        guardianPhone: registerData.guardianPhone ? registerData.guardianPhone.trim() : '',
      });

      setIsLoading(false);
      setSuccessMsg(res?.message || `Student account created successfully! Welcome, ${registerData.name}.`);

      setTimeout(() => {
        onClose();
        if (onLoginSuccess && res?.user) {
          const selectedCapacity = Number(registerData.preferredCapacity) || Number(res.user.preferredCapacity) || 2;
          const registeredStudent = {
            ...res.user,
            preferredCapacity: selectedCapacity,
            preferredRoom:
              selectedCapacity === 1
                ? 'Single Deluxe Room'
                : selectedCapacity === 4
                ? '4-Bed Standard Room'
                : 'Double Shared Room',
            allocationStatus: 'Pending Provost Approval',
            status: 'Active',
            room: '',
            seatNo: '',
          };
          onLoginSuccess('student', registeredStudent);

          // User Requirement:
          // "jodi student 2/4 joner room e select kore tahole smart room allocation er option asbe nahole asbe na jodi single room e apply kore."
          if (selectedCapacity === 2 || selectedCapacity === 4) {
            if (onOpenSmartAssign) {
              setTimeout(() => {
                onOpenSmartAssign(registeredStudent);
              }, 400);
            }
          }
        }
      }, 700);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Registration failed. An account may already exist with this Email or Student ID.');
    }
  };

  const currentRoleObj = roles.find((r) => r.id === selectedRole) || roles[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="ios-glass-modal w-full max-w-2xl my-8 rounded-3xl overflow-hidden transition-all bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-800 shadow-2xl">

        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 dark:from-emerald-950 dark:via-[#0c1a24] dark:to-slate-900 text-white border-b border-emerald-600/30">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <Building2 size={22} className="text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight">
                    Hostel Residence Portal
                  </h2>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200">
                    Smart Hall v2.0
                  </span>
                </div>
                <p className="text-xs text-emerald-100/80 mt-0.5">
                  Official Institutional Authentication & Workspace Access
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-emerald-100/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-5 p-1 bg-black/25 backdrop-blur-sm rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-emerald-100/80 hover:text-white hover:bg-white/5'
                }`}
            >
              <LogIn size={14} />
              <span>Institutional Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-emerald-100/80 hover:text-white hover:bg-white/5'
                }`}
            >
              <UserPlus size={14} />
              <span>Student Registration</span>
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-7 bg-white dark:bg-[#0d121f]">

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {authMode === 'login' && (
            <div className="space-y-4">

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Select Institutional Role:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const isSelected = selectedRole === r.id;

                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRoleSelect(r.id)}
                        className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${isSelected
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-600 dark:border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                            : 'bg-slate-50 dark:bg-[#060911] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                            <Icon size={14} />
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                            {r.badge}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate block">
                          {r.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 1-Click Fast Login Demo Credentials */}
              <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <Sparkles size={12} className="text-emerald-600" />
                      <span>1-Click Fast Login:</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Pass: 123456</span>
                  </div>
                  
                  {selectedRole === 'student' && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('');
                        setCredentials({ username: 'student.cse@hostel.edu', password: '123456', rememberMe: true });
                      }}
                      className="w-full text-left p-2 rounded-xl bg-white dark:bg-[#060911] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-xs font-semibold flex items-center justify-between text-slate-800 dark:text-slate-200 transition-colors shadow-xs"
                    >
                      <span>🎓 Student: Tanvir Hasan (221004128)</span>
                      <span className="text-[10px] font-bold text-emerald-600">Auto-fill ➔</span>
                    </button>
                  )}

                  {selectedRole === 'teacher' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMsg('');
                          setCredentials({ username: 'tutor.padma1@hostel.edu', password: '123456', rememberMe: true });
                        }}
                        className="text-left p-2 rounded-xl bg-white dark:bg-[#060911] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-[11px] font-semibold text-slate-800 dark:text-slate-200 transition-colors truncate"
                      >
                        <span>👨‍🏫 Dr. Tariqul (Fl 1)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMsg('');
                          setCredentials({ username: 'tutor.padma2@hostel.edu', password: '123456', rememberMe: true });
                        }}
                        className="text-left p-2 rounded-xl bg-white dark:bg-[#060911] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-[11px] font-semibold text-slate-800 dark:text-slate-200 transition-colors truncate"
                      >
                        <span>👨‍🏫 Prof. Anisur (Fl 2)</span>
                      </button>
                    </div>
                  )}

                  {selectedRole === 'super' && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('');
                        setCredentials({ username: 'provost@hostel.edu', password: '123456', rememberMe: true });
                      }}
                      className="w-full text-left p-2 rounded-xl bg-white dark:bg-[#060911] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-xs font-semibold flex items-center justify-between text-slate-800 dark:text-slate-200 transition-colors shadow-xs"
                    >
                      <span>🏛️ Hostel Super / Provost: Prof. Dr. Monirul Islam</span>
                      <span className="text-[10px] font-bold text-emerald-600">Auto-fill ➔</span>
                    </button>
                  )}

                  {selectedRole === 'staff' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMsg('');
                          setCredentials({ username: 'maintenance.padma@hostel.edu', password: '123456', rememberMe: true });
                        }}
                        className="text-left p-2 rounded-xl bg-white dark:bg-[#060911] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-[11px] font-semibold text-slate-800 dark:text-slate-200 transition-colors truncate"
                      >
                        <span>🛠️ Maintenance Staff</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMsg('');
                          setCredentials({ username: 'dining.padma@hostel.edu', password: '123456', rememberMe: true });
                        }}
                        className="text-left p-2 rounded-xl bg-white dark:bg-[#060911] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-[11px] font-semibold text-slate-800 dark:text-slate-200 transition-colors truncate"
                      >
                        <span>🍽️ Dining Staff</span>
                      </button>
                    </div>
                  )}

                  {selectedRole === 'parent' && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('');
                        setCredentials({ username: '221004128', password: '123456', rememberMe: true });
                      }}
                      className="w-full text-left p-2 rounded-xl bg-white dark:bg-[#060911] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-xs font-semibold flex items-center justify-between text-slate-800 dark:text-slate-200 transition-colors shadow-xs"
                    >
                      <span>👨‍👦 Guardian of Tanvir (Student ID: 221004128)</span>
                      <span className="text-[10px] font-bold text-emerald-600">Auto-fill ➔</span>
                    </button>
                  )}

                  {selectedRole === 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('');
                        setCredentials({ username: 'admin.it@hostel.edu', password: '123456', rememberMe: true });
                      }}
                      className="w-full text-left p-2 rounded-xl bg-white dark:bg-[#060911] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-xs font-semibold flex items-center justify-between text-slate-800 dark:text-slate-200 transition-colors shadow-xs"
                    >
                      <span>👑 Super Admin (Engr. Mahbubur Rahman)</span>
                      <span className="text-[10px] font-bold text-emerald-600">Auto-fill ➔</span>
                    </button>
                  )}
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {currentRoleObj.label}
                    </label>
                    <input
                      type="text"
                      value={credentials.username}
                      onChange={(e) => {
                        setErrorMsg('');
                        setCredentials({ ...credentials, username: e.target.value });
                      }}
                      placeholder={currentRoleObj.placeholder}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 dark:bg-[#131b2e]/80 dark:hover:bg-[#131b2e] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-[#0d121f] focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-xs"
                      required
                    />
                  </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Lock size={13} className="text-slate-400" />
                      <span>Security Password</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Please contact Central IT Division at support@hostel.edu or Room 204 to reset your portal password.')}
                      className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.password}
                      onChange={(e) => {
                        setErrorMsg('');
                        setCredentials({ ...credentials, password: e.target.value });
                      }}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50/70 hover:bg-slate-50 dark:bg-[#131b2e]/80 dark:hover:bg-[#131b2e] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-[#0d121f] focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={credentials.rememberMe}
                      onChange={(e) => setCredentials({ ...credentials, rememberMe: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 rounded border-slate-300 dark:border-slate-700 cursor-pointer"
                    />
                    <span>Remember institutional session</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">256-bit SSL</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50 mt-3"
                >
                  <span>{isLoading ? 'Verifying Credentials...' : `Enter ${currentRoleObj.name} Workspace`}</span>
                  <ArrowRight size={15} />
                </button>
              </form>

              {/* Bottom Quick Switch */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-500">
                <span>New student seeking hostel accommodation? </span>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Register as Student
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: REGISTER (STUDENTS ONLY) */}
          {/* ============================================================ */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs max-h-[60vh] overflow-y-auto pr-1">

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    placeholder="e.g. EMDADUL HAQUE RAHIN"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 dark:bg-[#131b2e]/80 dark:hover:bg-[#131b2e] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-[#0d121f] focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Student Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="e.g. emdadulrahin420@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 dark:bg-[#131b2e]/80 dark:hover:bg-[#131b2e] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-[#0d121f] focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                    required
                  />
                </div>
              </div>

              {/* Student Academic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerData.userId}
                    onChange={(e) => setRegisterData({ ...registerData, userId: e.target.value })}
                    placeholder="e.g. 22203188"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 dark:bg-[#131b2e]/80 dark:hover:bg-[#131b2e] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-[#0d121f] focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Academic Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={registerData.department}
                    onChange={(e) => setRegisterData({ ...registerData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 dark:bg-[#131b2e]/80 dark:hover:bg-[#131b2e] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-[#0d121f] focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs cursor-pointer"
                  >
                    <option value="CSE">Computer Science & Engineering (CSE)</option>
                    <option value="EEE">Electrical & Electronic Engineering (EEE)</option>
                    <option value="Civil">Civil Engineering (CE)</option>
                    <option value="Mechanical">Mechanical Engineering (ME)</option>
                    <option value="BBA">Bachelor of Business Administration (BBA)</option>
                    <option value="BSAg">Bachelor of Science in Agriculture (BSAg)</option>
                    <option value="Textile">Textile Engineering (TE)</option>
                    <option value="English">Bachelor of Arts in English (BA English)</option>
                    <option value="Economics">Bachelor of Science in Economics</option>
                    <option value="BATHM">Tourism & Hospitality Management (BATHM)</option>
                    <option value="Nursing">Bachelor of Science in Nursing (BSN)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Cumulative CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="2.0"
                    max="4.0"
                    value={registerData.cgpa}
                    onChange={(e) => setRegisterData({ ...registerData, cgpa: e.target.value })}
                    placeholder="e.g. 2.90"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 dark:bg-[#131b2e]/80 dark:hover:bg-[#131b2e] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-[#0d121f] focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              {/* Hall & Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Preferred Residential Hall
                  </label>
                  <select
                    value={registerData.preferredHall}
                    onChange={(e) => setRegisterData({ ...registerData, preferredHall: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 dark:bg-[#131b2e]/80 dark:hover:bg-[#131b2e] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-[#0d121f] focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs cursor-pointer"
                  >
                    <option value="Padma Residential Hall (Floor 1)">Padma Residential Hall (Floor 1)</option>
                    <option value="Padma Residential Hall (Floor 2)">Padma Residential Hall (Floor 2)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Student Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    placeholder="e.g. 01776277198"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 dark:bg-[#131b2e]/80 dark:hover:bg-[#131b2e] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-[#0d121f] focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              {/* Preferred Room Capacity (4 / 2 / 1 Person Room) */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Building size={14} className="text-emerald-600" />
                    <span>Preferred Room Capacity / Sharing Type <span className="text-red-500">*</span></span>
                  </label>
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold">
                    {registerData.preferredCapacity === 1 ? 'Single Room (1 Person)' : registerData.preferredCapacity === 4 ? 'Standard (4 Persons)' : 'Double Shared (2 Persons)'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { capacity: 1, title: '1 Person Room', sub: 'Single Deluxe', rent: `৳${(roomTariffs.single || 5500).toLocaleString()}/mo`, badge: 'Private AC Desk' },
                    { capacity: 2, title: '2 Persons Room', sub: 'Double Shared', rent: `৳${(roomTariffs.double || 3500).toLocaleString()}/mo`, badge: 'Most Popular' },
                    { capacity: 4, title: '4 Persons Room', sub: '4-Bed Standard', rent: `৳${(roomTariffs.quad || 2500).toLocaleString()}/mo`, badge: 'Economy Shared' },
                  ].map((opt) => {
                    const isSelected = Number(registerData.preferredCapacity) === opt.capacity;
                    return (
                      <button
                        key={opt.capacity}
                        type="button"
                        onClick={() => setRegisterData({ ...registerData, preferredCapacity: opt.capacity })}
                        className={`p-2.5 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-900/20 ring-2 ring-emerald-500/30'
                            : 'bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold">{opt.title}</span>
                          {isSelected && <Check size={13} className="text-white shrink-0" />}
                        </div>
                        <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {opt.sub}
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] font-mono font-bold">
                          <span className={isSelected ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}>
                            {opt.rent}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Smart Allocation Hint */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#131b2e] border border-emerald-200/70 dark:border-emerald-800/70 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2 shadow-xs">
                  {Number(registerData.preferredCapacity) === 1 ? (
                    <>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold shrink-0 text-[10px]">
                        1 Person Room
                      </span>
                      <span>Single Private Room selected. Direct allocation by Provost Office (Roommate matching is not needed).</span>
                    </>
                  ) : (
                    <>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold shrink-0 text-[10px]">
                        ✨ {registerData.preferredCapacity} Persons Room
                      </span>
                      <span>Shared Room selected. Smart Room & Roommate Allocation will automatically launch after registration!</span>
                    </>
                  )}
                </div>
              </div>

              {/* Guardian Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Guardian / Father's Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={registerData.guardianName}
                    onChange={(e) => setRegisterData({ ...registerData, guardianName: e.target.value })}
                    placeholder="e.g. Md. Rafiqul Hasan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 dark:bg-[#131b2e]/80 dark:hover:bg-[#131b2e] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-[#0d121f] focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Guardian Emergency Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={registerData.guardianPhone}
                    onChange={(e) => setRegisterData({ ...registerData, guardianPhone: e.target.value })}
                    placeholder="e.g. +880 1711 987654"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 dark:bg-[#131b2e]/80 dark:hover:bg-[#131b2e] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-[#0d121f] focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Create Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 dark:bg-[#131b2e]/80 dark:hover:bg-[#131b2e] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-[#0d121f] focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 dark:bg-[#131b2e]/80 dark:hover:bg-[#131b2e] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-[#0d121f] focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                    required
                  />
                </div>
              </div>

              {/* Password Strength Indicator */}
              {registerData.password && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Password Strength:</span>
                    <span className={`font-bold ${passwordStrength >= 75 ? 'text-emerald-600' : passwordStrength >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                      {passwordStrength >= 100 ? 'Very Strong' : passwordStrength >= 75 ? 'Strong' : passwordStrength >= 50 ? 'Medium' : 'Weak'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength >= 75 ? 'bg-emerald-500' : passwordStrength >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Agreement */}
              <label className="flex items-start gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none pt-1">
                <input
                  type="checkbox"
                  checked={registerData.agreeTerms}
                  onChange={(e) => setRegisterData({ ...registerData, agreeTerms: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                  required
                />
                <span className="text-[11px] leading-tight">
                  I agree to abide by the Residential Hostel Code of Conduct, Disciplinary Rules, and 10:00 PM curfew policy.
                </span>
              </label>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'Creating Student Account...' : 'Complete Student Registration & Enter'}</span>
                <ArrowRight size={15} />
              </button>

              {/* Switch to Login */}
              <div className="pt-2 text-center text-xs text-slate-500">
                <span>Already have an institutional student account? </span>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Log In Here
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
