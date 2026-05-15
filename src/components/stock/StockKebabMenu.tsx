import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type KebabAction = {
  key: string;
  label: string;
  icon?: LucideIcon;
  destructive?: boolean;
  separatorBefore?: boolean;
  onClick: () => void;
};

type Props = {
  actions: KebabAction[];
};

const MENU_WIDTH = 160;
const MENU_ITEM_HEIGHT = 32;
const MENU_SEPARATOR_HEIGHT = 9;
const MENU_PADDING_Y = 4;
const MENU_GAP = 4;
const VIEWPORT_MARGIN = 8;

export default function StockKebabMenu({ actions }: Props) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const estimatedHeight =
    MENU_PADDING_Y * 2 +
    actions.length * MENU_ITEM_HEIGHT +
    actions.filter((a) => a.separatorBefore).length * MENU_SEPARATOR_HEIGHT;

  useEffect(() => {
    if (!open || !wrapperRef.current) return;

    const updatePosition = () => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;

      const shouldOpenUp =
        rect.bottom + MENU_GAP + estimatedHeight >
        window.innerHeight - VIEWPORT_MARGIN;
      const top = shouldOpenUp
        ? Math.max(VIEWPORT_MARGIN, rect.top - MENU_GAP - estimatedHeight)
        : rect.bottom + MENU_GAP;
      const left = Math.min(
        window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN,
        Math.max(VIEWPORT_MARGIN, rect.right - MENU_WIDTH),
      );

      setMenuPosition({
        top,
        left,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, estimatedHeight]);

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
          className="fixed z-[120] min-w-[180px] overflow-hidden rounded-md py-1"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            background: "#18181B",
            boxShadow:
              "0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <div key={action.key}>
                {action.separatorBefore && (
                  <div
                    className="mx-2 my-1 h-px"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    action.onClick();
                  }}
                  className="ease-expo flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition-colors"
                  style={{
                    color: action.destructive ? "#F87171" : "#E4E4E7",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = action.destructive
                      ? "rgba(239,68,68,0.10)"
                      : "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  {action.label}
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}