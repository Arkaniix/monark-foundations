import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type DropdownItem<V extends string> =
  | { type: "option"; value: V; label: string }
  | { type: "section"; label: string };

type Props<V extends string> = {
  value: V;
  label: string;
  items: DropdownItem<V>[];
  onChange: (v: V) => void;
  minWidth?: number;
  maxPanelHeight?: number;
};

export default function DropdownSelect<V extends string>({
  value,
  label,
  items,
  onChange,
  minWidth = 140,
  maxPanelHeight = 380,
}: Props<V>) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, maxH: maxPanelHeight });
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
        width: Math.max(rect.width, minWidth),
        maxH: Math.max(120, Math.min(maxPanelHeight, available)),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, minWidth, maxPanelHeight]);

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
        onClick={() => setOpen((v) => !v)}
        className="ease-expo flex h-[30px] items-center justify-between gap-2 rounded-md px-3 font-mono text-[11px] tracking-[0.06em] text-zinc-300 transition-colors hover:text-zinc-100 focus:outline-none"
        style={{
          background: "rgba(255,255,255,0.02)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          minWidth,
        }}
      >
        <span className="truncate">{label}</span>
        <span className="font-mono text-[12px] leading-none text-zinc-500" aria-hidden>
          ⌄
        </span>
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
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
            {items.map((it, idx) => {
              if (it.type === "section") {
                const isFirst = idx === 0;
                return (
                  <div
                    key={`sec-${idx}`}
                    className="px-3 pb-1 pt-2 font-mono text-[9px] tracking-[0.15em] text-zinc-600"
                    style={{
                      borderTop: isFirst
                        ? undefined
                        : "1px solid rgba(255,255,255,0.06)",
                      marginTop: isFirst ? 0 : 4,
                    }}
                  >
                    {it.label}
                  </div>
                );
              }
              const active = it.value === value;
              return (
                <button
                  key={`opt-${it.value}`}
                  type="button"
                  onClick={() => {
                    onChange(it.value);
                    setOpen(false);
                  }}
                  className="ease-expo flex w-full items-center px-3 py-2 text-left font-mono text-[12px] transition-colors"
                  style={{
                    background: active ? "rgba(255,255,255,0.06)" : "transparent",
                    color: active ? "#FAFAFA" : "#E4E4E7",
                    borderLeft: active
                      ? "2px solid #3B82F6"
                      : "2px solid transparent",
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
                  {it.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
