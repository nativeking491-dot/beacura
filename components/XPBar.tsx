import React, { useEffect, useRef } from "react";
import { Shield, Star, Trophy, Crown, Zap } from "lucide-react";

const TIERS = [
  { name: "Newcomer", min: 0, max: 500, icon: Shield, color: "#64748b", gradient: "from-slate-400 to-slate-500" },
  { name: "Committed", min: 500, max: 1500, icon: Star, color: "#f59e0b", gradient: "from-amber-400 to-yellow-500" },
  { name: "Warrior", min: 1500, max: 3000, icon: Zap, color: "#6366f1", gradient: "from-indigo-500 to-violet-600" },
  { name: "Champion", min: 3000, max: 5000, icon: Trophy, color: "#0d9488", gradient: "from-teal-400 to-emerald-500" },
  { name: "Legend", min: 5000, max: 5000, icon: Crown, color: "#ec4899", gradient: "from-pink-500 to-rose-500" },
];

interface XPBarProps {
  points: number;
  className?: string;
}

export const XPBar: React.FC<XPBarProps> = ({ points, className = "" }) => {
  const barRef = useRef<HTMLDivElement>(null);

  const currentTier = TIERS.reduce((acc, t) => (points >= t.min ? t : acc), TIERS[0]);
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
  const isLegend = currentTier.name === "Legend";

  const progress = isLegend
    ? 1
    : Math.min((points - currentTier.min) / (currentTier.max - currentTier.min), 1);

  const TierIcon = currentTier.icon;

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    el.style.width = "0%";
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = "width 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
        el.style.width = `${progress * 100}%`;
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  return (
    <div className={`${className}`}>
      {/* Tier header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentTier.gradient} flex items-center justify-center shadow-md`}
          >
            <TierIcon size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100" style={{ fontFamily: "Sora, sans-serif" }}>
              {currentTier.name}
            </p>
            <p className="text-[10px] text-slate-400">
              {points.toLocaleString()} XP
            </p>
          </div>
        </div>
        {!isLegend && nextTier && (
          <div className="text-right">
            <p className="text-[10px] text-slate-400">Next tier</p>
            <p className="text-xs font-bold" style={{ color: nextTier.color }}>
              {nextTier.name} @ {nextTier.min.toLocaleString()}
            </p>
          </div>
        )}
        {isLegend && (
          <span className="text-xs font-bold text-pink-500">👑 Max Tier</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 opacity-50 z-10"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2.5s linear infinite",
          }}
        />
        <div
          ref={barRef}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier?.color ?? currentTier.color})`,
            boxShadow: `0 0 12px ${currentTier.color}60`,
            width: 0,
          }}
        />
      </div>

      {/* Tier milestones */}
      <div className="flex justify-between mt-1.5">
        {TIERS.filter((t, i) => i < TIERS.length - 1).map((t) => (
          <span
            key={t.name}
            className="text-[9px] font-semibold"
            style={{ color: points >= t.min ? t.color : "#94a3b8" }}
          >
            {t.name[0]}
          </span>
        ))}
        <span className="text-[9px] font-semibold" style={{ color: isLegend ? "#ec4899" : "#94a3b8" }}>
          L
        </span>
      </div>
    </div>
  );
};

export default XPBar;
