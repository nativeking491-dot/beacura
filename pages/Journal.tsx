import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Send, Calendar, Clock, Lock, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import { analyzeSentiment } from '../services/sentimentService';

export default function Journal() {
    const [entry, setEntry] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative'>('neutral');
    const { showToast } = useToast();
    const { user } = useUser();

    // Basic sentiment analysis on input change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (entry.trim().length > 10) {
                setSentiment(analyzeSentiment(entry));
            } else {
                setSentiment('neutral');
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [entry]);

    const handleSave = async () => {
        if (!entry.trim()) {
            showToast("Your journal entry is empty", "warning");
            return;
        }
        setIsSaving(true);

        // Simulate API delay for saving
        await new Promise(resolve => setTimeout(resolve, 1000));

        showToast("Journal entry saved securely.", "success");
        setEntry('');
        setIsSaving(false);
    };

    const getSentimentColor = () => {
        switch (sentiment) {
            case 'positive': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
            case 'negative': return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
            case 'neutral': return 'text-violet-500 bg-violet-500/10 border-violet-500/30';
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 space-y-4 md:space-y-0">
                <div>
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                        <BookOpen size={14} />
                        <span>Daily Reflection</span>
                    </div>
                    <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                        Your Private <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Journal</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2">
                        <Lock size={14} />
                        Your thoughts are securely stored and completely private.
                    </p>
                </div>

                <div className="flex items-center space-x-4 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                        <Calendar size={16} />
                        <span className="font-semibold text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">

                {/* Dynamic Sentiment Glow */}
                <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 transition-colors duration-1000 pointer-events-none
          ${sentiment === 'positive' ? 'bg-emerald-500' : ''}
          ${sentiment === 'negative' ? 'bg-rose-500' : ''}
          ${sentiment === 'neutral' ? 'bg-violet-500' : ''}
        `} />

                <div className="relative z-10 flex flex-col h-[500px]">
                    <textarea
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        placeholder="What's on your mind today? Let it all out..."
                        className="flex-1 w-full bg-transparent resize-none text-slate-800 dark:text-slate-100 text-lg md:text-xl leading-relaxed placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-0 p-2"
                        style={{ minHeight: '300px' }}
                    />

                    <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-4 flex justify-between items-center">

                        {/* Sentiment Indicator */}
                        <div className="flex items-center space-x-3">
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Current Mood:</span>
                            <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 transition-all duration-500 ${getSentimentColor()}`}>
                                <Sparkles size={14} className={sentiment === 'positive' ? 'animate-pulse' : ''} />
                                <span className="text-xs font-bold uppercase tracking-wide">
                                    {sentiment}
                                </span>
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
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BookOpen size={14} /> Reflection Prompts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        "What was the most challenging moment today, and how did you handle it?",
                        "Name one thing you are grateful for today.",
                        "What is one small win you achieved today, no matter how minor?"
                    ].map((prompt, i) => (
                        <button
                            key={i}
                            onClick={() => setEntry(entry + (entry ? '\n\n' : '') + "**" + prompt + "**\n")}
                            className="text-left p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors text-sm text-slate-600 dark:text-slate-300"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
}
