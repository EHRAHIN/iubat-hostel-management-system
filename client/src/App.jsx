import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import StatsBar from './components/StatsBar';
import SeatRadarSection from './components/SeatRadarSection';
import ActorPortalsSection from './components/ActorPortalsSection';
import ServicesSection from './components/ServicesSection';
import NoticeBoardSection from './components/NoticeBoardSection';
import StudentDashboard from './pages/StudentDashboard';
import FloorTeacherDashboard from './pages/FloorTeacherDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ParentDashboard from './pages/ParentDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import HostelSuperDashboard from './pages/HostelSuperDashboard';
import ApplySeatModal from './components/ApplySeatModal';
import PortalLoginModal from './components/PortalLoginModal';
import SmartSeatAssignModal from './components/SmartSeatAssignModal';
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

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

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
    setPreselectedHall(hall);
    setPreselectedRoomType(roomType);
    setPreselectedRoomNo(roomNo);
    setPreselectedBed(bedLabel);
    setPreselectedFloor(floor);
    setIsApplyModalOpen(true);
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

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-[#060911] text-slate-900 dark:text-slate-100 font-['Inter'] transition-colors ${darkMode ? 'dark' : ''}`}>
      
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
      <main className="flex-1">
        {(currentView === 'home' || !currentUser) && (
          <>
            {/* 1. IUBAT Hero Section with Student Verification Terminal */}
            <HeroSection
              onOpenApplyModal={() => handleOpenApply()}
              onScrollToVacancy={handleScrollToVacancy}
            />

            {/* 2. Key Metrics Bar */}
            <StatsBar />

            {/* 3. Hostel Blocks & Interactive Floor Map Matrix */}
            <SeatRadarSection
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

        {currentView === 'student-dashboard' && (
          <StudentDashboard
            currentUser={currentUser}
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
