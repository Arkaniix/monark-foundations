import { useEffect, useRef, useState, type ReactNode } from "react";

import { createPortal } from "react-dom";

type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom";
  delayMs?: number;
};

const GAP = 8;
const MARGIN = 8;

/**
 * Tooltip pédagogique. Rendu via portail (document.body) + position fixed
 * recalculée depuis le rect du déclencheur, avec clamp horizontal/vertical.
 * Plus de découpe par un parent overflow:hidden ni par les bords du viewport.
 */
export default function Tooltip({
  content,
  children,
  position = "top",
  delayMs = 300,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(true), delayMs);
  };
  const close = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
    setCoords(null);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const compute = () => {
      const trigger = triggerRef.current;
      const tip = tipRef.current;
      if (!trigger || !tip) return;
      const t = trigger.getBoundingClientRect();
      const w = tip.offsetWidth;
      const h = tip.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = t.left + t.width / 2 - w / 2;
      left = Math.max(MARGIN, Math.min(left, vw - w - MARGIN));
      let top = position === "top" ? t.top - h - GAP : t.bottom + GAP;
      if (top < MARGIN) top = t.bottom + GAP;
      if (top + h > vh - MARGIN) top = Math.max(MARGIN, t.top - h - GAP);
      setCoords({ top, left });
    };
    compute();
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [isOpen, position]);

  return (
    <>
      <span
        ref={triggerRef}
        className="relative inline-flex cursor-help items-center"
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
      >
        {children}
      </span>
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            ref={tipRef}
            role="tooltip"
            className="pointer-events-none fixed z-[100] w-max max-w-[280px] whitespace-normal rounded-md px-3 py-2 text-left text-[11.5px] leading-relaxed text-zinc-200"
            style={{
              top: coords ? coords.top : -9999,
              left: coords ? coords.left : -9999,
              visibility: coords ? "visible" : "hidden",
              background: "rgba(20,20,22,0.96)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              animation: "tooltipFadeIn 150ms ease-out",
            }}
          >
            {content}
          </span>,
          document.body,
        )}
    </>
  );
}
