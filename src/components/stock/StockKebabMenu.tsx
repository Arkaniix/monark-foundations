import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Trash2 } from "lucide-react";

type Props = {
  onDelete: () => void;
};

export default function StockKebabMenu({ onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !wrapperRef.current) return;

    const updatePosition = () => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;

      setMenuPosition({
        top: rect.bottom + 4,
        left: Math.max(8, rect.right - 160),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideButton = wrapperRef.current?.contains(target);
      const isInsideMenu = menuRef.current?.contains(target);

      if (!isInsideButton && !isInsideMenu) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="Actions"
        className="ease-expo flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-white/[0.06]"
      >
        <MoreHorizontal className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[120] min-w-[160px] overflow-hidden rounded-md"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            background: "#18181B",
            boxShadow:
              "0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
            className="ease-expo flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition-colors hover:bg-red-500/10"
            style={{ color: "#F87171" }}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            Supprimer
          </button>
        </div>,
        document.body,
      )}
    </div>
  );
}