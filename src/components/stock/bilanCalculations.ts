import { getNumberLocale } from "@/lib/numberFormat";
import type { StockItem } from "./datasets";
import type { Build } from "./buildsDatasets";
import { getBuildTotalCost } from "./buildsDatasets";
import type { AccountingEntry, ExpenseCategory } from "./accountingDatasets";
import { ACCOUNTING_CATEGORIES_META } from "./accountingDatasets";
import type {
  AccountingRegime,
  CaCompositionToggle,
  MicroBicSettings,
} from "@/lib/useAccountingSettings";

// ---------------------------------------------------------------------------
// Constantes (valeurs 2026)
// ---------------------------------------------------------------------------

export const SEUIL_FRANCHISE_TVA_MARCHANDISES_2026 = 85000;
export const SEUIL_REGIME_MICRO_2026 = 203100;
export const URSSAF_TAUX_MARCHANDISES = 0.123;
export const IR_LIBERATOIRE_TAUX_MARCHANDISES = 0.01;
export const ABATTEMENT_MICRO_BIC_MARCHANDISES = 0.71;

export const REGIME_LABELS: Record<AccountingRegime, string> = {
  particulier: "Particulier",
  micro_bic: "Micro-entreprise",
  reel: "Régime réel",
};

export const REGIME_BADGE_LABEL: Record<AccountingRegime, string> = {
  particulier: "PARTICULIER",
  micro_bic: "MICRO-BIC",
  reel: "RÉGIME RÉEL",
};

export const REGIME_DESCRIPTIONS: Record<AccountingRegime, string> = {
  particulier:
    "Vous revendez à titre personnel, sans activité régulière déclarée.",
  micro_bic:
    "Régime simplifié pour activité commerciale régulière (vente de marchandises).",
  reel: "Régime de comptabilité réelle avec écritures détaillées.",
};

export const COMPOSITION_LABELS: Record<keyof CaCompositionToggle, string> = {
  sales_items: "Ventes d'items du stock",
  sales_builds: "Ventes de builds",
  external_sale: "Gains externes · Vente hors-Monark",
  cashback: "Gains externes · Cashback / bonus",
  refund: "Gains externes · Remboursement plateforme",
  donation_received: "Gains externes · Don / cadeau reçu",
  other_income: "Gains externes · Autre",
};

export const COMPOSITION_RECOMMENDATION: Record<
  keyof CaCompositionToggle,
  "recommended" | "user_choice" | "discouraged"
> = {
  sales_items: "recommended",
  sales_builds: "recommended",
  external_sale: "recommended",
  cashback: "user_choice",
  refund: "discouraged",
  donation_received: "discouraged",
  other_income: "user_choice",
};

export const RECOMMENDATION_LABEL = {
  recommended: "recommandé",
  user_choice: "à votre choix",
  discouraged: "déconseillé",
} as const;

export const COMPOSITION_COLORS: Record<keyof CaCompositionToggle, string> = {
  sales_items: "#3B82F6",
  sales_builds: "#10B981",
  external_sale: "#F59E0B",
  cashback: "#A78BFA",
  refund: "#EC4899",
  donation_received: "#71717A",
  other_income: "#52525B",
};

const MONTHS_SHORT_FR = [
  "jan",
  "fév",
  "mar",
  "avr",
  "mai",
  "jun",
  "jul",
  "aoû",
  "sep",
  "oct",
  "nov",
  "déc",
];

export function monthLabel(idx: number): string {
  return MONTHS_SHORT_FR[idx] ?? "";
}

// ---------------------------------------------------------------------------
// Helpers internes
// ---------------------------------------------------------------------------

function inYear(iso: string | null | undefined, year: number): boolean {
  if (!iso) return false;
  return iso.startsWith(String(year));
}

function monthIndex(iso: string): number {
  const m = parseInt(iso.slice(5, 7), 10);
  return Number.isNaN(m) ? 0 : m - 1;
}

// ---------------------------------------------------------------------------
// CA déclarable
// ---------------------------------------------------------------------------

export type CaCategoryBreakdown = {
  key: keyof CaCompositionToggle;
  label: string;
  amountEur: number;
  pct: number;
  color: string;
};

export function computeCaDeclarable(
  year: number,
  composition: CaCompositionToggle,
  stockItems: StockItem[],
  builds: Build[],
  accountingEntries: AccountingEntry[],
): { totalEur: number; byCategory: CaCategoryBreakdown[] } {
  const amounts: Record<keyof CaCompositionToggle, number> = {
    sales_items: 0,
    sales_builds: 0,
    external_sale: 0,
    cashback: 0,
    refund: 0,
    donation_received: 0,
    other_income: 0,
  };

  // Items vendus (hors composants de builds)
  for (const it of stockItems) {
    if (it.status !== "sold") continue;
    if (it.build_id != null && (it.sale_price_eur ?? 0) === 0) continue;
    if (!inYear(it.sale_date, year)) continue;
    amounts.sales_items += it.sale_price_eur ?? 0;
  }

  // Builds vendus
  for (const b of builds) {
    if (b.status !== "sold") continue;
    if (!inYear(b.sale_date, year)) continue;
    amounts.sales_builds += b.sale_price_eur ?? 0;
  }

  // Gains externes par catégorie
  for (const e of accountingEntries) {
    if (e.kind !== "income") continue;
    if (!inYear(e.date, year)) continue;
    if (e.category === "external_sale") amounts.external_sale += e.amount_eur;
    else if (e.category === "cashback") amounts.cashback += e.amount_eur;
    else if (e.category === "refund") amounts.refund += e.amount_eur;
    else if (e.category === "donation_received")
      amounts.donation_received += e.amount_eur;
    else if (e.category === "other_income") amounts.other_income += e.amount_eur;
  }

  let total = 0;
  for (const k of Object.keys(amounts) as Array<keyof CaCompositionToggle>) {
    if (composition[k]) total += amounts[k];
  }

  const byCategory: CaCategoryBreakdown[] = (
    Object.keys(amounts) as Array<keyof CaCompositionToggle>
  )
    .filter((k) => composition[k] && amounts[k] > 0)
    .map((k) => ({
      key: k,
      label: COMPOSITION_LABELS[k],
      amountEur: amounts[k],
      pct: total > 0 ? (amounts[k] / total) * 100 : 0,
      color: COMPOSITION_COLORS[k],
    }))
    .sort((a, b) => b.amountEur - a.amountEur);

  return { totalEur: total, byCategory };
}

// Variante pour récupérer le total par toggle (utilisée dans § 05)
export function computeCaPerToggle(
  year: number,
  stockItems: StockItem[],
  builds: Build[],
  accountingEntries: AccountingEntry[],
): Record<keyof CaCompositionToggle, number> {
  const amounts: Record<keyof CaCompositionToggle, number> = {
    sales_items: 0,
    sales_builds: 0,
    external_sale: 0,
    cashback: 0,
    refund: 0,
    donation_received: 0,
    other_income: 0,
  };
  for (const it of stockItems) {
    if (it.status !== "sold") continue;
    if (it.build_id != null && (it.sale_price_eur ?? 0) === 0) continue;
    if (!inYear(it.sale_date, year)) continue;
    amounts.sales_items += it.sale_price_eur ?? 0;
  }
  for (const b of builds) {
    if (b.status !== "sold") continue;
    if (!inYear(b.sale_date, year)) continue;
    amounts.sales_builds += b.sale_price_eur ?? 0;
  }
  for (const e of accountingEntries) {
    if (e.kind !== "income") continue;
    if (!inYear(e.date, year)) continue;
    if (e.category === "external_sale") amounts.external_sale += e.amount_eur;
    else if (e.category === "cashback") amounts.cashback += e.amount_eur;
    else if (e.category === "refund") amounts.refund += e.amount_eur;
    else if (e.category === "donation_received")
      amounts.donation_received += e.amount_eur;
    else if (e.category === "other_income") amounts.other_income += e.amount_eur;
  }
  return amounts;
}

// ---------------------------------------------------------------------------
// Marge globale
// ---------------------------------------------------------------------------

export function computeMargeNetteGlobaleAnnuelle(
  year: number,
  stockItems: StockItem[],
  builds: Build[],
  accountingEntries: AccountingEntry[],
  composition: CaCompositionToggle,
): {
  margeVentesEur: number;
  netBalanceComptesEur: number;
  margeNetteGlobaleEur: number;
  margeMoyennePct: number | null;
} {
  let margeVentesEur = 0;

  for (const it of stockItems) {
    if (it.status !== "sold") continue;
    if (!inYear(it.sale_date, year)) continue;
    if (it.build_id != null && (it.sale_price_eur ?? 0) === 0) continue;
    const sale = it.sale_price_eur ?? 0;
    margeVentesEur += sale - it.purchase_price_eur - (it.fees_eur ?? 0);
  }

  for (const b of builds) {
    if (b.status !== "sold") continue;
    if (!inYear(b.sale_date, year)) continue;
    const sale = b.sale_price_eur ?? 0;
    margeVentesEur += sale - getBuildTotalCost(b) - (b.fees_eur ?? 0);
  }

  let expenses = 0;
  let incomes = 0;
  for (const e of accountingEntries) {
    if (!inYear(e.date, year)) continue;
    if (e.kind === "expense") expenses += e.amount_eur;
    else incomes += e.amount_eur;
  }
  const netBalanceComptesEur = incomes - expenses;

  const margeNetteGlobaleEur = margeVentesEur + netBalanceComptesEur;
  const ca = computeCaDeclarable(
    year,
    composition,
    stockItems,
    builds,
    accountingEntries,
  ).totalEur;
  const margeMoyennePct =
    ca > 0 ? (margeNetteGlobaleEur / ca) * 100 : null;

  return {
    margeVentesEur,
    netBalanceComptesEur,
    margeNetteGlobaleEur,
    margeMoyennePct,
  };
}

// ---------------------------------------------------------------------------
// Dépenses annuelles
// ---------------------------------------------------------------------------

export function computeDepensesAnnuelles(
  year: number,
  accountingEntries: AccountingEntry[],
  caEur: number,
): {
  totalEur: number;
  byCategory: Array<{
    category: ExpenseCategory;
    label: string;
    amountEur: number;
  }>;
  ratioOverCa: number | null;
} {
  const map = new Map<ExpenseCategory, number>();
  let total = 0;
  for (const e of accountingEntries) {
    if (e.kind !== "expense") continue;
    if (!inYear(e.date, year)) continue;
    const cat = e.category as ExpenseCategory;
    map.set(cat, (map.get(cat) ?? 0) + e.amount_eur);
    total += e.amount_eur;
  }
  const byCategory = Array.from(map.entries())
    .filter(([, v]) => v > 0)
    .map(([cat, amount]) => ({
      category: cat,
      label: ACCOUNTING_CATEGORIES_META[cat]?.label ?? cat,
      amountEur: amount,
    }))
    .sort((a, b) => b.amountEur - a.amountEur);

  return {
    totalEur: total,
    byCategory,
    ratioOverCa: caEur > 0 ? (total / caEur) * 100 : null,
  };
}

// ---------------------------------------------------------------------------
// Cotisations micro-BIC
// ---------------------------------------------------------------------------

export function computeCotisationsMicroBic(
  caDeclarable: number,
  settings: MicroBicSettings,
): {
  urssafEur: number;
  irLiberatoireEur: number | null;
  irBaremeAlternatifEur: number;
  totalCotisEur: number;
  revenuImposableEur: number;
} {
  const urssafEur = caDeclarable * URSSAF_TAUX_MARCHANDISES;
  const revenuImposableEur =
    caDeclarable * (1 - ABATTEMENT_MICRO_BIC_MARCHANDISES);
  const irBaremeAlternatifEur =
    revenuImposableEur * (settings.tmi_percent / 100);
  const irLiberatoireEur = settings.versement_liberatoire
    ? caDeclarable * IR_LIBERATOIRE_TAUX_MARCHANDISES
    : null;
  const irApplique =
    irLiberatoireEur != null ? irLiberatoireEur : irBaremeAlternatifEur;
  return {
    urssafEur,
    irLiberatoireEur,
    irBaremeAlternatifEur,
    totalCotisEur: urssafEur + irApplique,
    revenuImposableEur,
  };
}

// ---------------------------------------------------------------------------
// Seuils TVA
// ---------------------------------------------------------------------------

export function computeSeuilsTva(
  year: number,
  caDeclarable: number,
  activityStartDate: string,
): {
  caCourant: number;
  seuilFranchiseTva: number;
  pctFranchise: number;
  seuilRegimeMicro: number;
  pctRegimeMicro: number;
  status: "ok" | "warning" | "exceeded";
} {
  let seuilFranchiseTva = SEUIL_FRANCHISE_TVA_MARCHANDISES_2026;

  // Proratisation année 1
  const start = new Date(activityStartDate);
  if (!Number.isNaN(start.getTime()) && start.getFullYear() === year) {
    const endOfYear = new Date(year, 11, 31);
    const days =
      Math.floor(
        (endOfYear.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;
    const ratio = Math.max(0, Math.min(1, days / 365));
    seuilFranchiseTva = Math.round(SEUIL_FRANCHISE_TVA_MARCHANDISES_2026 * ratio);
  }

  const pctFranchise =
    seuilFranchiseTva > 0 ? (caDeclarable / seuilFranchiseTva) * 100 : 0;
  const pctRegimeMicro = (caDeclarable / SEUIL_REGIME_MICRO_2026) * 100;

  const status: "ok" | "warning" | "exceeded" =
    caDeclarable > seuilFranchiseTva
      ? "exceeded"
      : pctFranchise >= 80
        ? "warning"
        : "ok";

  return {
    caCourant: caDeclarable,
    seuilFranchiseTva,
    pctFranchise,
    seuilRegimeMicro: SEUIL_REGIME_MICRO_2026,
    pctRegimeMicro,
    status,
  };
}

export function computeResteASoi(
  margeNetteGlobaleEur: number,
  totalCotisEur: number,
): number {
  return margeNetteGlobaleEur - totalCotisEur;
}

// ---------------------------------------------------------------------------
// Évolution mensuelle
// ---------------------------------------------------------------------------

export function computeCaMensuelAnnuel(
  year: number,
  composition: CaCompositionToggle,
  stockItems: StockItem[],
  builds: Build[],
  accountingEntries: AccountingEntry[],
): number[] {
  const months = new Array(12).fill(0) as number[];

  if (composition.sales_items) {
    for (const it of stockItems) {
      if (it.status !== "sold" || !inYear(it.sale_date, year)) continue;
      if (it.build_id != null && (it.sale_price_eur ?? 0) === 0) continue;
      months[monthIndex(it.sale_date!)] += it.sale_price_eur ?? 0;
    }
  }
  if (composition.sales_builds) {
    for (const b of builds) {
      if (b.status !== "sold" || !inYear(b.sale_date, year)) continue;
      months[monthIndex(b.sale_date!)] += b.sale_price_eur ?? 0;
    }
  }
  for (const e of accountingEntries) {
    if (e.kind !== "income" || !inYear(e.date, year)) continue;
    const k = e.category as keyof CaCompositionToggle;
    if (k in composition && composition[k]) {
      months[monthIndex(e.date)] += e.amount_eur;
    }
  }

  return months;
}

export function projectCaMensuelRestant(
  caMensuelPartiel: number[],
  currentMonthIndex: number,
): number[] {
  const result = [...caMensuelPartiel];
  const known = caMensuelPartiel.slice(0, currentMonthIndex + 1);
  if (known.length === 0) return result;
  const sum = known.reduce((s, v) => s + v, 0);
  const avg = sum / known.length;
  for (let i = currentMonthIndex + 1; i < 12; i++) {
    result[i] = avg;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

const NBSP = "\u00A0";

export function formatEurInt(v: number): string {
  return new Intl.NumberFormat(getNumberLocale(), {
    maximumFractionDigits: 0,
  }).format(v);
}

export function formatEurSignedInt(v: number): string {
  if (v === 0) return `0${NBSP}€`;
  const sign = v > 0 ? "+" : "−";
  return `${sign}${formatEurInt(Math.abs(v))}${NBSP}€`;
}

export function formatPctSigned(v: number): string {
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${Math.abs(v).toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

export function buildBilanCsv(
  year: number,
  stockItems: StockItem[],
  builds: Build[],
  accountingEntries: AccountingEntry[],
): string {
  const rows: string[] = ["Section,Categorie,Date,Description,Montant_EUR"];
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;

  for (const it of stockItems) {
    if (it.status !== "sold" || !inYear(it.sale_date, year)) continue;
    if (it.build_id != null && (it.sale_price_eur ?? 0) === 0) continue;
    rows.push(
      [
        "Ventes items",
        esc(it.category_snapshot),
        it.sale_date ?? "",
        esc(`${it.model_name_snapshot} → ${it.sale_price_eur ?? 0} €`),
        String(it.sale_price_eur ?? 0),
      ].join(","),
    );
  }
  for (const b of builds) {
    if (b.status !== "sold" || !inYear(b.sale_date, year)) continue;
    rows.push(
      [
        "Ventes builds",
        "—",
        b.sale_date ?? "",
        esc(`${b.short_id} ${b.name}`),
        String(b.sale_price_eur ?? 0),
      ].join(","),
    );
  }
  for (const e of accountingEntries) {
    if (!inYear(e.date, year)) continue;
    const meta = ACCOUNTING_CATEGORIES_META[e.category];
    const section = e.kind === "expense" ? "Dépenses" : "Gains externes";
    const amount = e.kind === "expense" ? -e.amount_eur : e.amount_eur;
    rows.push(
      [
        section,
        esc(meta?.label ?? e.category),
        e.date,
        esc(e.note || meta?.label || e.category),
        amount.toFixed(2),
      ].join(","),
    );
  }

  return rows.join("\n");
}

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// UI prefs
// ---------------------------------------------------------------------------

const EXPANDED_YEAR_KEY = "monark.bilan.expanded_year.v1";
const SETTINGS_OPEN_KEY = "monark.bilan.settings_open.v1";

export function loadExpandedYear(): number {
  if (typeof window === "undefined") return new Date().getFullYear();
  try {
    const raw = window.localStorage.getItem(EXPANDED_YEAR_KEY);
    if (!raw) return new Date().getFullYear();
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : new Date().getFullYear();
  } catch {
    return new Date().getFullYear();
  }
}

export function saveExpandedYear(y: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(EXPANDED_YEAR_KEY, String(y));
  } catch {
    /* noop */
  }
}

export function loadSettingsOpen(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SETTINGS_OPEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveSettingsOpen(open: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SETTINGS_OPEN_KEY, open ? "1" : "0");
  } catch {
    /* noop */
  }
}