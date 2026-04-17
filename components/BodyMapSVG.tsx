import React, { useState } from "react";
import type { BodyRegion, BodyRegionStatus } from "../types";

interface BodyMapSVGProps {
  regions?: BodyRegionStatus[];
  selectedRegion?: BodyRegion | null;
  onRegionClick?: (region: BodyRegion) => void;
  size?: number;
  showLabels?: boolean;
}

const REGION_CONFIG: Record<BodyRegion, { cx: number; cy: number; rx: number; ry: number; label: string }> = {
  head:            { cx: 150, cy: 38,  rx: 22, ry: 26, label: "Head" },
  neck:            { cx: 150, cy: 72,  rx: 12, ry: 10, label: "Neck" },
  left_shoulder:   { cx: 112, cy: 100, rx: 20, ry: 14, label: "L Shoulder" },
  right_shoulder:  { cx: 188, cy: 100, rx: 20, ry: 14, label: "R Shoulder" },
  chest:           { cx: 150, cy: 120, rx: 30, ry: 18, label: "Chest" },
  left_elbow:      { cx: 88,  cy: 155, rx: 12, ry: 14, label: "L Elbow" },
  right_elbow:     { cx: 212, cy: 155, rx: 12, ry: 14, label: "R Elbow" },
  upper_back:      { cx: 150, cy: 140, rx: 28, ry: 16, label: "Upper Back" },
  abdomen:         { cx: 150, cy: 170, rx: 26, ry: 20, label: "Abdomen" },
  lower_back:      { cx: 150, cy: 195, rx: 26, ry: 16, label: "Lower Back" },
  left_wrist:      { cx: 72,  cy: 200, rx: 10, ry: 10, label: "L Wrist" },
  right_wrist:     { cx: 228, cy: 200, rx: 10, ry: 10, label: "R Wrist" },
  left_hip:        { cx: 125, cy: 225, rx: 18, ry: 14, label: "L Hip" },
  right_hip:       { cx: 175, cy: 225, rx: 18, ry: 14, label: "R Hip" },
  left_knee:       { cx: 125, cy: 295, rx: 14, ry: 16, label: "L Knee" },
  right_knee:      { cx: 175, cy: 295, rx: 14, ry: 16, label: "R Knee" },
  left_ankle:      { cx: 120, cy: 370, rx: 10, ry: 12, label: "L Ankle" },
  right_ankle:     { cx: 180, cy: 370, rx: 10, ry: 12, label: "R Ankle" },
};

function getPainColor(painLevel: number): string {
  if (painLevel <= 2) return "#10b981"; // green
  if (painLevel <= 4) return "#84cc16"; // lime
  if (painLevel <= 6) return "#eab308"; // yellow
  if (painLevel <= 8) return "#f97316"; // orange
  return "#ef4444"; // red
}

function getRecoveryColor(pct: number): string {
  if (pct >= 80) return "#10b981";
  if (pct >= 50) return "#06b6d4";
  if (pct >= 25) return "#eab308";
  return "#ef4444";
}

export const BodyMapSVG: React.FC<BodyMapSVGProps> = ({
  regions = [],
  selectedRegion = null,
  onRegionClick,
  size = 400,
  showLabels = false,
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<BodyRegion | null>(null);

  const getRegionStatus = (region: BodyRegion): BodyRegionStatus | undefined => {
    return regions.find(r => r.region === region);
  };

  const getRegionFill = (region: BodyRegion): string => {
    const status = getRegionStatus(region);
    if (!status) return "rgba(139, 92, 246, 0.15)";
    return getPainColor(status.painLevel) + "40"; // add alpha
  };

  const getRegionStroke = (region: BodyRegion): string => {
    const status = getRegionStatus(region);
    if (!status) return "rgba(139, 92, 246, 0.3)";
    return getPainColor(status.painLevel);
  };

  const getRegionClass = (region: BodyRegion): string => {
    const status = getRegionStatus(region);
    let cls = "body-region";
    if (selectedRegion === region) cls += " active";
    if (status) {
      if (status.painLevel >= 7) cls += " injured";
      else if (status.painLevel >= 3) cls += " recovering";
      else cls += " healthy";
    }
    return cls;
  };

  const scale = size / 300;

  return (
    <div className="relative" style={{ width: size, height: size * 1.35 }}>
      <svg
        viewBox="0 0 300 405"
        width={size}
        height={size * 1.35}
        className="mx-auto"
      >
        {/* Background body silhouette */}
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(139,92,246,0.08)" />
            <stop offset="100%" stopColor="rgba(16,185,129,0.05)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Body silhouette path */}
        <path
          d="M150,10 C165,10 175,25 175,40 C175,55 165,65 150,68 C135,65 125,55 125,40 C125,25 135,10 150,10 Z
             M150,68 L150,75 
             M130,80 C110,82 95,90 90,105 C85,120 80,140 75,165 C70,185 65,200 60,215
             M170,80 C190,82 205,90 210,105 C215,120 220,140 225,165 C230,185 235,200 240,215
             M130,80 L120,225 L115,280 L120,340 L115,380 L125,380 L130,340 L135,280 L140,240
             M170,80 L180,225 L185,280 L180,340 L185,380 L175,380 L170,340 L165,280 L160,240"
          fill="none"
          stroke="rgba(139,92,246,0.12)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Skeleton outline */}
        <g opacity="0.06">
          {/* Spine */}
          <line x1="150" y1="72" x2="150" y2="220" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,3" />
          {/* Ribs */}
          {[100, 115, 130, 145].map(y => (
            <React.Fragment key={y}>
              <line x1="120" y1={y} x2="150" y2={y-3} stroke="#8b5cf6" strokeWidth="1" />
              <line x1="150" y1={y-3} x2="180" y2={y} stroke="#8b5cf6" strokeWidth="1" />
            </React.Fragment>
          ))}
          {/* Pelvis */}
          <ellipse cx="150" cy="220" rx="35" ry="12" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
        </g>

        {/* Nerve pathways with animated flow */}
        <g opacity="0.15">
          <path d="M150,72 L150,100 L112,100" stroke="#06b6d4" strokeWidth="1" fill="none" className="nerve-flow" />
          <path d="M150,72 L150,100 L188,100" stroke="#06b6d4" strokeWidth="1" fill="none" className="nerve-flow" style={{ animationDelay: "0.3s" }} />
          <path d="M150,170 L125,225 L125,295" stroke="#06b6d4" strokeWidth="1" fill="none" className="nerve-flow" style={{ animationDelay: "0.6s" }} />
          <path d="M150,170 L175,225 L175,295" stroke="#06b6d4" strokeWidth="1" fill="none" className="nerve-flow" style={{ animationDelay: "0.9s" }} />
        </g>

        {/* Interactive regions */}
        {(Object.entries(REGION_CONFIG) as [BodyRegion, typeof REGION_CONFIG[BodyRegion]][]).map(([region, cfg]) => {
          const isSelected = selectedRegion === region;
          const isHovered = hoveredRegion === region;
          const status = getRegionStatus(region);

          return (
            <g key={region}>
              {/* Glow background */}
              {(isSelected || isHovered || (status && status.painLevel > 0)) && (
                <ellipse
                  cx={cfg.cx}
                  cy={cfg.cy}
                  rx={cfg.rx + 6}
                  ry={cfg.ry + 6}
                  fill={getRegionStroke(region)}
                  opacity={isSelected ? 0.25 : isHovered ? 0.15 : 0.08}
                  className="anatomy-highlight"
                />
              )}

              {/* Main region */}
              <ellipse
                cx={cfg.cx}
                cy={cfg.cy}
                rx={cfg.rx}
                ry={cfg.ry}
                fill={getRegionFill(region)}
                stroke={getRegionStroke(region)}
                strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                className={getRegionClass(region)}
                onClick={() => onRegionClick?.(region)}
                onMouseEnter={() => setHoveredRegion(region)}
                onMouseLeave={() => setHoveredRegion(null)}
                style={{ cursor: "pointer" }}
                filter={isSelected ? "url(#glow)" : undefined}
              />

              {/* Label */}
              {(showLabels || isHovered || isSelected) && (
                <text
                  x={cfg.cx}
                  y={cfg.cy + cfg.ry + 12}
                  textAnchor="middle"
                  fill={isSelected ? "#c4b5fd" : "#94a3b8"}
                  fontSize="8"
                  fontWeight="700"
                  fontFamily="Sora, sans-serif"
                  className="pointer-events-none"
                  style={{ opacity: isHovered || isSelected ? 1 : 0.6, transition: "opacity 0.3s" }}
                >
                  {cfg.label}
                </text>
              )}

              {/* Pain indicator dot */}
              {status && status.painLevel > 0 && (
                <circle
                  cx={cfg.cx + cfg.rx - 2}
                  cy={cfg.cy - cfg.ry + 2}
                  r="4"
                  fill={getPainColor(status.painLevel)}
                  stroke="#070711"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
              )}
            </g>
          );
        })}

        {/* Tooltip for hovered region */}
        {hoveredRegion && (() => {
          const cfg = REGION_CONFIG[hoveredRegion];
          const status = getRegionStatus(hoveredRegion);
          const tooltipY = cfg.cy - cfg.ry - 28;
          return (
            <g className="pointer-events-none">
              <rect
                x={cfg.cx - 50}
                y={tooltipY - 4}
                width="100"
                height="22"
                rx="6"
                fill="rgba(7,7,17,0.9)"
                stroke="rgba(139,92,246,0.3)"
                strokeWidth="1"
              />
              <text
                x={cfg.cx}
                y={tooltipY + 11}
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="9"
                fontWeight="600"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                {cfg.label} {status ? `• Pain: ${status.painLevel}/10` : "• No data"}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
};

export default BodyMapSVG;
