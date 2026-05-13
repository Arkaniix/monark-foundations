import { useEffect, useState } from "react";
import useReducedMotion from "@/lib/useReducedMotion";

type AnimatedBarProps = {
  percent: number;
  color: string;
  height?: number;
  duration?: number;
  delay?: number;
  rail?: string;
  className?: string;
};

export default function AnimatedBar({
  percent,
  color,
  height = 3,
  duration = 600,
  delay = 100,
  rail = "rgba(255,255,255,0.06)",
  className = "",
}: AnimatedBarProps) {
  const reducedMotion = useReducedMotion();
  const [width, setWidth] = useState(reducedMotion ? percent : 0);

  useEffect(() => {
    if (reducedMotion) {
      setWidth(percent);
      return;
    }
    const timeout = setTimeout(() => {
      setWidth(percent);
    }, delay);
    return () => clearTimeout(timeout);
  }, [percent, delay, reducedMotion]);

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