
import React, { useState, useEffect, useRef } from 'react';
import {
  Dumbbell, Clock, Zap, Heart,
  Wind, Sunrise, Sun, Sunset,
  CheckCircle2, PlayCircle, Info,
  X, RotateCcw, Award, Pause, Play
} from 'lucide-react';

interface ExerciseItem {
  id: string;
  title: string;
  time: string;
  duration: number; // in seconds
  type: string;
  icon: any;
  benefit: string;
  difficulty: string;
  color: string;
  bg: string;
  instructions?: { text: string; duration: number }[];
}

const Exercise: React.FC = () => {
  const [activeSession, setActiveSession] = useState<ExerciseItem | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [breathingStep, setBreathingStep] = useState(0);
  const [stepTimeLeft, setStepTimeLeft] = useState(0);

  // Fix: Use any for timer reference to avoid NodeJS namespace issues in browser environment
  const timerRef = useRef<any>(null);

  const exercises: ExerciseItem[] = [
    {
      id: 'ex1',
      title: "Box Breathing",
      time: "Anytime",
      duration: 120, // 2 mins
      type: "Anxiety Control",
      icon: Wind,
      benefit: "Instantly calms the nervous system and lowers heart rate during cravings.",
      difficulty: "Beginner",
      color: "text-sky-500",
      bg: "bg-sky-50",
      instructions: [
        { text: "Inhale (4s)", duration: 4 },
        { text: "Hold (4s)", duration: 4 },
        { text: "Exhale (4s)", duration: 4 },
        { text: "Hold (4s)", duration: 4 }
      ]
    },
    {
      id: 'ex2',
      title: "Mindful Yoga Flow",
      time: "07:00 AM",
      duration: 600, // 10 mins
      type: "Morning Energy",
      icon: Sunrise,
      benefit: "Improves blood flow and releases morning physical tension.",
      difficulty: "Intermediate",
      color: "text-amber-500",
      bg: "bg-amber-50"
    },
    {
      id: 'ex3',
      title: "4-7-8 Breathing",
      time: "Bedtime",
      duration: 180, // 3 mins
      type: "Sleep Support",
      icon: Wind,
      benefit: "A natural tranquilizer for the nervous system to aid restful sleep.",
      difficulty: "Beginner",
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      instructions: [
        { text: "Inhale (4s)", duration: 4 },
        { text: "Hold (7s)", duration: 7 },
        { text: "Exhale (8s)", duration: 8 }
      ]
    },
    {
      id: 'ex4',
      title: "Brisk Walking",
      time: "10:30 AM",
      duration: 1200, // 20 mins
      type: "Cardio",
      icon: Sun,
      benefit: "Stimulates dopamine production naturally through steady movement.",
      difficulty: "Easy",
      color: "text-teal-600",
      bg: "bg-teal-50"
    }
  ];

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);

        // Handle breathing step timer
        if (activeSession?.instructions) {
          setStepTimeLeft((prevStepTime) => {
            if (prevStepTime <= 1) {
              // Move to next step
              const nextStep = (breathingStep + 1) % activeSession.instructions!.length;
              setBreathingStep(nextStep);
              return activeSession.instructions![nextStep].duration;
            }
            return prevStepTime - 1;
          });
        }
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setSessionComplete(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, activeSession, breathingStep]);

  const startSession = (ex: ExerciseItem) => {
    setActiveSession(ex);
    setTimeLeft(ex.duration);
    setIsActive(true);
    setSessionComplete(false);
    setBreathingStep(0);
    if (ex.instructions) {
      setStepTimeLeft(ex.instructions[0].duration);
    }
  };

  const closeSession = () => {
    setActiveSession(null);
    setIsActive(false);
    setSessionComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Wellness & Exercise</h1>
          <p className="text-slate-500">Healing through movement and rhythmic breathing.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 flex items-center space-x-3 shadow-sm">
          <Zap className="text-amber-500" size={20} />
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Fitness Points</p>
            <p className="text-sm font-bold text-slate-700">450 XP</p>
          </div>
        </div>
      </header>

      {/* Breathing Focus Section */}
      <section className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Master Your Cravings</h2>
            <p className="text-teal-50 text-sm mb-6 leading-relaxed">
              When a craving hits, your breathing becomes shallow. Use "Box Breathing" to reset your brain in under 2 minutes.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => startSession(exercises[0])}
                className="bg-white text-teal-700 px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all"
              >
                Quick Restart (2m)
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 border-4 border-white/20 rounded-full flex items-center justify-center animate-pulse">
              <Wind size={40} className="text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Exercises */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exercises.map((ex) => (
          <div key={ex.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className={`${ex.bg} ${ex.color} p-4 rounded-2xl`}>
                  <ex.icon size={24} />
                </div>
                <div className="flex items-center space-x-1 text-slate-400 text-xs font-bold">
                  <Clock size={12} />
                  <span>{formatTime(ex.duration)}</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{ex.title}</h3>
              <p className="text-slate-500 text-xs mb-4 line-clamp-2">{ex.benefit}</p>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-[10px] font-bold bg-slate-50 text-slate-400 px-2 py-1 rounded-lg uppercase tracking-wider">
                {ex.difficulty}
              </span>
              <button
                onClick={() => startSession(ex)}
                className="flex items-center space-x-2 text-teal-600 font-bold text-sm hover:text-teal-700 transition-colors"
              >
                <span>Start Now</span>
                <PlayCircle size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Active Session Overlay */}
      {activeSession && (
        <div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-500">
          <button
            onClick={closeSession}
            className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <X size={24} />
          </button>

          {!sessionComplete ? (
            <div className="w-full max-w-md text-center space-y-12">
              <header>
                <h2 className="text-3xl font-bold mb-2">{activeSession.title}</h2>
                <p className="text-teal-400 font-medium tracking-widest uppercase text-xs">{activeSession.type}</p>
              </header>

              <div className="relative flex items-center justify-center">
                {/* Circular Progress Ring */}
                <svg className="w-64 h-64 -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/10"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={754}
                    strokeDashoffset={754 * (timeLeft / activeSession.duration)}
                    className="text-teal-500 transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black">{formatTime(timeLeft)}</span>
                </div>
              </div>

              {/* Breathing Instruction Pulse */}
              {activeSession.instructions && (
                <div className="h-20 flex flex-col items-center justify-center">
                  <div className="bg-teal-500/20 px-8 py-4 rounded-3xl border border-teal-500/30 animate-pulse">
                    <span className="text-2xl font-bold text-teal-300">
                      {activeSession.instructions[breathingStep].text}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-widest font-bold">Follow the rhythm</p>
                </div>
              )}

              <div className="flex justify-center space-x-6">
                <button
                  onClick={() => setTimeLeft(activeSession.duration)}
                  className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"
                >
                  <RotateCcw size={24} />
                </button>
                <button
                  onClick={() => setIsActive(!isActive)}
                  className="p-6 bg-teal-500 rounded-3xl hover:bg-teal-600 transition-all shadow-xl shadow-teal-500/20"
                >
                  {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-teal-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-teal-500/40">
                <Award size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black">Session Complete!</h2>
                <p className="text-slate-400">You've successfully built a healthier habit.</p>
              </div>
              <div className="bg-white/10 p-6 rounded-3xl inline-block border border-white/10">
                <p className="text-teal-400 text-xs font-bold uppercase mb-1">Rewards Earned</p>
                <p className="text-2xl font-bold">+25 Recovery Points</p>
              </div>
              <button
                onClick={closeSession}
                className="block w-full bg-white text-slate-900 py-4 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all"
              >
                Close & Return
              </button>
            </div>
          )}
        </div>
      )}

      {/* Science Explanation */}
      <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center space-x-2">
            <Wind size={16} className="text-sky-500" />
            <span>The Vagus Nerve</span>
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Breathing exercises stimulate the Vagus nerve, which signals your brain to turn off the "fight or flight" response triggered by cravings.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center space-x-2">
            <Heart size={16} className="text-rose-500" />
            <span>Heart Rate Variability</span>
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Regular light exercise improves HRV, making you physically more resilient to the emotional ups and downs of recovery.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 flex items-center space-x-2">
            <Zap size={16} className="text-amber-500" />
            <span>Dopamine Baseline</span>
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Instead of high spikes from substances, these activities raise your baseline dopamine slowly and sustainably.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Exercise;
