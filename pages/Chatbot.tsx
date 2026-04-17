import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Send,
  Bot,
  Info,
  Download,
  Plus,
  Sparkles,
  Heart,
  Shield,
  Zap,
  Flame,
  Brain,
  Target,
  MessageCircle,
} from "lucide-react";
import { generateLocalResponse } from "../services/localChatService";
import { generateChatResponse, AIContext } from "../services/geminiService";
import {
  detectCrisisLanguage,
  logCrisisEvent,
} from "../services/crisisDetection";
import { CrisisModal } from "../components/CrisisModal";
import { TypingDots } from "../components/TypingDots";
import { ChatMessage } from "../types";
import { useUser } from "../context/UserContext";
import { supabase, chatService } from "../services/supabaseClient";
import { useToast } from "../context/ToastContext";

// Distress keywords for sentiment detection
const DISTRESS_WORDS = ["relapse", "craving", "want to use", "can't do this", "hopeless", "give up", "die", "hurt myself", "failure", "ashamed"];
const POSITIVE_WORDS = ["better", "strong", "proud", "grateful", "hope", "day", "clean", "progress", "good", "great", "happy"];

function computeSentiment(messages: ChatMessage[]): "positive" | "neutral" | "distress" {
  const recent = messages.slice(-5).map(m => m.text.toLowerCase()).join(" ");
  const distressCount = DISTRESS_WORDS.filter(w => recent.includes(w)).length;
  const positiveCount = POSITIVE_WORDS.filter(w => recent.includes(w)).length;
  if (distressCount >= 2) return "distress";
  if (positiveCount > distressCount) return "positive";
  return "neutral";
}

// Redesigned quick prompts
const QUICK_PROMPTS = [
  { icon: Flame, text: "I'm having a craving right now", gradient: "from-rose-500 to-red-600", label: "Craving SOS" },
  { icon: Sparkles, text: "I need motivation to stay clean", gradient: "from-amber-400 to-orange-500", label: "Motivate Me" },
  { icon: Target, text: "How do I handle triggers?", gradient: "from-indigo-500 to-violet-600", label: "Coping Skills" },
  { icon: Brain, text: "Tell me about withdrawal symptoms", gradient: "from-purple-500 to-violet-600", label: "Withdrawal Info" },
  { icon: Heart, text: "I feel like relapsing", gradient: "from-rose-600 to-pink-600", label: "I'm Struggling" },
  { icon: MessageCircle, text: "How are you different from a therapist?", gradient: "from-teal-500 to-emerald-600", label: "About Me" },
];

const Chatbot: React.FC = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  // Emoji reactions: { [msgId]: { [emoji]: count } }
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();

  const sentiment = useMemo(() => computeSentiment(messages), [messages]);

  const sentimentConfig = {
    positive: { bg: "from-emerald-400 to-teal-500", glow: "rgba(16,185,129,0.3)", label: "Feeling positive" },
    neutral: { bg: "from-amber-400 to-orange-400", glow: "rgba(245,158,11,0.25)", label: "Steady" },
    distress: { bg: "from-rose-500 to-red-600", glow: "rgba(244,63,94,0.4)", label: "I hear you — I'm here" },
  }[sentiment];

  useEffect(() => {
    loadChatHistory();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const loadChatHistory = async () => {
    if (!user?.id) return;
    try {
      setIsLoadingHistory(true);
      let session = await chatService.getLatestSession(user.id);
      if (!session) {
        const sessionId = await chatService.createNewChatSession(user.id);
        setCurrentSessionId(sessionId);
        setMessages([{ id: "welcome", sender: "ai", text: getPersonalizedGreeting(), timestamp: new Date(), session_id: sessionId }]);
      } else {
        setCurrentSessionId(session.id);
        const history = await chatService.getChatHistory(user.id, session.id);
        const loadedMessages: ChatMessage[] = history.map((msg: any) => ({
          id: msg.id, sender: msg.sender, text: msg.message,
          timestamp: new Date(msg.created_at), session_id: msg.session_id,
        }));
        if (loadedMessages.length === 0) {
          setMessages([{ id: "welcome", sender: "ai", text: getPersonalizedGreeting(), timestamp: new Date(), session_id: session.id }]);
        } else {
          setMessages(loadedMessages);
        }
      }
    } catch {
      setMessages([{ id: "welcome", sender: "ai", text: getPersonalizedGreeting(), timestamp: new Date() }]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const greetings = [
      `${timeGreeting}! 👋 I'm Recovery, your support companion. How are you feeling today?`,
      `${timeGreeting}! 💙 I'm here to support you on your journey. What's on your mind?`,
      `Hey there! ${timeGreeting}. 🌟 Ready to talk? I'm all ears.`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading || !user?.id || !currentSessionId) {
      if (!user?.id) showToast("Please log in to use the chatbot", "warning");
      if (!currentSessionId) showToast("Chat session not ready. Please refresh.", "warning");
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(), sender: "user", text: textToSend,
      timestamp: new Date(), session_id: currentSessionId,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      await chatService.saveChatMessage(user.id, "user", textToSend, currentSessionId);
      const crisisSeverity = detectCrisisLanguage(textToSend);
      if (crisisSeverity) {
        setShowCrisisModal(true);
        await logCrisisEvent(supabase, user.id, textToSend, crisisSeverity);
      }

      let aiText = "";
      const lowerInput = textToSend.toLowerCase();
      
      let sessionType: AIContext['session_type'] = 'EXPLORATION';
      if (crisisSeverity) {
        sessionType = 'CRISIS';
      } else if (lowerInput.match(/(craving|urge|relapse|struggling|want to use)/)) {
        sessionType = 'CRAVING';
      } else if (lowerInput.match(/(celebrat|proud|milestone|clean|good day)/)) {
        sessionType = 'CELEBRATION';
      } else if (lowerInput.match(/(today|check|feeling|mood)/)) {
        sessionType = 'CHECKIN';
      }

      const aiContext: AIContext = {
        name: user.name,
        current_streak: user.streak,
        language: "English",
        session_type: sessionType,
        time: new Date().toLocaleTimeString()
      };

      try {
        // Attempt primary Gemini AI
        aiText = await generateChatResponse(textToSend, aiContext, messages);
      } catch (geminiError) {
        console.warn("Falling back to local AI due to Gemini error", geminiError);
        // Fallback to local offline rule-based service
        aiText = await generateLocalResponse(
          textToSend, user.streak || 0, user.name || "Friend", undefined, undefined,
          (() => { try { const d = localStorage.getItem(`daily_log_${new Date().toDateString()}`); return d ? JSON.parse(d) : undefined; } catch { return undefined; } })()
        );
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(), sender: "ai",
        text: aiText || "I'm here for you. Let's keep talking.",
        timestamp: new Date(), session_id: currentSessionId,
      };
      setMessages(prev => [...prev, aiMsg]);
      await chatService.saveChatMessage(user.id, "ai", aiMsg.text, currentSessionId);
    } catch {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 2).toString(), sender: "ai",
        text: "I'm having trouble connecting right now. Your message is important—please try again in a moment.",
        timestamp: new Date(), session_id: currentSessionId,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
    handleSend(promptText);
  };

  const handleNewSession = async () => {
    if (!user?.id) return;
    try {
      const newSessionId = await chatService.createNewChatSession(user.id);
      setCurrentSessionId(newSessionId);
      setMessages([{ id: "welcome-new", sender: "ai", text: "Starting a fresh conversation. 🌱 What would you like to talk about?", timestamp: new Date(), session_id: newSessionId }]);
    } catch { }
  };

  const handleExportChat = () => {
    const chatText = messages.map(msg => {
      const time = msg.timestamp.toLocaleString();
      const sender = msg.sender === "user" ? "You" : "Recovery AI";
      return `[${time}] ${sender}: ${msg.text}`;
    }).join("\n\n");
    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `recovery-chat-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const toggleReaction = (msgId: string, emoji: string) => {
    setReactions(prev => {
      const msgReacts = prev[msgId] || {};
      const current = msgReacts[emoji] || 0;
      return { ...prev, [msgId]: { ...msgReacts, [emoji]: current > 0 ? 0 : 1 } };
    });
  };

  if (isLoadingHistory) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-transparent rounded-3xl">
        <div className="text-center bento-card p-8 rounded-2xl">
          <div className="flex items-center gap-2 justify-center mb-4">
            <TypingDots color="#8b5cf6" />
          </div>
          <p className="text-slate-400 font-medium text-sm">Loading your conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bento-card rounded-3xl overflow-hidden border-none relative">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl pointer-events-none z-0" />
      {/* Header */}
      <div className="relative z-10 bg-white/5 border-b border-white/10 p-4 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Gradient mesh AI avatar */}
          <div className="relative w-11 h-11 flex-shrink-0">
            <div className="absolute inset-0 rounded-xl blur-md opacity-60 animate-glow-pulse"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6, #10b981)" }} />
            <div className="relative w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden shadow-lg border border-white/20"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6, #10b981)", backgroundSize: "300% 300%", animation: "aurora-shift 4s ease infinite" }}>
              <Bot size={22} className="text-white drop-shadow-sm" />
            </div>
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-100">Recovery AI Companion</h2>
            <p className="text-slate-400 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Always here for you · {user?.streak || 0} day streak
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={handleNewSession} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Start new conversation"><Plus size={20} /></button>
          <button onClick={handleExportChat} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Export chat history"><Download size={20} /></button>
          <button onClick={() => setShowInfoModal(true)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Chat information"><Info size={20} /></button>
        </div>
      </div>

      {/* Sentiment bar */}
      <div
        className="h-1 w-full sentiment-bar"
        style={{
          background: `linear-gradient(90deg, ${sentimentConfig.bg.replace("from-", "").replace(" to-", ", ")} )`,
          boxShadow: `0 0 12px ${sentimentConfig.glow}`,
        }}
        title={sentimentConfig.label}
      />

      {/* Quick Action Prompts — shown only early in conversation */}
      {messages.length <= 1 && (
        <div className="relative z-10 p-4 bg-white/5 border-b border-white/10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {QUICK_PROMPTS.map((prompt, idx) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(prompt.text)}
                  className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-95 hover:bg-white/10 group bg-white/5 border border-white/5"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                       style={{ background: `linear-gradient(135deg, ${prompt.gradient.replace("from-", "").replace(" to-", ", ")})` }}>
                    <Icon size={15} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white leading-tight">{prompt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg, idx) => {
          const showTimestamp = idx === 0 ||
            msg.timestamp.getTime() - messages[idx - 1].timestamp.getTime() > 300000;
          const isUser = msg.sender === "user";
          const msgReacts = reactions[msg.id] || {};

          return (
            <div key={msg.id}>
              {showTimestamp && (
                <div className="text-center my-4">
                  <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                 </div>
              )}
              <div className={`flex ${isUser ? "justify-end" : "justify-start"} ${isUser ? "msg-in-right" : "msg-in-left"}`}>
                <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm border border-white/20 ${isUser ? "ml-3" : "mr-3"}`}
                    style={isUser
                      ? { background: "linear-gradient(135deg, #10b981, #0d9488)" }
                      : { background: "linear-gradient(135deg, #8b5cf6, #3b82f6, #10b981)", backgroundSize: "300% 300%", animation: "aurora-shift 4s ease infinite" }
                    }>
                    {isUser
                      ? <span className="text-sm font-bold">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
                      : <Bot size={20} />
                    }
                  </div>

                  <div className="flex flex-col">
                    <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${isUser
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-none shadow-[0_4px_16px_rgba(16,185,129,0.2)]"
                      : "bg-white/10 backdrop-blur-md text-slate-100 rounded-tl-none border border-white/10"
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>

                    {/* Emoji reactions (AI messages only) */}
                    {!isUser && (
                      <div className="flex gap-1.5 mt-1.5 ml-1">
                        {["👍", "❤️", "🤔"].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(msg.id, emoji)}
                            className={`px-2 py-0.5 rounded-full text-xs border transition-all ${msgReacts[emoji]
                              ? "bg-amber-50 border-amber-200 scale-110"
                              : "bg-white border-slate-100 hover:border-amber-200 hover:bg-amber-50"
                            }`}
                          >
                            {emoji}{msgReacts[emoji] ? ` ${msgReacts[emoji]}` : ""}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start msg-in-left">
            <div className="flex items-start space-x-3 max-w-[70%]">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm border border-white/20"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6, #10b981)", backgroundSize: "300% 300%", animation: "aurora-shift 4s ease infinite" }}>
                <Bot size={20} />
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl rounded-tl-none shadow-sm border border-white/10 flex items-center space-x-3">
                <TypingDots color="#8b5cf6" />
                <span className="text-slate-300 text-sm font-medium">Recovery is thinking…</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative z-10 p-4 bg-white/5 border-t border-white/10">
        <div className="flex items-end space-x-2">
          <div className="flex-1 bg-slate-900/50 rounded-2xl border border-white/10 p-2 focus-within:ring-2 focus-within:ring-violet-500 transition-all shadow-sm">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder="Share what's on your mind… (Press Enter to send)"
              className="w-full bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 px-3 py-2 resize-none max-h-32 font-medium"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`p-3.5 rounded-2xl transition-all shadow-lg ${!input.trim() || isLoading
              ? "bg-white/10 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:scale-105"
            }`}
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-500 mt-2">
          Recovery AI provides support but is not a substitute for professional medical help.
        </p>
      </div>

      {showCrisisModal && <CrisisModal onDismiss={() => setShowCrisisModal(false)} />}

      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bento-card bento-glow-violet bg-slate-900/90 rounded-3xl shadow-2xl max-w-md w-full p-8 elastic-pop border border-white/10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}>
                <Sparkles className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">About Recovery AI</h3>
            </div>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start space-x-3">
                <Heart className="text-rose-400 flex-shrink-0 mt-0.5" size={18} />
                <p><strong>Empathetic Support:</strong> Trained to understand addiction recovery and provide compassionate, judgment-free guidance.</p>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="text-indigo-400 flex-shrink-0 mt-0.5" size={18} />
                <p><strong>Crisis Detection:</strong> Monitors for signs of distress and can connect you with emergency resources immediately.</p>
              </div>
              <div className="flex items-start space-x-3">
                <Zap className="text-violet-400 flex-shrink-0 mt-0.5" size={18} />
                <p><strong>Context Aware:</strong> Remembers your conversation to provide personalized support based on your journey.</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
              <p className="text-xs text-rose-200 leading-relaxed">
                <strong>Important:</strong> While I'm here to support you, I'm not a replacement for professional medical care, therapy, or emergency services. If you're in crisis, please call 988 or 911.
              </p>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full mt-6 bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-3 rounded-2xl font-bold hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
