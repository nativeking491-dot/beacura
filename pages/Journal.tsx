import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Sparkles, Send, Calendar, Clock, Lock, ChevronDown, Trash2 } from 'lucide-react';
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
    "What was the most challenging moment today, and how did you handle it?",
    "Name one thing you are grateful for today.",
    "What is one small win you achieved today, no matter how minor?",
    "How is your body feeling right now? Notice without judgment.",
    "What would your future self thank you for doing today?",
    "Write a message of compassion to yourself.",
];

const sentimentStyle = {
    positive: { badge: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', glow: 'bg-emerald-500', label: '✨ Positive' },
    neutral: { badge: 'text-violet-500 bg-violet-500/10 border-violet-500/30', glow: 'bg-violet-500', label: '💜 Neutral' },
    negative: { badge: 'text-rose-500 bg-rose-500/10 border-rose-500/30', glow: 'bg-rose-500', label: '🌧 Heavy' },
};

export default function Journal() {
    const [entry, setEntry] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative'>('neutral');
    const [pastEntries, setPastEntries] = useState<JournalEntry[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
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
                        <span>Daily Reflection</span>
                    </div>
                    <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                        Your Private <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Journal</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2 text-sm">
                        <Lock size={13} />
                        Entries are securely stored and only visible to you.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 dark:text-slate-400 text-sm font-semibold">
                    <Calendar size={15} />
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
            </div>

            {/* Editor */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                {/* Sentiment glow */}
                <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 transition-colors duration-1000 pointer-events-none ${style.glow}`} />

                <div className="relative z-10 flex flex-col">
                    <textarea
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        placeholder="What's on your mind today? Let it all out..."
                        className="w-full bg-transparent resize-none text-slate-800 dark:text-slate-100 text-lg leading-relaxed placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-0 p-2"
                        style={{ minHeight: '280px' }}
                    />

                    {/* Word count */}
                    <p className="text-xs text-slate-400 text-right mb-3">
                        {entry.trim().split(/\s+/).filter(Boolean).length} words
                    </p>

                    <div className="border-t border-slate-100 dark:border-slate-700 pt-4 flex flex-wrap justify-between items-center gap-3">
                        {/* Sentiment Indicator */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tone:</span>
                            <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 transition-all duration-500 text-xs font-bold ${style.badge}`}>
                                <Sparkles size={13} className={sentiment === 'positive' ? 'animate-pulse' : ''} />
                                <span className="uppercase tracking-wide">{style.label}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving || !entry.trim()}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-md shadow-violet-500/30"
                        >
                            {isSaving ? <Clock size={18} className="animate-spin" /> : <Send size={18} />}
                            <span>{isSaving ? 'Saving...' : 'Save Entry'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Reflection Prompts */}
            <div className="mt-8">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BookOpen size={13} /> Reflection Prompts — click to add
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {PROMPTS.map((prompt, i) => (
                        <button
                            key={i}
                            onClick={() => setEntry(e => e + (e ? '\n\n' : '') + prompt + '\n')}
                            className="text-left p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all text-sm text-slate-600 dark:text-slate-300 hover:shadow-sm"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Past Entries */}
            <div className="mt-10">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock size={13} /> Past Entries
                </h3>

                {loadingHistory && (
                    <div className="text-center py-8 text-slate-400 text-sm">Loading history...</div>
                )}

                {!loadingHistory && pastEntries.length === 0 && (
                    <div className="text-center py-10 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <BookOpen size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">No entries yet. Write your first one above! 💙</p>
                    </div>
                )}

                <div className="space-y-3">
                    {pastEntries.map(e => {
                        const s = sentimentStyle[e.sentiment || 'neutral'];
                        const isExpanded = expandedId === e.id;
                        return (
                            <div key={e.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
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
                                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm leading-relaxed pt-4">{e.content}</p>
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
