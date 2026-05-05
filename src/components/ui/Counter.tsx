import { useEffect, useRef, useState } from "react";

type CounterProps = {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
};

export function Counter({
  value,
  duration = 1600,
  suffix = "",
  prefix = "",
  decimals = 0,
}: CounterProps) {
  const [v, setV] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const start = performance.now();
    const from = 0;
    const to = value;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const display =
    decimals === 0
      ? Math.round(v).toLocaleString("fr-FR")
      : v.toFixed(decimals).replace(".", ",");

  return (
    <span className="font-mono tabular-nums">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export default Counter;