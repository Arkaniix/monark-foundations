import { useState } from "react";
import { useInView } from "@/hooks/useInView";

type SparklineProps = {
  points: number[];
  color?: string;
  /**
   * Largeur de référence du viewBox SVG. Le SVG est rendu en width="100%"
   * et s'étire horizontalement. Cette valeur sert seulement à fixer la
   * résolution interne du viewBox.
   */
  w?: number;
  /**
   * Hauteur de référence du viewBox SVG.
   *
   * Si `fillHeight=false` (default) : le SVG est rendu à `height={h}` en
   * pixels absolus (mode legacy pour les stat tiles §01).
   *
   * Si `fillHeight=true` : le SVG est rendu en `height="100%"` et remplit
   * son conteneur parent. Le ratio est défini par l'`aspect-ratio` CSS
   * du conteneur (ex. wrapper `aspect-ratio: 9/1` dans WatchlistPreview).
   * Le viewBox reste `w × h` en unités virtuelles.
   */
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
const DASH_LENGTH = 500;

const TOOLTIP_W = 150;
const TOOLTIP_H = 64;
const TOOLTIP_OFFSET = 10;
const TOOLTIP_PAD_X = 10;
const TOOLTIP_PAD_TOP = 16;
const TOOLTIP_LINE_GAP = 17;

const DAYS_FR = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
const MONTHS_FR = [
  "jan",
  "fév",
  "mar",
  "avr",
  "mai",
  "jun",
  "jui",
  "aoû",
  "sep",
  "oct",
  "nov",
  "déc",
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

function computeTooltipPosition(
  pointX: number,
  pointY: number,
  svgW: number,
): { x: number; y: number } {
  const rightX = pointX + TOOLTIP_OFFSET;
  const leftX = pointX - TOOLTIP_OFFSET - TOOLTIP_W;
  const aboveY = pointY - TOOLTIP_OFFSET - TOOLTIP_H;

  const fitsRight = rightX + TOOLTIP_W <= svgW;

  if (fitsRight) return { x: rightX, y: aboveY };
  return { x: Math.max(0, leftX), y: aboveY };
}

type HoverState = {
  idx: number;
  x: number;
  y: number;
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

  const path = `M ${coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ")}`;
  const area = fill ? `${path} L${w},${h} L0,${h} Z` : null;

  const hoverEnabled = hover && playing;

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!hoverEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * w;
    const idx = Math.max(
      0,
      Math.min(
        points.length - 1,
        Math.round((relativeX / w) * (points.length - 1)),
      ),
    );
    setHoverState({ idx, x: coords[idx].x, y: coords[idx].y });
  };

  const handleLeave = () => {
    setHoverState(null);
  };

  let tooltipNode: React.ReactNode = null;
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

    const { x: tx, y: ty } = computeTooltipPosition(
      hoverState.x,
      hoverState.y,
      w,
    );

    const deltaColor =
      deltaPct === null
        ? "#71717a"
        : deltaPct >= 0
          ? "#10B981"
          : "#EF4444";
    const deltaLabel =
      deltaPct === null
        ? "—"
        : `${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(1)}%`;

    tooltipNode = (
      <g style={{ pointerEvents: "none" }}>
        <line
          x1={hoverState.x}
          y1={0}
          x2={hoverState.x}
          y2={h}
          stroke="#fafafa"
          strokeOpacity="0.25"
          strokeDasharray="2 2"
          strokeWidth="0.6"
        />
        <circle cx={hoverState.x} cy={hoverState.y} r={2.6} fill={color} />
        <rect
          x={tx}
          y={ty}
          width={TOOLTIP_W}
          height={TOOLTIP_H}
          rx={6}
          fill="#0A0A0B"
          stroke="#fafafa"
          strokeOpacity="0.22"
          strokeWidth="0.7"
        />
        <text
          x={tx + TOOLTIP_PAD_X}
          y={ty + TOOLTIP_PAD_TOP}
          fontFamily="JetBrains Mono, monospace"
          fontSize="11"
          fill="#a1a1aa"
        >
          {dateLabel}
        </text>
        <text
          x={tx + TOOLTIP_PAD_X}
          y={ty + TOOLTIP_PAD_TOP + TOOLTIP_LINE_GAP}
          fontFamily="JetBrains Mono, monospace"
          fontSize="14"
          fontWeight="600"
          fill="#fafafa"
        >
          {price}
          {unit}
        </text>
        <text
          x={tx + TOOLTIP_PAD_X}
          y={ty + TOOLTIP_PAD_TOP + TOOLTIP_LINE_GAP * 2}
          fontFamily="JetBrains Mono, monospace"
          fontSize="11"
          fill={deltaColor}
        >
          {deltaLabel}
          {deltaPct !== null && <tspan fill="#52525b"> vs veille</tspan>}
        </text>
      </g>
    );
  }

  return (
    <svg
      ref={ref as unknown as React.RefObject<SVGSVGElement>}
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={fillHeight ? "100%" : h}
      preserveAspectRatio="none"
      className="overflow-visible"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        cursor: hoverEnabled ? "crosshair" : "default",
        display: "block",
      }}
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
      {tooltipNode}
    </svg>
  );
}

export default Sparkline;
