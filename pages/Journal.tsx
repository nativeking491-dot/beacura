import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Sparkles, Heart, Calendar, Clock, Lock, ChevronDown, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import { analyzeSentiment } from '../services/sentimentService';
import { supabase } from '../services/supabaseClient';

interface JournalEntry {
    id: string;
    content: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    created_at: string;
}

const PROMPTS = [
    "What was the hardest moment today, and how did I survive it?",
    "One thing I'm genuinely grateful for today, no matter how small.",
    "A small win I had today — even just getting out of bed counts.",
    "How is my body feeling right now? I'll describe it without judgment.",
    "What would my future self thank me for doing today?",
    "A message of deep compassion I want to give to myself right now.",
    "What emotion am I carrying that I haven't said out loud yet?",
    "Something I want to let go of today — I'm writing it here to release it.",
];

const sentimentStyle = {
    positive: { badge: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', glow: 'bg-gradient-to-br from-emerald-400 to-teal-400', label: '✨ Uplifted' },
    neutral: { badge: 'text-violet-500 bg-violet-500/10 border-violet-500/30', glow: 'bg-gradient-to-br from-violet-400 to-indigo-400', label: '💜 Reflective' },
    negative: { badge: 'text-rose-500 bg-rose-500/10 border-rose-500/30', glow: 'bg-gradient-to-br from-rose-400 to-pink-400', label: '🌧️ Heavy' },
};

const QUICK_PROMPTS = [
    "Right now I feel...",
    "The hardest part of today was...",
    "One tiny thing I'm grateful for:",
    "I want to forgive myself for...",
    "Something I'm proud of surviving this week:",
    "An emotion I haven't said out loud yet:",
];

// Pick 3 random prompts on mount
function getRandomPrompts() {
    const shuffled = [...QUICK_PROMPTS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
}

export default function Journal() {
    const [entry, setEntry] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative'>('neutral');
    const [pastEntries, setPastEntries] = useState<JournalEntry[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [quickPrompts] = useState(getRandomPrompts);
    const { showToast } = useToast();
    const { user } = useUser();

    const loadHistory = useCallback(async () => {
        if (!user?.id) return;
        setLoadingHistory(true);
        try {
            const { data, error } = await supabase
                .from('journal_entries')
                .select('id, content, sentiment, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);
            if (error) throw error;
            setPastEntries((data as JournalEntry[]) || []);
        } catch {
            showToast('Could not load journal history', 'error');
        } finally {
            setLoadingHistory(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // Real-time sentiment analysis debounced
    useEffect(() => {
        const timer = setTimeout(() => {
            setSentiment(entry.trim().length > 10 ? analyzeSentiment(entry) : 'neutral');
        }, 700);
        return () => clearTimeout(timer);
    }, [entry]);

    const handleSave = async () => {
        if (!entry.trim()) {
            showToast('Your journal entry is empty', 'warning');
            return;
        }
        if (!user?.id) {
            showToast('Please sign in to save your journal', 'error');
            return;
        }
        setIsSaving(true);
        try {
            const { error } = await supabase.from('journal_entries').insert({
                user_id: user.id,
                content: entry.trim(),
                sentiment,
            });
            if (error) throw error;
            showToast('Journal entry saved securely. 💙', 'success');
            setEntry('');
            setSentiment('neutral');
            loadHistory();
        } catch {
            showToast('Failed to save entry. Please try again.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await supabase.from('journal_entries').delete().eq('id', id);
            setPastEntries(prev => prev.filter(e => e.id !== id));
            showToast('Entry deleted', 'success');
        } catch {
            showToast('Could not delete entry', 'error');
        }
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const style = sentimentStyle[sentiment];

    return (
        <div className="max-w-4xl mx-auto pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 space-y-4 md:space-y-0">
                <div>
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-violet-500/10 text-violet-500 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                        <BookOpen size={14} />
                        <span>Your Safe Space</span>
                    </div>
                    <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                        Your Private{' '}<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-400">Journal</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2 text-sm">
                        <Lock size={13} />
                        Everything you write here is yours alone. No judgment. Just honesty.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 dark:text-slate-400 text-sm font-semibold">
                    <Calendar size={15} />
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
            </div>

            {/* Editor */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(145deg, #ffffff 0%, #faf5ff 100%)' }}>
                {/* Warm ambient glows */}
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                {/* Sentiment glow */}
                <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-10 transition-colors duration-1000 pointer-events-none ${style.glow}`} />
                <div className="dark:hidden absolute inset-0 rounded-3xl" style={{ border: '1px solid rgba(167,139,250,0.15)' }} />

                {/* Dark mode */}
                <div className="hidden dark:block absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(145deg, rgba(30,15,60,0.95) 0%, rgba(15,12,40,0.95) 100%)', border: '1px solid rgba(167,139,250,0.12)' }} />

                <div className="relative z-10 p-6 md:p-8">

                    {/* Top bar */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #a78bfa, #f472b6)', boxShadow: '0 0 8px rgba(167,139,250,0.6)', animation: 'pulse-warm 2s ease-in-out infinite' }} />
                            <span className="text-xs font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest">Safe Space — Only You Can See This</span>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-all duration-700 text-[11px] font-bold ${style.badge}`}>
                            <Sparkles size={11} className={sentiment === 'positive' ? 'animate-pulse' : ''} />
                            <span>{style.label}</span>
                        </div>
                    </div>

                    {/* ── Quick-start prompts (above textarea) ── */}
                    {!entry && (
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                                <Sparkles size={11} />
                                Not sure where to start? Tap one of these:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {quickPrompts.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setEntry(prompt + '\n')}
                                        style={{ transitionDelay: `${i * 60}ms` }}
                                        className="text-left px-3.5 py-2 rounded-xl border border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/8 hover:border-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-all text-xs text-violet-700 dark:text-violet-300 font-medium hover:shadow-sm hover:-translate-y-0.5"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <textarea
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        placeholder="Whatever you're feeling right now is valid. Let it out here — no one is watching, no one is judging. This space is entirely yours."
                        className="w-full bg-transparent resize-none text-slate-800 dark:text-slate-100 text-base leading-relaxed placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-0 p-2"
                        style={{ minHeight: '200px', fontFamily: 'Georgia, serif', fontSize: '1rem', lineHeight: '1.8' }}
                    />

                    {/* Word count */}
                    <p className="text-xs text-slate-300 dark:text-slate-600 text-right mb-4">
                        {entry.trim() ? `${entry.trim().split(/\s+/).filter(Boolean).length} words` : 'Start writing — this space is yours'}
                    </p>

                    <div className="border-t border-slate-100 dark:border-white/5 pt-4 flex flex-wrap justify-between items-center gap-3">
                        <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                            <Lock size={11} />
                            Saved privately · Only you can read this
                        </p>

                        <button
                            onClick={handleSave}
                            disabled={isSaving || !entry.trim()}
                            className="flex items-center space-x-2 px-6 py-3 text-white rounded-xl font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}
                        >
                            {isSaving ? <Clock size={17} className="animate-spin" /> : <Heart size={17} fill="rgba(255,255,255,0.4)" />}
                            <span>{isSaving ? 'Saving...' : 'Save My Thoughts'}</span>
                        </button>
                    </div>
                </div>

                <style>{`
                    @keyframes pulse-warm {
                        0%, 100% { transform: scale(1); opacity: 0.8; }
                        50% { transform: scale(1.4); opacity: 1; }
                    }
                `}</style>
            </div>

            {/* Reflection Prompts */}
            <div className="mt-8">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BookOpen size={13} /> Deeper reflection — click to add
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PROMPTS.map((prompt, i) => (
                        <button
                            key={i}
                            onClick={() => setEntry(e => e + (e ? '\n\n' : '') + prompt + '\n')}
                            className="text-left p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all text-sm text-slate-600 dark:text-slate-300 hover:shadow-md hover:-translate-y-0.5"
                        >
                            <span className="text-violet-400 mr-2">“</span>{prompt}<span className="text-violet-400 ml-1">”</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Past Entries */}
            <div className="mt-10">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock size={13} /> Your Story So Far
                </h3>

                {loadingHistory && (
                    <div className="text-center py-8 text-slate-400 text-sm">Loading your past reflections...</div>
                )}

                {!loadingHistory && pastEntries.length === 0 && (
                    <div className="text-center py-12 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.05) 0%, rgba(244,114,182,0.05) 100%)', border: '1px dashed rgba(167,139,250,0.2)' }}>
                        <div className="text-4xl mb-3">📖</div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Your story starts with the first entry.</p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Every word you write here is a step forward. 💙</p>
                    </div>
                )}

                <div className="space-y-3">
                    {pastEntries.map(e => {
                        const s = sentimentStyle[e.sentiment || 'neutral'];
                        const isExpanded = expandedId === e.id;
                        return (
                            <div key={e.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : e.id)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded-lg border text-xs font-bold ${s.badge}`}>{s.label}</span>
                                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium truncate max-w-[200px] md:max-w-sm">
                                            {e.content.substring(0, 80)}{e.content.length > 80 ? '...' : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-2">
                                        <span className="text-xs text-slate-400">{formatDate(e.created_at)}</span>
                                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>
                                {isExpanded && (
                                    <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-700">
                                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed pt-4" style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', lineHeight: '1.8' }}>{e.content}</p>
                                        <div className="flex justify-end mt-4">
                                            <button
                                                onClick={() => handleDelete(e.id)}
                                                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-600 font-semibold transition-colors"
                                            >
                                                <Trash2 size={13} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
