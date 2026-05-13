import { HARDWARE_CATEGORIES, type HardwareCategory } from "./datasets";

type Props = {
  active: HardwareCategory;
  counts: Record<string, number>;
  onChange: (next: HardwareCategory) => void;
};

/**
 * Onglets horizontaux pour navigation par catégorie.
 * Style Monark : font-mono uppercase tracking, underline 1px bleu sous l'actif.
 */
export default function CatalogCategoryTabs({ active, counts, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-white/10">
      {HARDWARE_CATEGORIES.map((cat) => {
        const isActive = cat === active;
        const count = counts[cat] ?? 0;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className="ease-expo relative -mb-px px-4 pb-2.5 pt-2.5 font-mono text-[11px] tracking-[0.18em] transition-colors"
            style={{
              color: isActive ? "#f4f4f5" : "#71717a",
              borderBottom: `1px solid ${isActive ? "#3B82F6" : "transparent"}`,
            }}
            aria-pressed={isActive}
          >
            {cat}
            <span className="ml-2 text-zinc-600">{count}</span>
          </button>
        );
      })}
    </div>
  );
}