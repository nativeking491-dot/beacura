import React, { useState } from "react";
import { Check, Heart, Zap, Moon, Flame, Sparkles } from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { useToast } from "../context/ToastContext";

interface DailyCheckInProps {
  userId: string;
  onComplete?: () => void;
}

const SLIDER_QUESTIONS = [
  { key: "mood_score", label: "Mood", icon: Heart, color: "#ec4899", emoji: ["😞","😔","😐","🙂","😊","😄","🤩"] },
  { key: "energy_score", label: "Energy", icon: Zap, color: "#f59e0b", emoji: ["🪫","😴","😑","🙂","⚡","🔋","💥"] },
  { key: "sleep_score", label: "Sleep Quality", icon: Moon, color: "#6366f1", emoji: ["😩","😫","😪","😪","😴","💤","🌙"] },
  { key: "craving_score", label: "Craving Urge", icon: Flame, color: "#ef4444", emoji: ["✅","😤","😬","😧","😰","🔥","🆘"],
    inverted: true, // lower is better
    scaleNote: "0 = none, 10 = overwhelming" },
];

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({ userId, onComplete }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, number>>({
    mood_score: 5,
    energy_score: 5,
    sleep_score: 5,
    craving_score: 3,
  });
  const [gratitude, setGratitude] = useState("");

  const totalSteps = SLIDER_QUESTIONS.length + 1; // +1 for gratitude

  const handleSave = async () => {
    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await supabase.from("daily_logs").upsert({
        user_id: userId,
        date: today,
        ...values,
        gratitude_note: gratitude.trim() || null,
      }, { onConflict: "user_id,date" });
      setDone(true);
      onComplete?.();
    } catch {
      showToast("Couldn't save check-in. Try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="bento-card rounded-2xl p-6 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl"
          style={{ background: "linear-gradient(135deg, #10b981, #0d9488)", boxShadow: "0 8px 24px rgba(16,185,129,0.3)" }}
        >
          ✅
        </div>
        <p className="font-bold text-slate-800 dark:text-slate-100 mb-1" style={{ fontFamily: "Sora, sans-serif" }}>
          Daily check-in complete! 🌟
        </p>
        <p className="text-xs text-slate-400">You're showing up for yourself — that's everything.</p>
      </div>
    );
  }

  const isGratitudeStep = step === SLIDER_QUESTIONS.length;
  const q = !isGratitudeStep ? SLIDER_QUESTIONS[step] : null;
  const QIcon = q?.icon;

  return (
    <div className="bento-card rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
            <Sparkles size={15} className="text-violet-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Daily Check-In</p>
            <p className="text-[10px] text-slate-400">Step {step + 1} of {totalSteps}</p>
          </div>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 16 : 6,
                height: 6,
                background: i <= step ? "#8b5cf6" : "#e2e8f0",
              }}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      {!isGratitudeStep && q && QIcon && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${q.color}20` }}
            >
              <QIcon size={17} style={{ color: q.color }} />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{q.label}</p>
              {q.scaleNote && <p className="text-[10px] text-slate-400">{q.scaleNote}</p>}
            </div>
            <span className="ml-auto text-2xl">
              {q.emoji[Math.min(Math.floor((values[q.key] / 10) * q.emoji.length), q.emoji.length - 1)]}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={10}
            value={values[q.key]}
            onChange={(e) => setValues((v) => ({ ...v, [q.key]: Number(e.target.value) }))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer mb-2"
            style={{
              background: `linear-gradient(to right, ${q.color} 0%, ${q.color} ${values[q.key] * 10}%, #e2e8f0 ${values[q.key] * 10}%, #e2e8f0 100%)`,
              accentColor: q.color,
            }}
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>{q.inverted ? "None" : "Very Low"}</span>
            <span className="font-bold text-base" style={{ color: q.color }}>{values[q.key]}</span>
            <span>{q.inverted ? "Overwhelming" : "Excellent"}</span>
          </div>
        </div>
      )}

      {/* Gratitude step */}
      {isGratitudeStep && (
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">One thing you're grateful for today</p>
          <p className="text-xs text-slate-400 mb-3">Even if it's tiny — it rewires your brain. ✨</p>
          <textarea
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="e.g. I woke up today. The sun was out. My coffee was good."
            rows={3}
            autoFocus
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-2 mt-4">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={() => {
            if (!isGratitudeStep) setStep((s) => s + 1);
            else handleSave();
          }}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}
        >
          {isGratitudeStep ? (
            saving ? "Saving…" : <><Check size={15} /> Complete</>
          ) : "Next →"}
        </button>
      </div>
    </div>
  );
};

export default DailyCheckIn;
