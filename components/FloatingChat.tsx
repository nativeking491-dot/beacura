import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Heart, Zap, Brain } from "lucide-react";
import { generateLocalResponse } from "../services/localChatService";
import { useUser } from "../context/UserContext";

interface ChatMessage {
    id: string;
    sender: "user" | "ai";
    text: string;
    timestamp: Date;
}

// Quick prompt chips
const QUICK_PROMPTS = [
    { label: "I'm struggling", emoji: "💙" },
    { label: "Daily check-in", emoji: "☀️" },
    { label: "Need motivation", emoji: "⚡" },
];

export const FloatingChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [showPrompts, setShowPrompts] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { user } = useUser();

    // Initial welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setTimeout(() => {
                setMessages([{
                    id: "1",
                    sender: "ai",
                    text: `Hey ${user?.name || "there"} 💙 I'm your recovery companion. Every moment of strength counts — ${user?.streak ? `you're on a ${user.streak}-day streak!` : "your journey starts now."}. How are you feeling right now?`,
                    timestamp: new Date(),
                }]);
            }, 400);
        }
        if (isOpen) {
            setHasNewMessage(false);
            setTimeout(() => inputRef.current?.focus(), 500);
        }
    }, [isOpen, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSend = async (text?: string) => {
        const userText = (text || input).trim();
        if (!userText) return;
        setInput("");
        setShowPrompts(false);

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: "user",
            text: userText,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            const aiText = await generateLocalResponse(
                userText,
                user?.streak || 0,
                user?.name || "Friend",
                undefined,
                undefined,
                (() => {
                    try {
                        const data = localStorage.getItem(`daily_log_${new Date().toDateString()}`);
                        return data ? JSON.parse(data) : undefined;
                    } catch { return undefined; }
                })()
            );

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: "ai",
                text: aiText,
                timestamp: new Date(),
            }]);

            if (!isOpen) setHasNewMessage(true);
        } catch (err) {
            console.error("Chat error:", err);
        } finally {
            setIsTyping(false);
        }
    };

    const formatTime = (d: Date) =>
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* ─── Chat Panel ─── */}
            <div
                className={`mb-4 w-[340px] md:w-[380px] flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isOpen
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-90 translate-y-4 pointer-events-none max-h-0"
                    }`}
                style={{
                    height: isOpen ? '520px' : '0px',
                    borderRadius: '24px',
                    boxShadow: '0 32px 64px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.08)',
                }}
            >
                {/* Dark glass background */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(145deg, rgba(15,5,35,0.97) 0%, rgba(20,12,50,0.97) 100%)',
                        backdropFilter: 'blur(40px)',
                    }} />
                    {/* Aurora accents */}
                    <div style={{ position: 'absolute', top: '-40px', right: '-20px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(139,92,246,0.25)', filter: 'blur(50px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '40px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(59,130,246,0.15)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                </div>

                <div className="relative z-10 flex flex-col h-full">

                    {/* ─── Header ─── */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.2))', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                        className="p-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            {/* Animated avatar */}
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-violet-500 blur-md opacity-60 animate-glow-pulse" />
                                <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                    <Brain size={17} className="text-white" />
                                </div>
                                {/* Online dot */}
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 animate-glow-pulse" />
                            </div>
                            <div>
                                <p style={{ fontFamily: 'Sora, sans-serif' }} className="text-white font-bold text-sm leading-none">Recovery Companion</p>
                                <p className="text-violet-300 text-[11px] mt-0.5 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                    Always here for you
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* ─── Messages ─── */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: 'none' }}>
                        {messages.map((msg, idx) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in`}
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                {msg.sender === "ai" && (
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mr-2 flex-shrink-0 mt-auto mb-0.5 shadow-md">
                                        <Sparkles size={10} className="text-white" />
                                    </div>
                                )}
                                <div className="max-w-[78%] space-y-0.5">
                                    <div
                                        className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${msg.sender === "user"
                                                ? "rounded-2xl rounded-br-md text-white"
                                                : "rounded-2xl rounded-bl-md text-slate-100"
                                            }`}
                                        style={msg.sender === "user" ? {
                                            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                            boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
                                        } : {
                                            background: 'rgba(255,255,255,0.07)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            backdropFilter: 'blur(10px)',
                                        }}
                                    >
                                        {msg.text}
                                    </div>
                                    <p className={`text-[10px] text-white/25 px-1 ${msg.sender === "user" ? "text-right" : ""}`}>
                                        {formatTime(msg.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex items-end gap-2 animate-in">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                    <Sparkles size={10} className="text-white" />
                                </div>
                                <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div className="flex space-x-1 items-center h-3">
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                                                style={{ animationDelay: `${i * 150}ms` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick prompts */}
                        {showPrompts && messages.length <= 1 && !isTyping && (
                            <div className="flex flex-wrap gap-2 justify-center pt-2 animate-in">
                                {QUICK_PROMPTS.map(p => (
                                    <button
                                        key={p.label}
                                        onClick={() => handleSend(p.label)}
                                        className="px-3 py-1.5 rounded-full text-xs font-semibold text-white/70 hover:text-white transition-all"
                                        style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)' }}
                                    >
                                        {p.emoji} {p.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* ─── Input Bar ─── */}
                    <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="relative flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={e => e.key === "Enter" && handleSend()}
                                placeholder="Share how you're feeling..."
                                className="flex-1 px-4 py-2.5 rounded-2xl text-[13px] text-white placeholder-white/30 focus:outline-none transition-all"
                                style={{
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(139,92,246,0.25)',
                                }}
                                onFocus={e => (e.target.style.borderColor = 'rgba(139,92,246,0.65)')}
                                onBlur={e => (e.target.style.borderColor = 'rgba(139,92,246,0.25)')}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isTyping}
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 disabled:scale-95"
                                style={{
                                    background: input.trim() ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'rgba(255,255,255,0.08)',
                                    boxShadow: input.trim() ? '0 4px 16px rgba(124,58,237,0.45)' : 'none',
                                }}
                            >
                                <Send size={15} className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── FAB Button ─── */}
            <div className="relative">
                {/* Pulsing ring when closed */}
                {!isOpen && (
                    <>
                        <div className="absolute inset-0 rounded-full bg-violet-500 opacity-30 animate-ping" style={{ animationDuration: '2.5s' }} />
                        <div className="absolute inset-0 rounded-full bg-violet-400 opacity-20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.4s' }} />
                    </>
                )}

                {/* New message badge */}
                {hasNewMessage && !isOpen && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white animate-bounce z-10" />
                )}

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                    style={{
                        background: isOpen
                            ? 'linear-gradient(135deg, #374151, #1f2937)'
                            : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        boxShadow: isOpen
                            ? '0 8px 32px rgba(0,0,0,0.35)'
                            : '0 8px 32px rgba(124,58,237,0.55), 0 0 0 1px rgba(255,255,255,0.1)',
                    }}
                >
                    <div className={`transition-all duration-300 ${isOpen ? "rotate-0" : "rotate-0"}`}>
                        {isOpen
                            ? <X size={22} className="text-white" />
                            : <MessageCircle size={24} className="text-white" />
                        }
                    </div>
                </button>
            </div>
        </div>
    );
};
