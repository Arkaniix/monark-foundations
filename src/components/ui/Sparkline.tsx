type SparklineProps = {
  points: number[];
  color?: string;
  w?: number;
  h?: number;
  fill?: boolean;
};

export function Sparkline({
  points,
  color = "#10B981",
  w = 60,
  h = 18,
  fill = false,
}: SparklineProps) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const area = fill ? `${path} L${w},${h} L0,${h} Z` : null;

  return (
    <svg width={w} height={h} className="overflow-visible">
      {fill && area && <path d={area} fill={color} fillOpacity="0.15" />}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Sparkline;