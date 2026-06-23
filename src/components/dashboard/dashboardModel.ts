import {
  type StockItem,
  isActif,
  isDormant,
  daysHeld,
  getMargeNette,
  agingColor,
  CONDITION_LABELS,
  PLATFORM_LABELS,
} from "@/components/stock/datasets";
import {
  type HardwareCategory,
  type CatalogModel,
  CATEGORY_LABELS,
} from "@/components/catalog/datasets";

export const CREDIT_CAP_BY_TIER: Record<string, number> = { free: 10, standard: 180, pro: 600 };

export const CATEGORY_COLORS: Record<HardwareCategory | "OTHER", string> = {
  GPU: "#10B981", CPU: "#60A5FA", RAM: "#A78BFA", SSD: "#22D3EE", MOBO: "#F59E0B", PSU: "#F472B6", OTHER: "#71717A",
};

export type EffectiveStatus = "listed" | "in_stock" | "dormant";
export const EFFECTIVE_STATUS_META: Record<EffectiveStatus, { label: string; color: string }> = {
  dormant: { label: "Dormant", color: "#EF4444" },
  listed: { label: "En vente", color: "#F59E0B" },
  in_stock: { label: "En stock", color: "#60A5FA" },
};

export type WeeklyWindow = "w4" | "w8" | "wq";
export type WeeklyBucket = { label: string; profit: number; count: number };
export type DonutSegment = { key: string; label: string; color: string; value: number; pct: number };
export type StockRow = {
  id: string; name: string; conditionLabel: string;
  statusKey: EffectiveStatus; statusLabel: string; statusColor: string; isDormant: boolean;
  platformLabel: string; paid: number; netEst: number | null; profit: number | null;
  ageDays: number; ageColor: string;
};
export type MoverRow = { id: string; name: string; category: HardwareCategory; base: number; trendPct: number };
export type KpiSet = {
  profit30j: number; profit30jDeltaPct: number | null; sold30jCount: number;
  capital: number; stockCount: number; potential: number;
  credits: number; creditsCap: number; tier: string;
};
export type DashboardModel = {
  kpis: KpiSet;
  weekly: Record<WeeklyWindow, WeeklyBucket[]>;
  donutByCategory: DonutSegment[];
  donutByStatus: DonutSegment[];
  stockRows: StockRow[];
  movers: MoverRow[];
  staleCount: number;
  categoryCount: number;
  generatedAt: string;
};

const DAY = 86_400_000;

function isSoldCounted(it: StockItem): boolean {
  return it.status === "sold" && !(it.build_id != null && (it.sale_price_eur ?? 0) === 0);
}
function effectiveStatus(it: StockItem): EffectiveStatus {
  if (isDormant(it, 60)) return "dormant";
  return it.status === "listed" ? "listed" : "in_stock";
}
function catLabel(key: HardwareCategory | "OTHER"): string {
  return key === "OTHER" ? "Autre" : CATEGORY_LABELS[key];
}
function modelMedian(it: StockItem, byId: Map<string, CatalogModel>): number | null {
  if (!it.model_id) return null;
  const m = byId.get(it.model_id);
  return m ? m.median_eur : null;
}
function sumByKey<K extends string>(rows: Array<{ key: K; value: number }>): Map<K, number> {
  const m = new Map<K, number>();
  for (const r of rows) m.set(r.key, (m.get(r.key) ?? 0) + r.value);
  return m;
}

function buildWeekly(sold: StockItem[], weeks: number, now: Date): WeeklyBucket[] {
  const end = now.getTime();
  const out: WeeklyBucket[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const hi = end - i * 7 * DAY;
    const lo = hi - 7 * DAY;
    let profit = 0, count = 0;
    for (const it of sold) {
      if (!it.sale_date) continue;
      const t = new Date(it.sale_date).getTime();
      if (Number.isNaN(t)) continue;
      if (t > lo && t <= hi) { profit += getMargeNette(it) ?? 0; count += 1; }
    }
    out.push({ label: i === 0 ? "Cette sem." : `S-${i}`, profit: Math.round(profit), count });
  }
  return out;
}

function buildKpis(items: StockItem[], byId: Map<string, CatalogModel>, now: Date, credits: number, tier: string): KpiSet {
  const active = items.filter(isActif);
  const capital = active.reduce((s, it) => s + it.purchase_price_eur, 0);
  const potential = active.reduce((s, it) => {
    const med = modelMedian(it, byId);
    return med == null ? s : s + (med - it.purchase_price_eur);
  }, 0);
  const soldCounted = items.filter(isSoldCounted);
  const end = now.getTime();
  const win = (lo: number, hi: number) =>
    soldCounted.filter((it) => {
      if (!it.sale_date) return false;
      const t = new Date(it.sale_date).getTime();
      return !Number.isNaN(t) && t > lo && t <= hi;
    });
  const cur = win(end - 30 * DAY, end);
  const prev = win(end - 60 * DAY, end - 30 * DAY);
  const profit30j = cur.reduce((s, it) => s + (getMargeNette(it) ?? 0), 0);
  const prevProfit = prev.reduce((s, it) => s + (getMargeNette(it) ?? 0), 0);
  return {
    profit30j: Math.round(profit30j),
    profit30jDeltaPct: prevProfit !== 0 ? ((profit30j - prevProfit) / Math.abs(prevProfit)) * 100 : null,
    sold30jCount: cur.length,
    capital: Math.round(capital),
    stockCount: active.length,
    potential: Math.round(potential),
    credits,
    creditsCap: CREDIT_CAP_BY_TIER[tier] ?? 0,
    tier,
  };
}

function buildDonutByCategory(active: StockItem[]): DonutSegment[] {
  const sums = sumByKey(active.map((it) => ({ key: it.category_snapshot, value: it.purchase_price_eur })));
  const total = [...sums.values()].reduce((s, v) => s + v, 0);
  return [...sums.entries()]
    .map(([key, value]) => ({
      key, label: catLabel(key), color: CATEGORY_COLORS[key] ?? CATEGORY_COLORS.OTHER,
      value: Math.round(value), pct: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

function buildDonutByStatus(active: StockItem[]): DonutSegment[] {
  const order: EffectiveStatus[] = ["listed", "in_stock", "dormant"];
  const sums = sumByKey(active.map((it) => ({ key: effectiveStatus(it), value: it.purchase_price_eur })));
  const total = [...sums.values()].reduce((s, v) => s + v, 0);
  return order
    .filter((k) => (sums.get(k) ?? 0) > 0)
    .map((key) => {
      const value = sums.get(key) ?? 0;
      const meta = EFFECTIVE_STATUS_META[key];
      return { key, label: meta.label, color: meta.color, value: Math.round(value), pct: total > 0 ? (value / total) * 100 : 0 };
    });
}

function buildStockRows(active: StockItem[], byId: Map<string, CatalogModel>, now: Date): StockRow[] {
  return active
    .map((it) => {
      const netEst = modelMedian(it, byId);
      const status = effectiveStatus(it);
      const age = daysHeld(it, now);
      return {
        id: it.id, name: it.model_name_snapshot, conditionLabel: CONDITION_LABELS[it.condition],
        statusKey: status, statusLabel: EFFECTIVE_STATUS_META[status].label, statusColor: EFFECTIVE_STATUS_META[status].color,
        isDormant: status === "dormant", platformLabel: PLATFORM_LABELS[it.purchase_platform],
        paid: it.purchase_price_eur,
        netEst: netEst == null ? null : Math.round(netEst),
        profit: netEst == null ? null : Math.round(netEst - it.purchase_price_eur),
        ageDays: age, ageColor: agingColor(age),
      };
    })
    .sort((a, b) => b.ageDays - a.ageDays);
}

function buildMovers(models: CatalogModel[], limit = 6): MoverRow[] {
  return models
    .filter((m) => Math.abs(m.trend_30d_pct) >= 0.5)
    .sort((a, b) => Math.abs(b.trend_30d_pct) - Math.abs(a.trend_30d_pct))
    .slice(0, limit)
    .map((m) => ({ id: m.id, name: m.name, category: m.category, base: m.median_eur, trendPct: m.trend_30d_pct }));
}

export function buildDashboardModel(
  items: StockItem[],
  byId: Map<string, CatalogModel>,
  models: CatalogModel[],
  now: Date,
  credits: number,
  tier: string,
): DashboardModel {
  const active = items.filter(isActif);
  const sold = items.filter(isSoldCounted);
  return {
    kpis: buildKpis(items, byId, now, credits, tier),
    weekly: { w4: buildWeekly(sold, 4, now), w8: buildWeekly(sold, 8, now), wq: buildWeekly(sold, 13, now) },
    donutByCategory: buildDonutByCategory(active),
    donutByStatus: buildDonutByStatus(active),
    stockRows: buildStockRows(active, byId, now),
    movers: buildMovers(models),
    staleCount: active.filter((it) => isDormant(it, 60)).length,
    categoryCount: new Set(active.map((it) => it.category_snapshot)).size,
    generatedAt: now.toISOString(),
  };
}
