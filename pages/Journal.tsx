import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Sparkles, Heart, Calendar, Clock, Lock, ChevronDown, Trash2, Mic, MicOff } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import { analyzeSentiment } from '../services/sentimentService';
import { supabase } from '../services/supabaseClient';
import { generateLocalResponse } from '../services/localAIService';

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
    const [writingStreak, setWritingStreak] = useState(0);
    const [aiReflection, setAiReflection] = useState<string | null>(null);
    const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = React.useRef<any>(null);
    const { showToast } = useToast();
    const { user } = useUser();

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setEntry((prev) => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + finalTranscript);
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
                showToast("Microphone error or permission denied.", "warning");
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
        }
    }, [showToast]);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            showToast("Speech recognition is not supported in this browser.", "error");
            return;
        }
        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
            showToast("Recording started. Speak clearly.", "success");
        }
    };

    const loadHistory = useCallback(async () => {
        if (!user?.id) return;
        setLoadingHistory(true);
        try {
            const { data, error } = await supabase
                .from('journal_entries')
                .select('id, content, sentiment, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);
            if (error) throw error;
            
            const entries = (data as JournalEntry[]) || [];
            setPastEntries(entries);
            
            // Calculate consecutive writing streak
            let streak = 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let currentDateCheck = today;
            
            // Check if there's an entry for today or yesterday to start the streak
            if (entries.length > 0) {
                 const firstEntryDate = new Date(entries[0].created_at);
                 firstEntryDate.setHours(0,0,0,0);
                 
                 const diffDays = Math.round((today.getTime() - firstEntryDate.getTime()) / (1000 * 60 * 60 * 24));
                 
                 if (diffDays <= 1) {
                     streak = 1;
                     currentDateCheck = firstEntryDate;
                     
                     // Count backwards
                     for (let i = 1; i < entries.length; i++) {
                         const entryDate = new Date(entries[i].created_at);
                         entryDate.setHours(0,0,0,0);
                         
                         const dayDiff = Math.round((currentDateCheck.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
                         if (dayDiff === 1) {
                             streak++;
                             currentDateCheck = entryDate;
                         } else if (dayDiff > 1) {
                             break;
                         }
                     }
                 }
            }
            setWritingStreak(streak);

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
        setAiReflection(null);
        try {
            const { error } = await supabase.from('journal_entries').insert({
                user_id: user.id,
                content: entry.trim(),
                sentiment,
            });
            if (error) throw error;
            showToast('Journal entry saved securely. 💙', 'success');
            
            // Generate AI reflection prompt
            setIsGeneratingReflection(true);
            const reflection = await generateLocalResponse([
                { role: 'system', content: `You are a compassionate journaling guide. The user just wrote a journal entry. Read it and offer ONE very short, gentle, open-ended reflection question to help them process it further. Don't give advice or summarize. Keep it under 2 sentences. Start with something encouraging like "Thank you for sharing." or "That sounds heavy."` },
                { role: 'user', content: entry.trim() }
            ]);
            setAiReflection(reflection);
            
            setEntry('');
            setSentiment('neutral');
            loadHistory();
        } catch {
            showToast('Failed to save entry. Please try again.', 'error');
        } finally {
            setIsSaving(false);
            setIsGeneratingReflection(false);
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
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-violet-500/20">
                        <BookOpen size={14} />
                        <span>Your Safe Space</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl md:text-4xl font-extrabold text-slate-100 leading-tight">
                          Your Private{' '}<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-rose-400">Journal</span>
                      </h1>
                      {writingStreak > 0 && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl mt-1">
                              <span className="text-lg">✍️</span>
                              <span className="text-sm font-bold text-emerald-400">{writingStreak} Day Streak</span>
                          </div>
                      )}
                    </div>
                    <p className="text-slate-400 mt-2 flex items-center gap-2 text-sm">
                        <Lock size={13} />
                        Everything you write here is yours alone. No judgment. Just honesty.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-sm text-slate-300 text-sm font-semibold hover:bg-white/10 transition-colors">
                    <Calendar size={15} />
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
            </div>

            {/* Editor */}
            <div className="relative rounded-3xl overflow-hidden bento-card border border-white/10">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xl z-0" pointer-events="none" />
                {/* Warm ambient glows */}
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
                <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
                
                {/* Mood-reactive background */}
                <div className="absolute inset-0 z-0 bg-gradient-to-br transition-opacity duration-1000 opacity-20"
                    style={{
                        backgroundImage: sentiment === 'positive' ? 'linear-gradient(to bottom right, #10b981, transparent)' :
                                         sentiment === 'negative' ? 'linear-gradient(to bottom right, #f43f5e, transparent)' :
                                         'linear-gradient(to bottom right, #8b5cf6, transparent)'
                    }} 
                />
                
                {/* Sentiment glow */}
                <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-10 transition-colors duration-1000 pointer-events-none z-0 ${style.glow}`} />

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
                            <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
                                <Sparkles size={11} className="text-violet-400" />
                                Not sure where to start? Tap one of these:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {quickPrompts.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setEntry(prompt + '\n')}
                                        style={{ transitionDelay: `${i * 60}ms` }}
                                        className="text-left px-3.5 py-2 rounded-xl border border-violet-500/20 bg-violet-500/10 hover:border-violet-400/50 hover:bg-violet-500/20 transition-all text-xs text-violet-300 font-medium hover:shadow-[0_0_10px_rgba(139,92,246,0.3)] hover:-translate-y-0.5"
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
                        className="w-full bg-transparent resize-none text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 px-2 py-4"
                        style={{ minHeight: '200px', fontFamily: 'Georgia, serif', fontSize: '1rem', lineHeight: '1.8' }}
                    />

                    {/* Word count */}
                    <p className="text-xs text-slate-500 text-right mb-4">
                        {entry.trim() ? `${entry.trim().split(/\s+/).filter(Boolean).length} words` : 'Start writing — this space is yours'}
                    </p>

                    <div className="border-t border-white/10 pt-4 flex flex-wrap justify-between items-center gap-3">
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            <Lock size={11} className="text-violet-400" />
                            Saved privately · Only you can read this
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleRecording}
                                className={`flex items-center justify-center w-12 h-12 rounded-xl border transition-all ${isRecording ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
                                title="Dictate Journal"
                            >
                                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={isSaving || !entry.trim()}
                                className="flex items-center space-x-2 px-6 py-3 text-white rounded-xl font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}
                            >
                                {isSaving ? <Clock size={17} className="animate-spin" /> : <Heart size={17} fill="rgba(255,255,255,0.4)" />}
                                <span>{isSaving ? 'Saving...' : 'Save My Thoughts'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes pulse-warm {
                        0%, 100% { transform: scale(1); opacity: 0.8; }
                        50% { transform: scale(1.4); opacity: 1; }
                    }
                `}</style>
            </div>

            {/* Active Reflection Prompt (AI) */}
            {(isGeneratingReflection || aiReflection) && (
                <div className="mt-8 relative z-10 animate-in slide-in-from-bottom-4 duration-500">
                     <div className="bento-card border-none rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 backdrop-blur-xl z-0 pointer-events-none" />
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-fuchsia-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-300">
                                    <Sparkles size={16} />
                                </div>
                                <h3 className="text-sm font-bold text-violet-200">AI Reflection</h3>
                            </div>
                            
                            {isGeneratingReflection ? (
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <div className="flex space-x-1">
                                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
                                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    Thinking about what you wrote...
                                </div>
                            ) : (
                                <div>
                                    <p className="text-slate-100 italic" style={{ fontFamily: 'Georgia, serif', fontSize: '1.05rem', lineHeight: '1.6' }}>"{aiReflection}"</p>
                                    <button 
                                        onClick={() => {
                                            setEntry("Thinking about that: ");
                                            setAiReflection(null);
                                        }}
                                        className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors border border-white/5"
                                    >
                                        Reply in Journal
                                    </button>
                                </div>
                            )}
                        </div>
                     </div>
                </div>
            )}

            {/* Reflection Prompts */}
            <div className="mt-8 relative z-10">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BookOpen size={13} className="text-violet-400" /> Deeper reflection — click to add
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PROMPTS.map((prompt, i) => (
                        <button
                            key={i}
                            onClick={() => setEntry(e => e + (e ? '\n\n' : '') + prompt + '\n')}
                            className="text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/50 hover:bg-white/10 transition-all text-sm text-slate-300 hover:text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] hover:-translate-y-0.5"
                        >
                            <span className="text-violet-400 mr-2">“</span>{prompt}<span className="text-violet-400 ml-1">”</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Past Entries */}
            <div className="mt-12 relative z-10">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Clock size={13} className="text-emerald-400" /> Your Story So Far
                </h3>

                {loadingHistory && (
                    <div className="text-center py-8 text-slate-500 text-sm">Loading your past reflections...</div>
                )}

                {!loadingHistory && pastEntries.length === 0 && (
                    <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10 border-dashed">
                        <div className="text-4xl mb-3">📖</div>
                        <p className="text-slate-300 text-sm font-semibold">Your story starts with the first entry.</p>
                        <p className="text-slate-500 text-xs mt-1">Every word you write here is a step forward. 💙</p>
                    </div>
                )}

                <div className="relative pl-6 md:pl-8 border-l border-white/10 space-y-8 mt-4 pb-8">
                    {pastEntries.map((e, index) => {
                        const s = sentimentStyle[e.sentiment || 'neutral'];
                        const isExpanded = expandedId === e.id;
                        
                        // Show date divider if it's the first entry or a different day from the previous
                        let showDateDivider = false;
                        if (index === 0) {
                            showDateDivider = true;
                        } else {
                            const prevDate = new Date(pastEntries[index - 1].created_at).toDateString();
                            const currDate = new Date(e.created_at).toDateString();
                            showDateDivider = prevDate !== currDate;
                        }

                        return (
                            <div key={e.id} className="relative">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[31px] md:-left-[39px] top-6 w-3 h-3 rounded-full bg-slate-900 border-2 border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.5)] z-10" />
                                
                                {showDateDivider && (
                                   <div className="mb-4">
                                       <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-slate-400 border border-white/5">
                                           {new Date(e.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                       </span>
                                   </div>
                                )}

                                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : e.id)}
                                        className="w-full flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-white/5 transition-colors text-left gap-3"
                                    >
                                        <div className="flex items-start md:items-center gap-3">
                                            <span className={`px-2 py-1 rounded-lg border text-[10px] font-bold shrink-0 ${s.badge}`}>{s.label}</span>
                                            <span className="text-sm text-slate-300 font-medium line-clamp-2 md:truncate md:max-w-md">
                                                {e.content}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 w-full md:w-auto">
                                            <span className="text-xs text-slate-500 font-medium bg-slate-900/50 px-2 py-1 rounded-md">
                                                {new Date(e.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <ChevronDown size={16} className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>
                                    
                                    {isExpanded && (
                                        <div className="animate-in slide-in-from-top-2 duration-200">
                                            <div className="px-5 pb-5 border-t border-white/10 bg-slate-900/40">
                                                <p className="text-slate-200 whitespace-pre-wrap leading-relaxed pt-5 pb-2" style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', lineHeight: '1.8' }}>{e.content}</p>
                                                <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                                                    <button
                                                        onClick={() => handleDelete(e.id)}
                                                        className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-400 font-semibold transition-colors"
                                                    >
                                                        <Trash2 size={13} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
