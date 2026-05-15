import { Settings } from "lucide-react";
import {
  type Build,
  BUILD_STATUS_BADGE_STYLE,
  BUILD_STATUS_LABELS,
  getBuildComponentsBreakdown,
  getBuildDuration,
  getBuildMarge,
  getBuildTotalCost,
  isBuildDormant,
} from "./buildsDatasets";
import {
  type StockDensity,
  formatDateShortFR,
  formatEur,
} from "./datasets";
import StockKebabMenu, { type KebabAction } from "./StockKebabMenu";

type Props = {
  builds: Build[];
  density: StockDensity;
  onRowClick?: (b: Build) => void;
  buildActions: (b: Build) => KebabAction[];
};

const HEADERS = [
  { key: "name", label: "NOM DU BUILD", className: "col-span-3" },
  { key: "status", label: "STATUS", className: "col-span-1" },
  { key: "components", label: "COMPOSANTS", className: "col-span-2" },
  { key: "cost", label: "COÛT TOTAL", className: "col-span-2 text-right" },
  { key: "sale", label: "VENTE", className: "col-span-1 text-right" },
  { key: "marge", label: "MARGE", className: "col-span-2 text-right" },
  { key: "duration", label: "DURÉE", className: "col-span-1" },
];

export default function StockBuildsTable({
  builds,
  density,
  onRowClick,
  buildActions,
}: Props) {
  const rowPadY = density === "compact" ? "py-2.5" : "py-3.5";
  return (
    <div className="mk-card-flat-soft">
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

      {builds.map((b) => {
        const cost = getBuildTotalCost(b);
        const marge = getBuildMarge(b);
        const dur = getBuildDuration(b);
        const dormant = isBuildDormant(b);
        const badge = BUILD_STATUS_BADGE_STYLE[b.status];
        const breakdown = getBuildComponentsBreakdown(b);
        const isFailed = b.status === "failed";
        const isSold = b.status === "sold" || b.status === "returned";
        const subDate = isSold
          ? `${b.short_id} · vendu ${b.sale_date ? formatDateShortFR(b.sale_date) : "—"}`
          : `${b.short_id} · créé ${formatDateShortFR(b.created_at)}`;
        const margeColor = !marge
          ? "#71717A"
          : marge.eur > 0
            ? "#10B981"
            : marge.eur < 0
              ? "#EF4444"
              : "#71717A";
        const ageColor =
          dormant && dur >= 90
            ? "#EF4444"
            : dormant
              ? "#F59E0B"
              : "#A1A1AA";
        return (
          <div
            key={b.id}
            className={`group relative grid cursor-pointer grid-cols-12 items-center gap-3 px-4 ${rowPadY} ease-expo transition-colors hover:bg-white/[0.02]`}
            style={{
              background: isFailed ? "rgba(239,68,68,0.06)" : undefined,
              boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.04)",
            }}
            onClick={() => onRowClick?.(b)}
          >
            <div className="col-span-3 flex min-w-0 items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
                }}
              >
                <Settings
                  className="h-4 w-4"
                  style={{ color: isFailed ? "#FCA5A5" : "#71717A" }}
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex min-w-0 flex-col">
                <div
                  className="truncate text-[13px]"
                  style={{ color: isFailed ? "#FCA5A5" : "#E4E4E7" }}
                >
                  {b.name}
                </div>
                <div className="font-mono text-[10px] tracking-[0.14em] text-zinc-600">
                  {subDate}
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <span
                className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.14em]"
                style={{ background: badge.bg, color: badge.fg }}
              >
                {BUILD_STATUS_LABELS[b.status].toUpperCase()}
              </span>
            </div>

            <div className="col-span-2 font-mono text-[11.5px] text-zinc-400">
              {breakdown.formatted}
            </div>

            <div className="col-span-2 text-right font-mono text-[12.5px] tabular-nums">
              {isSold && b.sale_price_eur != null ? (
                <span>
                  <span className="text-zinc-500">{formatEur(cost)} €</span>
                  <span className="px-1 text-zinc-700">→</span>
                  <span className="text-zinc-200">
                    {formatEur(b.sale_price_eur)} €
                  </span>
                </span>
              ) : (
                <span className="text-zinc-200">{formatEur(cost)} €</span>
              )}
            </div>

            <div className="col-span-1 text-right font-mono text-[11.5px] tabular-nums text-zinc-500">
              {b.status === "listed" && b.expected_sale_price_eur != null ? (
                <div className="flex flex-col items-end">
                  <span className="text-zinc-300">
                    {formatEur(b.expected_sale_price_eur)} €
                  </span>
                  <span className="text-[9.5px] text-zinc-600">attendu</span>
                </div>
              ) : isSold ? (
                <span className="text-zinc-700">—</span>
              ) : isFailed ? (
                <span className="text-zinc-700">— €</span>
              ) : (
                <span className="text-zinc-700">—</span>
              )}
            </div>

            <div className="col-span-2 flex flex-col items-end">
              {isFailed ? (
                <>
                  <span
                    className="tabular-nums text-[12.5px]"
                    style={{ color: "#EF4444", fontWeight: 500 }}
                  >
                    −{formatEur(cost)} €
                  </span>
                  <span className="font-mono text-[9.5px] text-zinc-600">
                    perte sèche
                  </span>
                </>
              ) : marge ? (
                <>
                  <span
                    className="tabular-nums text-[12.5px]"
                    style={{ color: margeColor, fontWeight: 500 }}
                  >
                    {marge.eur >= 0 ? "+" : ""}
                    {formatEur(marge.eur)} €
                  </span>
                  <span
                    className="font-mono text-[10px] tabular-nums"
                    style={{ color: margeColor }}
                  >
                    {marge.pct >= 0 ? "+" : ""}
                    {marge.pct.toFixed(1)}%
                  </span>
                </>
              ) : (
                <span className="text-[12px] text-zinc-700">—</span>
              )}
            </div>

            <div className="col-span-1 flex items-center justify-between gap-1.5">
              <span
                className="font-mono text-[11px] tabular-nums"
                style={{ color: ageColor }}
              >
                {dur} j
              </span>
              <div
                className="opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <StockKebabMenu actions={buildActions(b)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}