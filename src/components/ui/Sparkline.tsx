import { useInView } from "@/hooks/useInView";

type SparklineProps = {
  points: number[];
  color?: string;
  w?: number;
  h?: number;
  fill?: boolean;
  /**
   * Active l'animation de tracé progressif au premier passage dans le viewport.
   * Défaut : true.
   *
   * Technique calquée sur landing/VolatilityViz.tsx :
   *   - useInView (IntersectionObserver one-shot via /src/hooks/useInView.ts)
   *   - strokeDasharray="500" valeur fixe (dépasse toujours la longueur du path)
   *   - strokeDashoffset = seen ? 0 : 500
   *   - transition CSS 1600ms cubic-bezier(0.16,1,0.3,1) (expo-out)
   *   - Pas de getTotalLength (incohérent avec SVG stretch viewBox)
   *
   * Passer animate={false} pour rendre la sparkline statique.
   */
  animate?: boolean;
  /**
   * Délai en millisecondes avant le démarrage de l'animation, additionné à
   * `transition-delay`. Utile pour créer un effet de stagger entre plusieurs
   * sparklines rendues côte à côte (ex. delay = index * 120ms).
   * Défaut : 0. Ignoré si animate={false}.
   */
  delay?: number;
  /**
   * Si true, le SVG occupe 100% de la largeur du parent (width="100%")
   * tout en conservant son viewBox interne. Le viewBox + DASH_LENGTH fixe
   * garantissent que l'animation reste cohérente quelle que soit la
   * largeur rendue. Défaut : false.
   */
  stretch?: boolean;
};

const TRACE_DURATION_MS = 3000;
const FILL_FADE_DURATION_MS = 600;
const FILL_FADE_DELAY_MS = 1500; // après ~moitié du tracé
const EASING = "cubic-bezier(0.16,1,0.3,1)";
const DASH_LENGTH = 500; // valeur fixe, dépasse la longueur du path quel que soit le viewBox

export function Sparkline({
  points,
  color = "#10B981",
  w = 60,
  h = 18,
  fill = false,
  animate = true,
  delay = 0,
  stretch = false,
}: SparklineProps) {
  const [ref, seen] = useInView(0.25);
  const playing = animate ? seen : true; // animate=false → toujours révélé

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const pathPoints = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const path = `M ${pathPoints}`;
  const area = fill ? `${path} L${w},${h} L0,${h} Z` : null;

  return (
    <svg
      ref={ref as unknown as React.RefObject<SVGSVGElement>}
      viewBox={`0 0 ${w} ${h}`}
      width={stretch ? "100%" : w}
      height={h}
      className="overflow-visible block"
      preserveAspectRatio={stretch ? "none" : undefined}
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
    </svg>
  );
}

export default Sparkline;
