import React, { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Smile, X, Meh, Frown, CheckCircle2, Loader2 } from "lucide-react";

interface MoodLoggerProps {
    userId: string | undefined;
    onSuccess?: () => void;
}

export const MoodLogger: React.FC<MoodLoggerProps> = ({ userId, onSuccess }) => {
    const [showModal, setShowModal] = useState(false);
    const [moodScore, setMoodScore] = useState(5);
    const [energyLevel, setEnergyLevel] = useState(5);
    const [sleepQuality, setSleepQuality] = useState(5);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSubmit = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const { error } = await supabase.from("mood_logs").insert({
                user_id: userId,
                mood_score: moodScore,
                energy_level: energyLevel,
                sleep_quality: sleepQuality,
                notes,
            });
            if (error) throw error;
            setSaved(true);
            onSuccess?.();
            setTimeout(() => {
                setShowModal(false);
                setSaved(false);
                setMoodScore(5); setEnergyLevel(5); setSleepQuality(5); setNotes("");
            }, 1400);
        } catch (err) {
            console.error("Error logging mood:", err);
        } finally {
            setLoading(false);
        }
    };

    const getMoodEmoji = (score: number) => {
        if (score >= 8) return { icon: <Smile size={22} />, color: "text-emerald-500", label: "Great" };
        if (score >= 5) return { icon: <Meh size={22} />, color: "text-amber-500", label: "Okay" };
        return { icon: <Frown size={22} />, color: "text-rose-500", label: "Rough" };
    };

    const mood = getMoodEmoji(moodScore);

    const SliderRow = ({
        label, value, onChange, trackColor, emoji
    }: { label: string; value: number; onChange: (v: number) => void; trackColor: string; emoji: string }) => (
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>{emoji}</span> {label}
                </label>
                <span className={`text-sm font-extrabold ${trackColor}`} style={{ fontFamily: 'Sora, sans-serif' }}>
                    {value}<span className="text-slate-400 font-normal text-xs">/10</span>
                </span>
            </div>
            <input
                type="range" min="1" max="10" value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-100 dark:bg-slate-700"
                style={{ accentColor: trackColor.includes('emerald') ? '#10b981' : trackColor.includes('amber') ? '#f59e0b' : '#6366f1' }}
            />
            <div className="flex justify-between text-[9px] text-slate-300 dark:text-slate-600 mt-0.5 px-1">
                <span>Low</span><span>High</span>
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center space-x-2 glass-subtle border border-slate-200/60 dark:border-white/10 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-amber-300 dark:hover:border-amber-500/40 transition-all hover-lift"
            >
                <Smile size={17} className="text-amber-500" />
                <span>Log Mood</span>
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="relative bento-card rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in">

                        {/* Success overlay */}
                        {saved && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-slate-900/95 rounded-3xl z-10">
                                <div className="text-center animate-in">
                                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle2 size={32} className="text-emerald-500" />
                                    </div>
                                    <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-lg font-bold text-slate-900 dark:text-slate-100">Mood Saved!</p>
                                    <p className="text-sm text-slate-400 mt-1">Keep tracking, keep growing. 🌱</p>
                                </div>
                            </div>
                        )}

                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-0.5">Daily Check-in</p>
                                <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                    How are you feeling?
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Mood emoji display */}
                        <div className="flex items-center justify-center space-x-4 mb-6 glass-subtle p-4 rounded-2xl border border-white/60 dark:border-white/10">
                            <div className={`${mood.color} transition-all duration-300`}>{mood.icon}</div>
                            <div>
                                <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{moodScore}/10</p>
                                <p className={`text-xs font-bold ${mood.color}`}>{mood.label}</p>
                            </div>
                        </div>

                        <div className="space-y-5 mb-6">
                            <SliderRow label="Mood" value={moodScore} onChange={setMoodScore} trackColor="text-emerald-500" emoji="😊" />
                            <SliderRow label="Energy Level" value={energyLevel} onChange={setEnergyLevel} trackColor="text-amber-500" emoji="⚡" />
                            <SliderRow label="Sleep Quality" value={sleepQuality} onChange={setSleepQuality} trackColor="text-indigo-500" emoji="🌙" />

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    📝 Notes <span className="text-xs text-slate-400 font-normal">(optional)</span>
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Anything specific happening today?"
                                    rows={2}
                                    className="input-glow w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 resize-none"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn-primary w-full py-3 flex items-center justify-center space-x-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            <span>{loading ? "Saving..." : "Save Mood Log"}</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
