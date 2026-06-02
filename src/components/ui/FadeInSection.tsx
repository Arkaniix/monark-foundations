import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import useReducedMotion from "@/lib/useReducedMotion";

// Les animations d'entrée ne jouent qu'une fois par session : à la toute première vague de
// sections montées (premier affichage de l'app), avec leur stagger. Après ça, toute section
// montée plus tard — notamment lors des navigations entre pages — apparaît directement, sans
// fondu, pour que les changements de page soient instantanés.
let appEntranceComplete = false;
let entranceTimer: ReturnType<typeof setTimeout> | null = null;

function markEntranceCompleteSoon() {
  if (appEntranceComplete || entranceTimer) return;
  // Bascule au tick suivant : laisse la première vague (montée au même render) lancer son
  // animation, puis fige l'entrée comme « faite » pour tous les montages ultérieurs.
  entranceTimer = setTimeout(() => {
    appEntranceComplete = true;
  }, 0);
}

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
  const [isVisible, setIsVisible] = useState(reducedMotion || appEntranceComplete);

  useEffect(() => {
    if (reducedMotion || appEntranceComplete) {
      setIsVisible(true);
      return;
    }
    const timeout = setTimeout(() => setIsVisible(true), delay);
    markEntranceCompleteSoon();
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