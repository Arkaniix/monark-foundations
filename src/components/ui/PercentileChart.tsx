import { useState } from "react";

type HistogramBin = { bin_min: number; bin_max: number; count: number };

type PercentileChartProps = {
  distribution: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  /** Prix demandé. Optionnel : si absent (cas fiche modèle catalogue), pas de marqueur prix ni footer "prix demandé". */
  askPrice?: number;
  color: string;
  observationsLabel?: string;
  /**
   * Position percentile du prix saisi (0-100). Si fourni, affiche un tag
   * coloré "P{N}" dans le footer, à côté du label "prix demandé · X €".
   */
  percentilePosition?: number;
  /** Label en haut du chart. Par défaut : "DISTRIBUTION P10 → P90 · COMPARABLES SOLD". */
  chartTitle?: string;
  /** Paragraphe sous le titre. Par défaut : hint estimator. */
  chartHint?: string;
  /**
   * Histogramme RÉEL des ventes sold (bins contigus {bin_min,bin_max,count}).
   * Si fourni & non-vide, les barres représentent la vraie densité (comptes bruts)
   * et remplacent la gaussienne synthétique. Sinon, fallback gaussien.
   */
  histogram?: HistogramBin[] | null;
};

const GAUSS_BARS = 32;
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
 * Histogramme de distribution des prix sold avec curseur prix saisi.
 * Barres = densité RÉELLE des ventes sold si `histogram` fourni (comptes bruts),
 * sinon gaussienne approximée (fallback fiche catalogue / landing).
 * Composant pur — découplé du domaine.
 */
export default function PercentileChart({
  distribution,
  askPrice,
  color,
  observationsLabel,
  percentilePosition,
  chartTitle = "DISTRIBUTION P10 → P90 · COMPARABLES SOLD",
  chartHint = "Hauteur des barres = densité estimée des ventes sold (gaussienne approximée). Plus haut = plus de transactions à ce prix.",
  histogram,
}: PercentileChartProps) {
  const { p10, p25, p50, p75, p90 } = distribution;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const hasReal = !!histogram && histogram.length > 0;
  const nBars = hasReal ? histogram!.length : GAUSS_BARS;

  const dataMin = hasReal ? histogram![0].bin_min : p10;
  const dataMax = hasReal ? histogram![nBars - 1].bin_max : p90;
  const min = hasReal
    ? Math.min(dataMin, askPrice ?? dataMin)
    : (askPrice !== undefined ? Math.min(p10, askPrice) : p10) * 0.92;
  const max = hasReal
    ? Math.max(dataMax, askPrice ?? dataMax)
    : (askPrice !== undefined ? Math.max(p90, askPrice) : p90) * 1.08;
  const span = max - min || 1;
  const X = (v: number) => ((v - min) / span) * 100;
  const clampX8 = (v: number) => Math.max(0, Math.min(VIEWBOX_W, X(v) * 8));

  const counts: number[] = hasReal
    ? histogram!.map((b) => b.count)
    : Array.from({ length: GAUSS_BARS }, (_, i) => {
        const x = min + (i / GAUSS_BARS) * span;
        const sigma = (p90 - p10) / 2.563 || 1;
        return Math.exp(-Math.pow((x - p50) / sigma, 2) / 2);
      });
  const ymax = Math.max(...counts) || 1;

  const barX = (i: number): number =>
    hasReal ? clampX8(histogram![i].bin_min) : i * (VIEWBOX_W / GAUSS_BARS);
  const barW = (i: number): number =>
    hasReal
      ? Math.max(clampX8(histogram![i].bin_max) - clampX8(histogram![i].bin_min), 0.5)
      : VIEWBOX_W / GAUSS_BARS;

  const markers: [string, number][] = [
    ["P10", p10],
    ["P25", p25],
    ["P50", p50],
    ["P75", p75],
    ["P90", p90],
  ];

  const hoverBin = hoverIdx !== null && hasReal ? histogram![hoverIdx] : null;
  const hoverBarPrice =
    hoverIdx === null
      ? null
      : hasReal
        ? Math.round((histogram![hoverIdx].bin_min + histogram![hoverIdx].bin_max) / 2)
        : Math.round(min + ((hoverIdx + 0.5) / GAUSS_BARS) * span);
  const hoverBarPercentile =
    hoverBarPrice !== null
      ? computePercentileForPrice(hoverBarPrice, p10, p25, p50, p75, p90)
      : null;

  const hoverXFraction = hoverIdx !== null ? (hoverIdx + 0.5) / nBars : 0;
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
          {chartTitle}
        </div>
        {observationsLabel && (
          <div className="font-mono text-[10px] text-zinc-500">
            {observationsLabel}
          </div>
        )}
      </div>
      <p className="text-[10.5px] text-zinc-600 leading-snug mb-3 max-w-[640px]">
        {chartHint}
      </p>

      <div className="relative h-48" onMouseLeave={() => setHoverIdx(null)}>
        <svg
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          className="w-full h-full"
          preserveAspectRatio="none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relativeX = (e.clientX - rect.left) / rect.width;
            if (relativeX < 0 || relativeX > 1) return;
            const idx = Math.floor(relativeX * nBars);
            setHoverIdx(Math.max(0, Math.min(nBars - 1, idx)));
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
          {counts.map((y, i) => {
            const h = (y / ymax) * PLOT_H;
            const isHovered = hoverIdx === i;
            return (
              <rect
                key={i}
                x={barX(i) + 1}
                y={TOP_PAD + (PLOT_H - h)}
                width={Math.max(barW(i) - 2, 0.5)}
                height={h}
                fill={isHovered ? "url(#dist-grad-hover)" : "url(#dist-grad)"}
              />
            );
          })}
          {markers.map(([lbl, v]) => (
            <g key={lbl}>
              <line
                x1={clampX8(v)}
                x2={clampX8(v)}
                y1={TOP_PAD - 4}
                y2={VIEWBOX_H - BOTTOM_PAD + 4}
                stroke="#fafafa"
                strokeOpacity="0.18"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text
                x={clampX8(v)}
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
          {askPrice !== undefined && (
            <>
              <line
                x1={clampX8(askPrice)}
                x2={clampX8(askPrice)}
                y1={TOP_PAD - 18}
                y2={VIEWBOX_H - BOTTOM_PAD + 8}
                stroke={color}
                strokeWidth="1.8"
              />
              <circle cx={clampX8(askPrice)} cy={TOP_PAD - 18} r="4.5" fill={color} />
            </>
          )}
        </svg>

        {hoverIdx !== null && hoverBarPrice !== null && (
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
            {hasReal && hoverBin ? (
              <>
                <span className="text-[11px] text-zinc-100 font-medium">
                  {hoverBin.count} {hoverBin.count > 1 ? "ventes" : "vente"}
                </span>
                <span className="text-[10px] text-zinc-500"> · </span>
                <span className="text-[10px] text-zinc-400">
                  {Math.round(hoverBin.bin_min)}–{Math.round(hoverBin.bin_max)} €
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] text-zinc-500">autour de </span>
                <span className="text-[11px] text-zinc-100 font-medium">
                  {hoverBarPrice} €
                </span>
                <span className="text-[10px] text-zinc-500"> · </span>
                <span className="text-[11px]" style={{ color }}>
                  P{hoverBarPercentile}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-zinc-500">
        <span>{hasReal ? Math.round(min) : p10} €</span>
        {askPrice !== undefined ? (
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
        ) : (
          <span className="text-zinc-500">médiane · {p50} €</span>
        )}
        <span>{hasReal ? Math.round(max) : p90} €</span>
      </div>
    </div>
  );
}

export { PercentileChart };