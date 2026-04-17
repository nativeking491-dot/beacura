import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  TrendingDown,
  TrendingUp,
  Calendar,
  BarChart3,
  Target,
  Clock,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import { PainSlider } from "../components/PainSlider";
import { BodyMapSVG } from "../components/BodyMapSVG";
import type { BodyRegion, BodyRegionStatus, PainType, ActivityContext, PainLog } from "../types";

// ─── Demo Data ──────────────────────────────────────────────────────────────
const PAIN_TYPES: { value: PainType; label: string; icon: string }[] = [
  { value: "sharp", label: "Sharp", icon: "⚡" },
  { value: "dull", label: "Dull", icon: "🔵" },
  { value: "burning", label: "Burning", icon: "🔥" },
  { value: "throbbing", label: "Throbbing", icon: "💗" },
  { value: "aching", label: "Aching", icon: "😣" },
  { value: "tingling", label: "Tingling", icon: "✨" },
  { value: "stiffness", label: "Stiffness", icon: "🧊" },
  { value: "shooting", label: "Shooting", icon: "⚡" },
];

const ACTIVITY_CONTEXTS: { value: ActivityContext; label: string; icon: string }[] = [
  { value: "at_rest", label: "At Rest", icon: "🛋️" },
  { value: "during_exercise", label: "During Exercise", icon: "🏋️" },
  { value: "after_sleep", label: "After Sleep", icon: "😴" },
  { value: "during_work", label: "During Work", icon: "💻" },
  { value: "walking", label: "Walking", icon: "🚶" },
  { value: "lifting", label: "Lifting", icon: "📦" },
  { value: "sitting", label: "Sitting", icon: "🪑" },
  { value: "standing", label: "Standing", icon: "🧍" },
];

const MOOD_OPTIONS = ["😊", "🙂", "😐", "😕", "😢", "😤", "😰", "💪"];

const DEMO_ENTRIES: PainLog[] = [
  { id: "1", user_id: "u1", region: "right_knee", severity: 6, painType: "sharp", activityContext: "during_exercise", mood: "😕", notes: "Felt a twinge during wall squats. Eased off and it subsided.", created_at: new Date(Date.now() - 86400000 * 0).toISOString() },
  { id: "2", user_id: "u1", region: "lower_back", severity: 4, painType: "aching", activityContext: "after_sleep", mood: "😐", notes: "Stiff after sleeping — better after morning stretches.", created_at: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: "3", user_id: "u1", region: "right_knee", severity: 3, painType: "dull", activityContext: "at_rest", mood: "🙂", notes: "Much better today. Ice helped a lot last night.", created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "4", user_id: "u1", region: "left_shoulder", severity: 2, painType: "stiffness", activityContext: "during_work", mood: "💪", notes: "Got stiff at desk but pendulums fixed it quickly.", created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "5", user_id: "u1", region: "lower_back", severity: 5, painType: "throbbing", activityContext: "lifting", mood: "😤", notes: "Tried lifting a heavy box — mistake. Need to be more careful.", created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
];

const DEMO_REGIONS: BodyRegionStatus[] = [
  { region: "right_knee", painLevel: 3, recoveryPercent: 62, phase: "strengthening", lastUpdated: new Date().toISOString() },
  { region: "lower_back", painLevel: 4, recoveryPercent: 75, phase: "strengthening", lastUpdated: new Date().toISOString() },
  { region: "left_shoulder", painLevel: 2, recoveryPercent: 88, phase: "full_recovery", lastUpdated: new Date().toISOString() },
];

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

function getPainColor(severity: number): string {
  if (severity <= 2) return "#10b981";
  if (severity <= 4) return "#84cc16";
  if (severity <= 6) return "#eab308";
  if (severity <= 8) return "#f97316";
  return "#ef4444";
}

function formatDate(isoStr: string): string {
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

const PainJournal: React.FC = () => {
  const navigate = useNavigate();
  useScrollReveal();
  const [showLogger, setShowLogger] = useState(false);
  const [entries] = useState<PainLog[]>(DEMO_ENTRIES);

  // Logger state
  const [painValue, setPainValue] = useState(5);
  const [selectedRegion, setSelectedRegion] = useState<BodyRegion | null>(null);
  const [selectedPainType, setSelectedPainType] = useState<PainType | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityContext | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  // Insights
  const avgPain = entries.length > 0 ? (entries.reduce((s, e) => s + e.severity, 0) / entries.length) : 0;
  const recentPain = entries.filter(e => {
    const diff = Date.now() - new Date(e.created_at).getTime();
    return diff < 86400000 * 3;
  });
  const olderPain = entries.filter(e => {
    const created = new Date(e.created_at).getTime();
    return Date.now() - created >= 86400000 * 3 && Date.now() - created < 86400000 * 7;
  });
  const recentAvg = recentPain.length > 0 ? recentPain.reduce((s, e) => s + e.severity, 0) / recentPain.length : 0;
  const olderAvg = olderPain.length > 0 ? olderPain.reduce((s, e) => s + e.severity, 0) / olderPain.length : 0;
  const painTrend = olderAvg > 0 ? Math.round(((olderAvg - recentAvg) / olderAvg) * 100) : 0;

  const resetForm = () => {
    setPainValue(5);
    setSelectedRegion(null);
    setSelectedPainType(null);
    setSelectedActivity(null);
    setSelectedMood(null);
    setNotes("");
    setShowLogger(false);
  };

  return (
    <div className="space-y-6 animate-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/physio")} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl md:text-3xl font-extrabold text-white">
              Pain <span className="gradient-text-healing">Journal</span>
            </h1>
            <p className="text-xs text-slate-400">Track, understand, and overcome your pain</p>
          </div>
        </div>
        <button
          onClick={() => setShowLogger(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shine-on-hover"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 4px 20px rgba(139,92,246,0.3)' }}
        >
          <Plus size={16} />
          <span>Log Pain</span>
        </button>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bento-card rounded-2xl p-5 spotlight-card scroll-reveal stagger-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <BarChart3 size={14} className="text-violet-400" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg Pain</p>
          </div>
          <p className="text-3xl font-extrabold" style={{ fontFamily: 'Sora, sans-serif', color: getPainColor(Math.round(avgPain)) }}>
            {avgPain.toFixed(1)}<span className="text-sm text-slate-500">/10</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Last 7 days average</p>
        </div>

        <div className="bento-card rounded-2xl p-5 spotlight-card scroll-reveal stagger-2">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${painTrend > 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
              {painTrend >= 0 ? <TrendingDown size={14} className="text-emerald-400" /> : <TrendingUp size={14} className="text-rose-400" />}
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trend</p>
          </div>
          <p className="text-3xl font-extrabold" style={{ fontFamily: 'Sora, sans-serif', color: painTrend > 0 ? '#10b981' : painTrend < 0 ? '#ef4444' : '#eab308' }}>
            {painTrend > 0 ? "↓" : painTrend < 0 ? "↑" : "—"}{Math.abs(painTrend)}%
          </p>
          <p className="text-[10px] text-slate-400 mt-1">{painTrend > 0 ? "Pain is decreasing!" : painTrend < 0 ? "Pain increased" : "Stable"}</p>
        </div>

        <div className="bento-card rounded-2xl p-5 spotlight-card scroll-reveal stagger-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Calendar size={14} className="text-cyan-400" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Entries</p>
          </div>
          <p className="text-3xl font-extrabold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
            {entries.length}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Pain logs recorded</p>
        </div>
      </div>

      {/* Pain Entries */}
      <div className="bento-card rounded-2xl p-5 spotlight-card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Clock size={14} className="text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-slate-100">Recent Entries</p>
          </div>
        </div>

        <div className="space-y-3">
          {entries.map((entry, i) => (
            <div key={entry.id} className={`p-4 rounded-xl bg-white/5 border border-white/10 scroll-reveal stagger-${Math.min(i + 1, 6)}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${getPainColor(entry.severity)}25, ${getPainColor(entry.severity)}10)`,
                      border: `1px solid ${getPainColor(entry.severity)}40`,
                    }}
                  >
                    {entry.severity}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-100 capitalize">{entry.region.replace(/_/g, " ")}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500 font-bold capitalize">{entry.painType}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500 font-bold capitalize">{entry.activityContext.replace(/_/g, " ")}</span>
                      <span className="text-xs">{entry.mood}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{formatDate(entry.created_at)}</span>
              </div>
              {entry.notes && (
                <p className="text-xs text-slate-400 mt-2 leading-relaxed pl-[52px]">"{entry.notes}"</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pain Logger Modal */}
      {showLogger && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 pt-8 overflow-y-auto animate-in">
          <div className="bento-card rounded-3xl p-6 w-full max-w-lg relative mb-8">
            <button onClick={resetForm} className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <X size={16} />
            </button>

            <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-lg font-bold text-white mb-1">Log Pain Entry</h3>
            <p className="text-xs text-slate-400 mb-6">Record how you're feeling right now</p>

            <div className="space-y-6">
              {/* Pain Level */}
              <PainSlider value={painValue} onChange={setPainValue} />

              {/* Body Region Selection (mini map) */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Where does it hurt?</p>
                <div className="flex justify-center">
                  <BodyMapSVG
                    regions={DEMO_REGIONS}
                    selectedRegion={selectedRegion}
                    onRegionClick={setSelectedRegion}
                    size={160}
                  />
                </div>
                {selectedRegion && (
                  <p className="text-center text-xs font-bold text-violet-400 mt-2 capitalize">{selectedRegion.replace(/_/g, " ")}</p>
                )}
              </div>

              {/* Pain Type */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Type of Pain</p>
                <div className="flex flex-wrap gap-2">
                  {PAIN_TYPES.map(pt => (
                    <button
                      key={pt.value}
                      onClick={() => setSelectedPainType(pt.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        selectedPainType === pt.value
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span>{pt.icon}</span>
                      <span>{pt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Context */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">When did it happen?</p>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITY_CONTEXTS.map(ac => (
                    <button
                      key={ac.value}
                      onClick={() => setSelectedActivity(ac.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        selectedActivity === ac.value
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span>{ac.icon}</span>
                      <span>{ac.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">How do you feel?</p>
                <div className="flex gap-2 flex-wrap">
                  {MOOD_OPTIONS.map(mood => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                        selectedMood === mood
                          ? 'bg-violet-500/20 border-2 border-violet-400 scale-110'
                          : 'bg-white/5 border border-white/10 hover:scale-110'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Notes (optional)</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="What were you doing? How did it feel? Any triggers?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none input-glow"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={resetForm}
              className="w-full mt-6 py-3 rounded-xl text-sm font-bold text-white shine-on-hover transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 4px 20px rgba(139,92,246,0.3)' }}
            >
              <Check size={16} />
              <span>Save Pain Entry</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PainJournal;
