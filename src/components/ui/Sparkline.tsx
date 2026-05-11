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
   * qui s'anime de pathLength → 0 via transition CSS 1800ms easeInOutCubic.
   * Le fill (area) apparaît en fade-in opacity 0 → 1 décalé de 900ms
   * (commence quand le tracé est à mi-chemin), pour renforcer la sensation
   * "la ligne dessine puis la zone se remplit derrière elle".
   *
   * Passer `animate={false}` pour rendre la sparkline statique.
   */
  animate?: boolean;
  /**
   * Délai en millisecondes avant le démarrage de l'animation. Utile pour
   * créer un effet de stagger entre plusieurs sparklines rendues côte à
   * côte (ex. cards watchlist : delay = index * 120ms produit un "wave"
   * qui balaie la rangée). Défaut : 0. Ignoré si `animate={false}`.
   */
  delay?: number;
  /**
   * Si true, la sparkline s'étire à 100% de la largeur de son parent
   * (viewBox + preserveAspectRatio="none"). Les coordonnées internes
   * restent calculées sur `w` × `h` (viewBox), mais le rendu remplit
   * le conteneur. Le stroke utilise `vector-effect="non-scaling-stroke"`
   * pour éviter la distorsion de l'épaisseur. Défaut : false.
   */
  stretch?: boolean;
};

// Constantes d'animation centralisées pour cohérence + lisibilité
const TRACE_DURATION_MS = 1800;
const FILL_DELAY_MS = 900; // moitié du tracé : le fill commence quand la ligne est à mi-parcours
const FILL_DURATION_MS = TRACE_DURATION_MS - FILL_DELAY_MS;
const EASING = "cubic-bezier(0.65, 0, 0.35, 1)"; // easeInOutCubic — démarre lent, finit lent

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

    const length = pathRef.current.getTotalLength();
    setPathLength(length);
    setProgress(0);

    // Double rAF pour garantir que le browser applique l'état initial
    // (dashOffset = pathLength) AVANT le passage à 1 — sinon la transition
    // est ignorée car même tick de rendu.
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setProgress(1);
      });
    });

    return () => cancelAnimationFrame(id);
  }, [animate, path]);

  const dashOffset = pathLength !== null ? pathLength * (1 - progress) : 0;
  const dashArray = pathLength !== null ? pathLength : undefined;

  return (
    <svg
      {...(stretch
        ? {
            viewBox: `0 0 ${w} ${h}`,
            width: "100%",
            height: h,
            preserveAspectRatio: "none",
          }
        : { width: w, height: h })}
      className="overflow-visible"
    >
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
        vectorEffect={stretch ? "non-scaling-stroke" : undefined}
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
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
