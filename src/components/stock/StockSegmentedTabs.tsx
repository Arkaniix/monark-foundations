import { STOCK_TABS, type StockTab } from "./datasets";

type Props = {
  value: StockTab;
  counts: {
    actifs: number;
    historique: number;
    comptes: number;
    builds: number;
    bilan: number;
  };
  onChange: (next: StockTab) => void;
};

export default function StockSegmentedTabs({ value, counts, onChange }: Props) {
  return (
    <div className="flex items-center gap-1" role="tablist" aria-label="Onglets Inventaire">
      {STOCK_TABS.map((tab) => {
        const isActive = tab.key === value;
        const count = counts[tab.key];
        const isAvailable = tab.available;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className="ease-expo relative flex items-center gap-2 rounded-md px-4 py-2 transition-colors"
            style={{ background: isActive ? "#27272A" : "transparent" }}
          >
            <span
              className="font-mono text-[12px] tracking-[0.14em]"
              style={{ color: isActive ? "#FAFAFA" : isAvailable ? "#A1A1AA" : "#71717A" }}
            >
              {tab.label}
            </span>
            <span
              className="font-mono text-[11px] tabular-nums"
              style={{ color: isActive ? "#A1A1AA" : "#52525B" }}
            >
              · {count}
            </span>
            {!isAvailable && (
              <span className="h-1 w-1 rounded-full" style={{ background: "#52525B" }} aria-label="à venir" />
            )}
            {isActive && (
              <span aria-hidden="true" className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t" style={{ background: "#3B82F6" }} />
            )}
          </button>
        );
      })}
    </div>
  );
}