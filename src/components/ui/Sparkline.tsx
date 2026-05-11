import { useEffect, useLayoutEffect, useRef, useState } from "react";

type SparklineProps = {
  points: number[];
  color?: string;
  w?: number;
  h?: number;
  fill?: boolean;
  /** Animation de tracé progressif au mount / changement de `points`. Défaut true. */
  animate?: boolean;
  /** Délai (ms) avant démarrage — utile pour le stagger entre cards. Défaut 0. */
  delay?: number;
  /**
   * Si true, la sparkline mesure la largeur réelle de son conteneur via
   * ResizeObserver et calcule ses coordonnées dans cette largeur — le
   * tracé occupe 100% du parent sans distorsion ni dash incorrect
   * (contrairement à viewBox + preserveAspectRatio="none" qui casse
   * getTotalLength). Défaut false → utilise la prop `w`.
   */
  stretch?: boolean;
};

const TRACE_DURATION_MS = 1800;
const FILL_DELAY_MS = 900;
const FILL_DURATION_MS = TRACE_DURATION_MS - FILL_DELAY_MS;
const EASING = "cubic-bezier(0.65, 0, 0.35, 1)";

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
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const [measuredW, setMeasuredW] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!stretch || !containerRef.current) return;
    const el = containerRef.current;
    const update = () => setMeasuredW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stretch]);

  const renderW = stretch ? measuredW ?? w : w;

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * renderW;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const area = fill ? `${path} L${renderW},${h} L0,${h} Z` : null;

  const pathRef = useRef<SVGPathElement | null>(null);
  const [pathLength, setPathLength] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  useLayoutEffect(() => {
    if (!animate) {
      setPathLength(null);
      setProgress(1);
      return;
    }
    if (!pathRef.current) return;

    const length = pathRef.current.getTotalLength();
    setPathLength(length);
    setProgress(0);

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setProgress(1);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [animate, path]);

  const dashOffset = pathLength !== null ? pathLength * (1 - progress) : 0;
  const dashArray = pathLength !== null ? pathLength : undefined;

  const svg = (
    <svg width={renderW} height={h} className="overflow-visible block">
      {fill && area && (
        <path
          d={area}
          fill={color}
          fillOpacity="0.15"
          style={{
            opacity: animate ? progress : 1,
            transition: animate
              ? `opacity ${FILL_DURATION_MS}ms ${EASING} ${delay + FILL_DELAY_MS}ms`
              : undefined,
          }}
        />
      )}
      <path
        ref={pathRef}
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        style={{
          opacity: animate && pathLength === null ? 0 : 1,
          transition: animate
            ? `opacity 0ms linear ${delay}ms, stroke-dashoffset ${TRACE_DURATION_MS}ms ${EASING} ${delay}ms`
            : undefined,
        }}
      />
    </svg>
  );

  if (stretch) {
    return (
      <span ref={containerRef} className="block w-full" style={{ height: h }}>
        {measuredW !== null ? svg : null}
      </span>
    );
  }
  return svg;
}

export default Sparkline;