import { useState } from "react";

type PercentileChartProps = {
  distribution: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  askPrice: number;
  color: string;
  observationsLabel?: string;
  /**
   * Position percentile du prix saisi (0-100). Si fourni, affiche un tag
   * coloré "P{N}" dans le footer, à côté du label "prix demandé · X €".
   */
  percentilePosition?: number;
};

const BARS = 32;
const VIEWBOX_W = 800;
const VIEWBOX_H = 180;
const TOP_PAD = 26;
const BOTTOM_PAD = 24;
const PLOT_H = VIEWBOX_H - TOP_PAD - BOTTOM_PAD;

function computePercentileForPrice(
  price: number,
  p10: number,
  p25: number,
  p50: number,
  p75: number,
  p90: number,
): number {
  const pts: [number, number][] = [
    [p10, 10],
    [p25, 25],
    [p50, 50],
    [p75, 75],
    [p90, 90],
  ];
  if (price <= p10) return 5;
  if (price >= p90) return 95;
  for (let i = 0; i < pts.length - 1; i++) {
    const [v1, r1] = pts[i];
    const [v2, r2] = pts[i + 1];
    if (price >= v1 && price <= v2) {
      return Math.round(r1 + ((price - v1) / (v2 - v1)) * (r2 - r1));
    }
  }
  return 50;
}

/**
 * Histogramme de distribution P10 → P90 avec curseur prix saisi.
 * E2.2 : viewBox plus haut, hover interactif sur barres, tag percentile,
 * légende axe Y. Composant pur — découplé du domaine.
 */
export default function PercentileChart({
  distribution,
  askPrice,
  color,
  observationsLabel,
  percentilePosition,
}: PercentileChartProps) {
  const { p10, p25, p50, p75, p90 } = distribution;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const min = Math.min(p10, askPrice) * 0.92;
  const max = Math.max(p90, askPrice) * 1.08;
  const X = (v: number) => ((v - min) / (max - min)) * 100;

  const points: number[] = [];
  for (let i = 0; i < BARS; i++) {
    const x = min + (i / BARS) * (max - min);
    const sigma = (p90 - p10) / 2.563;
    const y = Math.exp(-Math.pow((x - p50) / sigma, 2) / 2);
    points.push(y);
  }
  const ymax = Math.max(...points);
  const markers: [string, number][] = [
    ["P10", p10],
    ["P25", p25],
    ["P50", p50],
    ["P75", p75],
    ["P90", p90],
  ];

  const hoverBarPrice =
    hoverIdx !== null
      ? Math.round(min + ((hoverIdx + 0.5) / BARS) * (max - min))
      : null;
  const hoverBarPercentile =
    hoverBarPrice !== null
      ? computePercentileForPrice(hoverBarPrice, p10, p25, p50, p75, p90)
      : null;

  const hoverXFraction = hoverIdx !== null ? (hoverIdx + 0.5) / BARS : 0;
  const hoverTransform =
    hoverXFraction > 0.78
      ? "translate(-100%, 0)"
      : hoverXFraction < 0.22
        ? "translate(0, 0)"
        : "translate(-50%, 0)";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-mono text-[10px] tracking-wider text-zinc-500">
          DISTRIBUTION P10 → P90 · COMPARABLES SOLD
        </div>
        {observationsLabel && (
          <div className="font-mono text-[10px] text-zinc-500">
            {observationsLabel}
          </div>
        )}
      </div>
      <p className="text-[10.5px] text-zinc-600 leading-snug mb-3 max-w-[640px]">
        Hauteur des barres = densité estimée des ventes sold (gaussienne
        approximée). Plus haut = plus de transactions à ce prix.
      </p>

      <div
        className="relative h-48"
        onMouseLeave={() => setHoverIdx(null)}
      >
        <svg
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          className="w-full h-full"
          preserveAspectRatio="none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relativeX = (e.clientX - rect.left) / rect.width;
            if (relativeX < 0 || relativeX > 1) return;
            const idx = Math.floor(relativeX * BARS);
            setHoverIdx(Math.max(0, Math.min(BARS - 1, idx)));
          }}
          style={{ cursor: "crosshair" }}
        >
          <defs>
            <linearGradient id="dist-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#3B82F6" stopOpacity="0.45" />
              <stop offset="1" stopColor="#3B82F6" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="dist-grad-hover" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#3B82F6" stopOpacity="0.85" />
              <stop offset="1" stopColor="#3B82F6" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {points.map((y, i) => {
            const h = (y / ymax) * PLOT_H;
            const isHovered = hoverIdx === i;
            return (
              <rect
                key={i}
                x={i * (VIEWBOX_W / BARS) + 1}
                y={TOP_PAD + (PLOT_H - h)}
                width={VIEWBOX_W / BARS - 2}
                height={h}
                fill={isHovered ? "url(#dist-grad-hover)" : "url(#dist-grad)"}
              />
            );
          })}
          {markers.map(([lbl, v]) => (
            <g key={lbl}>
              <line
                x1={X(v) * 8}
                x2={X(v) * 8}
                y1={TOP_PAD - 4}
                y2={VIEWBOX_H - BOTTOM_PAD + 4}
                stroke="#fafafa"
                strokeOpacity="0.18"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text
                x={X(v) * 8}
                y={TOP_PAD - 10}
                textAnchor="middle"
                fontSize="11"
                fontFamily="JetBrains Mono"
                fill="#a1a1aa"
              >
                {lbl}
              </text>
            </g>
          ))}
          <line
            x1={X(askPrice) * 8}
            x2={X(askPrice) * 8}
            y1={TOP_PAD - 18}
            y2={VIEWBOX_H - BOTTOM_PAD + 8}
            stroke={color}
            strokeWidth="1.8"
          />
          <circle cx={X(askPrice) * 8} cy={TOP_PAD - 18} r="4.5" fill={color} />
        </svg>

        {hoverIdx !== null && hoverBarPrice !== null && hoverBarPercentile !== null && (
          <div
            className="absolute pointer-events-none rounded-md px-2.5 py-1.5"
            style={{
              left: `${hoverXFraction * 100}%`,
              top: 4,
              transform: hoverTransform,
              background: "#0A0A0B",
              border: "0.5px solid rgba(250,250,250,0.22)",
              fontFamily: "JetBrains Mono, monospace",
              whiteSpace: "nowrap",
              zIndex: 20,
            }}
          >
            <span className="text-[10px] text-zinc-500">autour de </span>
            <span className="text-[11px] text-zinc-100 font-medium">
              {hoverBarPrice} €
            </span>
            <span className="text-[10px] text-zinc-500"> · </span>
            <span className="text-[11px]" style={{ color }}>
              P{hoverBarPercentile}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-zinc-500">
        <span>{p10} €</span>
        <span className="flex items-center gap-2" style={{ color }}>
          prix demandé · {askPrice} €
          {percentilePosition !== undefined && (
            <span
              className="px-1.5 py-0.5 rounded text-[9.5px]"
              style={{
                color,
                border: `0.5px solid ${color}`,
                background: `${color}14`,
              }}
            >
              P{percentilePosition}
            </span>
          )}
        </span>
        <span>{p90} €</span>
      </div>
    </div>
  );
}

export { PercentileChart };
