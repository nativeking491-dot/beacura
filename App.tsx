import React, { useState, useEffect, Suspense, lazy } from "react";
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
  Loader2,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "./context/ThemeContext";

// Lazy load pages for performance
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
import { FloatingChat } from "./components/FloatingChat";

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
const ExerciseTimer = lazy(() => import("./pages/ExerciseTimer"));
const DashboardRouter = lazy(() => import("./pages/DashboardRouter"));

import { UserRole } from "./types";
import { authService, supabase } from "./services/supabaseClient";
import { UserProvider, useUser } from "./context/UserContext";
import { OnboardingProvider } from "./context/OnboardingContext";

const AppContent: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ADMIN";

  // Show loading spinner while checking session
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2
            className="animate-spin text-amber-600 mx-auto mb-4"
            size={48}
          />
          <p className="text-slate-500">Loading Beacura...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await authService.signOut();
      // UserContext will automatically update via subscription in its own provider
      window.location.href = "/"; // Force reload to clear all states
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const NavItem = ({
    to,
    icon: Icon,
    label,
    isAdmin = false,
  }: {
    to: string;
    icon: any;
    label: string;
    isAdmin?: boolean;
  }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    if (isAdmin) {
      return (
        <Link
          to={to}
          onClick={() => setIsSidebarOpen(false)}
          className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${isActive
            ? "bg-purple-700 text-white shadow-lg"
            : "text-purple-100 hover:bg-purple-800 hover:text-white"
            }`}
        >
          <Icon size={20} />
          <span className="font-medium">{label}</span>
        </Link>
      );
    }

    return (
      <Link
        to={to}
        onClick={() => setIsSidebarOpen(false)}
        className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${isActive
          ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg"
          : "text-slate-600 hover:bg-amber-50 hover:text-amber-700"
          }`}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Sidebar / Navigation */}
      {isAuthenticated && (
        <>
          {/* Mobile Header */}
          <div
            className={`md:hidden ${isAdmin ? "bg-gradient-to-r from-purple-600 to-indigo-600" : "bg-white dark:bg-slate-800"} border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-between items-center fixed w-full z-50`}
          >
            <div
              className={`flex items-center space-x-2 ${isAdmin ? "text-white" : "text-amber-600"} font-bold text-xl`}
            >
              <Heart fill="currentColor" size={24} />
              <span>{isAdmin ? "Beacura Admin" : "Beacura"}</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={isAdmin ? "text-white" : "text-slate-900 dark:text-slate-100"}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Sidebar */}
          <aside
            className={`
              fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
              md:relative md:translate-x-0 transition duration-200 ease-in-out z-40
              w-64 ${isAdmin ? "bg-gradient-to-b from-purple-900 to-indigo-900 text-white" : "bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700"} flex flex-col h-full shadow-sm
            `}
          >
            <div
              className={`p-6 hidden md:flex items-center space-x-2 ${isAdmin ? "text-white" : "text-amber-600"} font-bold text-2xl`}
            >
              <Heart fill="currentColor" size={28} />
              <span>{isAdmin ? "Admin Panel" : "Beacura"}</span>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-16 md:mt-0">
              {isAdmin ? (
                // Admin Navigation - Only Dashboard
                <>
                  <NavItem
                    to="/dashboard"
                    icon={LayoutDashboard}
                    label="Dashboard"
                    isAdmin={isAdmin}
                  />
                </>
              ) : (
                // Regular User Navigation
                <>
                  <NavItem
                    to="/dashboard"
                    icon={LayoutDashboard}
                    label="Dashboard"
                    isAdmin={isAdmin}
                  />
                  <NavItem
                    to="/counseling"
                    icon={MessageCircle}
                    label="Counseling"
                    isAdmin={isAdmin}
                  />
                  <NavItem
                    to="/health"
                    icon={Utensils}
                    label="Health & Diet"
                    isAdmin={isAdmin}
                  />
                  <NavItem
                    to="/exercise"
                    icon={Dumbbell}
                    label="Exercise"
                    isAdmin={isAdmin}
                  />
                  <NavItem
                    to="/motivation"
                    icon={Award}
                    label="Motivation"
                    isAdmin={isAdmin}
                  />
                  <NavItem
                    to="/medical"
                    icon={ShieldAlert}
                    label="Medical Tips"
                    isAdmin={isAdmin}
                  />
                  <NavItem
                    to="/chat"
                    icon={Brain}
                    label="AI Support"
                    isAdmin={isAdmin}
                  />
                  <NavItem
                    to="/profile"
                    icon={User}
                    label="My Profile"
                    isAdmin={isAdmin}
                  />
                </>
              )}
            </nav>

            <div
              className={`p-4 ${isAdmin ? "border-t border-purple-700" : "border-t border-slate-200 dark:border-slate-700"}`}
            >
              {isAdmin && (
                <div className="mb-3 p-3 bg-purple-800 bg-opacity-50 rounded-lg">
                  <p className="text-xs text-purple-200 font-semibold">
                    ADMIN MODE
                  </p>
                  <p className="text-xs text-purple-300 mt-1">
                    Full system access
                  </p>
                </div>
              )}

              {/* Change Theme Navigation */}
              <NavItem
                to="/theme-settings"
                icon={Moon}
                label="Change Theme"
                isAdmin={isAdmin}
              />

              <button
                onClick={handleLogout}
                className={`flex items-center space-x-3 p-3 w-full rounded-lg ${isAdmin
                  ? "text-rose-300 hover:bg-purple-800 hover:text-rose-200"
                  : "text-rose-600 hover:bg-rose-50"
                  } transition-colors`}
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 overflow-y-auto ${isAuthenticated ? "pt-16 md:pt-0" : ""}`}
      >
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="animate-spin text-amber-600" size={48} />
            </div>
          }>
            <Routes>
              <Route
                path="/"
                element={
                  !isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />
                }
              />
              <Route
                path="/auth"
                element={
                  !isAuthenticated ? (
                    <Auth onLogin={() => { }} />
                  ) : (
                    <Navigate to="/dashboard" />
                  )
                }
              />
              <Route
                path="/learn-more"
                element={<LearnMore />}
              />
              <Route
                path="/onboarding"
                element={
                  isAuthenticated ? <Onboarding /> : <Navigate to="/auth" />
                }
              />
              <Route
                path="/mentor-dashboard"
                element={
                  isAuthenticated ? <MentorDashboard /> : <Navigate to="/auth" />
                }
              />

              {/* Debug route - accessible when logged in */}
              <Route
                path="/check-admin"
                element={
                  isAuthenticated ? <CheckAdmin /> : <Navigate to="/auth" />
                }
              />

              {/* Database connectivity test - accessible without login */}
              <Route path="/db-test" element={<DatabaseTest />} />

              <Route
                path="/dashboard"
                element={
                  isAuthenticated ? (
                    <DashboardRouter />
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              {/* Other protected routes... */}
              <Route
                path="/counseling"
                element={
                  isAuthenticated ? <Counseling /> : <Navigate to="/auth" />
                }
              />
              <Route
                path="/health"
                element={isAuthenticated ? <Health /> : <Navigate to="/auth" />}
              />
              <Route
                path="/exercise"
                element={
                  isAuthenticated ? <Exercise /> : <Navigate to="/auth" />
                }
              />
              <Route
                path="/exercise-timer/:exerciseIndex"
                element={
                  isAuthenticated ? <ExerciseTimer /> : <Navigate to="/auth" />
                }
              />
              <Route
                path="/motivation"
                element={
                  isAuthenticated ? <Motivation /> : <Navigate to="/auth" />
                }
              />
              <Route
                path="/medical"
                element={
                  isAuthenticated ? <Medical /> : <Navigate to="/auth" />
                }
              />
              <Route
                path="/chat"
                element={
                  isAuthenticated ? <Chatbot /> : <Navigate to="/auth" />
                }
              />
              <Route
                path="/profile"
                element={
                  isAuthenticated ? <Profile /> : <Navigate to="/auth" />
                }
              />
              <Route
                path="/theme-settings"
                element={
                  isAuthenticated ? <ThemeSettings /> : <Navigate to="/auth" />
                }
              />
              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />
            </Routes>
          </Suspense>
        </div>
      </main>

      {/* Floating Chat for authenticated users */}
      {isAuthenticated && <FloatingChat />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <OnboardingProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </OnboardingProvider>
  );
};

export default App;
