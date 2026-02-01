
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, User, Bot, Loader2, Info } from 'lucide-react';
import { generateChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hey there! 👋 I'm Recovery, your support buddy. Having a tough moment or just want to chat? I'm here for you.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const aiText = await generateChatResponse(input);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: aiText || "I'm sorry, I couldn't process that. Stay strong.",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-teal-600 p-4 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold">Recovery AI Assistant</h2>
            <p className="text-teal-100 text-xs flex items-center">
              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
              Always here for you
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-lg">
          <Info size={20} />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white
                ${msg.sender === 'user' ? 'bg-indigo-500 ml-2' : 'bg-teal-500 mr-2'}
              `}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`
                p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed
                ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}
              `}>
                {msg.text}
                <div className={`text-[10px] mt-2 ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-2">
              <Loader2 className="animate-spin text-teal-600" size={16} />
              <span className="text-slate-500 text-sm">Recovery is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-2 bg-slate-100 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-teal-500 transition-all">
          <button className="p-2 text-slate-400 hover:text-teal-600 transition-colors">
            <Mic size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your craving or ask for motivation..."
            className="flex-1 bg-transparent border-none outline-none text-slate-700 px-2 py-2"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-2 rounded-xl transition-all ${!input.trim() || isLoading ? 'text-slate-300' : 'text-teal-600 bg-teal-50'
              }`}
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          Recovery AI can assist but is not a substitute for professional medical help.
        </p>
      </div>
    </div>
  );
};

export default Chatbot;
