import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Volume2, VolumeX, Sparkles, X, Settings } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import { generateLocalResponse } from '../services/localChatService'; // If you want to use local gemini for direct context

const PATH_MESSAGES: Record<string, (name: string, t: any) => string> = {
    '/dashboard': (name, t) => t('avatar.greeting_dashboard', { name, defaultValue: `Good to see you, ${name}. You showed up today.` }),
    '/journal': (name, t) => t('avatar.greeting_journal', { defaultValue: "This space is yours completely. No judgment, just honesty." }),
    '/chat': (name, t) => t('avatar.greeting_chat', { defaultValue: "I'm here. Whatever you're carrying right now, you don't have to carry it alone." }),
    '/counseling': (name, t) => t('avatar.greeting_counseling', { defaultValue: "Real human support is powerful. You're making a strong choice." }),
    '/health': (name, t) => t('avatar.greeting_health', { defaultValue: "Your body is working to heal. Let's give it what it needs." }),
    '/exercise': (name, t) => t('avatar.greeting_exercise', { defaultValue: "Movement heals. Even five minutes counts today." }),
    '/profile': (name, t) => t('avatar.greeting_profile', { defaultValue: "Your personal space. Reflect on your progress here." })
};

export const AvatarCharacter: React.FC = () => {
    const location = useLocation();
    const { user } = useUser();
    const { t, i18n } = useTranslation();
    
    // Preferences
    const [isMuted, setIsMuted] = useState(localStorage.getItem('beacura_avatar_muted') === 'true');
    const [avatarType, setAvatarType] = useState<'aira'|'kai'>(localStorage.getItem('beacura_avatar_type') as 'aira'|'kai' || 'aira');
    
    // State
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

    // Toggle Functions
    const toggleAvatar = () => {
        const newType = avatarType === 'aira' ? 'kai' : 'aira';
        setAvatarType(newType);
        localStorage.setItem('beacura_avatar_type', newType);
        speak(t('avatar.switch', { defaultValue: `Hello, I'm Dr. ${newType === 'aira' ? 'Aira' : 'Kai'}.` }));
    };

    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        localStorage.setItem('beacura_avatar_muted', String(newMuted));
        if (synthRef.current && newMuted) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
    };

    const speak = (speechText: string) => {
        if (!speechText) return;
        setMessage(speechText);
        setIsOpen(true);

        if (!isMuted && synthRef.current) {
            synthRef.current.cancel();
            const utterance = new SpeechSynthesisUtterance(speechText);
            
            // Set language dynamically
            utterance.lang = i18n.language === 'en' ? 'en-US' : (i18n.language === 'es' ? 'es-MX' : 'ja-JP');

            const voices = synthRef.current.getVoices();
            // Voice preference based on avatar
            let preferredVoice;
            if (avatarType === 'aira') {
                preferredVoice = voices.find(v => v.lang.startsWith(i18n.language.split('-')[0]) && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google UK English Female')));
            } else {
                preferredVoice = voices.find(v => v.lang.startsWith(i18n.language.split('-')[0]) && (v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('Google US English Male')));
            }
            
            if (preferredVoice) utterance.voice = preferredVoice;
            
            utterance.rate = 0.9;
            utterance.pitch = avatarType === 'aira' ? 1.1 : 0.9;
            utterance.volume = 0.8;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                setTimeout(() => setIsOpen(false), 3000);
            };
            utterance.onerror = () => setIsSpeaking(false);

            synthRef.current.speak(utterance);
        } else {
            setTimeout(() => setIsOpen(false), 5000);
        }
    };

    // Handle route changes
    useEffect(() => {
        if (!isVisible) return;
        
        const name = user?.name?.split(' ')[0] || 'friend';
        const matchedPath = Object.keys(PATH_MESSAGES).find(p => location.pathname.startsWith(p));
        
        if (matchedPath) {
            speak(PATH_MESSAGES[matchedPath](name, t));
        } else {
            speak(t('avatar.greeting_default', { defaultValue: "I'm right here with you." }));
        }
    }, [location.pathname, isVisible, i18n.language]);

    // Handle voice list loading asynchronously
    useEffect(() => {
        if (synthRef.current) synthRef.current.onvoiceschanged = () => {};
    }, []);

    if (!isVisible) return null;

    const avatarName = avatarType === 'aira' ? 'Aira' : 'Kai';
    const avatarImg = avatarType === 'aira' ? '/dr_aira.png' : '/dr_kai.png';
    const glowColor = avatarType === 'aira' ? 'fuchsia' : 'emerald';

    return (
        <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[60] flex flex-col items-end pointer-events-none">
            {/* Speech Bubble */}
            <div 
                className={`transition-all duration-500 ease-in-out transform origin-bottom-right pointer-events-auto
                ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4 pointer-events-none'}
                mb-4 relative`}
            >
                <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-4 rounded-t-2xl rounded-bl-2xl rounded-br-sm shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-w-[280px]">
                    <div className="flex justify-between items-start mb-1.5 gap-3">
                        <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-${glowColor}-400`}>
                            <Sparkles size={12} className={isSpeaking ? 'animate-pulse' : ''} />
                            Dr. {avatarName}
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
                    <div className="absolute -bottom-2 right-6 w-4 h-4 bg-slate-900/90 border-b border-r border-white/10 transform rotate-45" />
                </div>
            </div>

            {/* Avatar Frame & Controls */}
            <div className="flex items-end gap-3 pointer-events-auto group">
                
                {/* Controls */}
                <div className="bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-2xl flex flex-col gap-1 p-1 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity translate-y-[-20%]">
                    <button 
                        onClick={toggleAvatar}
                        className="p-2 rounded-xl text-slate-300 hover:bg-white/10 transition-colors"
                        title="Switch Guide"
                    >
                        <Settings size={16} />
                    </button>
                    <button 
                        onClick={toggleMute}
                        className="p-2 rounded-xl text-slate-300 hover:bg-white/10 transition-colors"
                        title={isMuted ? t('avatar.unmute') : t('avatar.mute')}
                    >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="p-2 rounded-xl text-rose-400 hover:bg-white/10 transition-colors"
                        title={t('avatar.dismiss')}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* The Character Visual Container */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-visible outline-none transition-transform hover:scale-105"
                >
                    {/* Pulsing Audio Visualizer Ring (active when speaking) */}
                    <div className={`absolute inset-0 rounded-3xl transition-all duration-300 pointer-events-none scale-105
                        ${isSpeaking ? `border-2 border-${glowColor}-500/80 animate-ping opacity-100` : 'border border-transparent opacity-0'}`} 
                        style={{ animationDuration: '1.5s' }}
                    />
                    
                    {/* Base Background Glow */}
                    <div className={`absolute inset-0 rounded-3xl blur-xl transition-opacity duration-1000
                       ${isSpeaking ? `bg-${glowColor}-500 opacity-60` : `bg-${glowColor}-500 opacity-20`}`} />

                    {/* Character Frame */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/20 bg-slate-800 shadow-2xl">
                       <img 
                          src={avatarImg} 
                          alt={`Dr. ${avatarName}`}
                          className={`w-full h-full object-cover transition-transform duration-[2000ms] ease-in-out
                            ${isSpeaking ? 'scale-110 translate-y-1' : 'scale-100 translate-y-0'}
                          `}
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    </div>
                </button>
            </div>
        </div>
    );
};
