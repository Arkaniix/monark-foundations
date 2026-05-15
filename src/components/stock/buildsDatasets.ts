/**
 * Types et helpers pour le module Builds (P1E).
 *
 * Un Build agrège N composants (items du stock, achats neufs, pièces détenues)
 * et a son propre cycle de vie (in_progress → tested → listed → sold/returned/failed).
 */

import type { HardwareCategory } from "../catalog/datasets";
import type { PlatformKey, StockItem } from "./datasets";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BuildStatus =
  | "in_progress"
  | "tested"
  | "listed"
  | "sold"
  | "returned"
  | "failed";

export type BuildComponentKind =
  | "stock_item"
  | "new_purchase"
  | "owned_no_cost";

export type BuildComponent = {
  id: string;
  kind: BuildComponentKind;
  stock_item_id: string | null;
  label: string;
  category_snapshot: HardwareCategory | "OTHER";
  purchase_price_eur: number;
  notes: string | null;
  added_at: string;
};

export type BuildEventType =
  | "created"
  | "component_added"
  | "component_removed"
  | "tested"
  | "untested"
  | "listed"
  | "delisted"
  | "sold"
  | "sale_cancelled"
  | "returned"
  | "failed"
  | "resumed"
  | "duplicated";

export type BuildEvent = {
  type: BuildEventType;
  at: string;
  payload?: {
    component_label?: string;
    component_kind?: BuildComponentKind;
    sale_price_eur?: number;
    sale_platform?: PlatformKey;
    fees_eur?: number;
    source_build_id?: string;
  };
};

export type Build = {
  id: string;
  short_id: string;
  name: string;
  status: BuildStatus;
  components: BuildComponent[];
  expected_sale_price_eur: number | null;
  sale_price_eur: number | null;
  sale_date: string | null;
  sale_platform: PlatformKey | null;
  fees_eur: number | null;
  notes: string | null;
  events: BuildEvent[];
  created_at: string;
};

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

export const BUILD_STATUS_LABELS: Record<BuildStatus, string> = {
  in_progress: "En montage",
  tested: "Testé",
  listed: "Listé",
  sold: "Vendu",
  returned: "Retourné",
  failed: "Échec test",
};

export const BUILD_STATUS_BADGE_STYLE: Record<
  BuildStatus,
  { bg: string; fg: string }
> = {
  in_progress: { bg: "rgba(59,130,246,0.12)", fg: "#60A5FA" },
  tested: { bg: "rgba(9,177,186,0.12)", fg: "#09B1BA" },
  listed: { bg: "rgba(245,158,11,0.12)", fg: "#F59E0B" },
  sold: { bg: "rgba(16,185,129,0.12)", fg: "#10B981" },
  returned: { bg: "rgba(113,113,122,0.18)", fg: "#A1A1AA" },
  failed: { bg: "rgba(239,68,68,0.18)", fg: "#EF4444" },
};

export const BUILD_COMPONENT_KIND_LABELS: Record<BuildComponentKind, string> = {
  stock_item: "Du stock",
  new_purchase: "Achat neuf",
  owned_no_cost: "Détenue",
};

export const BUILD_COMPONENT_KIND_BADGE: Record<
  BuildComponentKind,
  { bg: string; fg: string; label: string }
> = {
  stock_item: { bg: "rgba(59,130,246,0.12)", fg: "#60A5FA", label: "DU STOCK" },
  new_purchase: {
    bg: "rgba(245,158,11,0.12)",
    fg: "#F59E0B",
    label: "ACHAT NEUF",
  },
  owned_no_cost: {
    bg: "rgba(113,113,122,0.16)",
    fg: "#A1A1AA",
    label: "DÉTENUE",
  },
};

export const BUILD_EVENT_LABEL: Record<BuildEventType, string> = {
  created: "Build créé",
  component_added: "Composant ajouté",
  component_removed: "Composant retiré",
  tested: "Marqué comme testé",
  untested: "Retour au montage",
  listed: "Mis en vente",
  delisted: "Retiré de la vente",
  sold: "Vendu",
  sale_cancelled: "Vente annulée",
  returned: "Retourné",
  failed: "Échec test",
  resumed: "Build repris",
  duplicated: "Build dupliqué",
};

export const BUILD_EVENT_COLOR: Record<BuildEventType, string> = {
  created: "#60A5FA",
  component_added: "#71717A",
  component_removed: "#71717A",
  tested: "#09B1BA",
  untested: "#A1A1AA",
  listed: "#F59E0B",
  delisted: "#A1A1AA",
  sold: "#10B981",
  sale_cancelled: "#A1A1AA",
  returned: "#71717A",
  failed: "#EF4444",
  resumed: "#60A5FA",
  duplicated: "#A78BFA",
};

// ---------------------------------------------------------------------------
// Helpers calcul
// ---------------------------------------------------------------------------

export function getBuildTotalCost(build: Build): number {
  return build.components.reduce((s, c) => s + (c.purchase_price_eur || 0), 0);
}

export function getBuildComponentsBreakdown(build: Build): {
  stockCount: number;
  newCount: number;
  ownedCount: number;
  formatted: string;
} {
  let stockCount = 0;
  let newCount = 0;
  let ownedCount = 0;
  for (const c of build.components) {
    if (c.kind === "stock_item") stockCount++;
    else if (c.kind === "new_purchase") newCount++;
    else ownedCount++;
  }
  const total = build.components.length;
  const parts: string[] = [];
  if (stockCount > 0) parts.push(`${stockCount} stock`);
  if (newCount > 0) parts.push(`${newCount} neuf`);
  if (ownedCount > 0) parts.push(`${ownedCount} dét.`);
  const sub = parts.length > 0 ? ` · ${parts.join(" · ")}` : "";
  return {
    stockCount,
    newCount,
    ownedCount,
    formatted: `${total} pièce${total > 1 ? "s" : ""}${sub}`,
  };
}

export function getBuildMarge(
  build: Build,
): { eur: number; pct: number } | null {
  const cost = getBuildTotalCost(build);
  const fees = build.fees_eur ?? 0;
  let revenue: number | null = null;
  if (build.status === "sold") {
    revenue = build.sale_price_eur;
  } else if (build.status === "returned") {
    return { eur: -fees, pct: cost > 0 ? (-fees / cost) * 100 : 0 };
  } else if (build.status === "failed") {
    return { eur: -cost, pct: -100 };
  } else {
    revenue = build.expected_sale_price_eur;
  }
  if (revenue == null) return null;
  const eur = revenue - cost - fees;
  const pct = cost > 0 ? (eur / cost) * 100 : 0;
  return { eur, pct };
}

export function getBuildDuration(build: Build): number {
  const start = new Date(build.created_at).getTime();
  if (Number.isNaN(start)) return 0;
  const end =
    (build.status === "sold" || build.status === "returned") && build.sale_date
      ? new Date(build.sale_date).getTime()
      : Date.now();
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
}

export function isBuildDormant(build: Build): boolean {
  if (build.status !== "in_progress" && build.status !== "listed") return false;
  return getBuildDuration(build) >= 60;
}

const SHORT_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateBuildShortId(existingBuilds: Build[]): string {
  const taken = new Set(existingBuilds.map((b) => b.short_id));
  for (let i = 0; i < 100; i++) {
    let suffix = "";
    for (let j = 0; j < 4; j++) {
      suffix += SHORT_ID_ALPHABET[
        Math.floor(Math.random() * SHORT_ID_ALPHABET.length)
      ];
    }
    const id = `BLD-${suffix}`;
    if (!taken.has(id)) return id;
  }
  return `BLD-${Date.now().toString(36).slice(-4).toUpperCase()}`;
}

export function newBuildId(): string {
  return `bld_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function newBuildComponentId(): string {
  return `bcp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function newBuildEvent(
  type: BuildEventType,
  payload?: BuildEvent["payload"],
): BuildEvent {
  return {
    type,
    at: new Date().toISOString(),
    ...(payload ? { payload } : {}),
  };
}

// ---------------------------------------------------------------------------
// KPI agrégats
// ---------------------------------------------------------------------------

export type BuildsKpis = {
  activeCount: number;
  inProgressCount: number;
  testedCount: number;
  listedCount: number;
  totalImmobilizedEur: number;
  margeBuildsVendusEur: number;
  margeMoyennePct: number | null;
  countBuildsVendus: number;
  dormantCount: number;
  pertesEur: number;
  failedCount: number;
};

export function computeBuildsKpis(builds: Build[]): BuildsKpis {
  const inProgress = builds.filter((b) => b.status === "in_progress");
  const tested = builds.filter((b) => b.status === "tested");
  const listed = builds.filter((b) => b.status === "listed");
  const actifs = [...inProgress, ...tested, ...listed];
  const sold = builds.filter((b) => b.status === "sold");
  const failed = builds.filter((b) => b.status === "failed");
  const dormant = builds.filter((b) => isBuildDormant(b));

  const totalImmobilizedEur = actifs.reduce(
    (s, b) => s + getBuildTotalCost(b),
    0,
  );
  const margeBuildsVendusEur = sold.reduce((s, b) => {
    const m = getBuildMarge(b);
    return s + (m?.eur ?? 0);
  }, 0);
  const totalCAVendus = sold.reduce((s, b) => s + (b.sale_price_eur ?? 0), 0);
  const margeMoyennePct =
    totalCAVendus > 0 ? (margeBuildsVendusEur / totalCAVendus) * 100 : null;
  const pertesEur = failed.reduce((s, b) => s + getBuildTotalCost(b), 0);

  return {
    activeCount: actifs.length,
    inProgressCount: inProgress.length,
    testedCount: tested.length,
    listedCount: listed.length,
    totalImmobilizedEur,
    margeBuildsVendusEur,
    margeMoyennePct,
    countBuildsVendus: sold.length,
    dormantCount: dormant.length,
    pertesEur,
    failedCount: failed.length,
  };
}

// ---------------------------------------------------------------------------
// Filtres
// ---------------------------------------------------------------------------

export type BuildsSortKey =
  | "recent_desc"
  | "duration_desc"
  | "cost_desc"
  | "marge_desc"
  | "name_asc";

export const BUILDS_SORT_OPTIONS: Array<{
  key: BuildsSortKey;
  label: string;
}> = [
  { key: "recent_desc", label: "Récent ↓" },
  { key: "duration_desc", label: "Durée ↓" },
  { key: "cost_desc", label: "Coût ↓" },
  { key: "marge_desc", label: "Marge ↓" },
  { key: "name_asc", label: "A → Z" },
];

export type BuildsStatusFilter = BuildStatus | "all";

export const BUILDS_STATUS_TABS: Array<{
  key: BuildsStatusFilter;
  label: string;
  color?: string;
}> = [
  { key: "all", label: "TOUS" },
  { key: "in_progress", label: "MONTAGE", color: "#60A5FA" },
  { key: "tested", label: "TESTÉ", color: "#09B1BA" },
  { key: "listed", label: "LISTÉ", color: "#F59E0B" },
  { key: "sold", label: "VENDU", color: "#10B981" },
];

export type BuildsFilters = {
  search: string;
  status: BuildsStatusFilter;
  sort: BuildsSortKey;
};

export const DEFAULT_BUILDS_FILTERS: BuildsFilters = {
  search: "",
  status: "all",
  sort: "recent_desc",
};

export function applyBuildsFilters(
  builds: Build[],
  filters: BuildsFilters,
): Build[] {
  let result = builds;
  if (filters.status !== "all") {
    result = result.filter((b) => b.status === filters.status);
  }
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.short_id.toLowerCase().includes(q) ||
        (b.notes ?? "").toLowerCase().includes(q),
    );
  }
  const sorted = [...result];
  switch (filters.sort) {
    case "recent_desc":
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
      break;
    case "duration_desc":
      sorted.sort((a, b) => getBuildDuration(b) - getBuildDuration(a));
      break;
    case "cost_desc":
      sorted.sort((a, b) => getBuildTotalCost(b) - getBuildTotalCost(a));
      break;
    case "marge_desc":
      sorted.sort(
        (a, b) => (getBuildMarge(b)?.eur ?? -Infinity) - (getBuildMarge(a)?.eur ?? -Infinity),
      );
      break;
    case "name_asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }
  return sorted;
}

export function isBuildActif(b: Build): boolean {
  return (
    b.status === "in_progress" ||
    b.status === "tested" ||
    b.status === "listed"
  );
}

export function isBuildHistorique(b: Build): boolean {
  return b.status === "sold" || b.status === "returned" || b.status === "failed";
}

/**
 * Snapshot d'un item stock vers un BuildComponent.
 */
export function buildComponentFromStockItem(item: StockItem): BuildComponent {
  return {
    id: newBuildComponentId(),
    kind: "stock_item",
    stock_item_id: item.id,
    label: item.model_name_snapshot,
    category_snapshot: item.category_snapshot,
    purchase_price_eur: item.purchase_price_eur,
    notes: null,
    added_at: new Date().toISOString(),
  };
}