import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Heart,
  Check,
  Lock,
  Info,
} from "lucide-react";
import type { RecoveryMilestone, RecoveryPhase } from "../types";

// ─── Milestone Data ─────────────────────────────────────────────────────────
interface TimelineMilestone {
  day: number;
  title: string;
  description: string;
  scienceFact: string;
  emoji: string;
  color: string;
  phase: RecoveryPhase;
  completed: boolean;
  isActive: boolean;
}

const MILESTONES: TimelineMilestone[] = [
  {
    day: 1, title: "Day 1: First Steps", description: "Started rehabilitation program. Initial assessment completed.",
    scienceFact: "After injury, the inflammatory phase begins immediately. Your body is already sending healing cells to the affected area — it's a sign of repair, not just pain.",
    emoji: "🌱", color: "#10b981", phase: "protection", completed: true, isActive: false,
  },
  {
    day: 3, title: "Day 3: Pain Management", description: "Learning RICE protocol. Gentle range-of-motion exercises introduced.",
    scienceFact: "Controlled movement during the acute phase increases blood flow by 25%, bringing essential nutrients and oxygen to the injury site.",
    emoji: "❄️", color: "#06b6d4", phase: "protection", completed: true, isActive: false,
  },
  {
    day: 7, title: "Week 1: Foundation", description: "First week complete. Swelling reduced. Basic mobility restored.",
    scienceFact: "By day 7, your body has laid down new collagen fibers. These fibers are disorganized initially but strengthen significantly with gentle controlled loading.",
    emoji: "🏗️", color: "#6366f1", phase: "protection", completed: true, isActive: false,
  },
  {
    day: 14, title: "Week 2: Movement Returns", description: "Beginning gentle active exercises. Pain noticeably reduced.",
    scienceFact: "The proliferative healing phase peaks around day 14. New tissue is forming rapidly — this is when gentle movement becomes critical for proper healing alignment.",
    emoji: "🚶", color: "#8b5cf6", phase: "gentle_movement", completed: true, isActive: false,
  },
  {
    day: 21, title: "Week 3: Building Confidence", description: "Increasing exercise intensity. Starting resistance work.",
    scienceFact: "At 3 weeks, your tendon/ligament tensile strength has recovered to approximately 25% of pre-injury levels. Progressive loading increases this rate by 15%.",
    emoji: "💪", color: "#ec4899", phase: "gentle_movement", completed: true, isActive: false,
  },
  {
    day: 30, title: "Month 1: Strong Progress", description: "Major pain reduction achieved. Strength rebuilding actively.",
    scienceFact: "At 4 weeks, your body transitions from the proliferative to the remodeling phase. Collagen fibers are reorganizing along lines of stress — your exercises are literally sculpting stronger tissue.",
    emoji: "⚡", color: "#f59e0b", phase: "strengthening", completed: true, isActive: true,
  },
  {
    day: 42, title: "Week 6: Strength Phase", description: "Advanced strengthening exercises. Functional movements being restored.",
    scienceFact: "By week 6, nerve regeneration begins producing noticeable improvements in proprioception — your body's spatial awareness is rebuilding.",
    emoji: "🏋️", color: "#f97316", phase: "strengthening", completed: false, isActive: false,
  },
  {
    day: 56, title: "Month 2: Resilience", description: "Sport-specific or work-specific rehabilitation begins.",
    scienceFact: "At 8 weeks, your repaired tissue has 50-60% of its original strength. This is the threshold where progressive overload produces the most significant gains.",
    emoji: "🔥", color: "#ef4444", phase: "strengthening", completed: false, isActive: false,
  },
  {
    day: 70, title: "Week 10: Near Full", description: "90% function restored. Fine-tuning balance and coordination.",
    scienceFact: "Muscle re-education at this stage creates lasting motor patterns. Your brain is literally rewiring neural pathways for the recovered movements.",
    emoji: "🎯", color: "#14b8a6", phase: "full_recovery", completed: false, isActive: false,
  },
  {
    day: 84, title: "Month 3: Full Recovery", description: "Rehabilitation complete! Full return to activities achieved.",
    scienceFact: "At 12 weeks, repaired tissue reaches 80-90% of original strength. Studies show patients who complete full rehab programs have 65% lower re-injury rates.",
    emoji: "🏆", color: "#10b981", phase: "full_recovery", completed: false, isActive: false,
  },
];

const PHASES: { phase: RecoveryPhase; label: string; color: string; weeks: string }[] = [
  { phase: "protection", label: "Protection", color: "#ef4444", weeks: "Week 1" },
  { phase: "gentle_movement", label: "Gentle Movement", color: "#eab308", weeks: "Weeks 2-3" },
  { phase: "strengthening", label: "Strengthening", color: "#06b6d4", weeks: "Weeks 4-8" },
  { phase: "full_recovery", label: "Full Recovery", color: "#10b981", weeks: "Weeks 8-12" },
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

const RecoveryTimeline: React.FC = () => {
  const navigate = useNavigate();
  useScrollReveal();
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);

  const currentDay = 30;
  const completedMilestones = MILESTONES.filter(m => m.completed).length;
  const progressPercent = (completedMilestones / MILESTONES.length) * 100;

  return (
    <div className="space-y-6 animate-in pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/physio")} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl md:text-3xl font-extrabold text-white">
            Recovery <span className="gradient-text-healing">Timeline</span>
          </h1>
          <p className="text-xs text-slate-400">Your healing journey — milestone by milestone</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bento-card rounded-2xl p-6 spotlight-card relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500 rounded-full blur-3xl opacity-10 animate-float" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Journey Progress</p>
              <p className="text-sm text-slate-300 mt-1">Day {currentDay} of 84 • {completedMilestones}/{MILESTONES.length} milestones</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-emerald-400" style={{ fontFamily: 'Sora, sans-serif' }}>
                {Math.round(progressPercent)}%
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Complete</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 rounded-full bg-white/5 overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #10b981, #06b6d4, #8b5cf6)',
              }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            </div>
            {/* Current position marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-lg border-2 border-emerald-400 transition-all duration-1000"
              style={{ left: `calc(${progressPercent}% - 10px)` }}
            />
          </div>

          {/* Phase indicators */}
          <div className="flex mt-4 gap-1">
            {PHASES.map((p, i) => {
              const phaseStart = (i / 4) * 100;
              const isCurrent = MILESTONES.find(m => m.isActive)?.phase === p.phase;
              return (
                <div key={p.phase} className="flex-1 text-center">
                  <div
                    className="h-1.5 rounded-full mb-1.5 transition-all"
                    style={{
                      background: isCurrent
                        ? `linear-gradient(90deg, ${p.color}, ${p.color}60)`
                        : progressPercent > phaseStart + 25 ? p.color : `${p.color}20`,
                      boxShadow: isCurrent ? `0 0 12px ${p.color}40` : 'none',
                    }}
                  />
                  <p className="text-[9px] font-bold" style={{ color: isCurrent ? p.color : '#475569' }}>
                    {p.label}
                  </p>
                  <p className="text-[8px] text-slate-500">{p.weeks}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500/40 via-cyan-500/20 to-transparent" />

        <div className="space-y-4">
          {MILESTONES.map((milestone, i) => {
            const isExpanded = expandedMilestone === i;
            const isCompleted = milestone.completed;
            const isActive = milestone.isActive;
            const isLocked = !isCompleted && !isActive;

            return (
              <div key={i} className={`relative scroll-reveal stagger-${Math.min(i + 1, 6)}`}>
                {/* Timeline node */}
                <div className="absolute left-3 md:left-5 top-6 z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md transition-all duration-300 ${
                      isActive ? 'healing-pulse' : ''
                    }`}
                    style={{
                      background: isCompleted || isActive
                        ? `linear-gradient(135deg, ${milestone.color}, ${milestone.color}88)`
                        : 'rgba(255,255,255,0.05)',
                      border: isLocked ? '2px solid rgba(255,255,255,0.1)' : `2px solid ${milestone.color}80`,
                      boxShadow: isActive ? `0 0 20px ${milestone.color}40` : 'none',
                    }}
                  >
                    {isCompleted ? (
                      <Check size={12} className="text-white" />
                    ) : isLocked ? (
                      <Lock size={10} className="text-slate-500" />
                    ) : (
                      <Sparkles size={10} className="text-white" />
                    )}
                  </div>
                </div>

                {/* Card */}
                <div
                  className={`ml-14 md:ml-16 ${
                    isLocked ? 'opacity-40' : ''
                  }`}
                >
                  <button
                    onClick={() => setExpandedMilestone(isExpanded ? null : i)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? 'rehab-card border-emerald-500/30'
                        : isCompleted
                        ? 'bento-card'
                        : 'bg-white/[0.02] border border-white/[0.05]'
                    } ${!isLocked ? 'hover:bg-white/[0.08]' : ''}`}
                    disabled={isLocked}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-xl ${isLocked ? 'grayscale' : ''}`}>{milestone.emoji}</span>
                        <div>
                          <p className="text-sm font-bold text-slate-100">{milestone.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{milestone.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="text-[9px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 animate-pulse">
                            CURRENT
                          </span>
                        )}
                        {!isLocked && (
                          isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-white/10 animate-in">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Info size={12} className="text-cyan-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Science of Healing</p>
                            <p className="text-xs text-slate-300 leading-relaxed">{milestone.scienceFact}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Encouragement */}
      <div className="rehab-card rounded-2xl p-6 text-center scroll-reveal">
        <div className="text-4xl mb-3">💙</div>
        <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-base font-bold text-slate-100 mb-2">
          Healing is not linear — but you are moving forward
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Some days will feel harder than others. That's normal. What matters is that you keep showing up. Your body is rebuilding itself stronger than before.
        </p>
      </div>
    </div>
  );
};

export default RecoveryTimeline;
