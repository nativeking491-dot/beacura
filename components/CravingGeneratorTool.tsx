import React, { useState } from "react";
import { Zap, Waves, Activity, ArrowRight, CheckCircle2 } from "lucide-react";
import { generateLocalResponse } from "../services/localChatService";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";

interface ChatMessage {
    id: string;
    sender: "user" | "ai";
    text: string;
}

export const CravingGeneratorTool = () => {
    const [isActive, setIsActive] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const { user } = useUser();
    const { theme } = useTheme();

    const startCravingFlow = async () => {
        setIsActive(true);
        setMessages([]); // Clear previous
        setIsTyping(true);

        // Initial trigger for the craving flow in localChatService
        // "I have a craving" triggers the Action: start_craving_flow
        try {
            const aiText = await generateLocalResponse(
                "I have a craving",
                user?.streak || 0,
                user?.name || "Friend"
            );

            setMessages([{
                id: "init",
                sender: "ai",
                text: aiText
            }]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userText = input;
        setInput("");

        setMessages(prev => [...prev, { id: Date.now().toString(), sender: "user", text: userText }]);
        setIsTyping(true);

        try {
            const aiText = await generateLocalResponse(
                userText,
                user?.streak || 0,
                user?.name || "Friend"
            );

            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "ai", text: aiText }]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isActive) {
        return (
            <div className={`p-6 rounded-3xl overflow-hidden relative group cursor-pointer transition-all duration-300 hover:shadow-xl
        ${theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-slate-100 shadow-sm'}`}
                onClick={startCravingFlow}
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Waves className="w-32 h-32 text-amber-500" />
                </div>

                <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Zap className="w-6 h-6 text-amber-600" />
                    </div>

                    <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        AI Craving Surf
                    </h3>

                    <p className={`mb-6 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Feeling an urge? Use this AI tool to "surf" the craving wave until it passes using scientifically proven techniques.
                    </p>

                    <button className="flex items-center gap-2 text-amber-600 font-bold text-sm group-hover:gap-3 transition-all">
                        Start Urge Surfing <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-[500px] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300
      ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>

            {/* Header */}
            <div className="bg-amber-500 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <Waves className="w-5 h-5" />
                    <span className="font-bold">Urge Surfing Session</span>
                </div>
                <button
                    onClick={() => setIsActive(false)}
                    className="hover:bg-amber-600 p-1 rounded-full transition-colors"
                >
                    <span className="text-xs font-bold px-2">End Session</span>
                </button>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm
              ${msg.sender === 'user'
                                ? 'bg-amber-500 text-white rounded-br-none'
                                : `${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-slate-800 shadow-sm'} rounded-bl-none`}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className={`px-4 py-2 rounded-2xl rounded-bl-none ${theme === 'dark' ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-0"></div>
                                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-150"></div>
                                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-300"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-white'}`}>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your response..."
                        className={`flex-1 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500
              ${theme === 'dark' ? 'bg-slate-900 text-white border-slate-700' : 'bg-slate-100 text-slate-900 border-transparent'}`}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="bg-amber-500 text-white p-2 rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-colors"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
