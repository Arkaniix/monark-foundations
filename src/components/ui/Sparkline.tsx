import { useEffect, useRef, useState } from "react";

type SparklineProps = {
  points: number[];
  color?: string;
  w?: number;
  h?: number;
  fill?: boolean;
  /**
   * Active l'animation de tracé progressif au mount et à chaque changement
   * de `points`. Défaut : true.
   *
   * Implémentation : stroke-dasharray = pathLength + stroke-dashoffset
   * qui s'anime de pathLength → 0 via transition CSS. Le fill (area)
   * apparaît en fade-in (opacity 0 → 1) sur la même durée.
   *
   * Passer `animate={false}` pour rendre la sparkline statique (utile en
   * contextes où l'animation distrairait, ex. tooltips, exports, tests).
   */
  animate?: boolean;
};

export function Sparkline({
  points,
  color = "#10B981",
  w = 60,
  h = 18,
  fill = false,
  animate = true,
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

  // Animation state
  const pathRef = useRef<SVGPathElement | null>(null);
  const [pathLength, setPathLength] = useState<number | null>(null);
  const [progress, setProgress] = useState(0); // 0 = caché, 1 = entièrement tracé

  useEffect(() => {
    if (!animate) {
      setPathLength(null);
      setProgress(1);
      return;
    }

    if (!pathRef.current) return;

    // Mesure la longueur du path. Doit être appelé après le render initial
    // car getTotalLength() nécessite que le path soit dans le DOM.
    const length = pathRef.current.getTotalLength();
    setPathLength(length);

    // Reset à 0 puis transition vers 1 au tick suivant pour déclencher le browser
    // (sinon, le passage 0 → 1 dans le même tick est ignoré par la transition).
    setProgress(0);
    const id = requestAnimationFrame(() => {
      setProgress(1);
    });

    return () => cancelAnimationFrame(id);
  }, [animate, path]);

  // Calcul du dashoffset : pathLength au démarrage, 0 à la fin
  const dashOffset =
    pathLength !== null ? pathLength * (1 - progress) : 0;
  const dashArray = pathLength !== null ? pathLength : undefined;

  return (
    <svg width={w} height={h} className="overflow-visible">
      {fill && area && (
        <path
          d={area}
          fill={color}
          fillOpacity="0.15"
          style={{
            opacity: animate ? progress : 1,
            transition: animate ? "opacity 900ms ease-out" : undefined,
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
          transition: animate
            ? "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)"
            : undefined,
        }}
      />
    </svg>
  );
}

export default Sparkline;
