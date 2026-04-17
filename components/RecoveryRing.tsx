import React from "react";

interface RecoveryRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showOrbit?: boolean;
}

function getAutoColor(pct: number): string {
  if (pct >= 80) return "#10b981";
  if (pct >= 50) return "#06b6d4";
  if (pct >= 25) return "#eab308";
  return "#ef4444";
}

export const RecoveryRing: React.FC<RecoveryRingProps> = ({
  percent,
  size = 120,
  strokeWidth = 8,
  color,
  label = "Recovery",
  showOrbit = true,
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const ringColor = color || getAutoColor(percent);
  const center = size / 2;

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size, height: size }}>
      {/* Orbit dots */}
      {showOrbit && (
        <div
          className="absolute inset-0 progress-orbit"
          style={{ width: size, height: size }}
        >
          {[0, 90, 180, 270].map((deg, i) => (
            <div
              key={deg}
              className="absolute"
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: `${ringColor}${i % 2 === 0 ? "60" : "30"}`,
                top: center + Math.sin((deg * Math.PI) / 180) * (radius + strokeWidth + 4) - 2,
                left: center + Math.cos((deg * Math.PI) / 180) * (radius + strokeWidth + 4) - 2,
              }}
            />
          ))}
        </div>
      )}

      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Glow ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={ringColor}
          strokeWidth={strokeWidth + 6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          opacity={0.15}
          style={{
            filter: `blur(4px)`,
            ["--full" as string]: circumference,
            ["--offset" as string]: offset,
          }}
          className="recovery-ring-animate"
        />
        {/* Main progress ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            ["--full" as string]: circumference,
            ["--offset" as string]: offset,
          }}
          className="recovery-ring-animate"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-extrabold text-white"
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: size * 0.22,
            lineHeight: 1,
          }}
        >
          {Math.round(percent)}%
        </span>
        <span
          className="font-bold text-slate-400 uppercase tracking-widest"
          style={{ fontSize: Math.max(7, size * 0.065) }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

export default RecoveryRing;
