import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FOOD_TIPS, WEEKLY_MEAL_PLAN, WEEKLY_EXERCISE_PLAN } from "../constants";
import {
  Utensils,
  Droplets,
  Apple,
  Coffee,
  CheckCircle2,
  Info,
  ChevronRight,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Brain,
  RefreshCcw,
  Loader2,
  Sparkle,
  Calendar,
  Dumbbell,
  CheckSquare,
  Square,
  Flame,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { generateLocalResponse } from "../services/localChatService";

const Health: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // Get current day of week (0-6)
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // Map Sun-Sat to Mon-Sun

  const [activeDayIdx, setActiveDayIdx] = useState(todayIdx);
  const [glasses, setGlasses] = useState(0);
  const [isGeneratingSnack, setIsGeneratingSnack] = useState(false);
  const [aiSnack, setAiSnack] = useState<string | null>(null);

  const [showFullDetails, setShowFullDetails] = useState(false);
  const [hoveredMeal, setHoveredMeal] = useState<{ type: string; content: string } | null>(null);

  // Daily Tracking State
  const [dailyMeals, setDailyMeals] = useState({ breakfast: "", lunch: "", dinner: "" });
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  const currentPlan = WEEKLY_MEAL_PLAN[activeDayIdx];
  const currentExercisePlan = WEEKLY_EXERCISE_PLAN[activeDayIdx];

  // Persistence Key Helper
  const getTodayKey = () => `daily_log_${new Date().toDateString()}`;

  // Load Daily Data
  useEffect(() => {
    const todayKey = getTodayKey();
    const savedData = localStorage.getItem(todayKey);

    // Cleanup old keys if needed (optional optimization)

    if (savedData) {
      const parsed = JSON.parse(savedData);
      setGlasses(parsed.water || 0);
      setDailyMeals(parsed.meals || { breakfast: "", lunch: "", dinner: "" });
      setCompletedExercises(parsed.exercises || []);
    } else {
      // Reset for new day
      setGlasses(0);
      setDailyMeals({ breakfast: "", lunch: "", dinner: "" });
      setCompletedExercises([]);
    }
  }, []);

  // Save Daily Data
  const saveData = (newGlasses: number, newMeals: any, newExercises: string[]) => {
    const todayKey = getTodayKey();
    const data = {
      water: newGlasses,
      meals: newMeals,
      exercises: newExercises,
    };
    localStorage.setItem(todayKey, JSON.stringify(data));
  };

  const handleDrinkWater = () => {
    if (glasses < 12) {
      const newAmount = glasses + 1;
      setGlasses(newAmount);
      saveData(newAmount, dailyMeals, completedExercises);
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
    // Include context in prompt implicitly for now
    const response = await generateLocalResponse(
      "I need a healthy recovery snack nutrition",
      user?.streak || 0,
      user?.name || "Friend"
    );
    setAiSnack(response);
    setIsGeneratingSnack(false);
  };

  const handleAccountAction = (action: string) => {
    alert(`✅ ${action} functionality triggered (Simulated)`);
  };

  const handleLogAllMeals = async () => {
    // Fill with planned meals
    const newMeals = {
      breakfast: currentPlan.meals.breakfast,
      lunch: currentPlan.meals.lunch,
      dinner: currentPlan.meals.dinner
    };
    setDailyMeals(newMeals);
    saveData(glasses, newMeals, completedExercises);
    alert('All planned meals logged! +20 XP');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 pb-28 relative">
      {/* ... (Meal Detail Popup & Modal code remains same - omitted for brevity in replace if not changing) ... */}
      {hoveredMeal && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="animate-in zoom-in duration-200 bg-white/90 backdrop-blur-xl border border-slate-200 p-8 rounded-[2rem] shadow-2xl max-w-sm text-center">
            <h3 className="text-2xl font-black text-slate-800 mb-2">{hoveredMeal.type}</h3>
            <div className="w-16 h-1 bg-teal-500 mx-auto rounded-full mb-4"></div>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">{hoveredMeal.content}</p>
          </div>
        </div>
      )}

      {showFullDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowFullDetails(false)}>
          <div className="bg-white p-8 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* ... Modal content ... */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-slate-800">Nutritional Breakdown</h2>
              <button onClick={() => setShowFullDetails(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                <CheckCircle2 size={24} className="text-slate-500" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="bg-teal-50 p-6 rounded-2xl">
                <h3 className="font-bold text-teal-800 mb-2">Why this plan?</h3>
                <p className="text-teal-700">{currentPlan.meals.benefit}</p>
              </div>
              {/* ... details ... */}
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Health & Diet</h1>
          <p className="text-slate-500">
            Track your nutrition and movement for holistic recovery.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100">
          <Brain size={20} className="animate-pulse" />
          <span className="font-bold text-sm">Brain Recovery Active</span>
        </div>
      </header>

      {/* --- EXERCISE TASKBAR --- */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-[2.5rem] shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Dumbbell className="text-amber-400" />
              Today's Movement: <span className="text-amber-400">{currentExercisePlan.focus}</span>
            </h2>
            <p className="text-slate-400 text-sm mt-1">{currentExercisePlan.benefit}</p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="font-mono font-bold text-xl">{completedExercises.length}/{currentExercisePlan.exercises.length}</span>
            <span className="text-xs text-slate-400 uppercase tracking-widest ml-2">Completed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentExercisePlan.exercises.map((ex, idx) => {
            const isDone = completedExercises.includes(ex.name);
            return (
              <div
                key={idx}
                onClick={() => navigate(`/exercise-timer/${idx}`)}
                className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 relative group overflow-hidden
                  ${isDone
                    ? "bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-bold text-lg ${isDone ? "text-emerald-300" : "text-white"}`}>{ex.name}</h4>
                  {isDone ? <CheckSquare className="text-emerald-400" /> : <Square className="text-slate-500 group-hover:text-white transition-colors" />}
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-300 mb-3 bg-black/20 inline-block px-2 py-1 rounded-lg">
                  <Flame size={12} className="text-orange-400" />
                  <span>{ex.duration}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {ex.instruction}
                </p>

                {isDone && (
                  <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none animate-in fade-in" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* --- DAILY INTAKE LOG --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hydration */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center space-x-2 text-slate-900 dark:text-slate-100">
              <Droplets className="text-blue-500" />
              <span>Hydration Tracker</span>
            </h3>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {glasses}/12 Glasses
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2 mb-6">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`h-12 rounded-xl transition-all border-2 ${i < glasses
                  ? "bg-blue-500 border-blue-400 shadow-lg shadow-blue-100 scale-100"
                  : "bg-slate-50 border-slate-100 scale-90"
                  }`}
              />
            ))}
          </div>
          <button
            onClick={handleDrinkWater}
            disabled={glasses === 12}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-blue-200"
          >
            <Droplets size={18} />
            <span>Drink a Glass (+5 XP)</span>
          </button>
        </div>

        {/* Meal Logging */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg flex items-center space-x-2 text-slate-900 dark:text-slate-100">
              <Utensils className="text-orange-500" />
              <span>Today's Intake</span>
            </h3>
            <button onClick={handleLogAllMeals} className="text-xs font-bold text-orange-600 hover:underline">
              Log Suggested Plan
            </button>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Breakfast</label>
            <input
              type="text"
              value={dailyMeals.breakfast}
              onChange={(e) => handleMealChange("breakfast", e.target.value)}
              placeholder={`e.g. ${currentPlan.meals.breakfast}`}
              className="w-full bg-orange-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Lunch</label>
            <input
              type="text"
              value={dailyMeals.lunch}
              onChange={(e) => handleMealChange("lunch", e.target.value)}
              placeholder={`e.g. ${currentPlan.meals.lunch}`}
              className="w-full bg-orange-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Dinner</label>
            <input
              type="text"
              value={dailyMeals.dinner}
              onChange={(e) => handleMealChange("dinner", e.target.value)}
              placeholder={`e.g. ${currentPlan.meals.dinner}`}
              className="w-full bg-orange-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Suggested & Tips Sections */}
      <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mt-8">
        {/* ... (Plan Tabs & Cards remain similar - keeping key parts) ... */}
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="text-amber-600" size={24} />
              Suggested Diet Plan
            </h2>
            <p className="text-slate-500 text-sm">
              Science-backed meals to support your recovery stage.
            </p>
          </div>
          {/* ... Tabs ... */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
            {WEEKLY_MEAL_PLAN.map((item, idx) => (
              <button
                key={item.day}
                onClick={() => setActiveDayIdx(idx)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex flex-col items-center ${activeDayIdx === idx
                  ? "bg-white text-amber-600 shadow-md"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                <span className="text-[10px] opacity-60 uppercase">
                  {item.day.substring(0, 3)}
                </span>
                <span>
                  {item.day === WEEKLY_MEAL_PLAN[todayIdx].day
                    ? "TODAY"
                    : item.day.substring(0, 3)}
                </span>
              </button>
            ))}
          </div>
        </div>
        {/* ... (Cards implementation similar to original but clearer) ... */}
        <div className="p-8 bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Suggested Breakfast</h4>
              <p className="font-bold text-slate-800">{currentPlan.meals.breakfast}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Suggested Lunch</h4>
              <p className="font-bold text-slate-800">{currentPlan.meals.lunch}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Suggested Dinner</h4>
              <p className="font-bold text-slate-800">{currentPlan.meals.dinner}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ... (Tips Section) ... */}
      <section className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-900 px-2 flex items-center gap-2">
          <Sparkles className="text-amber-500" />
          Daily Nutrition Insight
        </h3>

        {/* Dynamic Tip Card based on active day */}
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-8 rounded-[2.5rem] border border-teal-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Utensils size={120} className="text-teal-600" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-teal-600 shrink-0">
                <Brain size={32} />
              </div>

              <div>
                <h4 className="text-sm font-bold text-teal-600 uppercase tracking-widest mb-2">
                  {WEEKLY_MEAL_PLAN[activeDayIdx].day}'s Focus
                </h4>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {FOOD_TIPS[activeDayIdx].title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-lg mb-6 max-w-2xl">
                  {FOOD_TIPS[activeDayIdx].description}
                </p>

                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50 inline-flex items-start gap-3">
                  <div className="bg-amber-500 p-1.5 rounded-full text-white mt-0.5">
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                      Key Benefit
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      {FOOD_TIPS[activeDayIdx].benefits}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Health;
