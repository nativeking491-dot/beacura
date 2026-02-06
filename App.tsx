import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
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

import { UserRole } from "./types";
import { authService } from "./services/supabaseClient";
import { UserProvider, useUser } from "./context/UserContext";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.RECOVERING);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  // Check Supabase session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authService.getSession();
        console.log("🔍 Session check:", session);

        if (session) {
          setIsAuthenticated(true);
          // Get user role from profile if available
          try {
            const profile = await authService.getUserProfile(session.user.id);
            console.log("👤 User profile fetched:", profile);
            console.log("🎭 User role:", profile?.role);

            if (profile?.role === "ADMIN") {
              console.log("👑 ADMIN ROLE DETECTED - Setting isAdmin to true");
              setIsAdmin(true);
              setUserRole(UserRole.MENTOR); // Set a fallback role
            } else if (profile?.role === "RECOVERED_MENTOR") {
              console.log("🏆 MENTOR ROLE DETECTED");
              setUserRole(UserRole.MENTOR);
            } else {
              console.log("💚 REGULAR USER ROLE");
            }
          } catch (e) {
            console.log("⚠️ No profile found, using default role");
          }
        }
      } catch (error) {
        console.error("❌ Session check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Check database connection
    const checkConnection = async () => {
      try {
        const { count, error } = await authService.supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Database connection failed:", error.message);
        } else {
          console.log("Database connected successfully. User count:", count);
        }
      } catch (err) {
        console.error("Database connection error:", err);
      }
    };
    checkConnection();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setIsAuthenticated(true);
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setUserRole(UserRole.RECOVERING);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogin = (role: UserRole) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setIsAuthenticated(false);
      setUserRole(UserRole.RECOVERING);
      setIsAdmin(false);
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
          ? "bg-teal-600 text-white shadow-lg"
          : "text-slate-600 hover:bg-teal-50 hover:text-teal-700"
          }`}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  // Show loading spinner while checking session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2
            className="animate-spin text-teal-600 mx-auto mb-4"
            size={48}
          />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <UserProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
        {/* Sidebar / Navigation */}
        {isAuthenticated && (
          <>
            {/* Mobile Header */}
            <div
              className={`md:hidden ${isAdmin ? "bg-gradient-to-r from-purple-600 to-indigo-600" : "bg-white"} border-b px-4 py-3 flex justify-between items-center fixed w-full z-50`}
            >
              <div
                className={`flex items-center space-x-2 ${isAdmin ? "text-white" : "text-teal-600"} font-bold text-xl`}
              >
                <Heart fill="currentColor" size={24} />
                <span>{isAdmin ? "Beacura Admin" : "Beacura"}</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={isAdmin ? "text-white" : "text-slate-900"}
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Sidebar */}
            <aside
              className={`
              fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
              md:relative md:translate-x-0 transition duration-200 ease-in-out z-40
              w-64 ${isAdmin ? "bg-gradient-to-b from-purple-900 to-indigo-900 text-white" : "bg-white"} border-r flex flex-col h-full shadow-sm
            `}
            >
              <div
                className={`p-6 hidden md:flex items-center space-x-2 ${isAdmin ? "text-white" : "text-teal-600"} font-bold text-2xl`}
              >
                <Heart fill="currentColor" size={28} />
                <span>{isAdmin ? "Admin Panel" : "Beacura"}</span>
              </div>

              <nav className="flex-1 px-4 space-y-2 mt-16 md:mt-0">
                {isAdmin ? (
                  // Admin Navigation
                  <>
                    <NavItem
                      to="/dashboard"
                      icon={LayoutDashboard}
                      label="Dashboard"
                      isAdmin={isAdmin}
                    />
                    <NavItem
                      to="/profile"
                      icon={User}
                      label="My Profile"
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
                className={`p-4 ${isAdmin ? "border-t border-purple-700" : "border-t"}`}
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

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`flex items-center space-x-3 p-3 w-full rounded-lg mb-2 ${isAdmin
                    ? "text-purple-100 hover:bg-purple-800"
                    : "text-slate-600 hover:bg-teal-50 hover:text-teal-700"
                    } transition-colors`}
                >
                  {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                  <span className="font-medium">
                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                  </span>
                </button>

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
                <Loader2 className="animate-spin text-teal-600" size={48} />
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
                      <Auth onLogin={handleLogin} />
                    ) : (
                      <Navigate to="/dashboard" />
                    )
                  }
                />

                {/* Debug route - accessible when logged in */}
                <Route
                  path="/check-admin"
                  element={
                    isAuthenticated ? <CheckAdmin /> : <Navigate to="/auth" />
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    isAuthenticated ? (
                      isAdmin ? (
                        <AdminDashboard />
                      ) : (
                        <Dashboard />
                      )
                    ) : (
                      <Navigate to="/auth" />
                    )
                  }
                />
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
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </UserProvider>
  );
};

export default App;
