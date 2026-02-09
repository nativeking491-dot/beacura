import React from "react";
import { X, CheckCircle } from "lucide-react";
import { MealReminder } from "../services/mealReminder";

interface MealReminderModalProps {
  reminder: MealReminder;
  onClose: () => void;
}

export const MealReminderModal: React.FC<MealReminderModalProps> = ({
  reminder,
  onClose,
}) => {
  if (!reminder.type) {
    return null;
  }

  const getBackgroundColor = () => {
    switch (reminder.type) {
      case "breakfast":
        return "from-amber-50 to-orange-50";
      case "lunch":
        return "from-emerald-50 to-teal-50";
      case "dinner":
        return "from-indigo-50 to-purple-50";
      case "snack":
        return "from-rose-50 to-pink-50";
      default:
        return "from-blue-50 to-cyan-50";
    }
  };

  const getBorderColor = () => {
    switch (reminder.type) {
      case "breakfast":
        return "border-amber-200";
      case "lunch":
        return "border-emerald-200";
      case "dinner":
        return "border-indigo-200";
      case "snack":
        return "border-rose-200";
      default:
        return "border-blue-200";
    }
  };

  const getHeaderColor = () => {
    switch (reminder.type) {
      case "breakfast":
        return "from-amber-500 to-orange-500";
      case "lunch":
        return "from-emerald-500 to-teal-500";
      case "dinner":
        return "from-indigo-500 to-purple-500";
      case "snack":
        return "from-rose-500 to-pink-500";
      default:
        return "from-blue-500 to-cyan-500";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div
        className={`bg-gradient-to-br ${getBackgroundColor()} rounded-3xl shadow-2xl max-w-md w-full border ${getBorderColor()} overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300`}
      >
        {/* Header */}
        <div
          className={`bg-gradient-to-r ${getHeaderColor()} text-white p-6 flex justify-between items-start`}
        >
          <div className="flex items-start space-x-3">
            <span className="text-4xl">{reminder.icon}</span>
            <div>
              <h2 className="text-2xl font-bold">{reminder.title}</h2>
              <p className="text-white/90 text-sm mt-1">{reminder.message}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <CheckCircle size={18} className="text-emerald-600" />
              <span>Healthy Tips:</span>
            </h3>
            <ul className="space-y-2">
              {reminder.tips.map((tip, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm text-slate-700 leading-relaxed">
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/60 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-600 text-center">
              💡 <strong>Pro Tip:</strong> Consistent meal times help regulate your
              metabolism and support your recovery journey!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white font-semibold py-3 px-4 rounded-xl hover:from-slate-800 hover:to-slate-900 transition-all duration-200 shadow-md"
          >
            Got It! Let's Stay Healthy 💪
          </button>
        </div>
      </div>
    </div>
  );
};
