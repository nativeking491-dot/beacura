import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Target,
  Flame,
  Clock,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Heart,
  Award,
  BarChart3,
  Zap,
  Play,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { BodyMapSVG } from "../components/BodyMapSVG";
import { RecoveryRing } from "../components/RecoveryRing";
import type { BodyRegion, BodyRegionStatus, PhysioExercise, RecoveryPhase } from "../types";

// ─── Demo Data ──────────────────────────────────────────────────────────────
const DEMO_REGIONS: BodyRegionStatus[] = [
  { region: "right_knee", painLevel: 4, recoveryPercent: 62, injuryType: "post_surgery", phase: "strengthening", lastUpdated: new Date().toISOString() },
  { region: "lower_back", painLevel: 3, recoveryPercent: 75, injuryType: "disc_herniation", phase: "strengthening", lastUpdated: new Date().toISOString() },
  { region: "left_shoulder", painLevel: 2, recoveryPercent: 88, injuryType: "rotator_cuff", phase: "full_recovery", lastUpdated: new Date().toISOString() },
];

const TODAY_EXERCISES: { name: string; targetRegion: string; duration: string; icon: string; color: string; gradient: string }[] = [
  { name: "Quad Stretches", targetRegion: "Right Knee", duration: "8 min", icon: "🦵", color: "#10b981", gradient: "from-emerald-500 to-teal-600" },
  { name: "Core Stabilization", targetRegion: "Lower Back", duration: "12 min", icon: "💪", color: "#8b5cf6", gradient: "from-violet-500 to-indigo-600" },
  { name: "Shoulder Rotations", targetRegion: "Left Shoulder", duration: "6 min", icon: "🔄", color: "#06b6d4", gradient: "from-cyan-500 to-blue-600" },
  { name: "Resistance Band Walk", targetRegion: "Right Knee", duration: "10 min", icon: "🏃", color: "#f97316", gradient: "from-orange-500 to-amber-600" },
];

const PHASE_CONFIG: Record<RecoveryPhase, { label: string; icon: string; color: string; desc: string }> = {
  protection: { label: "Protection", icon: "🛡️", color: "#ef4444", desc: "Rest & protect the injury" },
  gentle_movement: { label: "Gentle Movement", icon: "🌱", color: "#eab308", desc: "Restore range of motion" },
  strengthening: { label: "Strengthening", icon: "💪", color: "#06b6d4", desc: "Build muscle & stability" },
  full_recovery: { label: "Full Recovery", icon: "🏆", color: "#10b981", desc: "Return to full activity" },
};

const PHASES: RecoveryPhase[] = ["protection", "gentle_movement", "strengthening", "full_recovery"];

// ─── Scroll Reveal ──────────────────────────────────────────────────────────
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

const PhysioHub: React.FC = () => {
  const navigate = useNavigate();
  useScrollReveal();

  const [activeRegion, setActiveRegion] = useState<BodyRegion | null>(null);
  const currentPhase: RecoveryPhase = "strengthening";
  const currentPhaseIndex = PHASES.indexOf(currentPhase);
  const overallRecovery = 72;
  const sessionsCompleted = 24;
  const totalMinutes = 312;
  const weekStreak = 6;
  const painReduction = 47;

  const selectedRegionStatus = activeRegion
    ? DEMO_REGIONS.find(r => r.region === activeRegion)
    : null;

  return (
    <div className="space-y-6 animate-in pb-8">

      {/* =================== HERO BANNER =================== */}
      <header className="relative overflow-hidden bento-card rounded-2xl p-6 md:p-8 shine-on-hover spotlight-card">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500 rounded-full blur-3xl opacity-15 animate-float" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-cyan-500 rounded-full blur-2xl opacity-15 animate-float-slow" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-violet-500 rounded-full blur-2xl opacity-10 morph-blob" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Physical Rehabilitation Hub
              </span>
            </div>
            <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl md:text-4xl font-extrabold text-white mb-2">
              Your Recovery <span className="gradient-text-healing">Dashboard</span>
            </h1>
            <p className="text-slate-400 font-medium leading-relaxed max-w-lg">
              {overallRecovery >= 80
                ? "You're nearly there! Your body has made incredible progress. Keep pushing through these final stages."
                : overallRecovery >= 50
                ? "Great progress! Your strength is building day by day. Stay consistent with your exercises."
                : "Every exercise brings you closer to recovery. Your body is healing — trust the process."
              }
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <RecoveryRing percent={overallRecovery} size={100} label="Overall" />
          </div>
        </div>
      </header>

      {/* =================== PHASE PROGRESS =================== */}
      <div className="bento-card rounded-2xl p-5 scroll-reveal spotlight-card overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
            <TrendingUp size={15} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">Recovery Phase</p>
            <p className="text-[10px] text-slate-400">Your healing journey stage</p>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          {PHASES.map((phase, i) => {
            const cfg = PHASE_CONFIG[phase];
            const isActive = i === currentPhaseIndex;
            const isPast = i < currentPhaseIndex;
            return (
              <React.Fragment key={phase}>
                {i > 0 && (
                  <div className={`hidden md:block flex-1 h-0.5 rounded-full transition-all duration-500 ${isPast ? 'bg-emerald-400' : isActive ? 'bg-gradient-to-r from-emerald-400 to-slate-700' : 'bg-slate-700'}`} />
                )}
                <div
                  className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'scale-110' : isPast ? 'opacity-60' : 'opacity-30'}`}
                  style={isActive ? { animation: 'phase-slide 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' } : undefined}
                >
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl shadow-md transition-all duration-300 ${isActive ? 'healing-pulse' : ''}`}
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}10)`
                        : isPast ? `${cfg.color}15` : 'rgba(255,255,255,0.03)',
                      border: isActive ? `2px solid ${cfg.color}60` : '1px solid rgba(255,255,255,0.06)',
                      boxShadow: isActive ? `0 4px 24px ${cfg.color}25` : 'none',
                    }}
                  >
                    {cfg.icon}
                  </div>
                  <span
                    className="text-[9px] md:text-[10px] font-bold text-center leading-tight"
                    style={{ color: isActive ? cfg.color : isPast ? '#94a3b8' : '#475569' }}
                  >
                    {cfg.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* =================== STAT BENTO GRID =================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Sessions", value: sessionsCompleted, suffix: "", icon: Activity, color: "from-violet-500 to-indigo-600", glow: "bento-glow-violet" },
          { label: "Minutes", value: totalMinutes, suffix: "", icon: Clock, color: "from-emerald-400 to-teal-500", glow: "bento-glow-emerald" },
          { label: "Week Streak", value: weekStreak, suffix: " wks", icon: Flame, color: "from-orange-400 to-amber-500", glow: "bento-glow-rose" },
          { label: "Pain ↓", value: painReduction, suffix: "%", icon: TrendingUp, color: "from-cyan-400 to-blue-500", glow: "bento-glow-indigo" },
        ].map((stat, i) => (
          <div key={stat.label} className={`bento-card rounded-2xl p-5 relative overflow-hidden group card-3d shine-on-hover spotlight-card ${stat.glow} scroll-reveal stagger-${i + 1}`}>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-current rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-all duration-500" />
            <div className="relative z-10">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 shadow-md`}>
                <stat.icon size={18} className="text-white" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{stat.label}</p>
              <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-white stat-val">
                {stat.value}{stat.suffix}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* =================== BODY MAP + REGION DETAIL =================== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 scroll-reveal">
        {/* Body Map */}
        <div className="lg:col-span-2 bento-card rounded-2xl p-5 spotlight-card flex flex-col items-center">
          <div className="flex items-center gap-2 self-start mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Target size={15} className="text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">Body Map</p>
              <p className="text-[10px] text-slate-400">Tap a region to see details</p>
            </div>
          </div>

          <BodyMapSVG
            regions={DEMO_REGIONS}
            selectedRegion={activeRegion}
            onRegionClick={setActiveRegion}
            size={220}
          />

          <button
            onClick={() => navigate("/body-map")}
            className="mt-3 flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors group"
          >
            <span>Open Full Body Map</span>
            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Region Detail */}
        <div className="lg:col-span-3 bento-card rounded-2xl p-6 spotlight-card">
          {selectedRegionStatus ? (
            <div className="space-y-5 animate-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-lg font-bold text-white capitalize">
                    {selectedRegionStatus.region.replace(/_/g, " ")}
                  </h3>
                  <p className="text-xs text-slate-400 capitalize">{selectedRegionStatus.injuryType?.replace(/_/g, " ") || "Active rehabilitation"}</p>
                </div>
                <RecoveryRing percent={selectedRegionStatus.recoveryPercent} size={70} label="Healed" showOrbit={false} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pain Level</p>
                  <p className="text-xl font-extrabold" style={{
                    fontFamily: 'Sora, sans-serif',
                    color: selectedRegionStatus.painLevel <= 3 ? '#10b981' : selectedRegionStatus.painLevel <= 6 ? '#eab308' : '#ef4444'
                  }}>
                    {selectedRegionStatus.painLevel}/10
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phase</p>
                  <p className="text-sm font-bold text-cyan-400 capitalize">
                    {PHASE_CONFIG[selectedRegionStatus.phase].icon} {PHASE_CONFIG[selectedRegionStatus.phase].label}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 mb-2">Assigned Exercises</p>
                <div className="space-y-2">
                  {TODAY_EXERCISES.filter(e =>
                    e.targetRegion.toLowerCase().includes(selectedRegionStatus.region.split("_").pop() || "")
                  ).map((ex, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors cursor-pointer">
                      <span className="text-lg">{ex.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-100 truncate">{ex.name}</p>
                        <p className="text-[10px] text-slate-400">{ex.duration}</p>
                      </div>
                      <Play size={14} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-3xl">
                🦴
              </div>
              <h3 className="text-sm font-bold text-slate-300 mb-1">Select a Body Region</h3>
              <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
                Click on a highlighted area on the body map to see recovery details and assigned exercises.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =================== TODAY'S PROGRAM =================== */}
      <div className="bento-card rounded-2xl p-6 spotlight-card scroll-reveal">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Calendar size={15} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">Today's Program</p>
              <p className="text-[10px] text-slate-400">4 exercises • ~36 minutes</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/guided-rehab")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shine-on-hover"
            style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}
          >
            <Play size={14} fill="white" />
            <span>Start Session</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TODAY_EXERCISES.map((ex, i) => (
            <div
              key={i}
              className={`rehab-card rounded-xl p-4 flex items-center gap-4 group cursor-pointer scroll-reveal stagger-${i + 1}`}
              onClick={() => navigate("/guided-rehab")}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ex.gradient} flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform duration-300`}
              >
                {ex.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-100 truncate">{ex.name}</p>
                <p className="text-[10px] text-slate-400">{ex.targetRegion} • {ex.duration}</p>
              </div>
              <ArrowRight size={14} className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* =================== QUICK ACTIONS =================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 scroll-reveal">
        <div
          className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group hover-lift card-3d shine-on-hover"
          style={{ background: 'linear-gradient(135deg, #0f766e, #0e7490)' }}
          onClick={() => navigate("/body-map")}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }} />
          <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-4">
              <Target size={20} className="text-white" />
            </div>
            <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-base font-bold text-white mb-1.5">Body Map</h3>
            <p className="text-teal-100 text-xs mb-4 leading-relaxed">Full interactive anatomy view with injury tracking.</p>
            <button className="btn-glass text-xs px-4 py-2 flex items-center space-x-1.5 group-hover:bg-white/30 transition-all">
              <span>Explore</span>
              <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group hover-lift card-3d shine-on-hover"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}
          onClick={() => navigate("/pain-journal")}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, #8b5cf6, #818cf8)' }} />
          <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-4">
              <BarChart3 size={20} className="text-white" />
            </div>
            <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-base font-bold text-white mb-1.5">Pain Journal</h3>
            <p className="text-violet-100 text-xs mb-4 leading-relaxed">Track pain levels & see your improvement over time.</p>
            <button className="btn-glass text-xs px-4 py-2 flex items-center space-x-1.5 group-hover:bg-white/30 transition-all">
              <span>Log Pain</span>
              <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group hover-lift card-3d shine-on-hover"
          style={{ background: 'linear-gradient(135deg, #b45309, #d97706)' }}
          onClick={() => navigate("/recovery-timeline")}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }} />
          <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-4">
              <Award size={20} className="text-white" />
            </div>
            <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-base font-bold text-white mb-1.5">Recovery Timeline</h3>
            <p className="text-amber-100 text-xs mb-4 leading-relaxed">View milestones & celebrate your healing journey.</p>
            <button className="btn-glass text-xs px-4 py-2 flex items-center space-x-1.5 group-hover:bg-white/30 transition-all">
              <span>View Timeline</span>
              <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PhysioHub;
