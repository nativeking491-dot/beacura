import React from "react";
import { useTheme, ColorTheme } from "../context/ThemeContext";
import { Palette, Check } from "lucide-react";

export const ThemePicker: React.FC = () => {
    const { theme, setTheme, colorTheme, setColorTheme } = useTheme();

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

    const modes = [
        { id: "light", label: "Light", color: "#f8fafc", borderColor: "#e2e8f0", textColor: "text-slate-900" },
        { id: "dark", label: "Dark", color: "#0f172a", borderColor: "#334155", textColor: "text-white" },
        { id: "grey", label: "Grey", color: "#27272a", borderColor: "#52525b", textColor: "text-zinc-200" },
        { id: "midnight", label: "Midnight", color: "#000000", borderColor: "#1e293b", textColor: "text-white" },
        { id: "sepia", label: "Sepia", color: "#fdf6e3", borderColor: "#fde68a", textColor: "text-amber-900" },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Palette className="text-teal-500" />
                <span>Appearance</span>
            </h3>

            <div className="space-y-6">
                {/* Background Mode Selection */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                        Change Theme
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                        {modes.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setTheme(m.id as any)}
                                className={`
                                    relative h-16 rounded-2xl flex flex-col items-center justify-center transition-all hover:scale-105 border-2
                                    ${theme === m.id ? "ring-2 ring-offset-2 ring-teal-500 scale-105 shadow-md" : ""}
                                `}
                                style={{
                                    backgroundColor: m.color,
                                    borderColor: m.borderColor
                                }}
                            >
                                {theme === m.id && (
                                    <div className="absolute top-1 right-1 bg-teal-500 rounded-full p-0.5">
                                        <Check size={10} className="text-white" />
                                    </div>
                                )}
                                <span className={`text-[10px] font-bold ${m.textColor}`}>
                                    {m.label}
                                </span>
                            </button>
                        ))}
                    </div>
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
