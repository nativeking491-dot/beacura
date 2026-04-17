import React, { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useUser } from "../context/UserContext";
import {
  Settings,
  Shield,
  Award,
  Calendar,
  Mail,
  Edit2,
  Loader2,
  ChevronRight,
  Flame,
  Trophy,
  Star,
  Download,
  Bell,
  Lock,
  Zap,
} from "lucide-react";
import { ThemePicker } from "../components/ThemePicker";
import { PrivacySettingsModal } from "../components/PrivacySettingsModal";
import { NotificationPreferencesModal } from "../components/NotificationPreferencesModal";
import { ExportDataModal } from "../components/ExportDataModal";
import { BecomeMentorModal } from "../components/BecomeMentorModal";
import { XPBar } from "../components/XPBar";

const Profile: React.FC = () => {
  const { user, loading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [badges, setBadges] = useState<any[]>([]);

  React.useEffect(() => {
    if (user?.name) setEditedName(user.name);
    fetchBadges();
  }, [user]);

  const fetchBadges = async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from("badges").select("*").eq("user_id", user.id)
        .order("earned_at", { ascending: false });
      setBadges(data || []);
    } catch (e) { console.error(e); }
  };

  const handleSaveProfile = async () => {
    if (!user || !editedName.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("users").update({ name: editedName }).eq("id", user.id);
      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => { setSaveSuccess(false); setIsEditing(false); window.location.reload(); }, 1200);
    } catch (e) {
      console.error("Error updating profile:", e);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full bg-amber-400 blur-lg opacity-40 animate-glow-pulse" />
          <div className="w-14 h-14 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-slate-500">Unable to load profile data.</p>
        <button onClick={() => (window.location.href = "/auth")} className="btn-primary px-6 py-2.5 text-sm">
          Return to Login
        </button>
      </div>
    );
  }

  const userName = user.name || "User";
  const userEmail = user.email || "email@example.com";
  const userRole = user.role || "RECOVERING_USER";
  const userStreak = user.streak || 0;
  const userPoints = user.points || 0;
  const joinDate = user.created_at ? new Date(user.created_at) : new Date();

  const levelName = userStreak < 7 ? "Beginner" : userStreak < 30 ? "Fighter" : userStreak < 90 ? "Champion" : "Warrior";
  const levelNum = userStreak < 7 ? 1 : userStreak < 30 ? 2 : userStreak < 90 ? 3 : 4;
  const xpPct = Math.min((userPoints / 1000) * 100, 100);

  const ACTION_ITEMS = [
    { label: "Privacy Settings", icon: Lock, onClick: () => setShowPrivacyModal(true) },
    { label: "Notification Preferences", icon: Bell, onClick: () => setShowNotificationModal(true) },
    { label: "Export Recovery Data", icon: Download, onClick: () => setShowExportModal(true) },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in pb-8">

      {/* =================== HERO BANNER =================== */}
      <div className="relative overflow-hidden bento-card rounded-2xl border-none">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl pointer-events-none z-0" />
        {/* Background gradient + orbs */}
        <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08), rgba(16,185,129,0.06))' }}
          className="absolute inset-0 z-0" />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-violet-500 rounded-full blur-3xl opacity-20 z-0" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500 rounded-full blur-3xl opacity-15 z-0" />

        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-3xl bg-violet-500 blur-2xl opacity-35 scale-110" />
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)] border border-white/20">
                <span style={{ fontFamily: 'Sora, sans-serif' }} className="text-white text-4xl font-extrabold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all border border-white/10"
              >
                <Edit2 size={13} />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                  <input
                    autoFocus
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-2xl font-bold text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 w-full md:w-auto transition-all shadow-inner"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className={`px-4 py-2 text-sm flex items-center gap-1.5 rounded-xl font-bold transition-all shadow-lg ${saveSuccess ? "bg-emerald-500 text-white shadow-emerald-500/30" : "bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:scale-105 hover:shadow-violet-500/30"}`}
                    >
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : saveSuccess ? "✓ Saved!" : "Save"}
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); setEditedName(user?.name || ""); }}
                      className="px-4 py-2 text-sm bg-white/5 text-slate-300 rounded-xl font-bold hover:bg-white/10 transition-colors border border-white/5"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">
                  {userName}
                </h1>
              )}

              <div className="flex flex-wrap justify-center md:justify-start gap-3 text-slate-400 text-xs font-medium mb-4">
                <span className="flex items-center gap-1"><Mail size={12} /> {userEmail}</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> Joined {joinDate.toLocaleDateString()}</span>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {userRole === "RECOVERED_MENTOR" ? "✦ Recovered Mentor" : "🌱 Recovering User"}
                </span>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/5 text-slate-300 border border-white/10 flex items-center gap-1">
                  <Flame size={11} className="text-violet-400" />
                  Level {levelNum} · {levelName}
                </span>
              </div>
            </div>

            {/* Stat chips */}
            <div className="flex md:flex-col gap-3">
              <div className="bg-white/5 backdrop-blur-md px-4 py-3 rounded-xl text-center border border-white/10 hover-lift">
                <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-xl font-extrabold text-violet-400">{userStreak}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">day streak</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md px-4 py-3 rounded-xl text-center border border-white/10 hover-lift">
                <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-xl font-extrabold text-emerald-400">{userPoints.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">total XP</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Left: Journey + Badges */}
        <div className="md:col-span-2 space-y-5">
          <ThemePicker />

          {/* Journey XP Card */}
          <div className="bento-card rounded-2xl p-6 border-none relative overflow-hidden">
             <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl pointer-events-none z-0" />
            <div className="relative z-10 flex items-center space-x-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] border border-white/20">
                <Zap size={18} className="text-white" />
              </div>
              <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-slate-100">Recovery Journey</h3>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4 mb-5">
              <div className="rounded-2xl p-4 text-center bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl font-extrabold text-violet-400 mb-0.5">{userStreak}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Days Clean</p>
              </div>
              <div className="rounded-2xl p-4 text-center bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl font-extrabold text-emerald-400 mb-0.5">{userPoints.toLocaleString()}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">XP Earned</p>
              </div>
            </div>

            {/* XP Progress Bar — Animated tier system */}
            <div className="relative z-10">
              <XPBar points={userPoints} className="mt-2" />
            </div>
          </div>

          {/* Badges */}
          <div className="bento-card rounded-2xl p-6 border-none relative overflow-hidden">
             <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl pointer-events-none z-0" />
            <div className="relative z-10 flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] border border-white/20">
                  <Trophy size={18} className="text-white" />
                </div>
                <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-slate-100">Badges & Accomplishments</h3>
              </div>
            </div>

            <div className="relative z-10 flex flex-wrap gap-3">
              {badges.length > 0 ? (
                badges.map((badge, i) => (
                  <div
                    key={badge.id}
                    className="hex-badge card-3d spotlight-card flex flex-col items-center text-center p-4 w-28 bg-white/5 border border-white/10 group hover-lift"
                    style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform
                      ${i % 3 === 0 ? "bg-gradient-to-br from-violet-500 to-indigo-600" : i % 3 === 1 ? "bg-gradient-to-br from-teal-400 to-emerald-500" : "bg-gradient-to-br from-indigo-500 to-purple-600"}`}
                    >
                      <Award size={18} className="text-white" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-200 leading-tight">{badge.name}</p>
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Award size={24} className="text-slate-500" />
                  </div>
                  <p className="text-sm font-bold text-slate-400">No badges yet</p>
                  <p className="text-xs text-slate-500 mt-0.5">Keep going — you'll earn them!</p>
                </div>
              )}
              {/* Next milestone */}
              <div
                className="flex flex-col items-center text-center p-4 w-28 rounded-2xl border-2 border-dashed border-white/10 group hover:border-violet-500/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Star size={18} className="text-slate-500 group-hover:text-violet-400 transition-colors" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 group-hover:text-violet-400 transition-colors leading-tight">
                  Next: {30 - userStreak > 0 ? `${30 - userStreak}d away` : "30-Day Pro!"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Account Actions + Mentor */}
        <div className="space-y-5">
          <div className="bento-card rounded-2xl p-5 border-none relative overflow-hidden">
             <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl pointer-events-none z-0" />
            <div className="relative z-10">
              <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-slate-100 mb-4 text-sm">Account</h3>
              <div className="space-y-1">
                {ACTION_ITEMS.map(({ label, icon: Icon, onClick }) => (
                  <button
                    key={label}
                    onClick={onClick}
                    className="w-full text-left px-3 py-3 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/10 transition-colors border border-white/5">
                        <Icon size={13} className="text-slate-400 group-hover:text-violet-400 transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{label}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-500 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mentor CTA */}
          <div className="relative overflow-hidden rounded-2xl p-5 text-white"
            style={{ background: 'linear-gradient(135deg, #2e1065 0%, #0f172a 100%)' }}>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-fuchsia-500 rounded-full blur-2xl opacity-30" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3 border border-white/10">
                <Shield size={20} className="text-fuchsia-300" />
              </div>
              <h4 style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-sm mb-2">Become a Mentor</h4>
              <p className="text-slate-300 text-xs mb-4 leading-relaxed">
                {userStreak >= 365
                  ? "You've earned the right to guide others."
                  : `Reach 1-year sobriety to unlock. ${365 - userStreak} days left.`}
              </p>
              <button
                onClick={() => setShowMentorModal(true)}
                disabled={userStreak < 365}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${userStreak >= 365
                    ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:shadow-[0_0_15px_rgba(217,70,239,0.5)] border border-white/20"
                    : "bg-white/5 text-slate-400 cursor-not-allowed border border-white/10"
                  }`}
              >
                {userStreak >= 365 ? "Become a Mentor →" : `${365 - userStreak} days away`}
              </button>
            </div>
          </div>

          {/* Settings shortcut */}
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="w-full bento-card rounded-2xl px-4 py-3 flex items-center justify-between group hover-lift border-none relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl pointer-events-none z-0" />
            <div className="relative z-10 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <Settings size={15} className="text-slate-400" />
              </div>
              <span className="text-sm font-semibold text-slate-200">Advanced Settings</span>
            </div>
            <ChevronRight size={14} className="relative z-10 text-slate-500 group-hover:translate-x-1 group-hover:text-white transition-all" />
          </button>
        </div>
      </div>

      {showPrivacyModal && <PrivacySettingsModal userId={user?.id} onClose={() => setShowPrivacyModal(false)} />}
      {showNotificationModal && <NotificationPreferencesModal userId={user?.id} onClose={() => setShowNotificationModal(false)} />}
      {showExportModal && <ExportDataModal userId={user?.id} userName={userName} userEmail={userEmail} onClose={() => setShowExportModal(false)} />}
      {showMentorModal && <BecomeMentorModal userId={user?.id} userStreak={userStreak} userEmail={userEmail} onClose={() => setShowMentorModal(false)} />}
    </div>
  );
};

export default Profile;
