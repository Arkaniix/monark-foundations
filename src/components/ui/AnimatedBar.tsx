import { useEffect, useState } from "react";
import useReducedMotion from "@/lib/useReducedMotion";
import { isEntranceComplete, markEntranceCompleteSoon } from "@/lib/entranceAnimation";

type AnimatedBarProps = {
  percent: number;
  color: string;
  height?: number;
  duration?: number;
  delay?: number;
  rail?: string;
  className?: string;
  // Voir AnimatedCounter : quand true, la barre ne s'anime qu'à la première vague de la session ;
  // aux montages suivants (navigations) elle affiche directement sa largeur finale.
  respectEntrance?: boolean;
};

export default function AnimatedBar({
  percent,
  color,
  height = 3,
  duration = 600,
  delay = 100,
  rail = "rgba(255,255,255,0.06)",
  className = "",
  respectEntrance = false,
}: AnimatedBarProps) {
  const reducedMotion = useReducedMotion();
  const skipAnimation = reducedMotion || (respectEntrance && isEntranceComplete());
  const [width, setWidth] = useState(skipAnimation ? percent : 0);

  useEffect(() => {
    if (reducedMotion || (respectEntrance && isEntranceComplete())) {
      setWidth(percent);
      return;
    }
    if (respectEntrance) markEntranceCompleteSoon();
    const timeout = setTimeout(() => {
      setWidth(percent);
    }, delay);
    return () => clearTimeout(timeout);
  }, [percent, delay, reducedMotion, respectEntrance]);

  return (
    <div
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{ background: rail, height }}
    >
      <div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{
          width: `${width}%`,
          background: color,
          transition: reducedMotion
            ? "none"
            : `width ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      />
    </div>
  );
}