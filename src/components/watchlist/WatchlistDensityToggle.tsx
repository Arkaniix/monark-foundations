import { WATCHLIST_DENSITIES, type WatchlistDensity } from "./datasets";

type Props = {
  value: WatchlistDensity;
  onChange: (next: WatchlistDensity) => void;
};

export default function WatchlistDensityToggle({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] tracking-[0.14em] text-zinc-600">
        DENSITÉ
      </span>
      <div
        role="radiogroup"
        aria-label="Densité d'affichage"
        className="flex items-center rounded-md border border-white/10 bg-white/[0.02] p-[2px]"
      >
        {WATCHLIST_DENSITIES.map((opt) => {
          const isActive = opt.key === value;
          return (
            <button
              key={opt.key}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(opt.key)}
              className="ease-expo rounded-[4px] px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] transition-colors"
              style={{
                background: isActive ? "#27272A" : "transparent",
                color: isActive ? "#F4F4F5" : "#71717A",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}