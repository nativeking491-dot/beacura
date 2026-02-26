import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Palette, Moon, Sun, Clock, AlignJustify } from "lucide-react";
import { ThemePicker } from "../components/ThemePicker";
import { useTheme } from "../context/ThemeContext";

type ThemeMode = "light" | "dark" | "grey" | "midnight" | "sepia";

const MODE_OPTIONS: { value: ThemeMode; label: string; icon: React.ReactNode; desc: string; bg: string }[] = [
  { value: "light", label: "Light", icon: <Sun size={20} />, desc: "Bright & airy", bg: "bg-slate-50 border-slate-200" },
  { value: "dark", label: "Dark", icon: <Moon size={20} />, desc: "Easy on the eyes", bg: "bg-slate-800 border-slate-600" },
  { value: "grey", label: "Grey", icon: <AlignJustify size={20} />, desc: "Muted & calming", bg: "bg-slate-600 border-slate-500" },
  { value: "midnight", label: "Midnight", icon: <Clock size={20} />, desc: "Deep focus mode", bg: "bg-slate-950 border-slate-800" },
  { value: "sepia", label: "Sepia", icon: <Palette size={20} />, desc: "Warm & timeless", bg: "bg-amber-950 border-amber-800" },
];

const ThemeSettings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold mb-8 transition-colors"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-violet-500/10 text-violet-500 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <Palette size={14} />
          <span>Appearance</span>
        </div>
        <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Theme Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Make Beacura feel like yours. Changes save instantly.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 mb-8">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-5">
          Display Mode
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {MODE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200
                ${theme === opt.value
                  ? "border-violet-500 ring-2 ring-violet-500/30 shadow-lg"
                  : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"}
                ${opt.bg}
              `}
            >
              <div className={`p-2 rounded-xl ${theme === opt.value ? "bg-violet-500 text-white" : "bg-white/10 text-white dark:text-slate-300"}`}>
                {opt.icon}
              </div>
              <span className="text-xs font-bold text-white">{opt.label}</span>
              <span className="text-[10px] text-white/60 text-center leading-tight">{opt.desc}</span>
              {theme === opt.value && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Color Theme Picker */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-5">
          Accent Color
        </h2>
        <ThemePicker />
      </div>

      {/* Live Preview */}
      <div className="mt-8 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-5">
          Live Preview
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
            <div className="w-8 h-8 rounded-lg bg-primary-500 shadow-lg shadow-primary-500/40" />
            <div>
              <p className="font-bold text-slate-800 dark:text-white text-sm">Accent Color Active</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Buttons, badges, highlights</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-primary-500/20 overflow-hidden">
            <div className="h-2 w-3/5 rounded-full bg-primary-500 transition-all duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
