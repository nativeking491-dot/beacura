import React from "react";

interface PainSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  showEmoji?: boolean;
}

const PAIN_EMOJIS = ["😊", "🙂", "😐", "😕", "😣", "😖", "😫", "😰", "🥺", "😭", "🆘"];
const PAIN_LABELS = [
  "No Pain", "Minimal", "Mild", "Uncomfortable", "Moderate",
  "Distracting", "Distressing", "Severe", "Intense", "Excruciating", "Unbearable"
];

function getPainGradientPosition(value: number): string {
  const pct = (value / 10) * 100;
  return `${pct}%`;
}

function getPainColor(value: number): string {
  if (value <= 2) return "#10b981";
  if (value <= 4) return "#84cc16";
  if (value <= 6) return "#eab308";
  if (value <= 8) return "#f97316";
  return "#ef4444";
}

export const PainSlider: React.FC<PainSliderProps> = ({
  value,
  onChange,
  label = "Pain Level",
  showEmoji = true,
}) => {
  const color = getPainColor(value);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-2">
          {showEmoji && (
            <span
              key={value}
              className="text-2xl transition-all duration-300 counter-bounce"
              style={{ display: "inline-block" }}
            >
              {PAIN_EMOJIS[value]}
            </span>
          )}
          <span
            className="text-lg font-extrabold transition-colors duration-300"
            style={{ color, fontFamily: "Sora, sans-serif" }}
          >
            {value}/10
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <div className="pain-track relative rounded-full overflow-hidden">
          {/* Active fill overlay */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-300"
            style={{
              background: `linear-gradient(90deg, ${color}30, transparent)`,
              width: getPainGradientPosition(value),
            }}
          />
          <input
            type="range"
            min={0}
            max={10}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="relative z-10 w-full h-8 -mt-3"
            style={{ marginTop: "-10px" }}
          />
        </div>

        {/* Scale markers */}
        <div className="flex justify-between px-1 mt-1.5">
          {[0, 2, 4, 6, 8, 10].map((n) => (
            <span
              key={n}
              className="text-[9px] font-bold transition-all duration-200"
              style={{
                color: n === value ? color : "#475569",
                transform: n === value ? "scale(1.2)" : "scale(1)",
              }}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Pain label */}
      <div className="text-center mt-2">
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full transition-all duration-300"
          style={{
            color: color,
            background: `${color}15`,
            border: `1px solid ${color}30`,
          }}
        >
          {PAIN_LABELS[value]}
        </span>
      </div>
    </div>
  );
};

export default PainSlider;
