import React, { useState, useEffect } from 'react';
import { Heart, Phone, X, MessageCircle, Eye, Ear, Wind, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';

interface SOSModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenChat?: () => void;
}

// ─── 5-4-3-2-1 Grounding Steps ─────────────────────────────────────────────
const GROUNDING_STEPS = [
    {
        count: 5,
        sense: 'SEE',
        icon: Eye,
        emoji: '👁️',
        color: '#818cf8',
        bg: 'rgba(129,140,248,0.12)',
        border: 'rgba(129,140,248,0.25)',
        instruction: 'Look around and name 5 things you can see.',
        hint: 'A cup, your hands, the ceiling, a colour, a shape. Anything at all.',
    },
    {
        count: 4,
        sense: 'HEAR',
        icon: Ear,
        emoji: '👂',
        color: '#34d399',
        bg: 'rgba(52,211,153,0.12)',
        border: 'rgba(52,211,153,0.25)',
        instruction: 'Close your eyes. Name 4 things you can hear.',
        hint: 'A fan, your own breath, traffic, birds, silence itself.',
    },
    {
        count: 3,
        sense: 'FEEL',
        icon: Wind,
        emoji: '🤲',
        color: '#fbbf24',
        bg: 'rgba(251,191,36,0.12)',
        border: 'rgba(251,191,36,0.25)',
        instruction: 'Name 3 things you can physically feel.',
        hint: 'Your feet on the floor. The chair beneath you. The temperature of the air.',
    },
    {
        count: 2,
        sense: 'SMELL',
        icon: Wind,
        emoji: '🌸',
        color: '#f472b6',
        bg: 'rgba(244,114,182,0.12)',
        border: 'rgba(244,114,182,0.25)',
        instruction: 'Name 2 things you can smell.',
        hint: 'The room, your clothes, food nearby — anything at all.',
    },
    {
        count: 1,
        sense: 'TASTE',
        icon: Heart,
        emoji: '💧',
        color: '#60a5fa',
        bg: 'rgba(96,165,250,0.12)',
        border: 'rgba(96,165,250,0.25)',
        instruction: 'Name 1 thing you can taste.',
        hint: 'Take a sip of water. Notice how it feels. You are here.',
    },
];

// ─── Anchoring Affirmations ──────────────────────────────────────────────────
const AFFIRMATIONS = [
    { phrase: "This feeling is temporary. It will pass.", emoji: "🌊" },
    { phrase: "I am safe in this moment, right now.", emoji: "🛡️" },
    { phrase: "I have survived every difficult moment so far.", emoji: "💪" },
    { phrase: "I am not alone. Someone is always here.", emoji: "🤝" },
    { phrase: "My brain is healing. Slowly, but surely.", emoji: "🧠" },
    { phrase: "I am proud of myself for reaching out.", emoji: "🌱" },
    { phrase: "One breath at a time. That's all I need.", emoji: "🌬️" },
    { phrase: "This craving is a wave. I can surf it.", emoji: "🌊" },
];

export const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose, onOpenChat }) => {
    const [tab, setTab] = useState<'breathing' | 'grounding' | 'anchor'>('breathing');
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [timeLeft, setTimeLeft] = useState(4);
    const [groundingStep, setGroundingStep] = useState(0);
    const [groundingDone, setGroundingDone] = useState(false);
    const [affIdx, setAffIdx] = useState(0);
    const [affFading, setAffFading] = useState(false);

    // Reset when opened
    useEffect(() => {
        if (isOpen) {
            setTab('breathing');
            setGroundingStep(0);
            setGroundingDone(false);
            setPhase('inhale');
            setTimeLeft(4);
            setAffIdx(Math.floor(Math.random() * AFFIRMATIONS.length));
        }
    }, [isOpen]);

    // 4-7-8 Breathing
    useEffect(() => {
        if (!isOpen || tab !== 'breathing') return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev > 1) return prev - 1;
                if (phase === 'inhale') { setPhase('hold'); return 7; }
                else if (phase === 'hold') { setPhase('exhale'); return 8; }
                else { setPhase('inhale'); return 4; }
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen, phase, tab]);

    // Auto-cycle affirmations
    useEffect(() => {
        if (!isOpen || tab !== 'anchor') return;
        const t = setInterval(() => {
            setAffFading(true);
            setTimeout(() => {
                setAffIdx(i => (i + 1) % AFFIRMATIONS.length);
                setAffFading(false);
            }, 400);
        }, 4000);
        return () => clearInterval(t);
    }, [isOpen, tab]);

    if (!isOpen) return null;

    const currentStep = GROUNDING_STEPS[groundingStep];
    const aff = AFFIRMATIONS[affIdx];

    const advanceGrounding = () => {
        if (groundingStep < GROUNDING_STEPS.length - 1) {
            setGroundingStep(s => s + 1);
        } else {
            setGroundingDone(true);
        }
    };

    const breathConfig = {
        inhale: { label: 'Breathe In', color: '#34d399', scale: '1.15', blur: '20px', glow: 'rgba(52,211,153,0.4)' },
        hold: { label: 'Hold Gently', color: '#fbbf24', scale: '1.15', blur: '16px', glow: 'rgba(251,191,36,0.3)' },
        exhale: { label: 'Let It Go', color: '#818cf8', scale: '0.82', blur: '8px', glow: 'rgba(129,140,248,0.2)' },
    };
    const bc = breathConfig[phase];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(2, 6, 23, 0.92)', backdropFilter: 'blur(20px)' }}>

            <div className="relative w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl"
                style={{
                    background: 'linear-gradient(160deg, rgba(15,8,40,0.98) 0%, rgba(10,15,35,0.98) 100%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                    animation: 'sos-rise 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                }}>

                {/* Warm ambient top glow */}
                <div style={{
                    position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
                    width: '300px', height: '200px', borderRadius: '50%',
                    background: 'radial-gradient(ellipse, rgba(251,113,133,0.18) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                {/* Warm top stripe */}
                <div style={{ height: '3px', background: 'linear-gradient(90deg, #f472b6, #fb7185, #fbbf24)', opacity: 0.8 }} />

                <button onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-full transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="px-7 pt-8 pb-2 text-center">
                    {/* Heartbeat icon */}
                    <div className="flex justify-center mb-4">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <div style={{
                                position: 'absolute', inset: 0, borderRadius: '50%',
                                background: 'rgba(251,113,133,0.15)',
                                animation: 'heartbeat 1.4s ease-in-out infinite',
                            }} />
                            <div style={{
                                position: 'absolute', inset: '-6px', borderRadius: '50%',
                                border: '2px solid rgba(251,113,133,0.2)',
                                animation: 'heartbeat 1.4s ease-in-out infinite 0.2s',
                            }} />
                            <Heart size={28} style={{ color: '#fb7185', position: 'relative', zIndex: 1, fill: 'rgba(251,113,133,0.3)' }} />
                        </div>
                    </div>

                    <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#fff', fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.2 }}>
                        You are safe. I'm here.
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', marginTop: '6px', lineHeight: 1.5 }}>
                        Opening this app in a hard moment takes real courage.<br />Let's take it one breath at a time together.
                    </p>

                    {/* Tabs */}
                    <div className="flex rounded-2xl mt-6 mb-1 p-1 gap-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {[
                            { id: 'breathing', label: '🌬️ Breathe' },
                            { id: 'grounding', label: '🌿 Ground' },
                            { id: 'anchor', label: '⚓ Anchor' },
                        ].map(t => (
                            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
                                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                                style={{
                                    background: tab === t.id ? 'rgba(255,255,255,0.09)' : 'transparent',
                                    color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.35)',
                                    boxShadow: tab === t.id ? '0 2px 10px rgba(0,0,0,0.2)' : 'none',
                                }}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-7 pb-7">

                    {/* ─── BREATHING TAB ─── */}
                    {tab === 'breathing' && (
                        <div className="flex flex-col items-center pt-4">
                            {/* Morphing circle */}
                            <div className="relative flex items-center justify-center mb-5" style={{ width: '180px', height: '180px' }}>
                                {/* Outer glow */}
                                <div style={{
                                    position: 'absolute', inset: 0, borderRadius: '50%',
                                    background: `radial-gradient(circle, ${bc.glow} 0%, transparent 70%)`,
                                    transition: 'all ease-in-out',
                                    transitionDuration: phase === 'inhale' ? '4000ms' : phase === 'hold' ? '700ms' : '8000ms',
                                }} />
                                {/* Main circle */}
                                <div style={{
                                    width: '130px', height: '130px', borderRadius: '50%',
                                    border: `2px solid ${bc.color}`,
                                    boxShadow: `0 0 ${bc.blur} ${bc.glow}, inset 0 0 30px ${bc.glow}`,
                                    transform: `scale(${bc.scale})`,
                                    transition: 'all ease-in-out',
                                    transitionDuration: phase === 'inhale' ? '4000ms' : phase === 'hold' ? '700ms' : '8000ms',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                                }}>
                                    <span style={{ fontFamily: 'Sora, sans-serif', color: '#fff', fontSize: '2.4rem', fontWeight: 800, lineHeight: 1 }}>
                                        {timeLeft}
                                    </span>
                                    <span style={{ color: bc.color, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
                                        {bc.label}
                                    </span>
                                </div>
                            </div>

                            <div className="text-center">
                                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>
                                    4-7-8 technique · Inhale · Hold · Release
                                </p>
                                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', marginTop: '4px' }}>
                                    Let your shoulders drop. You don't have to hold anything right now.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ─── GROUNDING TAB ─── */}
                    {tab === 'grounding' && !groundingDone && (
                        <div className="pt-4">
                            <div className="flex justify-center gap-2 mb-5">
                                {GROUNDING_STEPS.map((s, i) => (
                                    <div key={i}
                                        style={{
                                            width: i === groundingStep ? '24px' : '8px',
                                            height: '8px', borderRadius: '99px',
                                            background: i <= groundingStep ? currentStep.color : 'rgba(255,255,255,0.12)',
                                            transition: 'all 0.4s ease',
                                        }} />
                                ))}
                            </div>

                            <div className="rounded-2xl p-6 mb-4 flex flex-col items-center text-center"
                                style={{ background: currentStep.bg, border: `1px solid ${currentStep.border}` }}>
                                <div className="text-4xl mb-3" style={{ animation: 'float 3s ease-in-out infinite' }}>
                                    {currentStep.emoji}
                                </div>
                                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: '3rem', fontWeight: 900, color: currentStep.color, lineHeight: 1, marginBottom: '8px' }}>
                                    {currentStep.count}
                                </div>
                                <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px' }}>
                                    {currentStep.instruction}
                                </p>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', lineHeight: 1.6 }}>
                                    {currentStep.hint}
                                </p>
                            </div>

                            <button onClick={advanceGrounding}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                                style={{ background: `linear-gradient(135deg, ${currentStep.color}cc, ${currentStep.color})` }}>
                                {groundingStep < GROUNDING_STEPS.length - 1 ? (
                                    <><span>Done — Next Sense</span><ChevronRight size={16} /></>
                                ) : (
                                    <><CheckCircle2 size={16} /><span>I feel grounded ✓</span></>
                                )}
                            </button>
                        </div>
                    )}

                    {tab === 'grounding' && groundingDone && (
                        <div className="flex flex-col items-center text-center py-6">
                            <div className="text-5xl mb-4" style={{ animation: 'float 3s ease-in-out infinite' }}>🌿</div>
                            <h3 style={{ fontFamily: 'Sora, sans-serif', color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>
                                You came back to yourself.
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', lineHeight: 1.7, maxWidth: '280px' }}>
                                You just completed the 5-4-3-2-1 grounding method. Notice — the wave has shifted. You did that. You are more capable than you realise.
                            </p>
                        </div>
                    )}

                    {/* ─── ANCHOR TAB ─── */}
                    {tab === 'anchor' && (
                        <div className="pt-4">
                            <div className="rounded-2xl p-8 mb-4 flex flex-col items-center text-center relative overflow-hidden"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', minHeight: '160px', justifyContent: 'center' }}>
                                <div style={{
                                    position: 'absolute', inset: 0, borderRadius: '16px',
                                    background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.08) 0%, transparent 70%)',
                                    pointerEvents: 'none',
                                }} />
                                <div className="text-4xl mb-4" style={{ transition: 'opacity 0.4s', opacity: affFading ? 0 : 1 }}>
                                    {aff.emoji}
                                </div>
                                <p style={{
                                    fontFamily: 'Sora, sans-serif', color: '#fff', fontSize: '1.05rem', fontWeight: 700,
                                    lineHeight: 1.5, transition: 'opacity 0.4s', opacity: affFading ? 0 : 1,
                                }}>
                                    {aff.phrase}
                                </p>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', textAlign: 'center', marginBottom: '12px' }}>
                                Affirmations cycle every 4 seconds · Read each one slowly
                            </p>
                        </div>
                    )}

                    {/* ─── ACTION BUTTONS ─── */}
                    <div className="space-y-2.5 mt-5">
                        <button
                            onClick={() => { if (onOpenChat) onOpenChat(); onClose(); }}
                            className="w-full flex items-center justify-center space-x-3 text-white p-3.5 rounded-2xl font-semibold transition-all text-sm hover:opacity-90 active:scale-[0.98]"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}>
                            <MessageCircle size={17} />
                            <span>Talk to my Recovery Companion</span>
                        </button>
                        <a href="tel:988"
                            className="w-full flex items-center justify-center space-x-3 text-white p-3.5 rounded-2xl font-semibold transition-all text-sm hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', boxShadow: '0 4px 20px rgba(225,29,72,0.3)' }}>
                            <Phone size={17} />
                            <span>Call Crisis Helpline · 988</span>
                        </a>
                        <button
                            className="w-full flex items-center justify-center space-x-3 p-3.5 rounded-2xl font-semibold transition-all text-sm"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                            <Sparkles size={17} />
                            <span>Call My Sponsor / Mentor</span>
                        </button>
                    </div>

                    <style>{`
                        @keyframes heartbeat {
                            0%, 100% { transform: scale(1); opacity: 1; }
                            14% { transform: scale(1.4); opacity: 0.8; }
                            28% { transform: scale(1); opacity: 0.6; }
                            42% { transform: scale(1.2); opacity: 0.7; }
                            70% { transform: scale(1); opacity: 1; }
                        }
                        @keyframes float {
                            0%, 100% { transform: translateY(0px); }
                            50% { transform: translateY(-8px); }
                        }
                        @keyframes sos-rise {
                            from { opacity: 0; transform: scale(0.9) translateY(20px); }
                            to { opacity: 1; transform: scale(1) translateY(0); }
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
};
