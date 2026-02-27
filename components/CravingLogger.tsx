import React, { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Zap, X, ChevronDown } from "lucide-react";
import { useToast } from "../context/ToastContext";

interface CravingLoggerProps {
  userId: string | undefined;
  onSuccess?: () => void;
}

const TRIGGER_CATEGORIES = [
  { value: "people", label: "👥 People — old friends, dealers, family stress" },
  { value: "places", label: "📍 Places — bars, old neighbourhoods, using spots" },
  { value: "emotions", label: "💔 Emotions — anxiety, loneliness, anger, shame" },
  { value: "boredom", label: "😶 Boredom — nothing to do, restless energy" },
  { value: "physical", label: "🤒 Physical — pain, withdrawal, exhaustion" },
  { value: "celebration", label: "🎉 Celebration — good news, wanting to reward myself" },
  { value: "other", label: "📝 Other — describe below" },
];

export const CravingLogger: React.FC<CravingLoggerProps> = ({
  userId,
  onSuccess,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [severity, setSeverity] = useState(5);
  const [triggerCategory, setTriggerCategory] = useState("");
  const [triggerNote, setTriggerNote] = useState("");
  const [strategy, setStrategy] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!userId) {
      showToast("Please sign in first", "warning");
      return;
    }
    if (!triggerCategory) {
      showToast("Please select what triggered this craving", "warning");
      return;
    }

    setLoading(true);
    try {
      const trigger = triggerNote.trim()
        ? `${TRIGGER_CATEGORIES.find(t => t.value === triggerCategory)?.label.split(' — ')[0]}: ${triggerNote}`
        : TRIGGER_CATEGORIES.find(t => t.value === triggerCategory)?.label.split(' — ')[0] || triggerCategory;

      const { error } = await supabase.from("craving_logs").insert({
        user_id: userId,
        severity,
        trigger,
        coping_strategy_used: strategy,
      });

      if (error) throw error;

      setShowModal(false);
      onSuccess?.();
      showToast("Craving logged — you're doing great! 💪", "success");
      setSeverity(5);
      setTriggerCategory("");
      setTriggerNote("");
      setStrategy("");
    } catch (error) {
      console.error("Error logging craving:", error);
      showToast("Failed to log craving", "error");
    } finally {
      setLoading(false);
    }
  };

  const severityColor = severity <= 3 ? '#10b981' : severity <= 6 ? '#f59e0b' : '#ef4444';
  const severityLabel = severity <= 3 ? 'Mild' : severity <= 6 ? 'Moderate' : 'Intense';

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-rose-600 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-rose-700 transition font-semibold text-sm"
      >
        <Zap size={16} />
        <span>Log Craving</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 p-7 rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Log a Craving</h2>
                <p className="text-xs text-slate-400 mt-0.5">Tracking helps you spot patterns</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Severity Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Severity</label>
                  <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg" style={{ color: severityColor, background: `${severityColor}18` }}>
                    {severity}/10 · {severityLabel}
                  </span>
                </div>
                <input
                  type="range" min="1" max="10" value={severity}
                  onChange={(e) => setSeverity(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Mild urge</span><span>Overwhelming</span>
                </div>
              </div>

              {/* Trigger Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  What triggered it? <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={triggerCategory}
                    onChange={(e) => setTriggerCategory(e.target.value)}
                    className="w-full px-4 py-3 pr-10 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 appearance-none cursor-pointer"
                  >
                    <option value="">Select a trigger category...</option>
                    {TRIGGER_CATEGORIES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Any details? <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={triggerNote}
                  onChange={(e) => setTriggerNote(e.target.value)}
                  placeholder="e.g., ran into someone from my past..."
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Coping Strategy */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  What are you doing to cope? <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  placeholder="e.g., calling my sponsor, going for a walk..."
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !triggerCategory}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3.5 rounded-xl font-bold hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm shadow-md shadow-rose-500/20"
              >
                {loading ? "Logging..." : "✓ Log This Craving"}
              </button>

              <p className="text-xs text-slate-400 text-center">
                Every craving you survive is your brain getting stronger 💪
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
