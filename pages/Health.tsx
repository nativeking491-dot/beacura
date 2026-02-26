import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FOOD_TIPS, WEEKLY_MEAL_PLAN, WEEKLY_EXERCISE_PLAN } from "../constants";
import {
  Utensils,
  Droplets,
  Apple,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Brain,
  RefreshCcw,
  Loader2,
  Calendar,
  Dumbbell,
  CheckSquare,
  Square,
  Flame,
  Sun,
  Play,
  X,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { generateLocalResponse } from "../services/localChatService";

const Health: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const [activeDayIdx, setActiveDayIdx] = useState(todayIdx);
  const [glasses, setGlasses] = useState(0);
  const [isGeneratingSnack, setIsGeneratingSnack] = useState(false);
  const [aiSnack, setAiSnack] = useState<string | null>(null);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [dailyMeals, setDailyMeals] = useState({ breakfast: "", lunch: "", dinner: "" });
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [justDrank, setJustDrank] = useState(false);

  const currentPlan = WEEKLY_MEAL_PLAN[activeDayIdx];
  const currentExercisePlan = WEEKLY_EXERCISE_PLAN[activeDayIdx];

  const getTodayKey = () => `daily_log_${new Date().toDateString()}`;

  useEffect(() => {
    const todayKey = getTodayKey();
    const savedData = localStorage.getItem(todayKey);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setGlasses(parsed.water || 0);
      setDailyMeals(parsed.meals || { breakfast: "", lunch: "", dinner: "" });
      setCompletedExercises(parsed.exercises || []);
    } else {
      setGlasses(0);
      setDailyMeals({ breakfast: "", lunch: "", dinner: "" });
      setCompletedExercises([]);
    }
  }, []);

  const saveData = (newGlasses: number, newMeals: any, newExercises: string[]) => {
    const todayKey = getTodayKey();
    localStorage.setItem(todayKey, JSON.stringify({ water: newGlasses, meals: newMeals, exercises: newExercises }));
  };

  const handleDrinkWater = () => {
    if (glasses < 12) {
      const newAmount = glasses + 1;
      setGlasses(newAmount);
      saveData(newAmount, dailyMeals, completedExercises);
      setJustDrank(true);
      setTimeout(() => setJustDrank(false), 1000);
    }
  };

  const handleMealChange = (type: "breakfast" | "lunch" | "dinner", value: string) => {
    const newMeals = { ...dailyMeals, [type]: value };
    setDailyMeals(newMeals);
    saveData(glasses, newMeals, completedExercises);
  };

  const toggleExercise = (exerciseName: string) => {
    let newExercises;
    if (completedExercises.includes(exerciseName)) {
      newExercises = completedExercises.filter((e) => e !== exerciseName);
    } else {
      newExercises = [...completedExercises, exerciseName];
    }
    setCompletedExercises(newExercises);
    saveData(glasses, dailyMeals, newExercises);
  };

  const getCustomSnack = async () => {
    setIsGeneratingSnack(true);
    const response = await generateLocalResponse("I need a healthy recovery snack nutrition", user?.streak || 0, user?.name || "Friend");
    setAiSnack(response);
    setIsGeneratingSnack(false);
  };

  const handleLogAllMeals = () => {
    const newMeals = {
      breakfast: currentPlan.meals.breakfast,
      lunch: currentPlan.meals.lunch,
      dinner: currentPlan.meals.dinner,
    };
    setDailyMeals(newMeals);
    saveData(glasses, newMeals, completedExercises);
  };

  const waterPct = Math.round((glasses / 12) * 100);
  const exercisePct = currentExercisePlan.exercises.length
    ? Math.round((completedExercises.length / currentExercisePlan.exercises.length) * 100)
    : 0;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6 animate-in pb-8">

      {/* =================== HEADER =================== */}
      <header className="relative overflow-hidden bento-card rounded-2xl p-6">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-teal-300 rounded-full blur-3xl opacity-20" />
        <div className="flex md:flex-row flex-col md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-glow-pulse" />
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Brain Recovery Active</span>
            </div>
            <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              Health <span className="gradient-text-teal">&</span> Diet
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Track your nutrition and movement for holistic recovery.</p>
          </div>
          <div className="flex gap-3">
            <div className="glass-subtle px-4 py-2 rounded-xl text-center border border-teal-100/60">
              <p className="text-xs text-slate-400">Movement</p>
              <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-xl font-bold text-teal-600">{exercisePct}<span className="text-sm">%</span></p>
            </div>
            <div className="glass-subtle px-4 py-2 rounded-xl text-center border border-blue-100/60">
              <p className="text-xs text-slate-400">Hydration</p>
              <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-xl font-bold text-blue-600">{waterPct}<span className="text-sm">%</span></p>
            </div>
          </div>
        </div>
      </header>

      {/* =================== EXERCISE SECTION =================== */}
      <section className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500 rounded-full blur-[120px] opacity-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500 rounded-full blur-[100px] opacity-10" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Dumbbell size={18} className="text-amber-400" />
                <span style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-white text-lg">
                  Today's Movement{" "}
                  <span className="text-amber-400">&mdash; {currentExercisePlan.focus}</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm">{currentExercisePlan.benefit}</p>
            </div>

            {/* Progress Ring-style badge */}
            <div className="relative flex items-center space-x-3 glass-dark px-4 py-2 rounded-xl">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke={exercisePct === 100 ? "#34d399" : "#f59e0b"}
                    strokeWidth="3"
                    strokeDasharray={`${exercisePct * 0.94247} 94.247`}
                    strokeLinecap="round"
                  />
                </svg>
                <span style={{ fontFamily: 'Sora, sans-serif' }} className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">{exercisePct}%</span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Completed</p>
                <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-white font-bold">
                  {completedExercises.length}<span className="text-slate-400 font-normal">/{currentExercisePlan.exercises.length}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {currentExercisePlan.exercises.map((ex: any, idx: number) => {
              const isDone = completedExercises.includes(ex.name);
              return (
                <div
                  key={idx}
                  className={`relative rounded-2xl p-5 border transition-all duration-300 cursor-pointer group overflow-hidden
                    ${isDone
                      ? "bg-emerald-500/15 border-emerald-500/30"
                      : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15]"
                    }`}
                >
                  {isDone && <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />}
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className={`font-bold text-base leading-tight ${isDone ? "text-emerald-300" : "text-white"}`}>{ex.name}</h4>
                      <button
                        onClick={() => toggleExercise(ex.name)}
                        className={`flex-shrink-0 ml-2 transition-all ${isDone ? "text-emerald-400 scale-110" : "text-slate-500 hover:text-white"}`}
                      >
                        {isDone ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                    </div>
                    <div className="flex items-center space-x-1.5 mb-3">
                      <Flame size={11} className="text-orange-400" />
                      <span className="text-xs font-semibold text-slate-400">{ex.duration}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">{ex.instruction}</p>
                    <button
                      onClick={() => navigate(`/exercise-timer/${idx}`)}
                      className={`flex items-center space-x-1.5 text-xs font-bold transition-all ${isDone ? "text-emerald-400" : "text-amber-400 hover:text-amber-300"}`}
                    >
                      <Play size={11} />
                      <span>Start Timer</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================== TRACKING ROW =================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Water Tracker */}
        <div className="bento-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-md">
                <Droplets size={18} className="text-white" />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-slate-800 dark:text-slate-100">Hydration</h3>
                <p className="text-xs text-slate-400">Daily water intake</p>
              </div>
            </div>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-500/20">
              {glasses}/12
            </span>
          </div>

          {/* Liquid bar */}
          <div className="relative mb-5">
            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden relative">
              <div
                className="h-full rounded-2xl transition-all duration-700 ease-out relative overflow-hidden"
                style={{
                  width: `${waterPct}%`,
                  background: 'linear-gradient(90deg, #60a5fa, #22d3ee)',
                }}
              >
                <div className="absolute inset-0 shimmer-effect rounded-2xl" />
              </div>
            </div>
            <div className="flex justify-between mt-1.5 px-1">
              {[0, 3, 6, 9, 12].map(n => (
                <span key={n} className="text-[10px] text-slate-400">{n}</span>
              ))}
            </div>
          </div>

          {/* Glass dots */}
          <div className="grid grid-cols-6 gap-2 mb-5">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`h-9 rounded-xl transition-all duration-300 flex items-center justify-center text-lg ${i < glasses
                    ? "bg-gradient-to-br from-blue-400 to-cyan-400 shadow-md shadow-blue-100 dark:shadow-none scale-100"
                    : "bg-slate-100 dark:bg-slate-800 scale-90 opacity-60"
                  }`}
              >
                {i < glasses ? "💧" : ""}
              </div>
            ))}
          </div>

          <button
            onClick={handleDrinkWater}
            disabled={glasses === 12}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all duration-300 ${glasses === 12
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-500/20 cursor-default"
                : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200 dark:shadow-none hover:-translate-y-0.5 hover:shadow-blue-300 dark:hover:shadow-none"
              }`}
          >
            <Droplets size={17} className={justDrank ? "animate-bounce" : ""} />
            <span>{glasses === 12 ? "✓ Fully Hydrated!" : `Drink a Glass · +5 XP`}</span>
          </button>
        </div>

        {/* Meal Logging */}
        <div className="bento-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-md">
                <Utensils size={18} className="text-white" />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-slate-800 dark:text-slate-100">Today's Intake</h3>
                <p className="text-xs text-slate-400">Log what you're eating</p>
              </div>
            </div>
            <button
              onClick={handleLogAllMeals}
              className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors border border-amber-100 dark:border-amber-500/20"
            >
              Log Plan
            </button>
          </div>

          <div className="space-y-3">
            {(["breakfast", "lunch", "dinner"] as const).map((meal) => {
              const icons: Record<string, string> = { breakfast: "🌅", lunch: "☀️", dinner: "🌙" };
              const labels: Record<string, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };
              return (
                <div key={meal}>
                  <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    <span>{icons[meal]}</span>
                    <span>{labels[meal]}</span>
                  </label>
                  <input
                    type="text"
                    value={dailyMeals[meal]}
                    onChange={(e) => handleMealChange(meal, e.target.value)}
                    placeholder={`e.g. ${currentPlan.meals[meal as keyof typeof currentPlan.meals]}`}
                    className="input-glow w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =================== DIET PLAN =================== */}
      <section className="bento-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <Calendar size={18} className="text-white" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-slate-900 dark:text-slate-100 text-lg">Suggested Diet Plan</h2>
              <p className="text-xs text-slate-400">Science-backed meals for recovery</p>
            </div>
          </div>

          {/* Day Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl overflow-x-auto no-scrollbar gap-0.5">
            {WEEKLY_MEAL_PLAN.map((item, idx) => (
              <button
                key={item.day}
                onClick={() => setActiveDayIdx(idx)}
                className={`flex flex-col items-center px-3 py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap min-w-[48px] ${activeDayIdx === idx
                    ? "bg-white dark:bg-slate-700 text-amber-600 shadow-md"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
              >
                <span className="opacity-60">{item.day.substring(0, 3).toUpperCase()}</span>
                <span>{idx === todayIdx ? "●" : item.day.substring(0, 2)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["breakfast", "lunch", "dinner"] as const).map((meal) => {
              const configs = {
                breakfast: { icon: "🌅", label: "Breakfast", gradient: "from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10", border: "border-amber-100 dark:border-amber-500/20", text: "text-amber-700 dark:text-amber-400" },
                lunch: { icon: "☀️", label: "Lunch", gradient: "from-teal-50 to-emerald-50 dark:from-teal-500/10 dark:to-emerald-500/10", border: "border-teal-100 dark:border-teal-500/20", text: "text-teal-700 dark:text-teal-400" },
                dinner: { icon: "🌙", label: "Dinner", gradient: "from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10", border: "border-indigo-100 dark:border-indigo-500/20", text: "text-indigo-700 dark:text-indigo-400" },
              };
              const c = configs[meal];
              return (
                <div key={meal} className={`bg-gradient-to-br ${c.gradient} border ${c.border} rounded-2xl p-5 group hover-lift`}>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-xl">{c.icon}</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>{c.label}</span>
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-relaxed">
                    {currentPlan.meals[meal as keyof typeof currentPlan.meals]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================== NUTRITION INSIGHT =================== */}
      <section className="relative overflow-hidden bento-card rounded-2xl p-6 md:p-8">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-teal-300 rounded-full blur-3xl opacity-15" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-300 rounded-full blur-2xl opacity-15" />

        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-teal-100 dark:shadow-none flex-shrink-0">
            <Brain size={26} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                {WEEKLY_MEAL_PLAN[activeDayIdx].day}'s Focus
              </span>
            </div>
            <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {FOOD_TIPS[activeDayIdx].title}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-5 max-w-2xl">
              {FOOD_TIPS[activeDayIdx].description}
            </p>
            <div className="glass-subtle inline-flex items-start gap-3 px-4 py-3 rounded-xl border border-white/60">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 size={14} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block mb-0.5">Key Benefit</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{FOOD_TIPS[activeDayIdx].benefits}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Snack Generator */}
        <div className="relative z-10 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <button
              onClick={getCustomSnack}
              disabled={isGeneratingSnack}
              className="btn-primary px-5 py-2.5 text-sm flex items-center space-x-2"
            >
              {isGeneratingSnack ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Sparkles size={15} />
              )}
              <span>{isGeneratingSnack ? "Generating..." : "Get AI Snack Suggestion"}</span>
            </button>
            {aiSnack && (
              <div className="glass-subtle flex-1 px-4 py-3 rounded-xl border border-white/60 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {aiSnack}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Health;
