import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RotateCw,
  Info,
  TrendingUp,
  Play,
  ChevronRight,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { BodyMapSVG } from "../components/BodyMapSVG";
import { RecoveryRing } from "../components/RecoveryRing";
import { PainSlider } from "../components/PainSlider";
import type { BodyRegion, BodyRegionStatus, RecoveryPhase } from "../types";

// ─── Demo Data ──────────────────────────────────────────────────────────────
const DEMO_REGIONS: BodyRegionStatus[] = [
  { region: "right_knee", painLevel: 4, recoveryPercent: 62, injuryType: "post_surgery", phase: "strengthening", lastUpdated: new Date().toISOString() },
  { region: "lower_back", painLevel: 3, recoveryPercent: 75, injuryType: "disc_herniation", phase: "strengthening", lastUpdated: new Date().toISOString() },
  { region: "left_shoulder", painLevel: 2, recoveryPercent: 88, injuryType: "rotator_cuff", phase: "full_recovery", lastUpdated: new Date().toISOString() },
  { region: "neck", painLevel: 1, recoveryPercent: 95, injuryType: "chronic_pain", phase: "full_recovery", lastUpdated: new Date().toISOString() },
  { region: "left_hip", painLevel: 5, recoveryPercent: 45, injuryType: "arthritis", phase: "gentle_movement", lastUpdated: new Date().toISOString() },
];

const EXERCISES_BY_REGION: Record<string, { name: string; duration: string; icon: string; difficulty: string }[]> = {
  right_knee: [
    { name: "Quad Sets", duration: "5 min", icon: "🦵", difficulty: "Beginner" },
    { name: "Heel Slides", duration: "8 min", icon: "🔄", difficulty: "Beginner" },
    { name: "Wall Squats", duration: "6 min", icon: "💪", difficulty: "Intermediate" },
    { name: "Step-Ups", duration: "10 min", icon: "🏃", difficulty: "Advanced" },
  ],
  lower_back: [
    { name: "Pelvic Tilts", duration: "5 min", icon: "🌀", difficulty: "Beginner" },
    { name: "Bird Dog", duration: "8 min", icon: "🐕", difficulty: "Intermediate" },
    { name: "Cat-Cow Stretch", duration: "6 min", icon: "🐱", difficulty: "Beginner" },
    { name: "Dead Bug", duration: "10 min", icon: "🐛", difficulty: "Intermediate" },
  ],
  left_shoulder: [
    { name: "Pendulum Swings", duration: "4 min", icon: "🔄", difficulty: "Beginner" },
    { name: "Wall Walks", duration: "6 min", icon: "🧗", difficulty: "Intermediate" },
    { name: "External Rotation", duration: "8 min", icon: "💪", difficulty: "Intermediate" },
  ],
  neck: [
    { name: "Chin Tucks", duration: "3 min", icon: "🫠", difficulty: "Beginner" },
    { name: "Neck Rotations", duration: "4 min", icon: "🔄", difficulty: "Beginner" },
  ],
  left_hip: [
    { name: "Clamshells", duration: "6 min", icon: "🐚", difficulty: "Beginner" },
    { name: "Hip Flexor Stretch", duration: "5 min", icon: "🧘", difficulty: "Beginner" },
    { name: "Bridges", duration: "8 min", icon: "🌉", difficulty: "Intermediate" },
  ],
};

const PHASE_CONFIG: Record<RecoveryPhase, { label: string; icon: string; color: string }> = {
  protection: { label: "Protection", icon: "🛡️", color: "#ef4444" },
  gentle_movement: { label: "Gentle Movement", icon: "🌱", color: "#eab308" },
  strengthening: { label: "Strengthening", icon: "💪", color: "#06b6d4" },
  full_recovery: { label: "Full Recovery", icon: "🏆", color: "#10b981" },
};

const SCIENCE_FACTS: Record<string, string> = {
  right_knee: "The knee has the largest synovial joint in the body. After surgery, controlled movement stimulates synovial fluid production, crucial for cartilage nutrition.",
  lower_back: "Your lumbar spine supports 60% of your body weight. Core stabilization exercises reduce spinal load by up to 40%.",
  left_shoulder: "The rotator cuff consists of 4 muscles. Gradual progressive loading increases tendon tensile strength by 15-20% over 8 weeks.",
  neck: "The cervical spine has the greatest range of motion. Isometric exercises strengthen deep cervical flexors, reducing chronic pain by up to 50%.",
  left_hip: "The hip joint handles forces up to 8x body weight when running. Strengthening the gluteus medius improves joint stability significantly.",
};

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

const BodyMap: React.FC = () => {
  const navigate = useNavigate();
  useScrollReveal();
  const [selectedRegion, setSelectedRegion] = useState<BodyRegion | null>(null);
  const [showPainLogger, setShowPainLogger] = useState(false);
  const [painValue, setPainValue] = useState(5);

  const selectedStatus = selectedRegion
    ? DEMO_REGIONS.find(r => r.region === selectedRegion)
    : null;

  const exercises = selectedRegion ? EXERCISES_BY_REGION[selectedRegion] || [] : [];
  const scienceFact = selectedRegion ? SCIENCE_FACTS[selectedRegion] : null;

  return (
    <div className="space-y-6 animate-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/physio")}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Sora, sans-serif' }} className="text-2xl md:text-3xl font-extrabold text-white">
              Body <span className="gradient-text-healing">Map</span>
            </h1>
            <p className="text-xs text-slate-400">Interactive anatomy • Track every region</p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Body Map */}
        <div className="bento-card rounded-2xl p-6 spotlight-card flex flex-col items-center justify-center min-h-[500px]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-bold text-slate-300">Healthy</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-[10px] font-bold text-slate-300">Recovering</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-[10px] font-bold text-slate-300">Acute</span>
            </div>
          </div>

          <BodyMapSVG
            regions={DEMO_REGIONS}
            selectedRegion={selectedRegion}
            onRegionClick={setSelectedRegion}
            size={300}
            showLabels={true}
          />
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          {selectedStatus ? (
            <>
              {/* Region Header */}
              <div className="bento-card rounded-2xl p-6 spotlight-card animate-in">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 style={{ fontFamily: 'Sora, sans-serif' }} className="text-xl font-bold text-white capitalize">
                      {selectedRegion?.replace(/_/g, " ")}
                    </h2>
                    <p className="text-xs text-slate-400 capitalize">{selectedStatus.injuryType?.replace(/_/g, " ")}</p>
                  </div>
                  <RecoveryRing percent={selectedStatus.recoveryPercent} size={80} label="Healed" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Pain</p>
                    <p className="text-lg font-extrabold" style={{
                      fontFamily: 'Sora, sans-serif',
                      color: selectedStatus.painLevel <= 3 ? '#10b981' : selectedStatus.painLevel <= 6 ? '#eab308' : '#ef4444'
                    }}>
                      {selectedStatus.painLevel}/10
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Phase</p>
                    <p className="text-sm font-bold" style={{ color: PHASE_CONFIG[selectedStatus.phase].color }}>
                      {PHASE_CONFIG[selectedStatus.phase].icon}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Progress</p>
                    <p className="text-lg font-extrabold text-cyan-400" style={{ fontFamily: 'Sora, sans-serif' }}>
                      {selectedStatus.recoveryPercent}%
                    </p>
                  </div>
                </div>

                {/* Log Pain Button */}
                <button
                  onClick={() => { setShowPainLogger(true); setPainValue(selectedStatus.painLevel); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all"
                >
                  <Target size={14} />
                  <span>Log Pain for This Region</span>
                </button>
              </div>

              {/* Science Fact */}
              {scienceFact && (
                <div className="rehab-card rounded-2xl p-5 scroll-reveal">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Info size={14} className="text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">Science of Healing</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{scienceFact}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Exercises */}
              <div className="bento-card rounded-2xl p-5 spotlight-card">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-slate-100">Rehabilitation Exercises</p>
                  <span className="text-[10px] font-bold text-slate-400">{exercises.length} exercises</span>
                </div>
                <div className="space-y-2">
                  {exercises.map((ex, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-all cursor-pointer scroll-reveal stagger-${i + 1}`}
                      onClick={() => navigate("/guided-rehab")}
                    >
                      <span className="text-xl">{ex.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-100">{ex.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{ex.duration}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500 font-bold">{ex.difficulty}</span>
                        </div>
                      </div>
                      <Play size={14} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bento-card rounded-2xl p-8 text-center min-h-[400px] flex flex-col items-center justify-center spotlight-card">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-5 text-4xl healing-pulse">
                🦴
              </div>
              <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-lg font-bold text-slate-200 mb-2">
                Select a Body Region
              </h3>
              <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                Click on any highlighted area on the body map to view detailed recovery information, assigned exercises, and scientific healing facts.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pain Logger Modal */}
      {showPainLogger && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in">
          <div className="bento-card rounded-3xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowPainLogger(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>

            <h3 style={{ fontFamily: 'Sora, sans-serif' }} className="text-lg font-bold text-white mb-1 capitalize">
              Log Pain: {selectedRegion?.replace(/_/g, " ")}
            </h3>
            <p className="text-xs text-slate-400 mb-6">Record your current pain level for better tracking</p>

            <PainSlider value={painValue} onChange={setPainValue} />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPainLogger(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white shine-on-hover transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)', boxShadow: '0 4px 20px rgba(16,185,129,0.25)' }}
              >
                Save Pain Log
              </button>
              <button
                onClick={() => setShowPainLogger(false)}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyMap;
