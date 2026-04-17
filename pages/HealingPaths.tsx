import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { 
    Heart, HeartHandshake, Map, Focus, Navigation2, 
    Flame, CloudRain, Shield, Activity, TrendingUp, 
    Calendar, CheckCircle, ArrowRight
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

// Simple tool components that could be expanded later
const NoContactTracker = () => (
    <div className="bento-card p-6 rounded-2xl glow-on-hover relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-xl rounded-full" />
        <h4 className="font-bold text-slate-100 flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-rose-400" />
            No Contact Tracker
        </h4>
        <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-extrabold text-white font-display">14</span>
            <span className="text-slate-400 font-medium mb-1 line-through">Days String</span>
            <span className="text-rose-400 font-medium mb-1">Days Strong</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full" style={{ width: '45%' }} />
        </div>
        <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-200 font-semibold transition-all flex justify-center items-center gap-2 text-sm border border-white/5 hover:border-rose-500/30">
            <CheckCircle size={16} /> I stayed strong today
        </button>
    </div>
);

const EnergyTankTracker = () => (
    <div className="bento-card p-6 rounded-2xl glow-on-hover relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-xl rounded-full" />
        <h4 className="font-bold text-slate-100 flex items-center gap-2 mb-4">
            <Activity size={18} className="text-amber-400" />
            Energy Tank
        </h4>
        <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Critical</span>
            <span>Optimal</span>
        </div>
        <div className="flex gap-1 h-8 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <div 
                    key={level} 
                    className={`flex-1 rounded-sm ${level <= 6 
                        ? (level <= 3 ? 'bg-rose-500' : 'bg-amber-500') 
                        : 'bg-slate-700'}`}
                />
            ))}
        </div>
        <button className="w-full justify-between px-4 py-2.5 rounded-xl bg-white/5 hover:bg-amber-500/20 text-slate-200 font-semibold transition-all flex items-center gap-2 text-sm border border-white/5 hover:border-amber-500/30">
            Log Energy Drain <ArrowRight size={16} className="text-slate-500" />
        </button>
    </div>
);

const GroundingExercise = () => (
    <div className="bento-card p-6 rounded-2xl glow-on-hover relative overflow-hidden bg-gradient-to-br from-[#0e0d1f] to-[#1e1c35]">
        <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay" />
        <h4 className="font-bold text-slate-100 flex items-center gap-2 mb-2">
            <Focus size={18} className="text-indigo-400" />
            5-4-3-2-1 Grounding
        </h4>
        <p className="text-sm text-slate-400 mb-6">A sensory exercise to pull you back to the present moment.</p>
        
        <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <span className="text-lg font-bold text-indigo-400">5</span>
                <span className="text-sm text-slate-200">Things you can <strong>see</strong></span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 opacity-50">
                <span className="text-lg font-bold text-slate-500">4</span>
                <span className="text-sm text-slate-400">Things you can feel</span>
            </div>
        </div>
    </div>
);

const GriefWaveLogger = () => (
    <div className="bento-card p-6 rounded-2xl glow-on-hover relative overflow-hidden h-full flex flex-col justify-between">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-500/5 blur-xl rounded-full" />
        <div>
            <h4 className="font-bold text-slate-100 flex items-center gap-2 mb-2">
                <CloudRain size={18} className="text-blue-400" />
                Grief Wave Logger
            </h4>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                Grief doesn't shrink. We grow around it. Log when a wave hits.
            </p>
        </div>
        <button className="w-full py-4 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold transition-all border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            A Wave Hit Me Just Now
        </button>
    </div>
);


const PATHS = [
  {
    id: 'heartbreak',
    title: 'Heartbreak',
    icon: Heart,
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    description: 'Tools for untangling your life, processing loss, and regaining your individual identity.',
    component: <NoContactTracker />
  },
  {
    id: 'burnout',
    title: 'Burnout Recovery',
    icon: Flame,
    color: 'amber',
    gradient: 'from-orange-500 to-amber-500',
    description: 'Rebuild your energy reserves, establish firm boundaries, and redefine your relationship with work.',
    component: <EnergyTankTracker />
  },
  {
    id: 'ptsd',
    title: 'Trauma & PTSD',
    icon: Shield,
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600',
    description: 'Grounding techniques, trigger mapping, and nervous system regulation tools.',
    component: <GroundingExercise />
  },
  {
    id: 'grief',
    title: 'Grief Navigation',
    icon: CloudRain,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    description: 'A sanctuary to honor your loss, log grief waves, and store cherished memories.',
    component: <GriefWaveLogger />
  }
];

const HealingPaths: React.FC = () => {
    const { user } = useUser();
    const [activePath, setActivePath] = useState(PATHS[0].id);
    const { showToast } = useToast();

    return (
        <div className="animate-fade-scale">
            <header className="mb-8">
                <div className="flex items-center gap-3 text-violet-400 mb-2">
                    <Map size={20} />
                    <span className="font-bold tracking-widest uppercase text-sm">Paths</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-100 font-display mb-4">
                    Healing <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Roadmaps</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl">
                    Specialized toolkits designed for specific life challenges. Select a path below to access contextual resources and trackers.
                </p>
            </header>

            {/* Path Selector */}
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-8 snap-x">
                {PATHS.map((path) => {
                    const isActive = activePath === path.id;
                    const Icon = path.icon;
                    return (
                        <button
                            key={path.id}
                            onClick={() => setActivePath(path.id)}
                            className={`flex-shrink-0 snap-start flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all duration-300 ${
                                isActive 
                                ? `bg-${path.color}-500/10 border-${path.color}-400 shadow-[0_0_15px_rgba(0,0,0,0.2)]`
                                : 'bg-slate-900 border-white/5 hover:border-white/10 opacity-60 hover:opacity-100'
                            }`}
                        >
                            <Icon size={18} className={isActive ? `text-${path.color}-400` : 'text-slate-500'} />
                            <span className={`font-bold ${isActive ? 'text-slate-100' : 'text-slate-400'}`}>
                                {path.title}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Active Path Content */}
            {PATHS.map((path) => (
                <div 
                    key={path.id}
                    className={`transition-all duration-500 ${activePath === path.id ? 'opacity-100 block' : 'opacity-0 hidden'}`}
                >
                    <div className={`w-full p-8 rounded-3xl mb-8 relative overflow-hidden border border-${path.color}-500/20 bg-slate-900/50 backdrop-blur-xl`}>
                        {/* Background flourish */}
                        <div className={`absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br ${path.gradient} opacity-10 blur-[80px] rounded-full`} />
                        <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${path.gradient} opacity-50`} />
                        
                        <div className="grid md:grid-cols-2 gap-8 relative z-10">
                            <div>
                                <h2 className="text-3xl font-display font-bold text-white mb-4">{path.title} Protocol</h2>
                                <p className="text-slate-300 text-lg leading-relaxed mb-8">
                                    {path.description}
                                </p>
                                
                                <div className="space-y-4 mb-8">
                                    {['Daily Check-ins configured', 'AI Context Updated', 'Relevant Community Unlocked'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-${path.color}-500/20 text-${path.color}-400`}>
                                                <CheckCircle size={14} />
                                            </div>
                                            <span className="text-slate-300 font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                <button 
                                    onClick={() => showToast('Path deeply integrated into your dashboard.', 'success')}
                                    className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all bg-gradient-to-r ${path.gradient}`}
                                >
                                    <HeartHandshake size={20} />
                                    Make This My Primary Path
                                </button>
                            </div>
                            
                            <div className="flex flex-col gap-4 justify-center">
                                {path.component}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HealingPaths;
