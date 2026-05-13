import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import useReducedMotion from "@/lib/useReducedMotion";

type FadeInSectionProps = {
  delay?: number;
  duration?: number;
  translateY?: number;
  className?: string;
  children: ReactNode;
};

export default function FadeInSection({
  delay = 0,
  duration = 300,
  translateY = 8,
  className = "",
  children,
}: FadeInSectionProps) {
  const reducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }
    const timeout = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [delay, reducedMotion]);

  return (
    <div
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : `translateY(${translateY}px)`,
        transition: reducedMotion
          ? "none"
          : `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        willChange: isVisible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}