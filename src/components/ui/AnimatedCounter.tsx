import { useEffect, useRef, useState } from "react";
import useReducedMotion from "@/lib/useReducedMotion";
import { isEntranceComplete, markEntranceCompleteSoon } from "@/lib/entranceAnimation";

type AnimatedCounterProps = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
  frenchLocale?: boolean;
  // Quand true, le compteur ne fait défiler les chiffres qu'à la première vague d'animations de
  // la session. Aux montages suivants (navigations), il affiche directement la valeur finale.
  respectEntrance?: boolean;
};

export default function AnimatedCounter({
  value,
  decimals,
  prefix = "",
  suffix = "",
  duration = 500,
  delay = 0,
  frenchLocale = true,
  respectEntrance = false,
}: AnimatedCounterProps) {
  const reducedMotion = useReducedMotion();
  const skipAnimation = reducedMotion || (respectEntrance && isEntranceComplete());
  const [current, setCurrent] = useState(skipAnimation ? value : 0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion || (respectEntrance && isEntranceComplete())) {
      setCurrent(value);
      return;
    }
    if (respectEntrance) markEntranceCompleteSoon();

    let cancelled = false;
    const startValue = 0;
    const range = value - startValue;

    const animate = (timestamp: number) => {
      if (cancelled) return;
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp + delay;
      }
      const elapsed = timestamp - startTimeRef.current;
      if (elapsed < 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCurrent(startValue + range * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    startTimeRef.current = null;
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startTimeRef.current = null;
    };
  }, [value, duration, delay, reducedMotion, respectEntrance]);

  const d = decimals ?? (Number.isInteger(value) ? 0 : 1);
  const displayValue = frenchLocale
    ? new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      }).format(current)
    : current.toFixed(d);

  return (
    <span className="tabular-nums">
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}