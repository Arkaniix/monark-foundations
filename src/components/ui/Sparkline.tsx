import { useState } from "react";
import { useInView } from "@/hooks/useInView";

type SparklineProps = {
  points: number[];
  color?: string;
  w?: number;
  h?: number;
  fill?: boolean;
  /**
   * Active l'animation de tracé progressif au premier passage dans le viewport.
   * Défaut : true. Technique calquée sur landing/VolatilityViz.tsx.
   */
  animate?: boolean;
  /**
   * Délai en millisecondes avant le démarrage de l'animation (transition-delay).
   * Défaut : 0.
   */
  delay?: number;
  /**
   * Active le tooltip au hover sur la courbe : date FR + prix + delta vs J−1.
   * Le tooltip est positionné en haut-droit du point hovered avec bascule
   * automatique (haut-gauche, bas-droit, bas-gauche) si trop proche d'un bord.
   * Désactivé pendant l'animation de tracé pour ne pas interférer.
   * Défaut : false.
   */
  hover?: boolean;
  /**
   * Suffixe ajouté au prix dans le tooltip. Défaut : " €". Ignoré si hover=false.
   */
  unit?: string;
};

// Animation
const TRACE_DURATION_MS = 3000;
const FILL_FADE_DURATION_MS = 600;
const FILL_FADE_DELAY_MS = 1500;
const EASING = "cubic-bezier(0.16,1,0.3,1)";
const DASH_LENGTH = 500;

// Tooltip — dimensions et offsets
const TOOLTIP_W = 140;
const TOOLTIP_H = 56;
const TOOLTIP_OFFSET = 12; // gap entre le point et le tooltip
const TOOLTIP_PAD_X = 8;
const TOOLTIP_PAD_TOP = 14;
const TOOLTIP_LINE_GAP = 14; // espacement vertical entre les 3 lignes du tooltip

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
 * Calcule la position du tooltip avec bascule selon disponibilité.
 * Ordre de priorité : haut-droit → haut-gauche → bas-droit → bas-gauche.
 *
 * Le SVG a overflow-visible, donc on peut déborder du viewBox vers le haut /
 * gauche / droite. La contrainte principale est :
 *   - ne pas dépasser la largeur visuelle du SVG (sinon on entre dans la card voisine)
 *   - laisser un peu d'air en haut (-TOOLTIP_H au-dessus du svg = 56px, OK car mk-card padding p-5)
 */
function computeTooltipPosition(
  pointX: number,
  pointY: number,
  svgW: number,
): { x: number; y: number } {
  const rightX = pointX + TOOLTIP_OFFSET;
  const leftX = pointX - TOOLTIP_OFFSET - TOOLTIP_W;
  const aboveY = pointY - TOOLTIP_OFFSET - TOOLTIP_H;
  const belowY = pointY + TOOLTIP_OFFSET;

  const fitsRight = rightX + TOOLTIP_W <= svgW;
  const fitsLeft = leftX >= 0;
  const fitsAbove = aboveY >= -TOOLTIP_H; // tolère un débordement sup avec overflow-visible

  if (fitsRight && fitsAbove) return { x: rightX, y: aboveY };
  if (fitsLeft && fitsAbove) return { x: leftX, y: aboveY };
  if (fitsRight) return { x: rightX, y: belowY };
  return { x: leftX, y: belowY };
}

type HoverState = {
  idx: number;
  x: number;
  y: number;
};

export function Sparkline({
  points,
  color = "#10B981",
  w = 60,
  h = 18,
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
        {/* Vertical guide line + dot */}
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
        {/* Tooltip rectangle */}
        <rect
          x={tx}
          y={ty}
          width={TOOLTIP_W}
          height={TOOLTIP_H}
          rx={5}
          fill="#0A0A0B"
          stroke="#fafafa"
          strokeOpacity="0.2"
          strokeWidth="0.7"
        />
        {/* Ligne 1 : date */}
        <text
          x={tx + TOOLTIP_PAD_X}
          y={ty + TOOLTIP_PAD_TOP}
          fontFamily="JetBrains Mono, monospace"
          fontSize="9"
          fill="#a1a1aa"
        >
          {dateLabel}
        </text>
        {/* Ligne 2 : prix (plus grand, semibold) */}
        <text
          x={tx + TOOLTIP_PAD_X}
          y={ty + TOOLTIP_PAD_TOP + TOOLTIP_LINE_GAP}
          fontFamily="JetBrains Mono, monospace"
          fontSize="12"
          fontWeight="600"
          fill="#fafafa"
        >
          {price}
          {unit}
        </text>
        {/* Ligne 3 : delta J−1 */}
        <text
          x={tx + TOOLTIP_PAD_X}
          y={ty + TOOLTIP_PAD_TOP + TOOLTIP_LINE_GAP * 2}
          fontFamily="JetBrains Mono, monospace"
          fontSize="9"
          fill={deltaColor}
        >
          {deltaLabel}
          {deltaPct !== null && (
            <tspan fill="#52525b"> vs veille</tspan>
          )}
        </text>
      </g>
    );
  }

  return (
    <svg
      ref={ref as unknown as React.RefObject<SVGSVGElement>}
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className="overflow-visible"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ cursor: hoverEnabled ? "crosshair" : "default" }}
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
