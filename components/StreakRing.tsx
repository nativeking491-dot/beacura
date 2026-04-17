import React, { useEffect, useRef } from "react";

interface StreakRingProps {
  streak: number;
  maxDays?: number;
  size?: number;
  className?: string;
}

const getMilestoneColor = (streak: number): { stroke: string; glow: string; text: string } => {
  if (streak >= 90) return { stroke: "#8b5cf6", glow: "rgba(139,92,246,0.5)", text: "text-violet-500" };
  if (streak >= 60) return { stroke: "#ec4899", glow: "rgba(236,72,153,0.5)", text: "text-pink-500" };
  if (streak >= 30) return { stroke: "#f97316", glow: "rgba(249,115,22,0.5)", text: "text-orange-500" };
  if (streak >= 14) return { stroke: "#0d9488", glow: "rgba(13,148,136,0.5)", text: "text-teal-600" };
  if (streak >= 7) return { stroke: "#f59e0b", glow: "rgba(245,158,11,0.5)", text: "text-amber-500" };
  if (streak >= 3) return { stroke: "#6366f1", glow: "rgba(99,102,241,0.5)", text: "text-indigo-500" };
  return { stroke: "#10b981", glow: "rgba(16,185,129,0.5)", text: "text-emerald-500" };
};

export const StreakRing: React.FC<StreakRingProps> = ({
  streak,
  maxDays = 90,
  size = 80,
  className = "",
}) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const { stroke, glow, text } = getMilestoneColor(streak);

  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(streak / maxDays, 1);
  const dashOffset = circumference * (1 - progress);

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    // Animate from 0 to current progress
    el.style.strokeDashoffset = `${circumference}`;
    el.style.transition = "none";
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)";
        el.style.strokeDashoffset = `${dashOffset}`;
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [streak, dashOffset, circumference]);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Glow backdrop */}
      <div
        className="absolute inset-0 rounded-full blur-md opacity-60 animate-pulse"
        style={{ background: glow, transform: "scale(0.85)" }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative z-10 -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          className="text-slate-100 dark:text-slate-800"
        />
        {/* Progress arc */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            filter: `drop-shadow(0 0 6px ${glow})`,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span
          className={`font-extrabold leading-none ${text}`}
          style={{ fontFamily: "Sora, sans-serif", fontSize: size * 0.24 }}
        >
          {streak}
        </span>
        <span
          className="text-slate-400 leading-none"
          style={{ fontSize: size * 0.105 }}
        >
          days
        </span>
      </div>
    </div>
  );
};

export default StreakRing;
