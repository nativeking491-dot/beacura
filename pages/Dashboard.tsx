import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Flame,
  Calendar,
  Award,
  TrendingUp,
  ArrowRight,
  Heart,
  Brain,
  Sparkles,
  Target,
  ChevronRight,
  Edit3,
  Check,
  Star,
  Trophy,
  ChevronDown,
  ChevronUp,
  CloudRain,
  Sun,
  CloudLightning,
  Zap,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { supabase } from "../services/supabaseClient";
import { CravingLogger } from "../components/CravingLogger";
import { MoodLogger } from "../components/MoodLogger";
import { computeRiskScore, RiskScore } from "../services/riskScoreService";
import { useToast } from "../context/ToastContext";
import { StreakRing } from "../components/StreakRing";
import { DailyCheckIn } from "../components/DailyCheckIn";
import { TodayMission } from "../components/TodayMission";
import { getCategoryConfig, getMilestoneDays, type CategoryConfig } from "../services/recoveryConfig";
import type { RecoveryCategory } from "../context/OnboardingContext";

// Milestones are now dynamic per recovery category — see recoveryConfig.ts
// const MILESTONE_DAYS = computed dynamically from config

// ─── Scroll Reveal ────────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ─── Simple confetti burst ───────────────────────────────────────────────────
function spawnConfetti() {
  const colors = ['#8b5cf6', '#10b981', '#6366f1', '#ec4899', '#f97316', '#0d9488'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    Object.assign(el.style, {
      position: 'fixed', left: `${Math.random() * 100}vw`, top: '-10px',
      width: `${5 + Math.random() * 8}px`, height: `${5 + Math.random() * 8}px`,
      background: color, borderRadius: Math.random() > 0.5 ? '50%' : '2px', zIndex: '9999',
      animation: `confettiFall ${1.2 + Math.random() * 1.8}s ease-in forwards`,
      animationDelay: `${Math.random() * 0.6}s`,
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
  if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `@keyframes confettiFall { to { transform: translateY(105vh) rotate(720deg); opacity: 0; } }`;
    document.head.appendChild(style);
  }
}

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
      <div className="glass px-4 py-3 rounded-xl shadow-lg border-white/10 text-white">
        <p className="text-xs font-semibold text-slate-400 mb-1">{label}</p>
        <p className="text-base font-bold text-violet-400">{payload[0].value} <span className="text-xs text-slate-500">logged</span></p>
      </div>
    );
  }
  return null;
};

// Mini sparkline
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-10 w-full mt-2 opacity-60">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Progress timeline
const ProgressTimeline: React.FC<{ streak: number; catConfig: CategoryConfig }> = ({ streak, catConfig }) => {
  const [open, setOpen] = useState(false);
  const milestoneDays = getMilestoneDays(catConfig);

  return (
    <div className="bento-card bento-glow-violet rounded-2xl overflow-hidden scroll-reveal">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <TrendingUp size={15} className="text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">Progress Timeline</p>
            <p className="text-[10px] text-slate-400">Your milestone journey</p>
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {open && (
        <div className="px-5 pb-5 overflow-x-auto">
          <div className="flex gap-3 min-w-max">
            {milestoneDays.map((day, i) => {
              const m = catConfig.milestones[day];
              if (!m) return null;
              const reached = streak >= day;
              const isNext = !reached && milestoneDays[i - 1] !== undefined
                ? streak >= milestoneDays[i - 1]
                : !reached && i === 0;
              return (
                <div key={day} className="flex flex-col items-center relative">
                  {/* Connector line */}
                  {i < milestoneDays.length - 1 && (
                    <div
                      className="absolute top-6 left-[calc(50%+20px)] h-0.5 w-12"
                      style={{ background: reached ? m.color : '#e2e8f0' }}
                    />
                  )}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-2 shadow-md transition-all duration-300 ${reached ? 'scale-100' : 'scale-90 opacity-40 grayscale'}`}
                    style={reached ? { background: `linear-gradient(135deg, ${m.color}30, ${m.color}15)`, border: `2px solid ${m.color}60`, boxShadow: `0 4px 16px ${m.color}30` } : { background: 'rgba(0,0,0,0.04)', border: '2px solid #e2e8f0' }}
                  >
                    {m.emoji}
                  </div>
                  <p
                    className="text-[10px] font-bold text-center"
                    style={{ color: reached ? m.color : '#94a3b8' }}
                  >
                    Day {day}
                  </p>
                  {isNext && (
                    <span className="text-[9px] font-bold text-amber-500 animate-pulse">next</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Emotional Weather Widget ───────────────────────────────────────────────
const EmotionalWeatherWidget: React.FC<{ moodScore: number }> = ({ moodScore }) => {
  let weather = { icon: Sun, color: "from-amber-400 to-orange-500", text: "Sunny & Clear", desc: "You're having a good day. Enjoy the warmth." };
  if (moodScore < 4) weather = { icon: CloudLightning, color: "from-slate-700 to-slate-900", text: "Stormy", desc: "It's rough right now, but storms always pass." };
  else if (moodScore < 7) weather = { icon: CloudRain, color: "from-blue-400 to-indigo-500", text: "Cloudy & Showers", desc: "A bit gloomy today. Be gentle with yourself." };

  const Icon = weather.icon;

  return (
    <div className="bento-card p-6 rounded-2xl relative overflow-hidden group hover-lift card-3d shine-on-hover spotlight-card scroll-reveal">
      <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br ${weather.color} opacity-20 blur-3xl`} />
      <h3 className="font-bold text-slate-100 flex items-center gap-2 mb-4">
        <Icon size={18} className="text-slate-400" />
        Emotional Weather
      </h3>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${weather.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
           <Icon size={28} className="text-white" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-slate-100 font-display">{weather.text}</h4>
          <p className="text-sm text-slate-400 mt-1">{weather.desc}</p>
        </div>
      </div>
    </div>
  );
};

// ─── Breakthrough Moments ───────────────────────────────────────────────────
const BreakthroughMoments: React.FC = () => {
  return (
    <div className="bento-card p-6 rounded-2xl relative overflow-hidden group hover-lift card-3d shine-on-hover spotlight-card scroll-reveal">
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 opacity-10 blur-2xl" />
      <h3 className="font-bold text-slate-100 flex items-center gap-2 mb-4">
        <Zap size={18} className="text-fuchsia-400" />
        Breakthroughs
      </h3>
      <div className="space-y-3 relative z-10">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-slate-300 italic flex items-start gap-2">
          <span className="text-fuchsia-400 font-bold mt-0.5">"</span>
          My worth isn't tied to how productive I am today.
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-slate-300 italic flex items-start gap-2 opacity-70">
          <span className="text-fuchsia-400 font-bold mt-0.5">"</span>
          A craving is just a thought, it doesn't control my hands.
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, loading, isNewUser } = useUser();
  const navigate = useNavigate();
  const { showToast } = useToast();
  useScrollReveal();
  const [cravingData, setCravingData] = useState<CravingData[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [moodScore, setMoodScore] = useState<string>("Stable");
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [moodHistory, setMoodHistory] = useState<number[]>([]);
  // Anchor message
  const [anchorMessage, setAnchorMessage] = useState('');
  const [anchorDraft, setAnchorDraft] = useState('');
  const [editingAnchor, setEditingAnchor] = useState(false);
  const [savingAnchor, setSavingAnchor] = useState(false);
  // Victory
  const [victoryLoading, setVictoryLoading] = useState(false);
  // Check-in done today?
  const [checkInDone, setCheckInDone] = useState(false);

  useEffect(() => {
    if (!user?.id || isNewUser) return;
    fetchCravingData();
    fetchBadges();
    fetchMoodData();
    fetchAnchorMessage();
    computeRiskScore(user.id).then(setRiskScore);
    checkTodayCheckIn();
  }, [user?.id, isNewUser]);

  const checkTodayCheckIn = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("daily_logs")
        .select("id")
        .eq("user_id", user?.id)
        .eq("date", today)
        .single();
      if (data) setCheckInDone(true);
    } catch { }
  };

  const fetchAnchorMessage = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('bio')
        .eq('id', user?.id)
        .single();
      if (data?.bio) setAnchorMessage(data.bio);
    } catch { }
  };

  const saveAnchorMessage = async () => {
    if (!anchorDraft.trim()) return;
    setSavingAnchor(true);
    try {
      await supabase.from('users').update({ bio: anchorDraft.trim() }).eq('id', user?.id);
      setAnchorMessage(anchorDraft.trim());
      setEditingAnchor(false);
      showToast('Your anchor is saved 💚', 'success');
    } catch { showToast('Could not save. Try again.', 'error'); }
    finally { setSavingAnchor(false); }
  };

  const handleVictory = async () => {
    if (!user?.id) return;
    setVictoryLoading(true);
    try {
      await supabase.from('craving_logs').insert({
        user_id: user.id,
        severity: 0,
        trigger: 'craving_survived',
        coping_strategy_used: 'Resisted successfully — logged as victory',
      });
      spawnConfetti();
      showToast('🎉 You made it through! Victory recorded!', 'success');
      fetchCravingData();
    } catch { showToast('Could not record your victory', 'error'); }
    finally { setVictoryLoading(false); }
  };

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
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data, error } = await supabase
        .from("mood_logs")
        .select("mood_score, created_at")
        .eq("user_id", user?.id)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        const scores = data.map(d => d.mood_score);
        setMoodHistory(scores);
        const avgMood = scores.reduce((a, b) => a + b, 0) / scores.length;
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

  // Best day = lowest craving
  const bestDayIndex = cravingData.length > 0
    ? cravingData.reduce((minI, d, i, arr) => d.cravings < arr[minI].cravings ? i : minI, 0)
    : -1;

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

  // Get category-aware config
  const savedCategory = localStorage.getItem('beacura_recovery_category') as RecoveryCategory | null;
  const catConfig = getCategoryConfig(savedCategory);

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
  const activeMilestone = catConfig.milestones[userStreak];

  return (
    <div className="space-y-6 animate-in pb-8">

      {/* =================== MILESTONE BANNER =================== */}
      {activeMilestone && (
        <div className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 bounce-in"
          style={{ background: `linear-gradient(135deg, ${activeMilestone.color}18, ${activeMilestone.color}06)`, border: `1px solid ${activeMilestone.color}40`, boxShadow: `0 8px 32px ${activeMilestone.color}20` }}>
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10 morph-blob" style={{ background: activeMilestone.color }} />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          <div className="text-4xl flex-shrink-0 animate-float">{activeMilestone.emoji}</div>
          <div className="flex-1">
            <p className="font-extrabold text-slate-900 dark:text-slate-100 text-base" style={{ fontFamily: 'Sora, sans-serif' }}>
              {activeMilestone.title} 🎉
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{activeMilestone.science}</p>
          </div>
          <Trophy size={22} style={{ color: activeMilestone.color }} className="flex-shrink-0 animate-glow-pulse" />
        </div>
      )}

      {/* =================== HEADER =================== */}
      <header className="relative overflow-hidden bento-card rounded-2xl p-6 md:p-8 shine-on-hover spotlight-card">
        {/* Decorative orbs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-violet-500 rounded-full blur-3xl opacity-20 animate-float" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-float-slow" />
        <div className="absolute bottom-0 right-1/4 w-16 h-16 bg-emerald-500 rounded-full blur-2xl opacity-15 animate-float-fast" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                {(() => { const h = new Date().getHours(); if (h < 12) return '🌅 Good Morning'; if (h < 17) return '☀️ Good Afternoon'; if (h < 21) return '🌆 Good Evening'; return '🌙 Good Night'; })()}
              </span>
            </div>
            <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl md:text-4xl font-extrabold text-white">
              {isNewUser ? "Welcome, " : "Hey, "}<span className="gradient-text-emerald">{userName}</span> 💙
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed max-w-lg">
              {isNewUser
                ? "This is your safe space to heal, one day at a time. We're genuinely happy you're here."
                : userStreak === 0
                  ? "Every journey begins with a first step. Today is that step — and we're right here with you."
                  : userStreak < 7
                    ? `Day ${userStreak} — ${catConfig.greetingSuffix}`
                    : userStreak < 30
                      ? `${userStreak} days of showing up for yourself. Your body and mind are healing in ways you can't even see yet.`
                      : userStreak < 90
                        ? `${userStreak} days strong — your brain has measurably rewired. You are genuinely a different, stronger person.`
                        : `${userStreak} days. You didn't just survive — you rebuilt yourself. That is extraordinary.`
              }
            </p>
          </div>

          {/* Streak Ring + Mood Logger */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex flex-col items-center gap-1">
              <StreakRing streak={userStreak} size={90} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{catConfig.streakLabel}</span>
            </div>
            <MoodLogger userId={user?.id} onSuccess={fetchMoodData} />
          </div>
        </div>
      </header>

      {/* =================== ANCHOR MESSAGE =================== */}
      <div className="bento-card bento-glow-teal rounded-2xl p-5 spotlight-card">
        {!editingAnchor ? (
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Heart size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Why I'm Here</p>
                {anchorMessage ? (
                  <p className="text-slate-100 font-semibold text-sm leading-relaxed">"{anchorMessage}"</p>
                ) : (
                  <p className="text-slate-400 text-sm italic">{catConfig.whyImHerePrompt}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => { setAnchorDraft(anchorMessage); setEditingAnchor(true); }}
              className="flex-shrink-0 p-2 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
              title="Edit your anchor"
            >
              <Edit3 size={15} />
            </button>
          </div>
        ) : (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Your personal anchor — why are you doing this?</p>
              <textarea
              value={anchorDraft}
              onChange={e => setAnchorDraft(e.target.value)}
              placeholder="e.g. For my daughter. For the life I deserve. To prove I can."
              rows={2}
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none input-glow"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={saveAnchorMessage}
                disabled={savingAnchor || !anchorDraft.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                <Check size={14} />{savingAnchor ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setEditingAnchor(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-white/10 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =================== VICTORY BUTTON =================== */}
      <button
        onClick={handleVictory}
        disabled={victoryLoading}
        className="w-full relative overflow-hidden rounded-2xl p-4 flex items-center justify-center gap-3 font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 shine-on-hover group"
        style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)', boxShadow: '0 4px 24px rgba(16,185,129,0.25)' }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(135deg, #059669, #0f766e)' }} />
        <div className="absolute inset-0 rounded-2xl border-2 border-emerald-300/50 animate-ripple opacity-0 group-hover:opacity-100" />
        <Star size={20} fill="white" className="flex-shrink-0 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
        <span className="text-base relative z-10">
          {victoryLoading ? 'Recording your win...' : catConfig.winButtonText}
        </span>
      </button>

      {/* =================== DAILY CHECK-IN + TODAY'S MISSION =================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!checkInDone ? (
          <DailyCheckIn
            userId={user?.id || ""}
            onComplete={() => {
              setCheckInDone(true);
              showToast("🌟 Daily check-in complete!", "success");
            }}
          />
        ) : (
          <div className="bento-card rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-3 shadow-md">
              <Check size={22} className="text-white" />
            </div>
            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
              Check-in complete! ✅
            </p>
            <p className="text-xs text-slate-400 mt-1">You're showing up every single day.</p>
          </div>
        )}

        <TodayMission onAllComplete={() => { spawnConfetti(); showToast("🎉 All missions done! Incredible!", "success"); }} />
      </div>

      {/* =================== STAT BENTO GRID =================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bento-card rounded-2xl p-5 relative overflow-hidden group card-3d shine-on-hover spotlight-card bento-glow-violet scroll-reveal stagger-1">
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-indigo-500 rounded-full blur-2xl opacity-20 group-hover:opacity-50 group-hover:scale-125 transition-all duration-500" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-2 shadow-md">
              <span className="flame-flicker"><Flame size={18} className="text-white" /></span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Sobriety</p>
            <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-white stat-val text-shimmer">
              {userStreak}<span className="text-sm font-semibold text-slate-500 ml-1">days</span>
            </p>
            <Sparkline data={Array.from({ length: 7 }, (_, i) => Math.max(0, userStreak - (6 - i)))} color="#8b5cf6" />
          </div>
        </div>

        {/* Points */}
        <div className="bento-card rounded-2xl p-5 relative overflow-hidden group card-3d shine-on-hover spotlight-card bento-glow-emerald scroll-reveal stagger-2">
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-emerald-500 rounded-full blur-2xl opacity-20 group-hover:opacity-50 group-hover:scale-125 transition-all duration-500" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-2 shadow-md">
              <Award size={18} className="text-white" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Points</p>
            <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-white stat-val">{userPoints.toLocaleString()}</p>
            <Sparkline data={[100, 200, 150, 300, 250, 400, userPoints > 400 ? userPoints : 400]} color="#10b981" />
          </div>
        </div>

        {/* Mood */}
        <div className="bento-card rounded-2xl p-5 relative overflow-hidden group card-3d shine-on-hover spotlight-card bento-glow-rose scroll-reveal stagger-3">
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-pink-500 rounded-full blur-2xl opacity-20 group-hover:opacity-50 group-hover:scale-125 transition-all duration-500" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mb-2 shadow-md">
              <Heart size={18} className="text-white" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Mood</p>
            <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-white stat-val">{moodScore}</p>
            {moodHistory.length > 0 && <Sparkline data={moodHistory} color="#ec4899" />}
          </div>
        </div>

        {/* Risk Score */}
        <div className="bento-card rounded-2xl p-5 relative overflow-hidden group card-3d shine-on-hover spotlight-card bento-glow-teal scroll-reveal stagger-4">
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-teal-500 rounded-full blur-2xl opacity-20 group-hover:opacity-50 group-hover:scale-125 transition-all duration-500" />
          <div className="relative z-10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 shadow-md
              ${!riskScore || riskScore.level === 'low' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : ''}
              ${riskScore?.level === 'moderate' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : ''}
              ${riskScore?.level === 'high' ? 'bg-gradient-to-br from-rose-500 to-red-600 animate-pulse' : ''}
            `}>
              <Target size={18} className="text-white" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Risk Score</p>
            {riskScore ? (
              <>
                <p style={{ fontFamily: 'Sora, sans-serif' }} className={`text-2xl font-extrabold stat-val ${riskScore.color}`}>
                  {riskScore.score}<span className="text-sm font-semibold text-slate-500 ml-1">/100</span>
                </p>
                <p className={`text-xs font-bold mt-1 ${riskScore.color}`}>{riskScore.label}</p>
              </>
            ) : (
              <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-white stat-val">—</p>
            )}
          </div>
        </div>
      </div>

      {/* =================== CHART + BADGES =================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 scroll-reveal">

        {/* Chart */}
        <div className="lg:col-span-2 bento-card rounded-2xl p-6 spotlight-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-base font-bold text-slate-100">Craving Tracker</h2>
                <p className="text-xs text-slate-400">Last 7 days intensity</p>
              </div>
            </div>
          </div>

          <div className="h-52">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cravingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
                      <stop offset="50%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cravings"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#cravingGradient)"
                    dot={(props: any) => {
                      const isBest = props.index === bestDayIndex;
                      return (
                        <g key={props.index}>
                          <circle
                            cx={props.cx}
                            cy={props.cy}
                            r={isBest ? 7 : 4}
                            fill={isBest ? "#10b981" : "#8b5cf6"}
                            stroke="rgba(0,0,0,0.5)"
                            strokeWidth={2}
                          />
                          {isBest && (
                            <text x={props.cx} y={props.cy - 12} textAnchor="middle" fontSize={11} fill="#10b981" fontWeight="700">★</text>
                          )}
                        </g>
                      );
                    }}
                    activeDot={{ r: 6, fill: "#8b5cf6", stroke: "white", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-3 text-slate-500">
                  <Brain size={28} />
                </div>
                <h3 className="text-sm font-bold text-slate-300 mb-1">No Cravings Logged Yet</h3>
                <p className="text-xs text-slate-500 max-w-[180px] mb-3 leading-relaxed">
                  Tracking urges helps you understand your triggers.
                </p>
                <CravingLogger userId={user?.id} onSuccess={fetchCravingData} />
              </div>
            )}
          </div>

          {chartData.length > 0 && !isNewUser && (
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
              {bestDayIndex >= 0 && (
                <span className="text-xs text-emerald-400 font-semibold">
                  ★ Best day: {chartData[bestDayIndex]?.day} ({chartData[bestDayIndex]?.cravings} avg)
                </span>
              )}
              <CravingLogger userId={user?.id} onSuccess={fetchCravingData} />
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="bento-card rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Award size={16} className="text-violet-400" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-base font-bold text-slate-100">Achievements</h2>
              <p className="text-xs text-slate-400">Your latest badges</p>
            </div>
          </div>

          <div className="space-y-3">
            {badges.length > 0 ? (
              badges.map((badge) => (
                <div key={badge.id} className="flex items-center p-3 rounded-xl bg-white/5 border border-white/10 group hover-lift">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mr-3 shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Award size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-100 text-sm truncate">{badge.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Award size={24} className="opacity-40" />
                </div>
                <p className="text-sm font-semibold">No badges yet</p>
                <p className="text-xs mt-0.5 text-slate-500">Keep going — you'll earn them!</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="w-full mt-4 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm text-violet-400 font-bold hover:bg-white/10 transition-colors group"
          >
            <span>View All Rewards</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* =================== PROGRESS TIMELINE =================== */}
      <ProgressTimeline streak={userStreak} catConfig={catConfig} />

      {/* =================== OPTIONAL NEW WIDGETS =================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EmotionalWeatherWidget moodScore={moodScore} />
        <BreakthroughMoments />
      </div>

      {/* =================== ACTION CARDS =================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Morning Reflection */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group hover-lift card-3d shine-on-hover"
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
          className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group hover-lift card-3d shine-on-hover"
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
          className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group hover-lift card-3d shine-on-hover"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
          onClick={() => navigate("/counseling")}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }} />
          <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-4">
              <Flame size={20} className="text-white" />
            </div>
            <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-base font-bold text-white mb-1.5">Community Chat</h3>
            <p className="text-violet-100 text-xs mb-4 leading-relaxed">
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
