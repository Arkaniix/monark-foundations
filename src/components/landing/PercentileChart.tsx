import type { EstimatorResult } from "./estimator";

type Props = { p: EstimatorResult; askPrice: number; color: string };

export default function PercentileChart({ p, askPrice, color }: Props) {
  const min = Math.min(p.p10, askPrice) * 0.92;
  const max = Math.max(p.p90, askPrice) * 1.08;
  const X = (v: number) => ((v - min) / (max - min)) * 100;
  const bars = 32;
  const points: number[] = [];
  for (let i = 0; i < bars; i++) {
    const x = min + (i / bars) * (max - min);
    const sigma = (p.p90 - p.p10) / 2.563;
    const y = Math.exp(-Math.pow((x - p.p50) / sigma, 2) / 2);
    points.push(y);
  }
  const ymax = Math.max(...points);
  const markers: [string, number][] = [
    ["P10", p.p10], ["P25", p.p25], ["P50", p.p50], ["P75", p.p75], ["P90", p.p90],
  ];
  return (
    <div className="mk-subcard-soft p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[10px] tracking-wider text-zinc-500">DISTRIBUTION P10 → P90 · COMPARABLES SOLD</div>
        <div className="font-mono text-[10px] text-zinc-500">412 obs</div>
      </div>
      <div className="relative h-32">
        <svg viewBox="0 0 400 124" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="dist-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#3B82F6" stopOpacity="0.45" />
              <stop offset="1" stopColor="#3B82F6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {points.map((y, i) => {
            const h = (y / ymax) * 92;
            return <rect key={i} x={i * (400 / bars) + 1} y={114 - h} width={(400 / bars) - 2} height={h} fill="url(#dist-grad)" />;
          })}
          {markers.map(([lbl, v]) => (
            <g key={lbl}>
              <line x1={X(v) * 4} x2={X(v) * 4} y1="20" y2="114" stroke="#fafafa" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="2 2" />
              <text x={X(v) * 4} y="14" textAnchor="middle" fontSize="7" fontFamily="JetBrains Mono" fill="#71717A">{lbl}</text>
            </g>
          ))}
          <line x1={X(askPrice) * 4} x2={X(askPrice) * 4} y1="14" y2="122" stroke={color} strokeWidth="1.6" />
          <circle cx={X(askPrice) * 4} cy="14" r="3.5" fill={color} />
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-zinc-500">
        <span>{p.p10} €</span>
        <span style={{ color }}>prix demandé · {askPrice} €</span>
        <span>{p.p90} €</span>
      </div>
    </div>
  );
}