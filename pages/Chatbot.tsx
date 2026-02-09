import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  Loader2,
  Info,
  Download,
  Plus,
  Sparkles,
  Heart,
  Shield,
  Zap,
} from "lucide-react";
// import { generateChatResponse } from "../services/geminiService";
import { generateLocalResponse } from "../services/localChatService";
import {
  detectCrisisLanguage,
  logCrisisEvent,
} from "../services/crisisDetection";
import { CrisisModal } from "../components/CrisisModal";
import { ChatMessage } from "../types";
import { useUser } from "../context/UserContext";
import { supabase, chatService } from "../services/supabaseClient";

// Quick action prompts for common recovery scenarios
const QUICK_PROMPTS = [
  { icon: "🆘", text: "I'm having a craving right now", color: "rose" },
  { icon: "💪", text: "I need motivation to stay clean", color: "amber" },
  { icon: "🎯", text: "How do I handle triggers?", color: "indigo" },
  { icon: "🧠", text: "Tell me about withdrawal symptoms", color: "purple" },
  { icon: "❤️", text: "I feel like relapsing", color: "red" },
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, [user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const loadChatHistory = async () => {
    if (!user?.id) return;

    try {
      setIsLoadingHistory(true);

      // Get or create latest session
      let session = await chatService.getLatestSession(user.id);

      if (!session) {
        // Create first session
        const sessionId = await chatService.createNewChatSession(user.id);
        setCurrentSessionId(sessionId);

        // Add welcome message
        const welcomeMsg: ChatMessage = {
          id: "welcome",
          sender: "ai",
          text: getPersonalizedGreeting(),
          timestamp: new Date(),
          session_id: sessionId,
        };
        setMessages([welcomeMsg]);
      } else {
        setCurrentSessionId(session.id);

        // Load messages from this session
        const history = await chatService.getChatHistory(user.id, session.id);

        const loadedMessages: ChatMessage[] = history.map((msg: any) => ({
          id: msg.id,
          sender: msg.sender,
          text: msg.message,
          timestamp: new Date(msg.created_at),
          session_id: msg.session_id,
        }));

        if (loadedMessages.length === 0) {
          // Add welcome message if session is empty
          const welcomeMsg: ChatMessage = {
            id: "welcome",
            sender: "ai",
            text: getPersonalizedGreeting(),
            timestamp: new Date(),
            session_id: session.id,
          };
          setMessages([welcomeMsg]);
        } else {
          setMessages(loadedMessages);
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      // Fallback: show welcome message
      const welcomeMsg: ChatMessage = {
        id: "welcome",
        sender: "ai",
        text: getPersonalizedGreeting(),
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    const timeGreeting =
      hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";

    const greetings = [
      `${timeGreeting}! 👋 I'm Recovery, your support companion. How are you feeling today?`,
      `${timeGreeting}! 💙 I'm here to support you on your journey. What's on your mind?`,
      `Hey there! ${timeGreeting}. 🌟 Ready to talk? I'm all ears.`,
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;

    console.log("🔍 handleSend called with:", {
      textToSend,
      hasText: !!textToSend.trim(),
      isLoading,
      userId: user?.id,
      currentSessionId,
    });

    if (!textToSend.trim()) {
      console.warn("❌ No text to send");
      return;
    }

    if (isLoading) {
      console.warn("❌ Already loading");
      return;
    }

    if (!user?.id) {
      console.error("❌ No user ID - user not logged in");
      alert("Please log in to use the chatbot");
      return;
    }

    if (!currentSessionId) {
      console.error("❌ No session ID - session not initialized");
      alert("Chat session not ready. Please refresh the page.");
      return;
    }

    console.log("✅ All checks passed, sending message...");

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
      session_id: currentSessionId,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Save user message to database
      await chatService.saveChatMessage(
        user.id,
        "user",
        textToSend,
        currentSessionId
      );

      // Check for crisis language
      const crisisSeverity = detectCrisisLanguage(textToSend);
      if (crisisSeverity) {
        setShowCrisisModal(true);
        await logCrisisEvent(supabase, user.id, textToSend, crisisSeverity);
      }

      // Get AI response locally
      const aiText = await generateLocalResponse(
        textToSend,
        user.streak || 0,
        user.name || "Friend",
        undefined,
        undefined,
        (() => {
          try {
            const data = localStorage.getItem(`daily_log_${new Date().toDateString()}`);
            return data ? JSON.parse(data) : undefined;
          } catch { return undefined; }
        })()
      );

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiText || "I'm here for you. Let's keep talking.",
        timestamp: new Date(),
        session_id: currentSessionId,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Save AI message to database
      await chatService.saveChatMessage(
        user.id,
        "ai",
        aiMsg.text,
        currentSessionId
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // Show error message to user
      const errorMsg: ChatMessage = {
        id: (Date.now() + 2).toString(),
        sender: "ai",
        text: "I'm having trouble connecting right now. Your message is important—please try again in a moment.",
        timestamp: new Date(),
        session_id: currentSessionId,
      };
      setMessages((prev) => [...prev, errorMsg]);
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

      const welcomeMsg: ChatMessage = {
        id: "welcome-new",
        sender: "ai",
        text: "Starting a fresh conversation. 🌱 What would you like to talk about?",
        timestamp: new Date(),
        session_id: newSessionId,
      };

      setMessages([welcomeMsg]);
    } catch (error) {
      console.error("Error creating new session:", error);
    }
  };

  const handleExportChat = () => {
    const chatText = messages
      .map((msg) => {
        const time = msg.timestamp.toLocaleString();
        const sender = msg.sender === "user" ? "You" : "Recovery AI";
        return `[${time}] ${sender}: ${msg.text}`;
      })
      .join("\n\n");

    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recovery-chat-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoadingHistory) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-slate-50 rounded-3xl">
        <div className="text-center">
          <Loader2 className="animate-spin text-amber-500 mx-auto mb-4" size={48} />
          <p className="text-slate-600 font-medium">Loading your conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-4 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-lg">Recovery AI Companion</h2>
            <p className="text-amber-100 text-xs flex items-center">
              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
              Always here for you • {user?.streak || 0} day streak
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleNewSession}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Start new conversation"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={handleExportChat}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Export chat history"
          >
            <Download size={20} />
          </button>
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Chat information"
          >
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* Quick Action Prompts */}
      {messages.length <= 1 && (
        <div className="p-4 bg-gradient-to-b from-slate-50 to-white border-b">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Quick Actions
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(prompt.text)}
                className={`px-3 py-2 bg-${prompt.color}-50 text-${prompt.color}-700 border border-${prompt.color}-200 rounded-xl text-xs font-medium hover:bg-${prompt.color}-100 transition-all flex items-center space-x-1.5`}
              >
                <span>{prompt.icon}</span>
                <span>{prompt.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50"
      >
        {messages.map((msg, idx) => {
          const showTimestamp =
            idx === 0 ||
            msg.timestamp.getTime() - messages[idx - 1].timestamp.getTime() >
            300000; // 5 minutes

          return (
            <div key={msg.id}>
              {showTimestamp && (
                <div className="text-center my-4">
                  <span className="text-xs text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              <div
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[85%] md:max-w-[70%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${msg.sender === "user" ? "bg-gradient-to-br from-indigo-500 to-purple-600 ml-3" : "bg-gradient-to-br from-amber-500 to-orange-500 mr-3"}`}
                  >
                    {msg.sender === "user" ? (
                      <span className="text-sm font-bold">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    ) : (
                      <Bot size={20} />
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${msg.sender === "user" ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none border border-slate-100"}`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-[70%]">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
                <Bot size={20} />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex items-center space-x-3">
                <Loader2 className="animate-spin text-amber-500" size={18} />
                <span className="text-slate-500 text-sm font-medium">
                  Recovery is thinking...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-end space-x-2">
          <div className="flex-1 bg-white rounded-2xl border-2 border-slate-300 p-2 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all shadow-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Share what's on your mind... (Press Enter to send)"
              className="w-full bg-white border-none outline-none text-slate-900 placeholder-slate-400 px-3 py-2 resize-none max-h-32 font-medium"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`p-3.5 rounded-2xl transition-all shadow-lg ${!input.trim() || isLoading ? "bg-slate-200 text-slate-400" : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-xl hover:scale-105"}`}
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          Recovery AI provides support but is not a substitute for professional
          medical help.
        </p>
      </div>

      {/* Crisis Modal */}
      {showCrisisModal && (
        <CrisisModal onDismiss={() => setShowCrisisModal(false)} />
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                About Recovery AI
              </h3>
            </div>

            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start space-x-3">
                <Heart className="text-rose-500 flex-shrink-0 mt-0.5" size={18} />
                <p>
                  <strong>Empathetic Support:</strong> I'm trained to understand
                  addiction recovery and provide compassionate, judgment-free
                  guidance.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="text-indigo-500 flex-shrink-0 mt-0.5" size={18} />
                <p>
                  <strong>Crisis Detection:</strong> I monitor for signs of
                  distress and can connect you with emergency resources
                  immediately.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Zap className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
                <p>
                  <strong>Context Aware:</strong> I remember our conversation to
                  provide personalized support based on your journey.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong>Important:</strong> While I'm here to support you, I'm
                not a replacement for professional medical care, therapy, or
                emergency services. If you're in crisis, please call 988 or 911.
              </p>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-2xl font-bold hover:shadow-lg transition-all"
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
