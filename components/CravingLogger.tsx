import React, { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Zap, X } from "lucide-react";

interface CravingLoggerProps {
  userId: string | undefined;
  onSuccess?: () => void;
}

export const CravingLogger: React.FC<CravingLoggerProps> = ({
  userId,
  onSuccess,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [severity, setSeverity] = useState(5);
  const [trigger, setTrigger] = useState("");
  const [strategy, setStrategy] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userId) {
      alert("Please sign in first");
      return;
    }

    if (!trigger.trim()) {
      alert("Please describe the trigger");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("craving_logs").insert({
        user_id: userId,
        severity,
        trigger,
        coping_strategy_used: strategy,
      });

      if (error) throw error;

      setShowModal(false);
      onSuccess?.();
      alert("✅ Craving logged! You're doing great!");
      setSeverity(5);
      setTrigger("");
      setStrategy("");
    } catch (error) {
      console.error("Error logging craving:", error);
      alert("Failed to log craving");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-rose-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-rose-700 transition font-semibold"
      >
        <Zap size={20} />
        <span>Log Craving</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Log Craving</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Severity Level
                  </label>
                  <span className="text-lg font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
                    {severity}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>Mild</span>
                  <span>Intense</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  What triggered this craving?
                </label>
                <input
                  type="text"
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  placeholder="e.g., stressful day, saw old friend..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  What coping strategy are you using? (optional)
                </label>
                <textarea
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  placeholder="e.g., called mentor, went for run, meditated..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !trigger.trim()}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Logging..." : "Log Craving"}
              </button>

              <p className="text-xs text-slate-500 text-center">
                ✨ Logging cravings helps you understand your patterns and build strength
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
