import { useEffect, useRef, useState, type ReactNode } from "react";

type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom";
  delayMs?: number;
};

/**
 * Tooltip lightweight pour annotations pédagogiques.
 * Hover only (mobile non-fonctionnel — acceptable V1).
 */
export default function Tooltip({
  content,
  children,
  position = "top",
  delayMs = 300,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(true), delayMs);
  };
  const close = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <span
      className="relative inline-flex cursor-help items-center"
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      {children}
      {isOpen && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute left-1/2 z-50 w-max max-w-[280px] -translate-x-1/2 whitespace-normal rounded-md px-3 py-2 text-left text-[11.5px] leading-relaxed text-zinc-200 ${
            position === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          style={{
            background: "rgba(20,20,22,0.96)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            animation: "tooltipFadeIn 150ms ease-out",
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
}