import React from "react";
import { AlertTriangle, Phone, MessageSquare, Smile } from "lucide-react";
import { getCrisisResponse } from "../services/crisisDetection";

interface CrisisModalProps {
  onDismiss: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ onDismiss }) => {
  const crisisInfo = getCrisisResponse();

  const handleCall988 = () => {
    window.location.href = "tel:988";
  };

  const handleText = () => {
    alert("📱 Crisis Text Line\n\nText the word 'HOME' to 741741\n\nAvailable 24/7");
  };

  const handleCall911 = () => {
    window.location.href = "tel:911";
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-red-600 p-8 text-white">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-3xl font-bold">{crisisInfo.title}</h1>
          </div>
          <p className="text-lg text-rose-100">{crisisInfo.message}</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Immediate Help Section */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              🆘 Immediate Help Available
            </h2>
            <div className="space-y-4">
              {crisisInfo.hotlines.map((hotline, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-slate-50 to-blue-50 p-5 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition"
                >
                  <h3 className="font-bold text-slate-900 mb-2">
                    {hotline.name}
                  </h3>
                  {hotline.number && (
                    <p className="text-2xl font-mono font-bold text-rose-600 my-2">
                      {hotline.number}
                    </p>
                  )}
                  {hotline.message && (
                    <p className="text-lg font-semibold text-slate-700 my-2">
                      {hotline.message}
                    </p>
                  )}
                  <p className="text-sm text-slate-500 font-medium">
                    {hotline.available}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCall911}
              className="bg-red-600 text-white py-4 px-4 rounded-xl font-bold flex flex-col items-center justify-center space-y-2 hover:bg-red-700 transition transform hover:scale-105"
            >
              <Phone size={24} />
              <span className="text-sm">Call 911</span>
            </button>
            <button
              onClick={handleCall988}
              className="bg-rose-600 text-white py-4 px-4 rounded-xl font-bold flex flex-col items-center justify-center space-y-2 hover:bg-rose-700 transition transform hover:scale-105"
            >
              <Phone size={24} />
              <span className="text-sm">Call 988</span>
            </button>
            <button
              onClick={handleText}
              className="bg-indigo-600 text-white py-4 px-4 rounded-xl font-bold flex flex-col items-center justify-center space-y-2 hover:bg-indigo-700 transition transform hover:scale-105"
            >
              <MessageSquare size={24} />
              <span className="text-sm">Text 741741</span>
            </button>
            <button
              onClick={onDismiss}
              className="bg-rose-600 text-white py-4 px-4 rounded-xl font-bold flex flex-col items-center justify-center space-y-2 hover:bg-rose-700 transition transform hover:scale-105"
            >
              <Smile size={24} />
              <span className="text-sm">I'm Safe</span>
            </button>
          </div>

          {/* Message */}
          <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-xl">
            <p className="text-slate-700 text-center font-semibold">
              💙 Your life has value. Things can get better. <br />
              Professional help is available right now.
            </p>
          </div>

          {/* Additional Resources */}
          <div className="bg-slate-100 p-4 rounded-lg text-sm text-slate-600">
            <p className="font-semibold mb-2">💬 If you're struggling:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Your feelings are valid and real</li>
              <li>This moment is temporary, even if it doesn't feel like it</li>
              <li>Asking for help is strength, not weakness</li>
              <li>There are people who want to support you</li>
            </ul>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={onDismiss}
            className="w-full py-3 text-slate-600 font-semibold underline hover:text-slate-800 transition"
          >
            I've contacted someone for help or I'm safe now
          </button>
        </div>
      </div>
    </div>
  );
};
