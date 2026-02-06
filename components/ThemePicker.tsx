import React from "react";
import { useTheme, ColorTheme } from "../context/ThemeContext";
import { Moon, Sun, Palette, Check } from "lucide-react";

export const ThemePicker: React.FC = () => {
    const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();

    const colors: { id: ColorTheme; label: string; color: string }[] = [
        { id: "teal", label: "Beacura Teal", color: "#14b8a6" },
        { id: "blue", label: "Ocean Blue", color: "#3b82f6" },
        { id: "violet", label: "Royal Violet", color: "#8b5cf6" },
        { id: "rose", label: "Energy Rose", color: "#f43f5e" },
        { id: "orange", label: "Warm Sunset", color: "#f97316" },
        { id: "emerald", label: "Zen Emerald", color: "#10b981" },
        { id: "indigo", label: "Deep Indigo", color: "#6366f1" },
        { id: "amber", label: "Bright Amber", color: "#f59e0b" },
        { id: "fuchsia", label: "Vivid Fuchsia", color: "#d946ef" },
        { id: "cyan", label: "Cool Cyan", color: "#06b6d4" },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Palette className="text-teal-500" />
                <span>Appearance</span>
            </h3>

            <div className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-600 rounded-xl shadow-sm">
                            {theme === "dark" ? (
                                <Moon size={20} className="text-indigo-400" />
                            ) : (
                                <Sun size={20} className="text-amber-500" />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">Dark Mode</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {theme === "dark" ? "On" : "Off"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`
              w-12 h-7 rounded-full transition-colors flex items-center p-1
              ${theme === "dark" ? "bg-teal-500" : "bg-slate-200"}
            `}
                    >
                        <div
                            className={`
                w-5 h-5 bg-white rounded-full shadow-md transform transition-transform
                ${theme === "dark" ? "translate-x-5" : "translate-x-0"}
              `}
                        />
                    </button>
                </div>

                {/* Color Theme Selection */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                        Accent Color
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                        {colors.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setColorTheme(c.id)}
                                className={`
                  relative h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110
                  ${colorTheme === c.id ? "ring-2 ring-offset-2 ring-slate-300 dark:ring-slate-600 scale-110" : ""}
                `}
                                style={{ backgroundColor: c.color }}
                                title={c.label}
                            >
                                {colorTheme === c.id && (
                                    <Check size={16} className="text-white drop-shadow-md" strokeWidth={3} />
                                )}
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-xs text-slate-400 mt-2">
                        {colors.find(c => c.id === colorTheme)?.label}
                    </p>
                </div>
            </div>
        </div>
    );
};
