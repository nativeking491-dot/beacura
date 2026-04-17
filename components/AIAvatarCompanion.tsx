import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Volume2, VolumeX, Sparkles, BrainCircuit, X } from 'lucide-react';
import { useUser } from '../context/UserContext';

const PATH_MESSAGES: Record<string, (name: string) => string> = {
    '/dashboard': (name) => `Good to see you, ${name}. You showed up today. That already matters.`,
    '/journal': () => "This space is yours completely. No judgment, just honesty.",
    '/chat': () => "I'm here. Whatever you're carrying right now, you don't have to carry it alone.",
    '/counseling': () => "Real human support is powerful. You're making a strong choice.",
    '/health': () => "Your body is working to heal. Let's give it what it needs.",
    '/exercise': () => "Movement heals. Even five minutes counts today.",
    '/motivation': () => "Let's remember why you started this journey.",
    '/physio': () => "Your recovery is measurable. Let's track what's healing.",
    '/medical': () => "Understanding what's happening inside helps you feel in control.",
    '/body-map': () => "Your body tells a story. Let's listen to it carefully.",
    '/pain-journal': () => "Logging your pain helps us understand the pattern.",
    '/recovery-timeline': () => "Look how far you've come. Every step counts.",
    '/profile': () => "Your personal space. Reflect on your progress here."
};

const DEFAULT_MESSAGE = "I'm right here with you.";

export const AIAvatarCompanion: React.FC = () => {
    const location = useLocation();
    const { user } = useUser();
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isVisible, setIsVisible] = useState(true);
    
    const synthRef = useRef<SpeechSynthesis | null>(null);

    // Initialize speech synthesis
    useEffect(() => {
        if ('speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
        }
    }, []);

    // Handle route changes
    useEffect(() => {
        if (!isVisible) return;
        
        let speechText = DEFAULT_MESSAGE;
        const name = user?.name?.split(' ')[0] || 'friend';
        
        // Exact match or partial match for dynamic routes like /exercise-timer/:id
        const matchedPath = Object.keys(PATH_MESSAGES).find(p => location.pathname.startsWith(p));
        
        if (matchedPath) {
            speechText = PATH_MESSAGES[matchedPath](name);
        }

        setMessage(speechText);
        setIsOpen(true);

        if (!isMuted && synthRef.current) {
            // Cancel any ongoing speech
            synthRef.current.cancel();

            const utterance = new SpeechSynthesisUtterance(speechText);
            
            // Try to find a good English voice (preferably female/calm)
            const voices = synthRef.current.getVoices();
            const preferredVoice = voices.find(v => 
                v.lang.includes('en') && 
                (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'))
            ) || voices.find(v => v.lang.includes('en'));

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            
            utterance.rate = 0.9; // Slightly slower, more calming
            utterance.pitch = 1.0;
            utterance.volume = 0.8;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                setTimeout(() => setIsOpen(false), 3000); // Close naturally after a few seconds
            };
            utterance.onerror = () => setIsSpeaking(false);

            synthRef.current.speak(utterance);
        } else {
            // If muted, just show the message briefly
            setTimeout(() => setIsOpen(false), 5000);
        }

    }, [location.pathname, isMuted, user?.name, isVisible]);

    // Handle voice list loading asynchronously (some browsers load them late)
    useEffect(() => {
        if (synthRef.current) {
            synthRef.current.onvoiceschanged = () => {
                // Voices loaded, can re-evaluate if needed
            };
        }
    }, []);

    const toggleMute = () => {
        if (synthRef.current && !isMuted) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
        setIsMuted(!isMuted);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[60] flex flex-col items-end pointer-events-none">
            {/* Speech Bubble */}
            <div 
                className={`transition-all duration-500 ease-in-out transform origin-bottom-right pointer-events-auto
                ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4 pointer-events-none'}
                mb-4 relative`}
            >
                <div className="bg-slate-900/90 backdrop-blur-md border border-violet-500/30 p-4 rounded-t-2xl rounded-bl-2xl rounded-br-sm shadow-[0_8px_32px_rgba(139,92,246,0.2)] max-w-[280px]">
                    <div className="flex justify-between items-start mb-1.5 gap-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-violet-400 uppercase tracking-wider">
                            <Sparkles size={12} className={isSpeaking ? 'animate-pulse' : ''} />
                            Dr. Aira
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                        {message}
                    </p>
                    
                    {/* Tail */}
                    <div className="absolute -bottom-2 right-4 w-4 h-4 bg-slate-900/90 border-b border-r border-violet-500/30 transform rotate-45" />
                </div>
            </div>

            {/* Avatar Orb */}
            <div className="flex items-center gap-3 pointer-events-auto">
                {/* Controls (visible on hover of the general area) */}
                <div className="bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-full px-2 py-1.5 flex gap-2 opacity-0 hover:opacity-100 transition-opacity absolute right-[70px]">
                    <button 
                        onClick={toggleMute}
                        className="p-1.5 rounded-full text-slate-300 hover:bg-white/10 transition-colors"
                        title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                    >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="p-1.5 rounded-full text-rose-400 hover:bg-white/10 transition-colors"
                        title="Dismiss Avatar"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* The Orb */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative group w-14 h-14 rounded-full flex items-center justify-center outline-none"
                >
                    {/* Outer Glows */}
                    <div className={`absolute inset-0 rounded-full transition-all duration-1000 blur-xl opacity-40
                        ${isSpeaking ? 'bg-fuchsia-500 scale-150 animate-glow-pulse' : 'bg-violet-500 scale-125'}`} 
                    />
                    
                    {/* Inner Orb */}
                    <div className={`relative w-12 h-12 rounded-full overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all flex items-center justify-center
                        ${isSpeaking ? 'bg-gradient-to-br from-fuchsia-400 to-indigo-600' : 'bg-gradient-to-br from-violet-500 to-indigo-700'}`}
                    >
                        {/* Shimmer effect inside orb */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-shimmer" style={{ backgroundSize: '200% 200%' }} />
                        
                        <BrainCircuit size={24} className="text-white relative z-10 opacity-90" />
                    </div>

                    {/* Speech indicator rings */}
                    {isSpeaking && (
                        <>
                            <div className="absolute inset-0 rounded-full border-2 border-fuchsia-400/40 animate-ping" />
                            <div className="absolute -inset-2 rounded-full border border-fuchsia-400/20 animate-ping" style={{ animationDelay: '300ms' }} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
