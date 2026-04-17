import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  X,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Check,
  Award,
  Heart,
  ChevronRight,
  Sparkles,
  Trophy,
} from "lucide-react";
import { PainSlider } from "../components/PainSlider";
import type { ExerciseStep } from "../types";

// ─── Rehab Exercises for the Session ────────────────────────────────────────
interface RehabExercise {
  name: string;
  icon: string;
  targetRegion: string;
  steps: ExerciseStep[];
  color: string;
  benefit: string;
}

const SESSION_EXERCISES: RehabExercise[] = [
  {
    name: "Quad Sets",
    icon: "🦵",
    targetRegion: "Right Knee",
    color: "#10b981",
    benefit: "Activates the quadriceps without bending the knee — builds foundational strength.",
    steps: [
      { text: "Sit with your leg straight in front of you", duration: 5, type: "action" },
      { text: "Tighten your thigh muscle — push back of knee down", duration: 3, type: "action" },
      { text: "Hold the squeeze...", duration: 8, type: "hold" },
      { text: "Slowly release", duration: 3, type: "action" },
      { text: "Rest and breathe", duration: 5, type: "rest" },
      { text: "Tighten and push down again", duration: 3, type: "action" },
      { text: "Hold firmly...", duration: 8, type: "hold" },
      { text: "Release gently", duration: 3, type: "action" },
      { text: "Rest", duration: 5, type: "rest" },
      { text: "One more rep — tighten thigh", duration: 3, type: "action" },
      { text: "Hold strong...", duration: 8, type: "hold" },
      { text: "Release and relax completely", duration: 5, type: "action" },
    ],
  },
  {
    name: "Heel Slides",
    icon: "🔄",
    targetRegion: "Right Knee",
    color: "#06b6d4",
    benefit: "Restores knee flexion range of motion gently and progressively.",
    steps: [
      { text: "Lie on your back, legs straight", duration: 5, type: "action" },
      { text: "Slowly slide your heel toward your body", duration: 6, type: "action" },
      { text: "Hold at maximum comfortable bend", duration: 5, type: "hold" },
      { text: "Slide heel back to starting position", duration: 6, type: "action" },
      { text: "Rest", duration: 4, type: "rest" },
      { text: "Slide heel up again — go further if comfortable", duration: 6, type: "action" },
      { text: "Hold the bend...", duration: 5, type: "hold" },
      { text: "Slowly straighten", duration: 6, type: "action" },
      { text: "Rest and breathe deeply", duration: 5, type: "rest" },
    ],
  },
  {
    name: "Pelvic Tilts",
    icon: "🌀",
    targetRegion: "Lower Back",
    color: "#8b5cf6",
    benefit: "Reduces lower back pain by strengthening deep stabilizing muscles.",
    steps: [
      { text: "Lie flat with knees bent, feet flat on floor", duration: 5, type: "action" },
      { text: "Flatten your lower back against the floor", duration: 4, type: "action" },
      { text: "Hold — feel your core engage", duration: 8, type: "hold" },
      { text: "Slowly release to neutral", duration: 4, type: "action" },
      { text: "Rest", duration: 4, type: "rest" },
      { text: "Flatten back again — press harder", duration: 4, type: "action" },
      { text: "Hold firmly...", duration: 8, type: "hold" },
      { text: "Release gently", duration: 4, type: "action" },
      { text: "Deep breath and relax", duration: 5, type: "rest" },
    ],
  },
  {
    name: "Shoulder Pendulums",
    icon: "🔄",
    targetRegion: "Left Shoulder",
    color: "#f59e0b",
    benefit: "Uses gravity to gently stretch the shoulder capsule — painless rotation restoration.",
    steps: [
      { text: "Lean forward, let your arm hang down", duration: 5, type: "action" },
      { text: "Gently swing arm in small circles — clockwise", duration: 8, type: "action" },
      { text: "Pause", duration: 3, type: "rest" },
      { text: "Now swing counter-clockwise", duration: 8, type: "action" },
      { text: "Pause and let arm hang", duration: 3, type: "rest" },
      { text: "Swing side to side like a pendulum", duration: 8, type: "action" },
      { text: "Pause", duration: 3, type: "rest" },
      { text: "Swing front to back", duration: 8, type: "action" },
      { text: "Slowly stand up straight", duration: 5, type: "action" },
    ],
  },
];

// ─── Confetti ───────────────────────────────────────────────────────────────
function spawnConfetti() {
  const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'];
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

const GuidedRehab: React.FC = () => {
  const navigate = useNavigate();

  // Session state
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepTimeLeft, setStepTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [repsCompleted, setRepsCompleted] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [painBefore, setPainBefore] = useState(5);
  const [painAfter, setPainAfter] = useState(3);
  const [showPainCheck, setShowPainCheck] = useState<"before" | "after" | null>(null);
  const timerRef = useRef<any>(null);

  const exercise = SESSION_EXERCISES[currentExercise];
  const step = exercise?.steps[currentStep];
  const totalSteps = exercise?.steps.length || 0;
  const totalExercises = SESSION_EXERCISES.length;

  useEffect(() => {
    if (isRunning && stepTimeLeft > 0) {
      timerRef.current = setInterval(() => {
        setStepTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && stepTimeLeft === 0) {
      // Move to next step
      if (currentStep < totalSteps - 1) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        setStepTimeLeft(exercise.steps[nextStep].duration);
        if (exercise.steps[nextStep].type === "hold") {
          setRepsCompleted(prev => prev + 1);
        }
      } else {
        // Exercise complete - move to next exercise or finish session
        if (currentExercise < totalExercises - 1) {
          setCurrentExercise(prev => prev + 1);
          setCurrentStep(0);
          setStepTimeLeft(SESSION_EXERCISES[currentExercise + 1].steps[0].duration);
        } else {
          setIsRunning(false);
          setShowPainCheck("after");
        }
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, stepTimeLeft, currentStep, currentExercise, totalSteps, totalExercises]);

  const startSession = () => {
    setShowPainCheck("before");
  };

  const beginAfterPainCheck = () => {
    setShowPainCheck(null);
    setSessionStarted(true);
    setStepTimeLeft(exercise.steps[0].duration);
    setIsRunning(true);
  };

  const finishSession = () => {
    setShowPainCheck(null);
    setSessionComplete(true);
    spawnConfetti();
  };

  const getStepColor = (type: string): string => {
    switch (type) {
      case "hold": return "#f59e0b";
      case "rest": return "#10b981";
      case "transition": return "#8b5cf6";
      default: return "#06b6d4";
    }
  };

  const getStepLabel = (type: string): string => {
    switch (type) {
      case "hold": return "HOLD";
      case "rest": return "REST";
      case "transition": return "TRANSITION";
      default: return "ACTION";
    }
  };

  // Pre-session view
  if (!sessionStarted && !sessionComplete) {
    return (
      <div className="space-y-6 animate-in pb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/physio")} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl md:text-3xl font-extrabold text-white">
              Guided <span className="gradient-text-healing">Session</span>
            </h1>
            <p className="text-xs text-slate-400">{totalExercises} exercises • ~15 minutes</p>
          </div>
        </div>

        {/* Exercise Preview Cards */}
        <div className="space-y-3">
          {SESSION_EXERCISES.map((ex, i) => (
            <div key={i} className={`rehab-card rounded-2xl p-5 scroll-reveal stagger-${i + 1}`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${ex.color}25, ${ex.color}10)`, border: `1px solid ${ex.color}40` }}>
                  {ex.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{ex.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{ex.targetRegion} • {ex.steps.length} steps</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ex.benefit}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Start Button */}
        <button
          onClick={startSession}
          className="w-full relative overflow-hidden rounded-2xl p-5 flex items-center justify-center gap-3 font-bold text-white transition-all hover:scale-[1.02] active:scale-95 shine-on-hover group"
          style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)', boxShadow: '0 4px 24px rgba(16,185,129,0.3)' }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, #059669, #0f766e)' }} />
          <Play size={22} fill="white" className="relative z-10" />
          <span className="text-lg relative z-10">Begin Rehabilitation Session</span>
        </button>

        {/* Pain Check Modal */}
        {showPainCheck === "before" && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in">
            <div className="bento-card rounded-3xl p-6 w-full max-w-md">
              <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-lg font-bold text-white mb-1">Before We Start</h3>
              <p className="text-xs text-slate-400 mb-6">How does your body feel right now?</p>
              <PainSlider value={painBefore} onChange={setPainBefore} label="Current Pain" />
              <button onClick={beginAfterPainCheck} className="w-full mt-6 py-3 rounded-xl text-sm font-bold text-white shine-on-hover"
                style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)', boxShadow: '0 4px 20px rgba(16,185,129,0.25)' }}>
                Start Session →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Session Complete
  if (sessionComplete) {
    const painDelta = painBefore - painAfter;
    return (
      <div className="fixed inset-0 z-[60] bg-[#070711] flex flex-col items-center justify-center p-6 text-white animate-in">
        <div className="w-full max-w-md text-center space-y-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 healing-pulse">
            <Trophy size={48} className="text-white" />
          </div>

          <div>
            <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl font-extrabold text-white mb-2">Session Complete! 🎉</h2>
            <p className="text-slate-400">You showed up for your recovery today. That takes real courage.</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-2xl font-extrabold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>{totalExercises}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Exercises</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-2xl font-extrabold text-emerald-400" style={{ fontFamily: 'Sora, sans-serif' }}>{repsCompleted}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Reps</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-2xl font-extrabold" style={{ fontFamily: 'Sora, sans-serif', color: painDelta > 0 ? '#10b981' : painDelta < 0 ? '#ef4444' : '#eab308' }}>
                {painDelta > 0 ? `-${painDelta}` : painDelta === 0 ? "0" : `+${Math.abs(painDelta)}`}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Pain Δ</p>
            </div>
          </div>

          {painDelta > 0 && (
            <div className="rehab-card rounded-2xl p-4 text-center">
              <p className="text-sm font-bold text-emerald-400">
                ✨ Your pain decreased by {painDelta} points after this session!
              </p>
              <p className="text-xs text-slate-400 mt-1">Consistent exercise is proven to reduce chronic pain over time.</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/physio")}
              className="flex-1 py-4 rounded-2xl font-bold text-white text-base shine-on-hover transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)', boxShadow: '0 4px 20px rgba(16,185,129,0.25)' }}
            >
              Back to Hub
            </button>
            <button
              onClick={() => navigate("/pain-journal")}
              className="px-6 py-4 rounded-2xl font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              Log Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Session View
  const progress = ((currentExercise * totalSteps + currentStep) / (totalExercises * totalSteps)) * 100;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-6 text-white"
      style={{ background: `linear-gradient(135deg, #070711, ${exercise.color}08)` }}>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <button onClick={() => { setIsRunning(false); setSessionStarted(false); }} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
          <X size={18} />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Exercise {currentExercise + 1} of {totalExercises}
          </p>
          <p className="text-sm font-bold text-white">{exercise.name}</p>
        </div>
        <button onClick={() => {
          if (currentExercise < totalExercises - 1) {
            setCurrentExercise(prev => prev + 1);
            setCurrentStep(0);
            setStepTimeLeft(SESSION_EXERCISES[currentExercise + 1].steps[0].duration);
          }
        }} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
          <SkipForward size={18} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute top-16 left-4 right-4 h-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${exercise.color}, #8b5cf6)` }} />
      </div>

      {/* Main content */}
      <div className="w-full max-w-lg text-center space-y-8 mt-12">
        {/* Exercise icon */}
        <div className="text-6xl mb-2 animate-float">{exercise.icon}</div>

        {/* Timer ring */}
        <div className="relative flex items-center justify-center">
          <svg className="w-56 h-56 -rotate-90">
            <circle cx="112" cy="112" r="100" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="transparent" />
            <circle
              cx="112" cy="112" r="100"
              stroke={getStepColor(step.type)}
              strokeWidth="8" fill="transparent"
              strokeDasharray={628}
              strokeDashoffset={628 * (stepTimeLeft / step.duration)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black" style={{ fontFamily: 'Sora, sans-serif' }}>
              {stepTimeLeft}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: getStepColor(step.type) }}>
              {getStepLabel(step.type)}
            </span>
          </div>
        </div>

        {/* Instruction */}
        <div
          key={`${currentExercise}-${currentStep}`}
          className="px-6 py-4 rounded-2xl border animate-in"
          style={{
            background: `${getStepColor(step.type)}15`,
            borderColor: `${getStepColor(step.type)}40`,
          }}
        >
          <p className="text-xl font-bold text-white leading-snug">{step.text}</p>
          {step.type === "hold" && (
            <div className="mt-2 w-16 h-16 mx-auto rounded-full hold-breathe" style={{ background: `${getStepColor(step.type)}20`, border: `2px solid ${getStepColor(step.type)}40` }} />
          )}
        </div>

        {/* Reps counter */}
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>{repsCompleted}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Reps</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-extrabold text-slate-300" style={{ fontFamily: 'Sora, sans-serif' }}>
              {currentStep + 1}/{totalSteps}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Steps</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-6">
          <button
            onClick={() => { setCurrentStep(0); setStepTimeLeft(exercise.steps[0].duration); }}
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
          >
            <RotateCcw size={22} />
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-6 rounded-3xl transition-all shadow-xl hover:scale-105 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${exercise.color}, ${exercise.color}99)`, boxShadow: `0 8px 32px ${exercise.color}40` }}
          >
            {isRunning ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
          </button>
          <button
            onClick={() => {
              if (currentStep < totalSteps - 1) {
                setCurrentStep(prev => prev + 1);
                setStepTimeLeft(exercise.steps[currentStep + 1].duration);
              }
            }}
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
          >
            <SkipForward size={22} />
          </button>
        </div>
      </div>

      {/* Pain After Modal */}
      {showPainCheck === "after" && (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in">
          <div className="bento-card rounded-3xl p-6 w-full max-w-md">
            <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-lg font-bold text-white mb-1">Great Work! 💪</h3>
            <p className="text-xs text-slate-400 mb-6">How does your body feel now?</p>
            <PainSlider value={painAfter} onChange={setPainAfter} label="Pain After Session" />
            <button onClick={finishSession} className="w-full mt-6 py-3 rounded-xl text-sm font-bold text-white shine-on-hover"
              style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)', boxShadow: '0 4px 20px rgba(16,185,129,0.25)' }}>
              Complete Session 🎉
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidedRehab;
