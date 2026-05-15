import {
  type StockItem,
  type StockDensity,
  STATUS_LABELS,
  STATUS_BADGE_STYLE,
  PLATFORM_LABELS,
  PLATFORM_DOT_COLOR,
  daysHeld,
  isDormant,
  agingColor,
  agingRowAccent,
  formatDateShortFR,
  formatEur,
} from "./datasets";
import type { HardwareCategory } from "@/components/catalog/datasets";
import { CATALOG_MODELS } from "@/components/catalog/mockData";
import ModelImage from "@/components/catalog/ModelImage";
import StockKebabMenu from "./StockKebabMenu";

type Props = {
  items: StockItem[];
  density: StockDensity;
  onDelete: (id: string) => void;
};

const HEADERS = [
  { key: "model", label: "MODÈLE", className: "col-span-4" },
  { key: "status", label: "STATUS", className: "col-span-1" },
  { key: "achat", label: "ACHAT", className: "col-span-1 text-right" },
  { key: "date", label: "DATE", className: "col-span-1" },
  { key: "pf", label: "PF.", className: "col-span-1" },
  { key: "aging", label: "AGING", className: "col-span-1" },
  { key: "median", label: "MÉDIANE", className: "col-span-1 text-right" },
  { key: "delta", label: "Δ POT.", className: "col-span-2 text-right" },
];

export default function StockTableActifs({ items, density, onDelete }: Props) {
  const rowPadY = density === "compact" ? "py-2.5" : "py-3.5";

  return (
    <div className="mk-card-flat-soft">
      {/* Header */}
      <div
        className="grid grid-cols-12 gap-3 px-4 py-2.5"
        style={{
          background: "rgba(255,255,255,0.015)",
          boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {HEADERS.map((h) => (
          <div
            key={h.key}
            className={`font-mono text-[10px] tracking-[0.16em] text-zinc-600 ${h.className}`}
          >
            {h.label}
          </div>
        ))}
      </div>

      {items.map((item) => {
        const age = daysHeld(item);
        const accent = agingRowAccent(age);
        const dormant = isDormant(item);
        const ageCol = agingColor(age);
        const badge = STATUS_BADGE_STYLE[item.status];

        const model = item.model_id
          ? CATALOG_MODELS.find((m) => m.id === item.model_id)
          : null;
        const median = model?.median_eur ?? null;
        const deltaEur = median != null ? median - item.purchase_price_eur : null;
        const deltaPct =
          median != null && item.purchase_price_eur > 0
            ? ((median - item.purchase_price_eur) / item.purchase_price_eur) * 100
            : null;

        const platformDot = PLATFORM_DOT_COLOR[item.purchase_platform];
        const platformLabel = PLATFORM_LABELS[item.purchase_platform];
        const cat = item.category_snapshot;
        const isHwCat = cat !== "OTHER";

        return (
          <div
            key={item.id}
            className={`group relative grid grid-cols-12 items-center gap-3 px-4 ${rowPadY} ease-expo transition-colors hover:bg-white/[0.02]`}
            style={{
              background: accent ?? undefined,
              boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <div className="col-span-4 flex items-center gap-3 min-w-0">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
                }}
              >
                {isHwCat ? (
                  <ModelImage
                    category={cat as HardwareCategory}
                    url={null}
                    className="opacity-70"
                  />
                ) : (
                  <span className="font-mono text-[9px] text-zinc-600">—</span>
                )}
              </div>
              <div className="flex min-w-0 flex-col">
                <div className="truncate text-[13px] text-zinc-100">
                  {item.model_name_snapshot}
                </div>
                <div className="font-mono text-[10px] tracking-[0.14em] text-zinc-600">
                  {item.category_snapshot}
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <span
                className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.14em]"
                style={{ background: badge.bg, color: badge.fg }}
              >
                {STATUS_LABELS[item.status].toUpperCase()}
              </span>
            </div>

            <div className="col-span-1 text-right tabular-nums text-[12.5px] text-zinc-200">
              {formatEur(item.purchase_price_eur)} €
            </div>

            <div className="col-span-1 font-mono text-[11px] text-zinc-500">
              {formatDateShortFR(item.purchase_date)}
            </div>

            <div className="col-span-1 flex items-center gap-1.5 text-[11.5px] text-zinc-400">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: platformDot }}
              />
              {platformLabel}
            </div>

            <div className="col-span-1 flex items-center gap-1.5">
              {dormant && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: ageCol }}
                />
              )}
              <span
                className="font-mono text-[11px] tabular-nums"
                style={{ color: ageCol }}
              >
                {age} j
              </span>
            </div>

            <div className="col-span-1 text-right tabular-nums text-[12px] text-zinc-300">
              {median != null ? `${formatEur(median)} €` : "—"}
            </div>

            <div className="col-span-2 flex items-center justify-end gap-2">
              {deltaEur != null ? (
                <div className="flex flex-col items-end">
                  <span
                    className="tabular-nums text-[12px]"
                    style={{
                      color:
                        deltaEur > 0
                          ? "#10B981"
                          : deltaEur < 0
                            ? "#EF4444"
                            : "#71717A",
                      fontWeight: 500,
                    }}
                  >
                    {deltaEur >= 0 ? "+" : ""}
                    {formatEur(deltaEur)} €
                  </span>
                  {deltaPct != null && (
                    <span
                      className="font-mono text-[10px] tabular-nums"
                      style={{
                        color:
                          deltaEur > 0
                            ? "#10B981"
                            : deltaEur < 0
                              ? "#EF4444"
                              : "#71717A",
                      }}
                    >
                      {deltaPct >= 0 ? "+" : ""}
                      {deltaPct.toFixed(1)}%
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[12px] text-zinc-600">—</span>
              )}
              <div className="opacity-0 transition-opacity group-hover:opacity-100">
                <StockKebabMenu onDelete={() => onDelete(item.id)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}