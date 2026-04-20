import React, { useState, useEffect, Suspense, lazy, useRef } from "react";
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  User,
  MessageCircle,
  Utensils,
  Award,
  ShieldAlert,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Heart,
  Brain,
  Dumbbell,
  Moon,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Flame,
  Activity,
  Target,
  BarChart3,
  Milestone,
  Map,
} from "lucide-react";
import { useTheme } from "./context/ThemeContext";

// Lazy load pages for performance
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
import { FloatingChat } from "./components/FloatingChat";
import { SOSModal } from "./components/SOSModal";
import { AvatarCharacter } from "./components/AvatarCharacter";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Counseling = lazy(() => import("./pages/Counseling"));
const Health = lazy(() => import("./pages/Health"));
const Motivation = lazy(() => import("./pages/Motivation"));
const Medical = lazy(() => import("./pages/Medical"));
const Chatbot = lazy(() => import("./pages/Chatbot"));
const Profile = lazy(() => import("./pages/Profile"));
const Exercise = lazy(() => import("./pages/Exercise"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CheckAdmin = lazy(() => import("./pages/CheckAdmin"));
const ThemeSettings = lazy(() => import("./pages/ThemeSettings"));
const LearnMore = lazy(() => import("./pages/LearnMore"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const MentorDashboard = lazy(() => import("./pages/MentorDashboard"));
const DatabaseTest = lazy(() => import("./pages/DatabaseTest"));
const Journal = lazy(() => import("./pages/Journal"));
const ExerciseTimer = lazy(() => import("./pages/ExerciseTimer"));
const DashboardRouter = lazy(() => import("./pages/DashboardRouter"));
const PhysioHub = lazy(() => import("./pages/PhysioHub"));
const BodyMap = lazy(() => import("./pages/BodyMap"));
const GuidedRehab = lazy(() => import("./pages/GuidedRehab"));
const PainJournal = lazy(() => import("./pages/PainJournal"));
const RecoveryTimeline = lazy(() => import("./pages/RecoveryTimeline"));
const HealingPaths = lazy(() => import("./pages/HealingPaths"));

import { UserRole } from "./types";
import { authService, supabase } from "./services/supabaseClient";
import { UserProvider, useUser } from "./context/UserContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import { ToastProvider } from "./context/ToastContext";
import ErrorBoundary from "./components/ErrorBoundary";

// Bottom tab bar routes (5 primary routes for mobile)
const BOTTOM_NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/physio", icon: Activity, label: "Physio" },
  { to: "/chat", icon: Brain, label: "AI" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/profile", icon: User, label: "Profile" },
];

const AppContent: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar-collapsed') === 'true'; } catch { return false; }
  });
  const { theme } = useTheme();

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ADMIN";

  const toggleSidebar = () => {
    setSidebarCollapsed(c => {
      const next = !c;
      try { localStorage.setItem('sidebar-collapsed', String(next)); } catch { }
      return next;
    });
  };

  // Close sidebar on route change
  const location = useLocation();
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-in">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 animate-glow-pulse opacity-30 blur-xl" />
            {/* Triple rings */}
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-pulse-ring" />
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/15 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl">
              <Heart fill="white" size={32} className="text-white animate-glow-pulse" />
            </div>
          </div>
          <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-slate-500 font-semibold tracking-wide animate-pulse">Loading Beacura...</p>
          {/* Wave loading bars */}
          <div className="flex items-end justify-center gap-1 mt-4 h-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-1.5 bg-violet-500 rounded-full wave-bar" style={{ height: '16px', animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await authService.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const NavItem = ({
    to,
    icon: Icon,
    label,
    isAdminItem = false,
    collapsed = false,
  }: {
    to: string;
    icon: any;
    label: string;
    isAdminItem?: boolean;
    collapsed?: boolean;
  }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    if (isAdminItem) {
      return (
        <Link
          to={to}
          title={collapsed ? label : undefined}
          className={`group flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-xl transition-all duration-200 relative ${isActive
            ? "nav-item-active-admin"
            : "text-purple-300 hover:bg-white/5 hover:text-white"
            }`}
        >
          {isActive && !collapsed && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-400 rounded-r-full nav-indicator" />
          )}
          <div className={`p-1.5 rounded-lg transition-all ${isActive ? "bg-violet-500/20" : "group-hover:bg-white/5"}`}>
            <Icon size={17} />
          </div>
          {!collapsed && <span className="font-semibold text-sm">{label}</span>}
        </Link>
      );
    }

    return (
      <Link
        to={to}
        title={collapsed ? label : undefined}
        className={`group flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-xl transition-all duration-200 relative ${isActive
          ? "nav-item-active"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
      >
        {isActive && !collapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-violet-400 rounded-r-full nav-indicator" />
        )}
        {isActive && collapsed && (
          <div className="absolute inset-0 rounded-xl bg-violet-500/10" />
        )}
        <div className={`p-1.5 rounded-lg transition-all duration-200 relative z-10 ${isActive
          ? "bg-violet-500/10"
          : "group-hover:bg-white/5"
          }`}>
          <Icon size={17} className={`transition-transform duration-200 ${isActive ? 'scale-110 text-violet-400' : 'group-hover:scale-110'}`} />
        </div>
        {!collapsed && <span className="font-semibold text-sm">{label}</span>}
        {isActive && !collapsed && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
        )}
      </Link>
    );
  };

  const sidebarBg = isAdmin
    ? "bg-[#070711] border-white/[0.06]"
    : "bg-[#070711]/80 border-white/[0.06]";

  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-300">
      {isAuthenticated && (
        <>
          {/* Mobile Header */}
          <div
            className={`md:hidden fixed w-full z-50 flex justify-between items-center px-4 py-3 border-b ${isAdmin
              ? "bg-[#070711]/90 border-white/10 backdrop-blur-xl"
              : "glass border-white/[0.06]"
              }`}
          >
            <div className={`flex items-center space-x-2 font-bold text-xl ${isAdmin ? "text-white" : "text-violet-400"}`}>
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-violet-400 blur-md opacity-40 animate-glow-pulse" />
                <Heart fill="currentColor" size={22} className="relative" />
              </div>
              <span style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold">
                {isAdmin ? "Beacura Admin" : "Beacura"}
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-xl transition-all ${isAdmin
                ? "text-white hover:bg-white/10"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
            >
              {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div
              className="md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`
              fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
              md:relative md:translate-x-0 transition-all duration-300 ease-in-out z-40
              ${sidebarCollapsed ? "md:w-[64px]" : "md:w-60"} w-60 ${sidebarBg} border-r backdrop-blur-xl flex flex-col h-full
            `}
          >
            {/* Logo + Collapse button */}
            <div className="p-4 hidden md:flex items-center justify-between border-b border-white/[0.06]">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-2.5">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-full bg-violet-400 blur-lg opacity-50 animate-glow-pulse" />
                    <div className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg">
                      <Heart fill="white" size={18} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <span style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-lg text-slate-100">
                      {isAdmin ? "Admin" : "Beacura"}
                    </span>
                    {isAdmin && <p className="text-xs text-violet-300 -mt-0.5">Admin panel</p>}
                  </div>
                </div>
              )}
              {sidebarCollapsed && (
                <div className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg mx-auto">
                  <Heart fill="white" size={18} className="text-white" />
                </div>
              )}
              {!sidebarCollapsed && (
                <button onClick={toggleSidebar} className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-slate-200 hover:bg-white/10">
                  <ChevronLeft size={16} />
                </button>
              )}
            </div>

            {/* Expand chevron when collapsed */}
            {sidebarCollapsed && (
              <button onClick={toggleSidebar} className="mx-auto mt-3 p-1.5 rounded-lg transition-colors text-slate-400 hover:text-slate-200 hover:bg-white/10">
                <ChevronRight size={16} />
              </button>
            )}

            {/* User avatar chip in sidebar */}
            {!sidebarCollapsed && !isAdmin && user && (
              <div className="mx-3 mt-3 p-3 rounded-xl bg-white/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #10b981, #8b5cf6)' }}>
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-100 truncate">{user.name || 'User'}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Flame size={11} className="text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400">{user.streak || 0} days</span>
                  </div>
                </div>
              </div>
            )}
            {sidebarCollapsed && !isAdmin && user && (
              <div className="mx-auto mt-3 w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-md"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #8b5cf6)' }}>
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}

            {/* Nav Items */}
            <nav className={`flex-1 ${sidebarCollapsed ? 'px-2' : 'px-3'} pt-3 pb-2 mt-16 md:mt-0 space-y-0.5 overflow-y-auto no-scrollbar`}>
              {isAdmin ? (
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" isAdminItem collapsed={sidebarCollapsed} />
              ) : (
                <>
                  <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={sidebarCollapsed} />

                  {/* Physio Rehab Section */}
                  {!sidebarCollapsed && (
                    <div className="pt-3 pb-1 px-3">
                      <p className="text-[9px] font-extrabold text-emerald-400/60 uppercase tracking-[0.2em]">Rehabilitation</p>
                    </div>
                  )}
                  {sidebarCollapsed && <div className="my-1.5 mx-3 h-px bg-white/[0.06]" />}
                  <NavItem to="/physio" icon={Activity} label="Physio Hub" collapsed={sidebarCollapsed} />
                  <NavItem to="/body-map" icon={Target} label="Body Map" collapsed={sidebarCollapsed} />
                  <NavItem to="/pain-journal" icon={BarChart3} label="Pain Journal" collapsed={sidebarCollapsed} />
                  <NavItem to="/recovery-timeline" icon={Milestone} label="Timeline" collapsed={sidebarCollapsed} />

                  {/* Wellness Section */}
                  {!sidebarCollapsed && (
                    <div className="pt-3 pb-1 px-3">
                      <p className="text-[9px] font-extrabold text-violet-400/60 uppercase tracking-[0.2em]">Wellness</p>
                    </div>
                  )}
                  {sidebarCollapsed && <div className="my-1.5 mx-3 h-px bg-white/[0.06]" />}
                  <NavItem to="/healing-paths" icon={Map} label="Healing Paths" collapsed={sidebarCollapsed} />
                  <NavItem to="/counseling" icon={MessageCircle} label="Counseling" collapsed={sidebarCollapsed} />
                  <NavItem to="/health" icon={Utensils} label="Health & Diet" collapsed={sidebarCollapsed} />
                  <NavItem to="/exercise" icon={Dumbbell} label="Exercise" collapsed={sidebarCollapsed} />
                  <NavItem to="/motivation" icon={Award} label="Motivation" collapsed={sidebarCollapsed} />
                  <NavItem to="/medical" icon={ShieldAlert} label="Medical Tips" collapsed={sidebarCollapsed} />
                  <NavItem to="/journal" icon={BookOpen} label="Journal" collapsed={sidebarCollapsed} />
                  <NavItem to="/chat" icon={Brain} label="AI Support" collapsed={sidebarCollapsed} />
                  <NavItem to="/profile" icon={User} label="My Profile" collapsed={sidebarCollapsed} />
                </>
              )}
            </nav>

            {/* Bottom */}
            <div className={`${sidebarCollapsed ? 'px-2' : 'px-3'} pb-3 border-t ${isAdmin ? "border-white/10" : "border-slate-100 dark:border-white/[0.06]"} space-y-0.5 pt-2`}>
              <NavItem to="/theme-settings" icon={Moon} label="Change Theme" isAdminItem={isAdmin} collapsed={sidebarCollapsed} />
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-xl transition-all duration-200 group ${isAdmin
                  ? "text-rose-400 hover:bg-rose-500/10"
                  : "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  }`}
                title={sidebarCollapsed ? 'Logout' : undefined}
              >
                <div className="p-1.5 rounded-lg group-hover:bg-rose-50 dark:group-hover:bg-rose-500/10 transition-all flex-shrink-0">
                  <LogOut size={17} />
                </div>
                {!sidebarCollapsed && <span className="font-semibold text-sm">Logout</span>}
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Mobile Bottom Tab Bar */}
      {isAuthenticated && !isAdmin && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070711]/90 backdrop-blur-xl border-t border-white/[0.06] flex items-center justify-around px-2 py-2">
          {BOTTOM_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl relative"
              >
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-violet-400 bottom-nav-pill" />
                )}
                <Icon size={20} className={`transition-colors ${isActive ? 'text-violet-400' : 'text-slate-500'}`} />
                <span className={`text-[10px] font-bold transition-colors ${isActive ? 'text-violet-400' : 'text-slate-500'}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto min-h-screen ${isAuthenticated ? "pt-14 md:pt-0" : ""}`}>
        <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <div className="relative w-14 h-14 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-violet-500 blur-lg opacity-40 animate-glow-pulse" />
                  <div className="w-14 h-14 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                </div>
                {/* Wave bars */}
                <div className="flex items-end justify-center gap-1 mt-3 h-5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-1 bg-violet-500/60 rounded-full wave-bar" style={{ height: '12px', animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>
            </div>
          }>
            <div key={location.pathname} className="page-transition-enter">
              <Routes>
                <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />} />
                <Route path="/auth" element={!isAuthenticated ? <Auth onLogin={() => { }} /> : <Navigate to="/dashboard" />} />
                <Route path="/learn-more" element={<LearnMore />} />
                <Route path="/onboarding" element={isAuthenticated ? <Onboarding /> : <Navigate to="/auth" />} />
                <Route path="/mentor-dashboard" element={isAuthenticated ? <MentorDashboard /> : <Navigate to="/auth" />} />
                <Route path="/check-admin" element={isAuthenticated ? <CheckAdmin /> : <Navigate to="/auth" />} />
                <Route path="/db-test" element={<DatabaseTest />} />
                <Route path="/dashboard" element={isAuthenticated ? <DashboardRouter /> : <Navigate to="/auth" />} />
                <Route path="/healing-paths" element={isAuthenticated ? <HealingPaths /> : <Navigate to="/auth" />} />
                <Route path="/counseling" element={isAuthenticated ? <Counseling /> : <Navigate to="/auth" />} />
                <Route path="/health" element={isAuthenticated ? <Health /> : <Navigate to="/auth" />} />
                <Route path="/exercise" element={isAuthenticated ? <Exercise /> : <Navigate to="/auth" />} />
                <Route path="/exercise-timer/:exerciseIndex" element={isAuthenticated ? <ExerciseTimer /> : <Navigate to="/auth" />} />
                <Route path="/motivation" element={isAuthenticated ? <Motivation /> : <Navigate to="/auth" />} />
                <Route path="/medical" element={isAuthenticated ? <Medical /> : <Navigate to="/auth" />} />
                <Route path="/journal" element={isAuthenticated ? <Journal /> : <Navigate to="/auth" />} />
                <Route path="/chat" element={isAuthenticated ? <Chatbot /> : <Navigate to="/auth" />} />
                <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/auth" />} />
                <Route path="/theme-settings" element={isAuthenticated ? <ThemeSettings /> : <Navigate to="/auth" />} />
                <Route path="/physio" element={isAuthenticated ? <PhysioHub /> : <Navigate to="/auth" />} />
                <Route path="/body-map" element={isAuthenticated ? <BodyMap /> : <Navigate to="/auth" />} />
                <Route path="/guided-rehab" element={isAuthenticated ? <GuidedRehab /> : <Navigate to="/auth" />} />
                <Route path="/pain-journal" element={isAuthenticated ? <PainJournal /> : <Navigate to="/auth" />} />
                <Route path="/recovery-timeline" element={isAuthenticated ? <RecoveryTimeline /> : <Navigate to="/auth" />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Suspense>
        </div>
      </main>

      {isAuthenticated && (
        <>
          <AvatarCharacter />
          <FloatingChat />
          {/* Floating SOS Button */}
          <button
            onClick={() => setIsSOSOpen(true)}
            className="fixed bottom-6 left-6 md:left-auto md:right-28 z-40 bg-rose-600 hover:bg-rose-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30 transition-all duration-300 hover:scale-110 active:scale-95 relative group"
            title="Emergency SOS"
          >
            {/* Double pulse rings */}
            <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-30" />
            <div className="absolute inset-0 rounded-full bg-rose-400 animate-pulse opacity-20" />
            <ShieldAlert size={28} className="relative z-10 group-hover:rotate-12 transition-transform duration-300" />
          </button>

          <SOSModal
            isOpen={isSOSOpen}
            onClose={() => setIsSOSOpen(false)}
            onOpenChat={() => {
              // Custom event to trigger chat opening in crisis mode
              window.dispatchEvent(new CustomEvent('open-crisis-chat'));
            }}
          />
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <OnboardingProvider>
        <UserProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </UserProvider>
      </OnboardingProvider>
    </ToastProvider>
  );
};

export default App;
