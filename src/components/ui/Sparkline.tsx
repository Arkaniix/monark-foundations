import { useState } from "react";
import { useInView } from "@/hooks/useInView";

type SparklineProps = {
  points: number[];
  color?: string;
  w?: number;
  h?: number;
  fillHeight?: boolean;
  fill?: boolean;
  animate?: boolean;
  delay?: number;
  hover?: boolean;
  unit?: string;
};

const TRACE_DURATION_MS = 3000;
const FILL_FADE_DURATION_MS = 600;
const FILL_FADE_DELAY_MS = 1500;
const EASING = "cubic-bezier(0.16,1,0.3,1)";

const DAYS_FR = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
const MONTHS_FR = [
  "jan", "fév", "mar", "avr", "mai", "jun",
  "jui", "aoû", "sep", "oct", "nov", "déc",
];

function formatDateFR(date: Date): string {
  return `${DAYS_FR[date.getDay()]} ${date.getDate()} ${MONTHS_FR[date.getMonth()]}`;
}

function dateForIndex(index: number, totalPoints: number): Date {
  const daysAgo = totalPoints - 1 - index;
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

type HoverState = {
  idx: number;
  xPct: number;
  yPct: number;
};

export function Sparkline({
  points,
  color = "#10B981",
  w = 320,
  h = 28,
  fillHeight = false,
  fill = false,
  animate = true,
  delay = 0,
  hover = false,
  unit = " €",
}: SparklineProps) {
  const [ref, seen] = useInView(0.25);
  const playing = animate ? seen : true;
  const [hoverState, setHoverState] = useState<HoverState | null>(null);

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * w,
    y: h - ((p - min) / range) * h,
    value: p,
  }));

  const path = coords
    .map((c, i) =>
      i === 0
        ? `M ${c.x.toFixed(2)},${c.y.toFixed(2)}`
        : `L ${c.x.toFixed(2)},${c.y.toFixed(2)}`,
    )
    .join(" ");
  const area = fill ? `${path} L ${w},${h} L 0,${h} Z` : null;

  const hoverEnabled = hover && playing;

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xFraction = (e.clientX - rect.left) / rect.width;
    if (xFraction < 0 || xFraction > 1) return;
    const idx = Math.max(
      0,
      Math.min(points.length - 1, Math.round(xFraction * (points.length - 1))),
    );
    const pointXPct = (coords[idx].x / w) * 100;
    const pointYPct = (coords[idx].y / h) * 100;
    setHoverState({ idx, xPct: pointXPct, yPct: pointYPct });
  };

  const handleLeave = () => setHoverState(null);

  let tooltipNode: React.ReactNode = null;
  let dotNode: React.ReactNode = null;
  let crosshairNode: React.ReactNode = null;

  if (hoverState) {
    const date = dateForIndex(hoverState.idx, points.length);
    const dateLabel = formatDateFR(date);
    const currentValue = coords[hoverState.idx].value;
    const price = Math.round(currentValue);
    const prevValue =
      hoverState.idx > 0 ? coords[hoverState.idx - 1].value : null;
    const deltaPct =
      prevValue !== null && prevValue !== 0
        ? ((currentValue - prevValue) / prevValue) * 100
        : null;

    const deltaColor =
      deltaPct === null ? "#71717a" : deltaPct >= 0 ? "#10B981" : "#EF4444";
    const deltaLabel =
      deltaPct === null
        ? "—"
        : `${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(1)}%`;

    const inRightHalf = hoverState.xPct > 60;
    const inTopHalf = hoverState.yPct < 50;

    const tooltipStyle: React.CSSProperties = {
      position: "absolute",
      left: `${hoverState.xPct}%`,
      top: `${hoverState.yPct}%`,
      transform: `translate(${inRightHalf ? "calc(-100% - 10px)" : "10px"}, ${inTopHalf ? "10px" : "calc(-100% - 10px)"})`,
      background: "#0A0A0B",
      border: "0.5px solid rgba(250,250,250,0.22)",
      borderRadius: "6px",
      padding: "8px 10px",
      fontFamily: "JetBrains Mono, monospace",
      pointerEvents: "none",
      zIndex: 20,
      whiteSpace: "nowrap",
      minWidth: "120px",
    };

    tooltipNode = (
      <div style={tooltipStyle}>
        <div style={{ fontSize: 11, color: "#a1a1aa" }}>{dateLabel}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#fafafa", marginTop: 2 }}>
          {price}
          {unit}
        </div>
        <div style={{ fontSize: 11, color: deltaColor, marginTop: 2 }}>
          {deltaLabel}
          {deltaPct !== null && (
            <span style={{ color: "#52525b" }}> vs veille</span>
          )}
        </div>
      </div>
    );

    dotNode = (
      <div
        style={{
          position: "absolute",
          left: `${hoverState.xPct}%`,
          top: `${hoverState.yPct}%`,
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 15,
        }}
      />
    );

    crosshairNode = (
      <div
        style={{
          position: "absolute",
          left: `${hoverState.xPct}%`,
          top: 0,
          bottom: 0,
          width: 0,
          borderLeft: "1px dashed rgba(250,250,250,0.25)",
          transform: "translateX(-0.5px)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
    );
  }

  return (
    <div
      ref={ref as unknown as React.RefObject<HTMLDivElement>}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        position: "relative",
        width: "100%",
        height: fillHeight ? "100%" : h,
        cursor: hoverEnabled ? "crosshair" : "default",
      }}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        className="overflow-visible"
        style={{ display: "block" }}
      >
        {fill && area && (
          <path
            d={area}
            fill={color}
            fillOpacity="0.15"
            style={{
              opacity: playing ? 1 : 0,
              transition: animate
                ? `opacity ${FILL_FADE_DURATION_MS}ms ${EASING} ${delay + FILL_FADE_DELAY_MS}ms`
                : undefined,
            }}
          />
        )}
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={animate ? DASH_LENGTH : undefined}
          strokeDashoffset={animate ? (playing ? 0 : DASH_LENGTH) : 0}
          vectorEffect="non-scaling-stroke"
          style={{
            transition: animate
              ? `stroke-dashoffset ${TRACE_DURATION_MS}ms ${EASING} ${delay}ms`
              : undefined,
          }}
        />
      </svg>
      {crosshairNode}
      {dotNode}
      {tooltipNode}
    </div>
  );
}

export default Sparkline;
