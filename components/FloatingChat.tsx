import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Play, Sparkles } from "lucide-react";
import { generateLocalResponse } from "../services/localChatService";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";

interface ChatMessage {
    id: string;
    sender: "user" | "ai";
    text: string;
}

export const FloatingChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useUser();
    const { theme } = useTheme();

    // Initial welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: "1",
                    sender: "ai",
                    text: `Hi ${user?.name || "there"}! I'm your recovery companion. How are you feeling right now?`,
                },
            ]);
        }
    }, [isOpen, user]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userText = input;
        setInput("");

        // Add user message
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: "user",
            text: userText,
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsTyping(true);

        try {
            // Get AI response
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

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: "ai",
                text: aiText,
            };

            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div
                    className={`mb-4 w-80 md:w-96 h-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-10 fade-in
            ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}
                >
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-violet-600 to-indigo-600 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Recovery Assistant</h3>
                                <p className="text-violet-200 text-xs">Always here for you</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-opacity-50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === "user"
                                        ? "bg-violet-600 text-white rounded-br-none"
                                        : `${theme === 'dark' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'} rounded-bl-none`
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className={`px-4 py-2 rounded-2xl rounded-bl-none ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-0"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className={`p-3 border-t ${theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Type a message..."
                                className={`w-full pr-10 pl-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all
                  ${theme === 'dark'
                                        ? 'bg-slate-800 text-white placeholder-slate-400 border-slate-700'
                                        : 'bg-slate-100 text-slate-900 placeholder-slate-500 border-transparent'}`}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="absolute right-1 p-1.5 bg-violet-600 text-white rounded-full hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group
          ${isOpen
                        ? 'bg-slate-800 text-white'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'}`}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <MessageCircle className="w-7 h-7 group-hover:animate-pulse" />
                )}
            </button>
        </div>
    );
};
