import { Star, Bell } from "lucide-react";
import { WATCHLIST_TABS, type WatchlistTabKey } from "./datasets";

type Props = {
  active: WatchlistTabKey;
  favoritesCount: number;
  alertsCount: number;
  significantMovesCount: number;
  onChange: (next: WatchlistTabKey) => void;
};

export default function WatchlistTabs({
  active,
  favoritesCount,
  alertsCount,
  significantMovesCount,
  onChange,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      {WATCHLIST_TABS.map((tab) => {
        const isActive = tab.key === active;
        const count = tab.key === "favorites" ? favoritesCount : alertsCount;
        const Icon = tab.key === "favorites" ? Star : Bell;
        const hasMoves = tab.key === "alerts" && significantMovesCount > 0;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            aria-pressed={isActive}
            className="ease-expo relative flex h-9 items-center gap-2 rounded-md border px-4 transition-colors"
            style={{
              background: isActive ? "var(--mk-surface-2)" : "transparent",
              borderColor: isActive ? "#3F3F46" : "#27272A",
            }}
          >
            <Icon
              size={13}
              strokeWidth={1.75}
              style={{ color: isActive ? tab.iconColor : "#71717a" }}
              fill={isActive ? tab.iconColor : "transparent"}
            />
            <span
              className="font-mono text-[11px] tracking-[0.14em]"
              style={{ color: isActive ? "#E4E4E7" : "#A1A1AA" }}
            >
              {tab.label}
            </span>
            <span
              className="rounded-md px-1.5 py-0.5 font-mono text-[10px] tabular-nums"
              style={{
                background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                color: isActive ? "#D4D4D8" : "#71717a",
                border: "0.5px solid rgba(255,255,255,0.08)",
              }}
            >
              {count}
            </span>
            {hasMoves && (
              <span
                className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 font-mono text-[9px] font-semibold tabular-nums"
                style={{
                  background: "rgba(239,68,68,0.18)",
                  color: "#F87171",
                  border: "0.5px solid rgba(239,68,68,0.45)",
                }}
              >
                {significantMovesCount}
              </span>
            )}
            {isActive && (
              <span
                className="absolute -bottom-px left-3 right-3 h-px"
                style={{ background: tab.iconColor, opacity: 0.6 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}