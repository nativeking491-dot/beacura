import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pause, Play, SkipForward, CheckCircle2, Timer, Flame } from "lucide-react";
import { WEEKLY_EXERCISE_PLAN } from "../constants";
import { useUser } from "../context/UserContext";
import { supabase } from "../services/supabaseClient";

const ExerciseTimer: React.FC = () => {
    const navigate = useNavigate();
    const { exerciseIndex } = useParams<{ exerciseIndex: string }>();
    const { user } = useUser();

    // Get current day's exercise plan
    const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    const currentExercisePlan = WEEKLY_EXERCISE_PLAN[todayIdx];
    const exerciseIdx = parseInt(exerciseIndex || "0");
    const exercise = currentExercisePlan.exercises[exerciseIdx];

    // Parse duration (e.g., "10 min" -> 600 seconds)
    const parseDuration = (duration: string): number => {
        const match = duration.match(/(\d+)\s*min/i);
        return match ? parseInt(match[1]) * 60 : 300; // default 5 minutes
    };

    const totalSeconds = parseDuration(exercise?.duration || "5 min");
    const [timeLeft, setTimeLeft] = useState(totalSeconds);
    const [isRunning, setIsRunning] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        if (!exercise) {
            navigate("/health");
            return;
        }
    }, [exercise, navigate]);

    useEffect(() => {
        if (!isRunning || isCompleted) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, isCompleted]);

    const handleComplete = async () => {
        setIsCompleted(true);
        setIsRunning(false);

        // Save to localStorage
        const todayKey = `daily_log_${new Date().toDateString()}`;
        const savedData = localStorage.getItem(todayKey);
        const data = savedData ? JSON.parse(savedData) : { water: 0, meals: {}, exercises: [] };

        if (!data.exercises.includes(exercise.name)) {
            data.exercises.push(exercise.name);
            localStorage.setItem(todayKey, JSON.stringify(data));
        }

        // Save to database
        if (user?.id) {
            try {
                await supabase.from("activity_logs").insert({
                    user_id: user.id,
                    activity_type: exercise.name,
                    duration_minutes: Math.floor(totalSeconds / 60),
                    notes: `Completed via timer: ${exercise.instruction}`,
                });
            } catch (error) {
                console.error("Error logging activity:", error);
            }
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleBack = () => {
        navigate("/health");
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

    if (!exercise) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 text-white">
                    <button
                        onClick={handleBack}
                        className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-semibold">Back</span>
                    </button>

                    {!isCompleted && (
                        <button
                            onClick={handleSkip}
                            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-all backdrop-blur-sm"
                        >
                            <span className="font-semibold">Skip</span>
                            <SkipForward size={20} />
                        </button>
                    )}
                </div>

                {/* Main Timer Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-12 border border-white/20 shadow-2xl">
                    {!isCompleted ? (
                        <>
                            {/* Exercise Info */}
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-full text-sm font-bold mb-6">
                                    <Flame size={16} className="animate-pulse" />
                                    <span>{currentExercisePlan.focus}</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                                    {exercise.name}
                                </h1>
                                <p className="text-xl text-slate-300 max-w-lg mx-auto leading-relaxed">
                                    {exercise.instruction}
                                </p>
                            </div>

                            {/* Timer Display */}
                            <div className="relative mb-12">
                                {/* Progress Ring */}
                                <div className="relative w-64 h-64 mx-auto">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle
                                            cx="128"
                                            cy="128"
                                            r="120"
                                            stroke="rgba(255,255,255,0.1)"
                                            strokeWidth="12"
                                            fill="none"
                                        />
                                        <circle
                                            cx="128"
                                            cy="128"
                                            r="120"
                                            stroke="url(#gradient)"
                                            strokeWidth="12"
                                            fill="none"
                                            strokeDasharray={`${2 * Math.PI * 120}`}
                                            strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000"
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#f59e0b" />
                                                <stop offset="100%" stopColor="#f97316" />
                                            </linearGradient>
                                        </defs>
                                    </svg>

                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <Timer size={32} className="text-amber-400 mb-2" />
                                        <div className="text-6xl font-black text-white font-mono">
                                            {formatTime(timeLeft)}
                                        </div>
                                        <div className="text-sm text-slate-400 mt-2">
                                            {Math.round(progress)}% Complete
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => setIsRunning(!isRunning)}
                                    className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center space-x-3 ${isRunning
                                            ? "bg-white/20 hover:bg-white/30 text-white"
                                            : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                                        }`}
                                >
                                    {isRunning ? (
                                        <>
                                            <Pause size={24} />
                                            <span>Pause</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play size={24} />
                                            <span>Resume</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Completion Screen */
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 mb-8 animate-in zoom-in">
                                <CheckCircle2 size={64} className="text-white" />
                            </div>

                            <h2 className="text-5xl font-black text-white mb-4">
                                Task Completed! 🎉
                            </h2>

                            <p className="text-2xl text-slate-300 mb-8">
                                Great job completing <span className="text-amber-400 font-bold">{exercise.name}</span>!
                            </p>

                            <div className="bg-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm border border-white/20">
                                <p className="text-slate-300 text-lg">
                                    <span className="text-amber-400 font-bold">+{Math.floor(totalSeconds / 60) * 5} XP</span> earned for completing this exercise!
                                </p>
                            </div>

                            <button
                                onClick={handleBack}
                                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-bold text-lg transition-all shadow-lg"
                            >
                                Back to Health & Diet
                            </button>
                        </div>
                    )}
                </div>

                {/* Exercise Count */}
                {!isCompleted && (
                    <div className="text-center mt-8 text-slate-400">
                        <p className="text-sm">
                            Exercise {exerciseIdx + 1} of {currentExercisePlan.exercises.length} • {exercise.duration}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseTimer;
