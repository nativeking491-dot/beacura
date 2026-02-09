import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ThemePicker } from "../components/ThemePicker";
import { useTheme } from "../context/ThemeContext";

const ThemeSettings: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className={`${theme === "dark" ? "bg-slate-900" : "bg-slate-50"} min-h-screen transition-colors`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className={`${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} border-b p-6`}>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition-colors ${
                theme === "dark"
                  ? "hover:bg-slate-700 text-slate-300"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Theme Settings
              </h1>
              <p className={`mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                Customize your app appearance
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <ThemePicker />
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
