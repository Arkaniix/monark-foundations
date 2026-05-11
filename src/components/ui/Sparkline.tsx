import { useState } from "react";
import { useInView } from "@/hooks/useInView";

type SparklineProps = {
  points: number[];
  color?: string;
  /**
   * Largeur de référence utilisée pour le viewBox SVG.
   * Note : le SVG est rendu en width="100%" et s'étire à la largeur de son
   * conteneur. La valeur `w` détermine seulement la résolution interne du
   * viewBox (plus elle est élevée, plus le path a de détail). Pour les
   * sparklines watchlist on utilise 320 par défaut pour un compromis
   * détail / coût render.
   */
  w?: number;
  h?: number;
  fill?: boolean;
  animate?: boolean;
  delay?: number;
  /**
   * Active le tooltip au hover : date FR + prix + delta vs J−1.
   * Positionnement mouse-aware avec bascule de quadrant et débordement
   * autorisé au-dessus de la card pour préserver la lisibilité.
   */
  hover?: boolean;
  unit?: string;
};

// Animation
const TRACE_DURATION_MS = 3000;
const FILL_FADE_DURATION_MS = 600;
const FILL_FADE_DELAY_MS = 1500;
const EASING = "cubic-bezier(0.16,1,0.3,1)";
const DASH_LENGTH = 500;

// Tooltip — dimensions en unités viewBox (même système que les coords des points)
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

/**
 * Positionnement du tooltip avec bascule de quadrant.
 *
 * Le SVG a overflow-visible et la mk-card parente n'a pas overflow:hidden,
 * donc le tooltip peut déborder vers le haut au-dessus de la card. C'est
 * le comportement souhaité pour préserver la lisibilité — quitte à
 * chevaucher légèrement la card voisine du dessus.
 *
 * Le seul clipping strict est horizontal : on évite que le tooltip dépasse
 * du viewBox en X (sinon il finirait dans la card voisine de droite ou
 * passerait à gauche, hors zone cliquable).
 *
 * Ordre :
 *   - défaut : haut-droit du point (gap TOOLTIP_OFFSET)
 *   - si point trop à droite : bascule haut-gauche
 *   - on ne bascule jamais en bas (débordement haut autorisé)
 */
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
  // Fallback : haut-gauche (et si ça déborde encore à gauche, on l'accepte
  // car au pire le tooltip touche le bord gauche du conteneur — moins
  // gênant qu'un débordement à droite qui empiéterait sur la card voisine)
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
    // Conversion pixel → unité viewBox via la largeur réelle du SVG
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
    const price = Math.round(hoverState.value);
    const prevValue =
      hoverState.idx > 0 ? coords[hoverState.idx - 1].value : null;
    const deltaPct =
      prevValue !== null && prevValue !== 0
        ? ((hoverState.value - prevValue) / prevValue) * 100
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
      height={h}
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
