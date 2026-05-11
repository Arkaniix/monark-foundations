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
   * Délai en millisecondes avant le démarrage de l'animation, additionné à
   * transition-delay. Utilisé pour le stagger entre plusieurs sparklines.
   * Défaut : 0.
   */
  delay?: number;
  /**
   * Active le tooltip au hover sur la courbe.
   * Si activé, le composant ajoute une couche d'interaction (vertical line,
   * dot, rectangle tooltip) qui affiche : date calendaire FR + prix + delta
   * vs point précédent.
   * Le tooltip nécessite au moins 2 points pour calculer le delta. Hover
   * désactivé pendant l'animation de tracé pour ne pas interférer.
   * Défaut : false.
   */
  hover?: boolean;
  /**
   * Suffixe ajouté au prix dans le tooltip. Défaut : " €".
   * Ignoré si hover=false.
   */
  unit?: string;
};

const TRACE_DURATION_MS = 3000;
const FILL_FADE_DURATION_MS = 600;
const FILL_FADE_DELAY_MS = 1500;
const EASING = "cubic-bezier(0.16,1,0.3,1)";
const DASH_LENGTH = 500;

// Tooltip
const TOOLTIP_W = 84;
const TOOLTIP_H = 42;
const TOOLTIP_PAD = 6;

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

/**
 * Formate une date en "lun 5 mai" (jour 3 lettres + jour du mois + mois 3 lettres).
 */
function formatDateFR(date: Date): string {
  return `${DAYS_FR[date.getDay()]} ${date.getDate()} ${MONTHS_FR[date.getMonth()]}`;
}

/**
 * Étant donné un index dans un tableau de N points (où le dernier point = aujourd'hui),
 * retourne la Date correspondante en reculant jour par jour.
 */
function dateForIndex(index: number, totalPoints: number): Date {
  const daysAgo = totalPoints - 1 - index;
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
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

  // Pré-calcul des coordonnées de chaque point pour réutilisation (path + hover)
  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * w,
    y: h - ((p - min) / range) * h,
    value: p,
  }));

  const path = `M ${coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ")}`;
  const area = fill ? `${path} L${w},${h} L0,${h} Z` : null;

  // Hover désactivé tant que l'animation tracé n'est pas terminée
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

  // Données du tooltip si hoverState actif
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

    // Clamp pour éviter le débordement horizontal
    const tooltipX = Math.min(
      w - TOOLTIP_W - 2,
      Math.max(2, hoverState.x - TOOLTIP_W / 2),
    );
    // Tooltip toujours au-dessus du point quand possible, sinon en dessous
    const tooltipY = Math.max(2, hoverState.y - TOOLTIP_H - TOOLTIP_PAD);

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
        {/* Vertical line */}
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
        {/* Dot */}
        <circle cx={hoverState.x} cy={hoverState.y} r={2.2} fill={color} />
        {/* Tooltip background */}
        <rect
          x={tooltipX}
          y={tooltipY}
          width={TOOLTIP_W}
          height={TOOLTIP_H}
          rx={4}
          fill="#0A0A0B"
          stroke="#fafafa"
          strokeOpacity="0.18"
          strokeWidth="0.6"
        />
        {/* Date */}
        <text
          x={tooltipX + TOOLTIP_W / 2}
          y={tooltipY + 11}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="7"
          fill="#a1a1aa"
        >
          {dateLabel}
        </text>
        {/* Prix */}
        <text
          x={tooltipX + TOOLTIP_W / 2}
          y={tooltipY + 23}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="9"
          fontWeight="600"
          fill="#fafafa"
        >
          {price}
          {unit}
        </text>
        {/* Delta */}
        <text
          x={tooltipX + TOOLTIP_W / 2}
          y={tooltipY + 34}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="7"
          fill={deltaColor}
        >
          {deltaLabel}
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
