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
};

/**
 * Histogramme de distribution P10 → P90 avec curseur prix saisi.
 * Composant pur — promu depuis landing/ en E2.
 */
export default function PercentileChart({
  distribution,
  askPrice,
  color,
  observationsLabel,
}: PercentileChartProps) {
  const { p10, p25, p50, p75, p90 } = distribution;
  const min = Math.min(p10, askPrice) * 0.92;
  const max = Math.max(p90, askPrice) * 1.08;
  const X = (v: number) => ((v - min) / (max - min)) * 100;
  const bars = 32;
  const points: number[] = [];
  for (let i = 0; i < bars; i++) {
    const x = min + (i / bars) * (max - min);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[10px] tracking-wider text-zinc-500">
          DISTRIBUTION P10 → P90 · COMPARABLES SOLD
        </div>
        {observationsLabel && (
          <div className="font-mono text-[10px] text-zinc-500">
            {observationsLabel}
          </div>
        )}
      </div>
      <div className="relative h-32">
        <svg viewBox="0 0 800 124" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="dist-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#3B82F6" stopOpacity="0.45" />
              <stop offset="1" stopColor="#3B82F6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {points.map((y, i) => {
            const h = (y / ymax) * 92;
            return (
              <rect
                key={i}
                x={i * (800 / bars) + 1}
                y={114 - h}
                width={800 / bars - 2}
                height={h}
                fill="url(#dist-grad)"
              />
            );
          })}
          {markers.map(([lbl, v]) => (
            <g key={lbl}>
              <line
                x1={X(v) * 8}
                x2={X(v) * 8}
                y1="20"
                y2="114"
                stroke="#fafafa"
                strokeOpacity="0.18"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text
                x={X(v) * 8}
                y="14"
                textAnchor="middle"
                fontSize="7"
                fontFamily="JetBrains Mono"
                fill="#71717A"
              >
                {lbl}
              </text>
            </g>
          ))}
          <line
            x1={X(askPrice) * 8}
            x2={X(askPrice) * 8}
            y1="14"
            y2="122"
            stroke={color}
            strokeWidth="1.6"
          />
          <circle cx={X(askPrice) * 8} cy="14" r="3.5" fill={color} />
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-zinc-500">
        <span>{p10} €</span>
        <span style={{ color }}>prix demandé · {askPrice} €</span>
        <span>{p90} €</span>
      </div>
    </div>
  );
}

export { PercentileChart };
