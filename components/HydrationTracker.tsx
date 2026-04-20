import React, { useState, useEffect } from 'react';
import { Droplets, Plus, Check } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

export const HydrationTracker: React.FC = () => {
    const { user } = useUser();
    const { showToast } = useToast();
    const [glasses, setGlasses] = useState<number>(0);
    const goal = 8;
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        const fetchHydration = async () => {
            const today = new Date().toISOString().split('T')[0];
            const { data } = await supabase
                .from('health_metrics')
                .select('value_json')
                .eq('user_id', user.id)
                .eq('metric_type', 'hydration')
                .eq('date', today)
                .single();
            if (data && typeof data.value_json?.glasses === 'number') {
                setGlasses(data.value_json.glasses);
            }
        };
        fetchHydration();
    }, [user?.id]);

    const addGlass = async () => {
        if (!user?.id) return;
        setSaving(true);
        const next = Math.min(glasses + 1, goal);
        try {
            const today = new Date().toISOString().split('T')[0];
            await supabase.from('health_metrics').upsert({
                user_id: user.id,
                metric_type: 'hydration',
                date: today,
                value_json: { glasses: next }
            });
            setGlasses(next);
            if (next === goal) showToast('Hydration goal met! 💧', 'success');
        } catch (err) {
            showToast('Failed to add water.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const fillPercentage = Math.min((glasses / goal) * 100, 100);

    return (
        <div className="bento-card p-6 rounded-2xl relative overflow-hidden group hover-lift card-3d shine-on-hover spotlight-card scroll-reveal flex flex-col justify-between">
            {/* Liquid Fill Effect */}
            <div 
                className="absolute left-0 right-0 bottom-0 bg-blue-500/20 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" 
                style={{ height: `${fillPercentage}%` }}
            >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-t from-blue-400/20 to-transparent" />
            </div>
            
            <div className="relative z-10 flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                    <Droplets size={18} className="text-blue-400" />
                    Hydration
                </h3>
                {fillPercentage >= 100 && <div className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md flex items-center gap-1"><Check size={12}/> Goal Met</div>}
            </div>

            <div className="relative z-10 flex items-center justify-center py-6">
                <div className="text-center">
                    <p className="text-5xl font-extrabold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                        {glasses} <span className="text-2xl text-slate-500">/ {goal}</span>
                    </p>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-2">Glasses</p>
                </div>
            </div>

            <div className="relative z-10 mt-auto">
                <button 
                    onClick={addGlass}
                    disabled={saving || glasses >= goal}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2
                        ${glasses >= goal ? 'bg-white/5 text-blue-400/50 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-sky-600 text-white hover:shadow-blue-500/25'}`}
                >
                    <Plus size={16} /> Add Glass (250ml)
                </button>
            </div>
        </div>
    );
};
