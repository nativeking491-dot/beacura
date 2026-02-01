
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import {
  Home, User, MessageCircle, Utensils, Award,
  ShieldAlert, LayoutDashboard, LogOut, Menu, X,
  Heart, Brain, Dumbbell, Loader2
} from 'lucide-react';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Counseling from './pages/Counseling';
import Health from './pages/Health';
import Motivation from './pages/Motivation';
import Medical from './pages/Medical';
import Chatbot from './pages/Chatbot';
import Profile from './pages/Profile';
import Exercise from './pages/Exercise';
import { UserRole } from './types';
import { authService } from './services/supabaseClient';
import { UserProvider } from './context/UserContext';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.RECOVERING);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check Supabase session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authService.getSession();
        if (session) {
          setIsAuthenticated(true);
          // Get user role from profile if available
          try {
            const profile = await authService.getUserProfile(session.user.id);
            if (profile?.role === 'RECOVERED_MENTOR') {
              setUserRole(UserRole.MENTOR);
            }
          } catch (e) {
            console.log('No profile found, using default role');
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Check database connection
    const checkConnection = async () => {
      try {
        const { count, error } = await authService.supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error('Database connection failed:', error.message);
        } else {
          console.log('Database connected successfully. User count:', count);
        }
      } catch (err) {
        console.error('Database connection error:', err);
      }
    };
    checkConnection();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
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
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setIsSidebarOpen(false)}
        className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${isActive
          ? 'bg-teal-600 text-white shadow-lg'
          : 'text-slate-600 hover:bg-teal-50 hover:text-teal-700'
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
          <Loader2 className="animate-spin text-teal-600 mx-auto mb-4" size={48} />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
          {/* Sidebar / Navigation */}
          {isAuthenticated && (
            <>
              {/* Mobile Header */}
              <div className="md:hidden bg-white border-b px-4 py-3 flex justify-between items-center fixed w-full z-50">
                <div className="flex items-center space-x-2 text-teal-600 font-bold text-xl">
                  <Heart fill="currentColor" size={24} />
                  <span>Beacura</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                  {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>

              {/* Sidebar */}
              <aside className={`
              fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
              md:relative md:translate-x-0 transition duration-200 ease-in-out z-40
              w-64 bg-white border-r flex flex-col h-full shadow-sm
            `}>
                <div className="p-6 hidden md:flex items-center space-x-2 text-teal-600 font-bold text-2xl">
                  <Heart fill="currentColor" size={28} />
                  <span>Beacura</span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-16 md:mt-0">
                  <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                  <NavItem to="/counseling" icon={MessageCircle} label="Counseling" />
                  <NavItem to="/health" icon={Utensils} label="Health & Diet" />
                  <NavItem to="/exercise" icon={Dumbbell} label="Exercise" />
                  <NavItem to="/motivation" icon={Award} label="Motivation" />
                  <NavItem to="/medical" icon={ShieldAlert} label="Medical Tips" />
                  <NavItem to="/chat" icon={Brain} label="AI Support" />
                  <NavItem to="/profile" icon={User} label="My Profile" />
                </nav>

                <div className="p-4 border-t">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 p-3 w-full rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </aside>
            </>
          )}

          {/* Main Content Area */}
          <main className={`flex-1 overflow-y-auto ${isAuthenticated ? 'pt-16 md:pt-0' : ''}`}>
            <div className="max-w-6xl mx-auto p-4 md:p-8">
              <Routes>
                <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />} />
                <Route path="/auth" element={<Auth onLogin={handleLogin} />} />

                <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} />
                <Route path="/counseling" element={isAuthenticated ? <Counseling /> : <Navigate to="/auth" />} />
                <Route path="/health" element={isAuthenticated ? <Health /> : <Navigate to="/auth" />} />
                <Route path="/exercise" element={isAuthenticated ? <Exercise /> : <Navigate to="/auth" />} />
                <Route path="/motivation" element={isAuthenticated ? <Motivation /> : <Navigate to="/auth" />} />
                <Route path="/medical" element={isAuthenticated ? <Medical /> : <Navigate to="/auth" />} />
                <Route path="/chat" element={isAuthenticated ? <Chatbot /> : <Navigate to="/auth" />} />
                <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/auth" />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;
