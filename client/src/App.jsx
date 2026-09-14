import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import StatsBar from './components/StatsBar';
import SeatRadarSection from './components/SeatRadarSection';
import ActorPortalsSection from './components/ActorPortalsSection';
import ServicesSection from './components/ServicesSection';
import NoticeBoardSection from './components/NoticeBoardSection';

// High-Performance Dynamic Code-Splitting: Dashboards load on-demand instead of monolithic 1.5MB block
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const FloorTeacherDashboard = lazy(() => import('./pages/FloorTeacherDashboard'));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard'));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const HostelSuperDashboard = lazy(() => import('./pages/HostelSuperDashboard'));
import ApplySeatModal from './components/ApplySeatModal';
import PortalLoginModal from './components/PortalLoginModal';
import SmartSeatAssignModal from './components/SmartSeatAssignModal';
import PaymentResultView from './components/PaymentResultView';
import Toast from './components/Toast';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  // Day / Night Theme State (Default to Light Mode, restored from localStorage)
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('iubat_theme');
      if (savedTheme) return savedTheme === 'dark';
      return false;
    } catch {
      return false;
    }
  });

  // User and Role Session State (Per-tab session isolation via sessionStorage, with localStorage initial fallback)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const sessionSaved = sessionStorage.getItem('iubat_auth_user');
      if (sessionSaved) return JSON.parse(sessionSaved);
      const localSaved = localStorage.getItem('iubat_auth_user');
      return localSaved ? JSON.parse(localSaved) : null;
    } catch {
      return null;
    }
  });

  const [currentUserRole, setCurrentUserRole] = useState(() => {
    try {
      return sessionStorage.getItem('iubat_auth_role') || localStorage.getItem('iubat_auth_role') || null;
    } catch {
      return null;
    }
  });

  // View state: 'home', 'student-dashboard', 'teacher-dashboard', 'staff-dashboard', 'parent-dashboard', 'admin-dashboard', or 'super-dashboard'
  const [currentView, setCurrentView] = useState(() => {
    try {
      const sessionView = sessionStorage.getItem('iubat_current_view');
      const sessionUser = sessionStorage.getItem('iubat_auth_user');
      if (sessionView && sessionUser) return sessionView;

      const localView = localStorage.getItem('iubat_current_view');
      const localUser = localStorage.getItem('iubat_auth_user');
      if (localView && localUser) return localView;

      return 'home';
    } catch {
      return 'home';
    }
  });

  // Modals state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [isSmartAssignOpen, setIsSmartAssignOpen] = useState(false);
  const [smartAssignStudent, setSmartAssignStudent] = useState(null);
  const [portalModalRole, setPortalModalRole] = useState('student');
  const [portalModalMode, setPortalModalMode] = useState('login');
  const [preselectedHall, setPreselectedHall] = useState('');
  const [preselectedRoomType, setPreselectedRoomType] = useState('');
  const [preselectedFloor, setPreselectedFloor] = useState('Floor 1');
  const [preselectedRoomNo, setPreselectedRoomNo] = useState('');
  const [preselectedBed, setPreselectedBed] = useState('');

  // Live rooms from MongoDB for real vacancy monitoring
  const [rooms, setRooms] = useState([]);

  const fetchRooms = async () => {
    try {
      const res = await api.getRooms();
      if (res?.data) {
        setRooms(res.data);
      }
    } catch (err) {
      console.log('Error fetching live rooms:', err.message);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [currentView]);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Track SSLCommerz payment callback view
  const [isPaymentResultView, setIsPaymentResultView] = useState(() => {
    try {
      const p = window.location.pathname.toLowerCase();
      const q = new URLSearchParams(window.location.search);
      return p.includes('/payment/') || Boolean(q.get('tran_id'));
    } catch {
      return false;
    }
  });

  // Handle return parameters from SSLCommerz Hosted Gateway
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tranId = urlParams.get('tran_id');
      const invoiceNo = urlParams.get('invoiceNo');
      const status = urlParams.get('status');
      const reason = urlParams.get('reason');

      if (tranId || invoiceNo) {
        setIsPaymentResultView(true);
        if (status === 'failed' || reason) {
          showToast(`SSLCommerz Payment ${reason ? `failed: ${reason}` : 'was not completed'}.`, 'error');
        } else if (status === 'cancelled') {
          showToast('SSLCommerz Payment was cancelled by user.', 'info');
        } else {
          showToast(`✅ Payment for Invoice ${invoiceNo || tranId} completed successfully via SSLCommerz!`, 'success');
        }
      }
    } catch (err) {
      console.error('SSL URL callback parse error:', err);
    }
  }, []);

  // Synchronize Dark Mode class with both HTML document and body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    try {
      localStorage.setItem('iubat_theme', darkMode ? 'dark' : 'light');
    } catch (e) {
      console.error(e);
    }
  }, [darkMode]);

  // Synchronize authentication and view state with sessionStorage (isolated per tab)
  useEffect(() => {
    try {
      if (currentUser) {
        sessionStorage.setItem('iubat_auth_user', JSON.stringify(currentUser));
      } else {
        sessionStorage.removeItem('iubat_auth_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      if (currentUserRole) {
        sessionStorage.setItem('iubat_auth_role', currentUserRole);
      } else {
        sessionStorage.removeItem('iubat_auth_role');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUserRole]);

  useEffect(() => {
    try {
      sessionStorage.setItem('iubat_current_view', currentView);
    } catch (e) {
      console.error(e);
    }
  }, [currentView]);

  // Guard: If the view is a dashboard but user is null (stale session), reset to home
  useEffect(() => {
    if (currentView !== 'home' && !currentUser) {
      console.warn('[App] Stale session detected: view is', currentView, 'but no user. Redirecting to home.');
      setCurrentView('home');
      setCurrentUserRole(null);
      try {
        sessionStorage.setItem('iubat_current_view', 'home');
        localStorage.setItem('iubat_current_view', 'home');
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentView, currentUser]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  // Handlers
  const handleOpenApply = (hall = '', roomType = '', roomNo = '', bedLabel = '', floor = 'Floor 1') => {
    // If student is already logged in, redirect directly to student dashboard
    if (currentUser && currentUserRole === 'student') {
      setCurrentView('student-dashboard');
      showToast('Redirected to your Student Residential Workspace.', 'info');
      return;
    }
    // Requirement: "apply for seat e click korle registration er option e jabe"
    handleOpenPortal('student', 'register');
  };

  const handleOpenPortal = (role = 'student', mode = 'login') => {
    setPortalModalRole(role);
    setPortalModalMode(mode);
    setIsPortalModalOpen(true);
  };

  const handleOpenSmartAssign = (student) => {
    setSmartAssignStudent(student || currentUser);
    setIsSmartAssignOpen(true);
  };

  const handleSmartAssignComplete = (result) => {
    const isOfficiallyAllocated = result.user?.allocationStatus === 'Allocated' && Boolean(result.user?.room);
    const updatedUser = {
      ...(result.user || smartAssignStudent || {}),
      hall: result.user?.hall || result.allocation?.hall || smartAssignStudent?.hall,
      floor: result.user?.floor || result.allocation?.floor || smartAssignStudent?.floor,
      room: isOfficiallyAllocated ? result.user.room : '',
      seatNo: isOfficiallyAllocated ? result.user.seatNo : '',
      unit: isOfficiallyAllocated ? result.user.unit : `${result.allocation?.hall || 'Padma Residential Hall'} (Pending Provost Allocation)`,
      floorTeacher: result.user?.floorTeacher || result.allocation?.houseTutor,
      floorTeacherPhone: result.user?.floorTeacherPhone || result.allocation?.houseTutorPhone,
      allocationStatus: isOfficiallyAllocated ? 'Allocated' : 'Pending Provost Approval',
      roommate: result.user?.roommate || result.allocation?.roommate || null,
    };
    setCurrentUserRole('student');
    setCurrentUser(updatedUser);
    setCurrentView('student-dashboard');
    try {
      sessionStorage.setItem('iubat_auth_user', JSON.stringify(updatedUser));
      sessionStorage.setItem('iubat_auth_role', 'student');
      sessionStorage.setItem('iubat_current_view', 'student-dashboard');
      localStorage.setItem('iubat_auth_user', JSON.stringify(updatedUser));
      localStorage.setItem('iubat_auth_role', 'student');
      localStorage.setItem('iubat_current_view', 'student-dashboard');
    } catch (e) {
      console.error(e);
    }
    showToast(result.message || 'Roommate preferences submitted! Seat allocation pending Hostel Super approval.', 'success');
  };

  const handleLoginSuccess = (role, user) => {
    setCurrentUserRole(role);
    setCurrentUser(user);
    try {
      // Save to both sessionStorage (per-tab) and localStorage (cross-tab fallback)
      sessionStorage.setItem('iubat_auth_user', JSON.stringify(user));
      sessionStorage.setItem('iubat_auth_role', role);
      localStorage.setItem('iubat_auth_user', JSON.stringify(user));
      localStorage.setItem('iubat_auth_role', role);
    } catch (e) {
      console.error(e);
    }
    const userName = user?.name || (role === 'student' ? 'Student Resident' : role.toUpperCase());
    let targetView = 'home';
    if (role === 'student') {
      targetView = 'student-dashboard';
      showToast(`Welcome back, ${userName}! AI Roommate Matcher is active.`, 'success');
    } else if (role === 'teacher') {
      targetView = 'teacher-dashboard';
      showToast(`Authenticated as Floor Teacher ${userName} (House Tutor).`, 'success');
    } else if (role === 'staff') {
      targetView = 'staff-dashboard';
      showToast(`Authenticated as Staff ${userName} (Maintenance & Dining Operations).`, 'success');
    } else if (role === 'parent') {
      targetView = 'parent-dashboard';
      showToast(`Authenticated as Guardian ${userName}.`, 'success');
    } else if (role === 'admin') {
      targetView = 'admin-dashboard';
      showToast(`Authenticated as Super Administrator ${userName} (Root Access).`, 'success');
    } else if (role === 'super') {
      targetView = 'super-dashboard';
      showToast(`Authenticated as Hostel Super / Provost ${userName}.`, 'success');
    } else {
      showToast(`Authenticated as ${userName}.`, 'info');
    }
    setCurrentView(targetView);
    try {
      sessionStorage.setItem('iubat_current_view', targetView);
      localStorage.setItem('iubat_current_view', targetView);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setCurrentUserRole(null);
    setCurrentUser(null);
    setCurrentView('home');
    try {
      sessionStorage.removeItem('iubat_auth_user');
      sessionStorage.removeItem('iubat_auth_role');
      sessionStorage.setItem('iubat_current_view', 'home');
      sessionStorage.removeItem('iubat_student_tab');
      sessionStorage.removeItem('iubat_teacher_tab');
      sessionStorage.removeItem('iubat_provost_tab');
      sessionStorage.removeItem('iubat_staff_tab');
      sessionStorage.removeItem('iubat_parent_tab');
      sessionStorage.removeItem('iubat_admin_tab');
      // Also clear localStorage so it doesn't resurrect on new tabs if logged out
      localStorage.removeItem('iubat_auth_user');
      localStorage.removeItem('iubat_auth_role');
      localStorage.setItem('iubat_current_view', 'home');
    } catch (e) {
      console.error(e);
    }
    showToast('Signed out of institutional workspace.', 'info');
  };

  const handleScrollToVacancy = () => {
    const el = document.getElementById('vacancy');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dynamic Page-specific Watermark ("Jolchap")
  const getWatermarkInfo = () => {
    switch (currentView) {
      case 'student-dashboard':
        return { main: 'Student', sub: 'Student Residence' };
      case 'admin-dashboard':
        return { main: 'Admin', sub: 'Super Administrator' };
      case 'super-dashboard':
        return { main: 'Hostelsuper', sub: 'Hostel Provost' };
      case 'teacher-dashboard':
        return { main: 'Teacher', sub: 'House Tutor' };
      case 'staff-dashboard':
        return { main: 'Staff', sub: 'Hostel Operations' };
      case 'parent-dashboard':
        return { main: 'Parent', sub: 'Guardian Portal' };
      default:
        return { main: 'IUBAT', sub: 'ESTD 1991' };
    }
  };

  const watermark = getWatermarkInfo();

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-[#060911] text-slate-900 dark:text-slate-100 font-['Inter'] transition-colors relative ${darkMode ? 'dark' : ''}`}>
      
      {/* Global Dynamic Page Watermark ("Jolchap") & Ambient Apple iOS Aurora Gradients (Active on all pages & dashboards) */}
      <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 transform-gpu" style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }}>
        {/* Top Right iOS Emerald-Teal Orb */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent blur-[130px] dark:from-emerald-500/20 dark:via-teal-500/15 transform-gpu" style={{ transform: 'translate3d(0,0,0)' }} />
        {/* Mid Left iOS Cyan-Sky Orb */}
        <div className="absolute top-1/3 -left-32 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-cyan-500/10 via-emerald-500/10 to-transparent blur-[140px] dark:from-cyan-500/15 dark:via-emerald-500/15 transform-gpu" style={{ transform: 'translate3d(0,0,0)' }} />
        {/* Lower Right iOS Amber-Emerald Orb */}
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-emerald-500/10 via-teal-500/10 to-transparent blur-[130px] dark:from-emerald-500/15 dark:via-teal-500/15 transform-gpu" style={{ transform: 'translate3d(0,0,0)' }} />

        {/* Dynamic Page Name Watermark ("Jolchap") */}
        <div 
          key={watermark.main}
          className="absolute -right-4 sm:right-6 md:right-12 lg:right-16 bottom-6 md:bottom-12 opacity-[0.045] dark:opacity-[0.065] pointer-events-none select-none text-right font-serif font-black text-6xl sm:text-[110px] md:text-[160px] lg:text-[220px] leading-none text-emerald-950 dark:text-emerald-300 tracking-tighter uppercase transition-all duration-700"
        >
          {watermark.main}
        </div>
        <div 
          key={watermark.sub}
          className="absolute left-4 sm:left-8 top-20 sm:top-24 opacity-[0.02] dark:opacity-[0.035] pointer-events-none select-none font-serif font-black text-2xl sm:text-4xl md:text-5xl tracking-widest text-slate-900 dark:text-white uppercase transition-all duration-700"
        >
          {watermark.sub}
        </div>
      </div>

      {/* Global Navigation Bar */}
      <Navbar
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        onOpenPortalModal={handleOpenPortal}
        onOpenApplyModal={() => handleOpenApply()}
        currentView={currentView}
        onNavigateHome={() => setCurrentView('home')}
      />

      {/* Main Content Router */}
      <main className="flex-1 relative z-10">
        {isPaymentResultView ? (
          <PaymentResultView
            currentUser={currentUser}
            onNavigate={(targetView) => {
              setIsPaymentResultView(false);
              window.history.replaceState({}, document.title, '/');
              if (targetView) setCurrentView(targetView);
            }}
          />
        ) : (
          <>
            {currentView === 'home' && (
          <>

            {/* 1. IUBAT Hero Section with Student Verification Terminal */}
            <HeroSection
              rooms={rooms}
              onOpenApplyModal={() => handleOpenApply()}
              onScrollToVacancy={handleScrollToVacancy}
            />

            {/* 2. Key Metrics Bar */}
            <StatsBar rooms={rooms} />

            {/* 3. Hostel Blocks & Interactive Floor Map Matrix */}
            <SeatRadarSection
              rooms={rooms}
              onApplyForHall={(hall, roomType, roomNo, bedLabel, floor) => handleOpenApply(hall, roomType, roomNo, bedLabel, floor)}
            />

            {/* 4. 6-Actor Institutional Portals Gateway (RBAC) */}
            <ActorPortalsSection
              onSelectRole={(role) => handleOpenPortal(role, 'login')}
            />

            {/* 5. Institutional Services */}
            <ServicesSection />

            {/* 6. Official Circulars and Notices */}
            <NoticeBoardSection />
          </>
        )}

        <Suspense fallback={
          <div className="min-h-[75vh] flex flex-col items-center justify-center p-8 text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-pulse">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Loading Workspace...</h3>
              <p className="text-xs text-slate-400">Rendering institutional environment at 120 FPS</p>
            </div>
          </div>
        }>
          {currentView === 'student-dashboard' && (
            <StudentDashboard
              currentUser={currentUser || {
                id: '221004128',
                userId: '221004128',
                name: 'Tanvir Hasan',
                email: 'student.cse@iubat.edu',
                role: 'student',
                department: 'Computer Science and Engineering (CSE)',
                cgpa: 3.82,
                hall: 'Padma Residential Hall',
                floor: 'Floor 1',
                room: 'Padma-104',
                seatNo: 'Bed A',
                roomType: 'Double Shared Room',
                preferredCapacity: 2,
                allocationStatus: 'Allocated',
                phone: '+880 1712 345678',
                guardianName: 'Md. Rafiqul Islam',
                guardianPhone: '+880 1819 987654',
                floorTeacher: 'Dr. Tariqul Islam (Padma Floor 1 House Tutor)',
                floorTeacherPhone: '+880 1819 123456',
                balance: '৳ 4,500'
              }}
              onLogout={handleLogout}
              onShowToast={showToast}
              onOpenSmartAssign={() => handleOpenSmartAssign(currentUser)}
            />
          )}

          {currentView === 'teacher-dashboard' && currentUser && (
            <FloorTeacherDashboard
              currentUser={currentUser}
              onLogout={handleLogout}
              onShowToast={showToast}
            />
          )}

          {currentView === 'staff-dashboard' && (
            <StaffDashboard
              currentUser={currentUser}
              onLogout={handleLogout}
              onShowToast={showToast}
            />
          )}

          {currentView === 'parent-dashboard' && (
            <ParentDashboard
              currentUser={currentUser}
              onLogout={handleLogout}
              onShowToast={showToast}
            />
          )}

          {currentView === 'super-dashboard' && (
            <HostelSuperDashboard
              currentUser={currentUser}
              onLogout={handleLogout}
              onShowToast={showToast}
            />
          )}

          {currentView === 'admin-dashboard' && (
            <SuperAdminDashboard
              currentUser={currentUser}
              onLogout={handleLogout}
              onShowToast={showToast}
            />
          )}
        </Suspense>
      </>
    )}
  </main>

      {/* Institutional Footer */}
      <Footer />

      {/* Modal: Seat Application Form */}
      <ApplySeatModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        preselectedHall={preselectedHall}
        preselectedFloor={preselectedFloor}
        preselectedRoomType={preselectedRoomType}
        preselectedRoomNo={preselectedRoomNo}
        preselectedBed={preselectedBed}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      {/* Modal: Portal Login & Registration */}
      <PortalLoginModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        defaultRole={portalModalRole}
        defaultMode={portalModalMode}
        onLoginSuccess={handleLoginSuccess}
        onOpenSmartAssign={handleOpenSmartAssign}
      />

      {/* Modal: Smart Seat & Roommate Allocation Questionnaire */}
      <SmartSeatAssignModal
        isOpen={isSmartAssignOpen}
        onClose={() => setIsSmartAssignOpen(false)}
        studentUser={smartAssignStudent || currentUser}
        onAllocationComplete={handleSmartAssignComplete}
      />

      {/* Feedback Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
