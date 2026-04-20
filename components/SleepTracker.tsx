import React, { useState, useEffect } from 'react';
import { Moon, Star, Zap, Check } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

export const SleepTracker: React.FC = () => {
    const { user } = useUser();
    const { showToast } = useToast();
    const [hours, setHours] = useState<number>(7);
    const [quality, setQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        const fetchTodaySleep = async () => {
            const today = new Date().toISOString().split('T')[0];
            const { data } = await supabase
                .from('health_metrics')
                .select('value_json')
                .eq('user_id', user.id)
                .eq('metric_type', 'sleep')
                .eq('date', today)
                .single();
            if (data && data.value_json) {
                setHours(data.value_json.hours || 7);
                setQuality(data.value_json.quality || 'good');
                setIsSaved(true);
            }
        };
        fetchTodaySleep();
    }, [user?.id]);

    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            await supabase.from('health_metrics').upsert({
                user_id: user.id,
                metric_type: 'sleep',
                date: today,
                value_json: { hours, quality }
            });
            setIsSaved(true);
            showToast('Sleep logged successfully. Rest heals the brain!', 'success');
        } catch (err) {
            showToast('Failed to log sleep.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const qColors = {
        poor: 'bg-rose-500',
        fair: 'bg-amber-500',
        good: 'bg-emerald-500',
        excellent: 'bg-violet-500'
    };

    return (
        <div className="bento-card p-6 rounded-2xl relative overflow-hidden group hover-lift card-3d shine-on-hover spotlight-card scroll-reveal">
            <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-20 ${qColors[quality]}`} />
            
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                    <Moon size={18} className="text-violet-400" />
                    Sleep Recovery
                </h3>
                {isSaved && <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md flex items-center gap-1"><Check size={12}/> Logged</div>}
            </div>

            <div className="mb-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Duration: {hours} hours</p>
                <input 
                    type="range" 
                    min="2" max="14" step="0.5" 
                    value={hours} 
                    onChange={e => { setHours(parseFloat(e.target.value)); setIsSaved(false); }}
                    className="w-full accent-violet-500 h-2 bg-slate-800 rounded-full appearance-none"
                />
            </div>

            <div className="mb-6">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Quality</p>
                <div className="grid grid-cols-4 gap-2">
                    {['poor', 'fair', 'good', 'excellent'].map((q) => (
                        <button 
                            key={q}
                            onClick={() => { setQuality(q as any); setIsSaved(false); }}
                            className={`py-2 rounded-xl text-xs font-bold transition-all ${quality === q ? qColors[q as keyof typeof qColors] + ' text-white scale-105 shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>

            <button 
                onClick={handleSave}
                disabled={isSaved || saving}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg
                    ${isSaved ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:shadow-violet-500/25'}`}
            >
                {saving ? 'Saving...' : isSaved ? 'Sleep Logged' : 'Log Sleep'}
            </button>
        </div>
    );
};
