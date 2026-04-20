import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Utensils,
  Droplets,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Brain,
  Loader2,
  Calendar,
  Dumbbell,
  CheckSquare,
  Square,
  Flame,
  Play,
  X,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useTranslation } from "react-i18next";
import { generateLocalResponse } from "../services/localChatService";
import { getDynamicIntelligence, DailyHealthPlan, DynamicMeal } from "../services/dynamicIntelligenceService";
import { SleepTracker } from "../components/SleepTracker";
import { HydrationTracker } from "../components/HydrationTracker";

// Helper for generating images locally since text-to-image API can't be relied upon every second
function getMealImage(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("oatmeal") || n.includes("oat")) return "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=500&auto=format&fit=crop&q=70";
  if (n.includes("yogurt")) return "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=70";
  if (n.includes("egg") || n.includes("scramble")) return "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=70";
  if (n.includes("salmon")) return "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=70";
  if (n.includes("chicken")) return "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&auto=format&fit=crop&q=70";
  if (n.includes("soup") || n.includes("lentil")) return "https://images.unsplash.com/photo-1547592180-85f173990554?w=500&auto=format&fit=crop&q=70";
  return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=70";
}

const Health: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [dynamicPlan, setDynamicPlan] = useState<DailyHealthPlan | null>(null);

  const [glasses, setGlasses] = useState(0);
  const [isGeneratingSnack, setIsGeneratingSnack] = useState(false);
  const [aiSnack, setAiSnack] = useState<string | null>(null);
  const [dailyMeals, setDailyMeals] = useState({ breakfast: "", lunch: "", dinner: "" });
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [justDrank, setJustDrank] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<{ id: string, name: string; type: string } | null>(null);

  const getTodayKey = () => `daily_log_${new Date().toDateString()}`;

  useEffect(() => {
    const loadDynamicPlan = async () => {
      setIsLoadingPlan(true);
      const plan = await getDynamicIntelligence({ 
        name: user?.name, 
        current_streak: user?.streak 
      }, i18n.language);
      setDynamicPlan(plan);
      setIsLoadingPlan(false);
    };
    loadDynamicPlan();

    const todayKey = getTodayKey();
    const savedData = localStorage.getItem(todayKey);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setGlasses(parsed.water || 0);
      setDailyMeals(parsed.meals || { breakfast: "", lunch: "", dinner: "" });
      setCompletedExercises(parsed.exercises || []);
    }
  }, [user, i18n.language]);

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
    const response = await generateLocalResponse("I need a quick healthy recovery snack tip", user?.streak || 0, user?.name || "Friend");
    setAiSnack(response);
    setIsGeneratingSnack(false);
  };

  const handleLogAllMeals = () => {
    if (!dynamicPlan) return;
    const newMeals = {
      breakfast: dynamicPlan.breakfast.name,
      lunch: dynamicPlan.lunch.name,
      dinner: dynamicPlan.dinner.name,
    };
    setDailyMeals(newMeals);
    saveData(glasses, newMeals, completedExercises);
  };

  const waterPct = Math.round((glasses / 12) * 100);
  const exercisePct = dynamicPlan?.exercise.exercises.length
    ? Math.round((completedExercises.length / dynamicPlan.exercise.exercises.length) * 100)
    : 0;

  if (isLoadingPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <Sparkles size={32} className="text-violet-400 animate-pulse" />
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
           Generating your cellular healing plan...
        </h2>
        <p className="text-slate-400 max-w-sm text-center text-sm">
           Our AI is constructing today's exact macronutrient and movement requirements based on your current phase of neuroplastic repair.
        </p>
      </div>
    );
  }

  if (!dynamicPlan) return null;

  return (
    <div className="space-y-6 animate-in pb-8">
      {/* Header */}
      <header className="relative overflow-hidden bento-card rounded-2xl p-6">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-teal-300 rounded-full blur-3xl opacity-20" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-glow-pulse" />
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Dynamic Intelligence Active</span>
            </div>
            <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              Custom <span className="gradient-text-teal">Recovery</span> Plan
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Generated strictly for you.</p>
          </div>
          <div className="flex gap-3">
            <div className="glass-subtle px-4 py-2 rounded-xl text-center border border-teal-100/60">
              <p className="text-xs text-slate-400">Movement</p>
              <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-xl font-bold text-teal-600">{exercisePct}<span className="text-sm">%</span></p>
            </div>
          </div>
        </div>
      </header>

      {/* Recommended Diet */}
      <section className="bento-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <Calendar size={18} className="text-white" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="font-bold text-slate-900 dark:text-slate-100 text-lg">AI Generated Diet</h2>
              <p className="text-xs text-slate-400">Targeted neuro-repair for Day {user?.streak || 0}</p>
            </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["breakfast", "lunch", "dinner"] as const).map((mealKey) => {
              const configs = {
                breakfast: { icon: "🌅", label: "Breakfast", cls: "from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10", text: "text-amber-500" },
                lunch:     { icon: "☀️", label: "Lunch", cls: "from-teal-50 to-emerald-50 dark:from-teal-500/10 dark:to-emerald-500/10", text: "text-teal-500" },
                dinner:    { icon: "🌙", label: "Dinner", cls: "from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10", text: "text-indigo-500" },
              };
              const c = configs[mealKey];
              const mealData = dynamicPlan[mealKey];

              return (
                <div key={mealKey} onClick={() => setSelectedMeal({ id: mealKey, name: mealData.name, type: c.label })}
                  className={`bg-gradient-to-br ${c.cls} border border-white/5 rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-transform`}>
                   
                   <div className="flex justify-between items-start mb-2">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 dark:bg-black/20 ${c.text}`}>
                       {c.icon} {c.label}
                     </span>
                     <span className="text-[10px] font-bold text-slate-500 bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full">
                        {mealData.prepTime}
                     </span>
                   </div>
                   
                   <h3 className="font-bold text-sm mb-3 dark:text-slate-200">{mealData.name}</h3>
                   
                   <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-400">
                     <span>🔥 {mealData.calories} kcal</span>
                     <span>🥩 {mealData.protein}g P</span>
                     <span>🌾 {mealData.carbs}g C</span>
                     <span>🥑 {mealData.fat}g F</span>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Modals for Meals */}
      {selectedMeal && (() => {
         const mealData = dynamicPlan[selectedMeal.id as keyof DailyHealthPlan] as DynamicMeal;
         const macros = mealData ? [
            { label: "Calories", value: mealData.calories, unit: "kcal", color: "bg-orange-400", pct: Math.min(100, (mealData.calories / 700) * 100) },
            { label: "Protein", value: mealData.protein, unit: "g", color: "bg-blue-400", pct: Math.min(100, (mealData.protein / 60) * 100) },
            { label: "Carbs", value: mealData.carbs, unit: "g", color: "bg-amber-400", pct: Math.min(100, (mealData.carbs / 80) * 100) },
            { label: "Fat", value: mealData.fat, unit: "g", color: "bg-rose-400", pct: Math.min(100, (mealData.fat / 40) * 100) },
          ] : [];

         return (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                  onClick={() => setSelectedMeal(null)}>
                <div className="bg-[#0f172a] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10 border border-white/10"
                     onClick={e => e.stopPropagation()}>
                    <div className="relative h-40">
                       <img src={getMealImage(mealData.name)} className="w-full h-full object-cover rounded-t-3xl opacity-60" />
                       <button onClick={() => setSelectedMeal(null)}
                         className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white">
                         <X size={16} />
                       </button>
                       <div className="absolute bottom-4 left-4">
                           <h3 className="text-white font-bold text-xl">{mealData.name}</h3>
                       </div>
                    </div>
                    <div className="p-6 space-y-5">
                       
                       {/* Nutrition Science */}
                       <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                          <p className="text-[10px] uppercase font-bold text-emerald-400 mb-1 tracking-widest flex gap-1">
                            <Brain size={12} /> Neuro-Recovery Logic
                          </p>
                          <p className="text-sm text-emerald-100">{mealData.recoveryBenefit}</p>
                       </div>

                       {/* Macros */}
                       <div>
                         <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Macro Profile</h4>
                         <div className="space-y-2">
                            {macros.map(m => (
                               <div key={m.label} className="flex gap-2 items-center">
                                  <span className="w-16 text-xs text-slate-400">{m.label}</span>
                                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                     <div className={`h-full ${m.color}`} style={{ width: `${m.pct}%` }}/>
                                  </div>
                                  <span className="text-xs text-white font-bold w-12 text-right">{m.value}{m.unit}</span>
                               </div>
                            ))}
                         </div>
                       </div>

                       {/* Ingredients */}
                       <div>
                          <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Key Ingredients</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                             {mealData.ingredients.map((ing, i) => (
                               <li key={i}>• {ing}</li>
                             ))}
                          </ul>
                       </div>

                    </div>
                </div>
             </div>
         );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tracking */}
          <div className="bento-card p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-white flex items-center gap-2">
                     <Utensils size={16} className="text-orange-400" /> Log Intake
                  </h3>
                  <button onClick={handleLogAllMeals} className="text-[10px] bg-orange-500/20 text-orange-400 px-3 py-1 rounded-md font-bold">
                     AUTO-FILL PLAN
                  </button>
              </div>
              <div className="space-y-3">
                 {(["breakfast", "lunch", "dinner"] as const).map(meal => (
                    <input 
                      key={meal}
                      placeholder={dynamicPlan[meal].name}
                      value={dailyMeals[meal]}
                      onChange={(e) => handleMealChange(meal, e.target.value)}
                      className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
                    />
                 ))}
              </div>
          </div>

          <HydrationTracker />
          <SleepTracker />
      </div>

       {/* Exercises */}
       <section className="bento-card p-6 rounded-2xl">
          <h2 className="font-bold text-white flex items-center gap-2 mb-1 text-lg">
             <Dumbbell size={20} className="text-teal-400" /> AI Designed Movement
          </h2>
          <p className="text-xs text-slate-400 mb-4">{dynamicPlan.exercise.benefit}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {dynamicPlan.exercise.exercises.map((ex, idx) => {
                 const isDone = completedExercises.includes(ex.name);
                 return (
                    <div key={idx} className={`p-4 rounded-xl border ${isDone ? 'bg-teal-500/10 border-teal-500/30' : 'bg-black/20 border-white/5'}`}>
                       <div className="flex justify-between items-start mb-2">
                           <h4 className="font-bold text-sm text-white">{ex.name}</h4>
                           <button onClick={() => toggleExercise(ex.name)} className={isDone ? 'text-teal-400' : 'text-slate-600'}>
                              {isDone ? <CheckSquare size={16}/> : <Square size={16}/>}
                           </button>
                       </div>
                       <p className="text-[10px] text-teal-400 font-bold mb-2 uppercase tracking-wide">{ex.duration}</p>
                       <p className="text-xs text-slate-400">{ex.instruction}</p>
                    </div>
                 );
             })}
          </div>
       </section>

    </div>
  );
};

export default Health;
