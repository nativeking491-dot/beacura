import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Volume2, Sparkles, Save, CheckCircle } from "lucide-react";
import { useToast } from "../context/ToastContext";

const AvatarSettings: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [avatarType, setAvatarType] = useState<'aira'|'kai'>(localStorage.getItem('beacura_avatar_type') as 'aira'|'kai' || 'aira');
  const [voiceURI, setVoiceURI] = useState<string>(localStorage.getItem('beacura_avatar_voiceURI') || '');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  useEffect(() => {
    const fetchVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
    };
    fetchVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = fetchVoices;
    }
  }, []);

  const handleTestVoice = () => {
      const u = new SpeechSynthesisUtterance("This is how I will sound when I help you on your recovery journey.");
      const selected = voices.find(v => v.voiceURI === voiceURI);
      if (selected) u.voice = selected;
      u.rate = 0.85;
      u.pitch = avatarType === 'aira' ? 1.2 : 0.85;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
  };

  const handleSave = () => {
      localStorage.setItem('beacura_avatar_type', avatarType);
      localStorage.setItem('beacura_avatar_voiceURI', voiceURI);
      showToast('Avatar preferences saved successfully.', 'success');
      // Trigger a global force-refresh if needed or just let it be.
  };

  return (
    <div className="max-w-3xl mx-auto pb-16 animate-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold mb-8 transition-colors"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-violet-500/10 text-violet-500 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles size={14} />
          <span>AI Companion</span>
        </div>
        <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Avatar Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Customize your doctor companion's identity and voice.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 mb-8">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-5">
          Select Avatar
        </h2>
        <div className="grid grid-cols-2 gap-4">
            <button
               onClick={() => setAvatarType('aira')}
               className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${avatarType === 'aira' ? 'border-violet-500 bg-violet-500/10 shadow-lg' : 'border-transparent bg-slate-50 border-slate-200 dark:bg-slate-700/50 dark:border-slate-600 hover:border-violet-300'}`}
            >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-violet-500 relative">
                   <div className="absolute inset-0 bg-fuchsia-500 blur-xl opacity-20" />
                   <img src="/dr_aira.png" alt="Aira" className="w-full h-full object-cover" />
                </div>
                <div>
                   <p className="font-bold text-slate-900 dark:text-white">Dr. Aira</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400">Warm & Empathetic</p>
                </div>
            </button>

            <button
               onClick={() => setAvatarType('kai')}
               className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${avatarType === 'kai' ? 'border-emerald-500 bg-emerald-500/10 shadow-lg' : 'border-transparent bg-slate-50 border-slate-200 dark:bg-slate-700/50 dark:border-slate-600 hover:border-emerald-300'}`}
            >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 relative">
                   <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20" />
                   <img src="/dr_kai.png" alt="Kai" className="w-full h-full object-cover" />
                </div>
                <div>
                   <p className="font-bold text-slate-900 dark:text-white">Dr. Kai</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400">Calm & Reassuring</p>
                </div>
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 mb-8">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-5">
          Avatar Voice
        </h2>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
            <select 
                value={voiceURI}
                onChange={(e) => setVoiceURI(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
                <option value="">-- Choose System Default --</option>
                {voices.map(v => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                    </option>
                ))}
            </select>
            
            <button 
                onClick={handleTestVoice}
                className="px-6 py-3 bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 font-bold rounded-xl hover:bg-violet-200 dark:hover:bg-violet-500/30 transition-colors flex items-center justify-center gap-2 flex-shrink-0"
            >
                <Volume2 size={18} /> Test Voice
            </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
            Note: Voices are provided natively by your operating system or browser, and availability may vary. We recommend trying different ones to find the perfect companion tone.
        </p>
      </div>

      <button 
         onClick={handleSave}
         className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg transition-all"
      >
          <Save size={20} /> Save Avatar Preferences
      </button>

    </div>
  );
};

export default AvatarSettings;
