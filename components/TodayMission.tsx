import React, { useState } from "react";
import { Brain, Dumbbell, Utensils, Sparkles, CheckCircle } from "lucide-react";
import { WEEKLY_EXERCISE_PLAN, FOOD_TIPS, WEEKLY_MEAL_PLAN } from "../constants";

interface TodayMissionProps {
  onAllComplete?: () => void;
}

const JOURNALING_PROMPTS = [
  "What is one thing you can control today?",
  "Describe a moment this week when you felt proud of yourself.",
  "What does your recovery mean to the people who love you?",
  "Write about a craving you successfully resisted.",
  "What small win can you celebrate today, no matter how tiny?",
  "How has your body changed in a positive way since you started this journey?",
  "Who in your life makes you stronger? Write them a mental thank-you note.",
];

export const TodayMission: React.FC<TodayMissionProps> = ({ onAllComplete }) => {
  const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon…
  const exercisePlanIndex = dayIndex === 0 ? 6 : dayIndex - 1; // maps Sun→6, Mon→0, etc.
  const exercise = WEEKLY_EXERCISE_PLAN[exercisePlanIndex];
  const mealDay = WEEKLY_MEAL_PLAN[exercisePlanIndex];
  const journalPrompt = JOURNALING_PROMPTS[dayIndex % JOURNALING_PROMPTS.length];
  const foodTip = FOOD_TIPS[exercisePlanIndex % FOOD_TIPS.length];

  const missions = [
    {
      key: "exercise",
      label: exercise.exercises[0].name,
      sub: exercise.exercises[0].duration,
      icon: Dumbbell,
      color: "#f59e0b",
      bg: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      key: "journal",
      label: "Journal Prompt",
      sub: journalPrompt.length > 50 ? journalPrompt.slice(0, 50) + "…" : journalPrompt,
      icon: Brain,
      color: "#8b5cf6",
      bg: "bg-violet-50 dark:bg-violet-500/10",
    },
    {
      key: "nutrition",
      label: foodTip.title,
      sub: foodTip.description.length > 50 ? foodTip.description.slice(0, 50) + "…" : foodTip.description,
      icon: Utensils,
      color: "#10b981",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
  ];

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [fired, setFired] = useState(false);

  const toggle = (key: string) => {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    const allDone = missions.every((m) => next[m.key]);
    if (allDone && !fired) {
      setFired(true);
      onAllComplete?.();
    }
  };

  const completedCount = missions.filter((m) => checked[m.key]).length;

  return (
    <div className="bento-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <Sparkles size={15} className="text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Today's Missions</p>
            <p className="text-[10px] text-slate-400">{exercise.focus} · {exercise.day}</p>
          </div>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{
            background: completedCount === 3 ? "linear-gradient(135deg,#10b981,#0d9488)" : "#f1f5f9",
            color: completedCount === 3 ? "white" : "#94a3b8",
            transition: "all 0.4s ease",
          }}
        >
          {completedCount}/3
        </span>
      </div>

      <div className="space-y-2.5">
        {missions.map((m) => {
          const Icon = m.icon;
          const done = !!checked[m.key];
          return (
            <button
              key={m.key}
              onClick={() => toggle(m.key)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${done ? "opacity-70" : "hover:scale-[1.01]"}`}
              style={{ background: done ? "rgba(16,185,129,0.08)" : undefined }}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${m.bg} ${done ? "scale-110" : ""}`}
              >
                {done
                  ? <CheckCircle size={17} className="text-emerald-500" />
                  : <Icon size={17} style={{ color: m.color }} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold truncate transition-colors ${done ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-100"}`}>
                  {m.label}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{m.sub}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all duration-300 ${done ? "border-emerald-400 bg-emerald-400" : "border-slate-300 dark:border-slate-600"}`}>
                {done && (
                  <svg viewBox="0 0 16 16" fill="none" className="w-full h-full p-0.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3,8 6.5,11.5 13,5" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {completedCount === 3 && (
        <div
          className="mt-4 text-center py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #10b981, #0d9488)", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}
        >
          🎉 All missions complete! You crushed it today!
        </div>
      )}
    </div>
  );
};

export default TodayMission;
