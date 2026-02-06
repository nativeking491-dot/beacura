import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Flame,
  Calendar,
  Award,
  TrendingUp,
  ArrowRight,
  Heart,
  Brain,
  Zap,
  Loader2,
} from "lucide-react";
import { useUser } from "../context/UserContext";

const Dashboard: React.FC = () => {
  const { user, loading, isNewUser } = useUser();
  const navigate = useNavigate();

  // Mock data - in a real app this would come from the database
  const mockData = [
    { day: "Mon", cravings: 4 },
    { day: "Tue", cravings: 3 },
    { day: "Wed", cravings: 5 },
    { day: "Thu", cravings: 2 },
    { day: "Fri", cravings: 1 },
    { day: "Sat", cravings: 2 },
    { day: "Sun", cravings: 0 },
  ];

  const data = isNewUser ? [] : mockData;

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );

  // Default badges for display
  const defaultBadges = [
    { id: "b1", name: "Week One", icon: "Shield", color: "text-blue-500" },
    {
      id: "b2",
      name: "First Mentor Call",
      icon: "Award",
      color: "text-yellow-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-teal-600" size={48} />
      </div>
    );
  }

  // Redirect to auth if no user is found after loading
  if (!user) {
    navigate("/auth");
    return null;
  }

  const userName = user.name || "User";
  const userStreak = user.streak || 0;
  const userPoints = user.points || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isNewUser ? `Welcome, ${userName}!` : `Welcome back, ${userName}!`}
          </h1>
          <p className="text-slate-500">
            {userStreak === 0
              ? "Start your journey to wellness today!"
              : `Day ${userStreak} of your fresh start. Keep going!`}
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl border border-amber-100">
          <Flame size={20} fill="currentColor" />
          <span className="font-bold text-lg">{userStreak} Day Streak</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Flame}
          label="Sobriety Streak"
          value={`${userStreak} Days`}
          color="bg-orange-50 text-orange-600"
        />
        <StatCard
          icon={Award}
          label="Recovery Points"
          value={userPoints.toLocaleString()}
          color="bg-teal-50 text-teal-600"
        />
        <StatCard
          icon={Heart}
          label="Mood Score"
          value="Stable"
          color="bg-rose-50 text-rose-600"
        />
        <StatCard
          icon={Zap}
          label="Daily Goal"
          value="80%"
          color="bg-indigo-50 text-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <TrendingUp size={20} className="text-teal-600" />
              <span>Cravings Frequency</span>
            </h2>
            <select className="text-sm border-none bg-slate-50 rounded-lg p-1">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 w-full">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient
                      id="colorCravings"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cravings"
                    stroke="#0d9488"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCravings)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Brain size={40} className="text-slate-200 mb-3" />
                <h3 className="text-base font-bold text-slate-600 mb-1">
                  No Cravings Logged Yet
                </h3>
                <p className="text-xs text-slate-400 max-w-[200px] mb-3">
                  Great job! Tracking urges helps you understand your triggers.
                </p>
                <button
                  onClick={() => console.log('Log craving')}
                  className="text-xs font-bold text-teal-600 bg-teal-50 px-4 py-2 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  Log First Craving
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Badges & Rewards */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <Award size={20} className="text-amber-500" />
            <span>Achievements</span>
          </h2>
          <div className="space-y-4">
            {defaultBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div
                  className={`w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm ${badge.color}`}
                >
                  <Award size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{badge.name}</p>
                  <p className="text-xs text-slate-500">Unlocked 3 days ago</p>
                </div>
              </div>
            ))}
            <button
              onClick={() => navigate("/profile")}
              className="w-full mt-4 flex items-center justify-center space-x-2 py-3 rounded-xl text-teal-600 font-semibold hover:bg-teal-50 transition-colors"
            >
              <span>View All Rewards</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-6 rounded-2xl text-white shadow-lg shadow-teal-100 relative overflow-hidden">
          <div className="relative z-10">
            <Brain className="mb-4 opacity-80" size={32} />
            <h3 className="text-lg font-bold mb-2">Morning Reflection</h3>
            <p className="text-teal-50 text-sm mb-4">
              Start your day with a calm mind. Spend 5 minutes on our AI
              counseling.
            </p>
            <button
              onClick={() => navigate("/chat")}
              className="bg-white text-teal-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-teal-50 transition-colors"
            >
              Start Now
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Brain size={120} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-2xl text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
          <div className="relative z-10">
            <Calendar className="mb-4 opacity-80" size={32} />
            <h3 className="text-lg font-bold mb-2">Meal Planning</h3>
            <p className="text-indigo-50 text-sm mb-4">
              Good food is fuel for recovery. Check your suggested diet plan.
            </p>
            <button
              onClick={() => navigate("/health")}
              className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors"
            >
              Plan Meal
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Calendar size={120} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl text-white shadow-lg shadow-amber-100 relative overflow-hidden">
          <div className="relative z-10">
            <Flame className="mb-4 opacity-80" size={32} />
            <h3 className="text-lg font-bold mb-2">Community Chat</h3>
            <p className="text-amber-50 text-sm mb-4">
              Talk to mentors who have stayed clean for over 5 years.
            </p>
            <button
              onClick={() => navigate("/counseling")}
              className="bg-white text-amber-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-50 transition-colors"
            >
              Join Chat
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Flame size={120} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
