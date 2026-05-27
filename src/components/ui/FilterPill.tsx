import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

type Option = { value: string; label: string };

type Props = {
  label?: string;
  value: string;
  options: Option[];
  onChange: (next: string) => void;
  dimWhenAll?: boolean;
  disabled?: boolean;
};

/**
 * Custom dark dropdown used across catalogue/watchlist filter bars.
 * Renders a pill button + portal panel matching the site's design tokens.
 */
export default function FilterPill({
  label,
  value,
  options,
  onChange,
  dimWhenAll = false,
  disabled = false,
}: Props) {
  const display = options.find((o) => o.value === value)?.label ?? value;
  const isDim = dimWhenAll && value === "ALL";
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, maxH: 320 });
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const update = () => {
      const rect = btnRef.current?.getBoundingClientRect();
      if (!rect) return;
      const available = window.innerHeight - rect.bottom - 16;
      setPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 160),
        maxH: Math.max(160, Math.min(320, available)),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !panelRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`relative inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 font-mono text-[10.5px] tracking-[0.14em] transition-colors ${
          disabled ? "cursor-not-allowed opacity-40" : "hover:bg-white/[0.04]"
        }`}
      >
        {label && <span className="text-zinc-600">{label}</span>}
        <span className={isDim ? "text-zinc-500" : "text-zinc-200"}>{display}</span>
        <ChevronDown
          className={`h-3 w-3 text-zinc-600 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={1.5}
        />
      </button>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            className="fixed z-[110] overflow-y-auto rounded-md py-1"
            style={{
              top: pos.top,
              left: pos.left,
              minWidth: pos.width,
              maxHeight: pos.maxH,
              background: "#18181B",
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.08) transparent",
            }}
          >
            {options.map((o) => {
              const active = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className="ease-expo flex w-full items-center px-3 py-2 text-left font-mono text-[11px] tracking-[0.06em] transition-colors"
                  style={{
                    background: active ? "rgba(255,255,255,0.06)" : "transparent",
                    color: active ? "#FAFAFA" : "#E4E4E7",
                    borderLeft: active ? "2px solid #3B82F6" : "2px solid transparent",
                    paddingLeft: active ? 10 : 12,
                  }}
                  onMouseEnter={(e) => {
                    if (!active)
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}