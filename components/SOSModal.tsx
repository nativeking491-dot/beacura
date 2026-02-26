import React, { useState, useEffect } from 'react';
import { ShieldAlert, Phone, Heart, X, MessageCircle } from 'lucide-react';

interface SOSModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenChat?: () => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose, onOpenChat }) => {
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [timeLeft, setTimeLeft] = useState(4);

    // 4-7-8 Breathing Technique
    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev > 1) return prev - 1;

                // Transition phases
                if (phase === 'inhale') {
                    setPhase('hold');
                    return 7;
                } else if (phase === 'hold') {
                    setPhase('exhale');
                    return 8;
                } else {
                    setPhase('inhale');
                    return 4;
                }
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, phase]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl transition-all duration-300">
            <div className="relative w-full max-w-lg p-8 mx-auto bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Urgent header styling */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500" />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mb-4 border border-rose-500/30">
                        <ShieldAlert size={32} />
                    </div>
                    <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl font-bold text-white mb-2">You are safe.</h2>
                    <p className="text-slate-300 text-lg">Let's take a moment to ground yourself.</p>
                </div>

                {/* Breathing Exercise UI */}
                <div className="relative flex flex-col items-center justify-center h-48 mb-8 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                    <div
                        className={`absolute w-32 h-32 rounded-full border-4 transition-all ease-in-out
              ${phase === 'inhale' ? 'border-emerald-500 scale-150 duration-[4000ms]' : ''}
              ${phase === 'hold' ? 'border-amber-500 scale-150 duration-700' : ''}
              ${phase === 'exhale' ? 'border-blue-500 scale-100 duration-[8000ms]' : ''}
            `}
                    />
                    <div className="relative z-10 flex flex-col items-center">
                        <span className="text-3xl font-bold text-white mb-1">{timeLeft}</span>
                        <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                            {phase === 'inhale' && 'Breathe In'}
                            {phase === 'hold' && 'Hold'}
                            {phase === 'exhale' && 'Breathe Out'}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => {
                            if (onOpenChat) onOpenChat();
                            onClose();
                        }}
                        className="w-full flex items-center justify-center space-x-3 bg-violet-600 hover:bg-violet-700 text-white p-4 rounded-xl font-semibold transition-colors"
                    >
                        <MessageCircle size={20} />
                        <span>Chat with AI Companion</span>
                    </button>

                    <a
                        href="tel:988"
                        className="w-full flex items-center justify-center space-x-3 bg-rose-600 hover:bg-rose-700 text-white p-4 rounded-xl font-semibold transition-colors"
                    >
                        <Phone size={20} />
                        <span>Emergency Helpline (988)</span>
                    </a>

                    <button className="w-full flex items-center justify-center space-x-3 bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-xl font-semibold transition-colors">
                        <Heart size={20} />
                        <span>Call My Sponsor / Mentor</span>
                    </button>
                </div>

            </div>
        </div>
    );
};
