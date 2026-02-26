import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";

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
  Sparkles,
  Target,
  ChevronRight,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { supabase } from "../services/supabaseClient";
import { CravingLogger } from "../components/CravingLogger";
import { MoodLogger } from "../components/MoodLogger";
import { computeRiskScore, RiskScore } from "../services/riskScoreService";

interface CravingData {
  day: string;
  cravings: number;
  date: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  earned_at: string;
}

// Custom tooltip for chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass px-4 py-3 rounded-xl shadow-lg">
        <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
        <p className="text-base font-bold text-amber-600">{payload[0].value} <span className="text-xs text-slate-400">cravings</span></p>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC = () => {
  const { user, loading, isNewUser } = useUser();
  const navigate = useNavigate();
  const [cravingData, setCravingData] = useState<CravingData[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [moodScore, setMoodScore] = useState<string>("Stable");
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);

  useEffect(() => {
    if (!user?.id || isNewUser) return;
    fetchCravingData();
    fetchBadges();
    fetchMoodData();
    computeRiskScore(user.id).then(setRiskScore);
  }, [user?.id, isNewUser]);

  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .eq("user_id", user?.id)
        .order("earned_at", { ascending: false })
        .limit(2);
      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error("Error fetching badges:", error);
    }
  };

  const fetchMoodData = async () => {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const { data, error } = await supabase
        .from("mood_logs")
        .select("mood_score")
        .eq("user_id", user?.id)
        .gte("created_at", threeDaysAgo.toISOString());
      if (error) throw error;
      if (data && data.length > 0) {
        const avgMood = data.reduce((acc, curr) => acc + curr.mood_score, 0) / data.length;
        if (avgMood >= 8) setMoodScore("Excellent");
        else if (avgMood >= 6) setMoodScore("Good");
        else if (avgMood >= 4) setMoodScore("Okay");
        else setMoodScore("Struggling");
      }
    } catch (error) {
      console.error("Error fetching mood:", error);
    }
  };

  const fetchCravingData = async () => {
    setLoadingChart(true);
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data, error } = await supabase
        .from("craving_logs")
        .select("created_at, severity")
        .eq("user_id", user?.id)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true });
      if (error) throw error;
      const dailyData = aggregateCravingsByDay(data || []);
      setCravingData(dailyData);
    } catch (error) {
      console.error("Error fetching craving data:", error);
    } finally {
      setLoadingChart(false);
    }
  };

  const aggregateCravingsByDay = (logs: any[]) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const aggregated: Record<string, any> = {};
    logs.forEach((log) => {
      const date = new Date(log.created_at);
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
      const day = days[dayIndex];
      const dateStr = date.toLocaleDateString();
      if (!aggregated[dateStr]) {
        aggregated[dateStr] = { day, cravings: [], date: dateStr };
      }
      aggregated[dateStr].cravings.push(log.severity);
    });
    return Object.values(aggregated)
      .map((item: any) => ({
        ...item,
        cravings: Math.round(item.cravings.reduce((a: number, b: number) => a + b, 0) / item.cravings.length),
      }))
      .slice(-7);
  };

  const chartData = isNewUser ? [] : cravingData;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-in">
          <div className="relative w-14 h-14 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-amber-400 blur-lg opacity-40 animate-glow-pulse" />
            <div className="w-14 h-14 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }


  const userName = user.name || "User";
  const userStreak = user.streak || 0;
  const userPoints = user.points || 0;

  const getMoodConfig = (mood: string) => {
    const configs: Record<string, { color: string; bg: string; emoji: string }> = {
      "Excellent": { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", emoji: "🌟" },
      "Good": { color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-500/10", emoji: "😊" },
      "Okay": { color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", emoji: "😐" },
      "Stable": { color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", emoji: "😌" },
      "Struggling": { color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10", emoji: "💪" },
    };
    return configs[mood] || configs["Stable"];
  };

  const moodConfig = getMoodConfig(moodScore);

  return (
    <div className="space-y-6 animate-in pb-8">

      {/* =================== HEADER =================== */}
      <header className="relative overflow-hidden bento-card rounded-2xl p-6 md:p-8">
        {/* Decorative orbs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-amber-300 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-teal-300 rounded-full blur-2xl opacity-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-glow-pulse" />
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Recovery Active</span>
            </div>
            <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
              {isNewUser ? "Welcome, " : "Welcome back, "}<span className="gradient-text-amber">{userName}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {userStreak === 0
                ? "Start your wellness journey today — every step counts."
                : `Day ${userStreak} of your fresh start. You're doing amazing!`}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center space-x-2 glass-subtle px-4 py-2.5 rounded-xl border border-amber-200/50">
              <Flame size={20} fill="#f59e0b" className="text-amber-500 animate-glow-pulse" />
              <div>
                <p className="text-xs text-slate-400 leading-none">Streak</p>
                <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-lg font-extrabold text-amber-600 leading-none">{userStreak}d</p>
              </div>
            </div>
            <MoodLogger userId={user?.id} onSuccess={fetchMoodData} />
          </div>
        </div>
      </header>

      {/* =================== STAT BENTO GRID =================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bento-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-orange-300 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
              <Flame size={18} className="text-white" />
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Sobriety</p>
            <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 stat-val">{userStreak}<span className="text-sm font-semibold text-slate-400 ml-1">days</span></p>
          </div>
        </div>

        {/* Points */}
        <div className="bento-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-amber-300 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
              <Award size={18} className="text-white" />
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Points</p>
            <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 stat-val">{userPoints.toLocaleString()}</p>
          </div>
        </div>

        {/* Mood */}
        <div className="bento-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-rose-300 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
              <Heart size={18} className="text-white" />
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Mood</p>
            <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 stat-val">{moodScore}</p>
          </div>
        </div>

        {/* Risk Score */}
        <div className="bento-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-indigo-300 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative z-10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform
              ${!riskScore || riskScore.level === 'low' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : ''}
              ${riskScore?.level === 'moderate' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : ''}
              ${riskScore?.level === 'high' ? 'bg-gradient-to-br from-rose-500 to-red-600 animate-pulse' : ''}
            `}>
              <Target size={18} className="text-white" />
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Risk Score</p>
            {riskScore ? (
              <>
                <p style={{ fontFamily: 'Sora, sans-serif' }} className={`text-2xl font-extrabold stat-val ${riskScore.color}`}>
                  {riskScore.score}<span className="text-sm font-semibold text-slate-400 ml-1">/100</span>
                </p>
                <p className={`text-xs font-bold mt-1 ${riskScore.color}`}>{riskScore.label}</p>
              </>
            ) : (
              <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 stat-val">—</p>
            )}
          </div>
        </div>
      </div>

      {/* =================== CHART + BADGES =================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Chart */}
        <div className="lg:col-span-2 bento-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <TrendingUp size={16} className="text-amber-600" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-base font-bold text-slate-900 dark:text-slate-100">Craving Tracker</h2>
                <p className="text-xs text-slate-400">Last 7 days intensity</p>
              </div>
            </div>
            <select className="text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <div className="h-52">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cravingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cravings"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#cravingGradient)"
                    dot={{ fill: "#f59e0b", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: "#f59e0b", stroke: "white", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-300 dark:text-slate-600">
                  <Brain size={28} />
                </div>
                <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">No Cravings Logged Yet</h3>
                <p className="text-xs text-slate-400 max-w-[180px] mb-3 leading-relaxed">
                  Tracking urges helps you understand your triggers.
                </p>
                <CravingLogger userId={user?.id} onSuccess={fetchCravingData} />
              </div>
            )}
          </div>

          {chartData.length > 0 && !isNewUser && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <CravingLogger userId={user?.id} onSuccess={fetchCravingData} />
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="bento-card rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <Award size={16} className="text-amber-500" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-base font-bold text-slate-900 dark:text-slate-100">Achievements</h2>
              <p className="text-xs text-slate-400">Your latest badges</p>
            </div>
          </div>

          <div className="space-y-3">
            {badges.length > 0 ? (
              badges.map((badge) => (
                <div key={badge.id} className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 group hover-lift">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mr-3 shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Award size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{badge.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                  <Award size={24} className="opacity-40" />
                </div>
                <p className="text-sm font-semibold">No badges yet</p>
                <p className="text-xs mt-0.5 text-slate-400">Keep going — you'll earn them!</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="w-full mt-4 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm text-amber-600 font-bold hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors group"
          >
            <span>View All Rewards</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* =================== ACTION CARDS =================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Morning Reflection */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group hover-lift"
          style={{ background: 'linear-gradient(135deg, #0f766e, #0e7490)' }}
          onClick={() => navigate("/chat")}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }} />
          <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-4">
              <Brain size={20} className="text-white" />
            </div>
            <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-base font-bold text-white mb-1.5">Morning Reflection</h3>
            <p className="text-teal-100 text-xs mb-4 leading-relaxed">
              Start your day with calm. 5 minutes with our AI counselor.
            </p>
            <button className="btn-glass text-xs px-4 py-2 flex items-center space-x-1.5 group-hover:bg-white/30 transition-all">
              <span>Start Now</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Meal Planning */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group hover-lift"
          style={{ background: 'linear-gradient(135deg, #4338ca, #6d28d9)' }}
          onClick={() => navigate("/health")}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }} />
          <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-4">
              <Calendar size={20} className="text-white" />
            </div>
            <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-base font-bold text-white mb-1.5">Meal Planning</h3>
            <p className="text-indigo-100 text-xs mb-4 leading-relaxed">
              Good food is fuel for recovery. Check your suggested diet plan.
            </p>
            <button className="btn-glass text-xs px-4 py-2 flex items-center space-x-1.5 group-hover:bg-white/30 transition-all">
              <span>Plan Meal</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Community */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group hover-lift"
          style={{ background: 'linear-gradient(135deg, #b45309, #c2410c)' }}
          onClick={() => navigate("/counseling")}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(135deg, #d97706, #ea580c)' }} />
          <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-4">
              <Flame size={20} className="text-white" />
            </div>
            <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-base font-bold text-white mb-1.5">Community Chat</h3>
            <p className="text-orange-100 text-xs mb-4 leading-relaxed">
              Talk to mentors who have stayed clean for over 5 years.
            </p>
            <button className="btn-glass text-xs px-4 py-2 flex items-center space-x-1.5 group-hover:bg-white/30 transition-all">
              <span>Join Chat</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
