import {
  Send,
  Package,
  Repeat,
  Zap,
  Wrench,
  CreditCard,
  Car,
  Circle,
  Undo2,
  Gift,
  ArrowUpRight,
  HandHeart,
  type LucideIcon,
} from "lucide-react";

export type AccountingKind = "expense" | "income";

export type ExpenseCategory =
  | "shipping_out"
  | "shipping_in"
  | "subscription"
  | "electricity"
  | "equipment"
  | "bank_fees"
  | "transport"
  | "other_expense";

export type IncomeCategory =
  | "refund"
  | "cashback"
  | "external_sale"
  | "donation_received"
  | "other_income";

export type AccountingCategory = ExpenseCategory | IncomeCategory;

export type AccountingEntry = {
  id: string;
  kind: AccountingKind;
  category: AccountingCategory;
  amount_eur: number;
  date: string;
  note: string;
  is_professional: boolean;
  created_at: string;
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "shipping_out",
  "shipping_in",
  "subscription",
  "electricity",
  "equipment",
  "bank_fees",
  "transport",
  "other_expense",
];

export const INCOME_CATEGORIES: IncomeCategory[] = [
  "refund",
  "cashback",
  "external_sale",
  "donation_received",
  "other_income",
];

export const ACCOUNTING_CATEGORIES_META: Record<
  AccountingCategory,
  { label: string; kind: AccountingKind; icon: LucideIcon }
> = {
  shipping_out: { label: "Port à l'envoi", kind: "expense", icon: Send },
  shipping_in: { label: "Port à l'achat", kind: "expense", icon: Package },
  subscription: { label: "Abonnement", kind: "expense", icon: Repeat },
  electricity: { label: "Électricité", kind: "expense", icon: Zap },
  equipment: { label: "Équipement atelier", kind: "expense", icon: Wrench },
  bank_fees: { label: "Frais bancaires", kind: "expense", icon: CreditCard },
  transport: { label: "Déplacement", kind: "expense", icon: Car },
  other_expense: { label: "Autre", kind: "expense", icon: Circle },
  refund: { label: "Remboursement plateforme", kind: "income", icon: Undo2 },
  cashback: { label: "Cashback / bonus", kind: "income", icon: Gift },
  external_sale: { label: "Vente hors-Monark", kind: "income", icon: ArrowUpRight },
  donation_received: { label: "Don / cadeau reçu", kind: "income", icon: HandHeart },
  other_income: { label: "Autre", kind: "income", icon: Circle },
};

export type AccountingFilters = {
  search: string;
  kind: "all" | AccountingKind;
  category: AccountingCategory | "all";
  sort: "date_desc" | "date_asc" | "amount_desc" | "amount_asc";
};

export const DEFAULT_ACCOUNTING_FILTERS: AccountingFilters = {
  search: "",
  kind: "all",
  category: "all",
  sort: "date_desc",
};

export type AccountingViewMode = "flat" | "monthly";

const VIEW_MODE_KEY = "monark.accounting.view_mode.v1";
const EXPANDED_MONTHS_KEY = "monark.accounting.expanded_months.v1";

export function loadAccountingViewMode(): AccountingViewMode {
  if (typeof window === "undefined") return "flat";
  try {
    const raw = window.localStorage.getItem(VIEW_MODE_KEY);
    return raw === "monthly" ? "monthly" : "flat";
  } catch {
    return "flat";
  }
}

export function saveAccountingViewMode(v: AccountingViewMode) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VIEW_MODE_KEY, v);
  } catch {
    /* noop */
  }
}

export function loadExpandedMonths(fallback: string[]): string[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(EXPANDED_MONTHS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      return parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function saveExpandedMonths(months: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(EXPANDED_MONTHS_KEY, JSON.stringify(months));
  } catch {
    /* noop */
  }
}

export function newAccountingEntryId(): string {
  return `acc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function signedAmount(entry: AccountingEntry): number {
  return entry.kind === "expense" ? -entry.amount_eur : entry.amount_eur;
}

const NBSP = "\u00A0";

export function formatSignedEur(entry: AccountingEntry): string {
  const sign = entry.kind === "expense" ? "−" : "+";
  const value = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(entry.amount_eur);
  return `${sign}${value}${NBSP}€`;
}

export function formatEurSigned(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const abs = Math.abs(value);
  const v = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return `${sign}${v}${NBSP}€`;
}

export function toYearMonth(isoDate: string): string {
  return isoDate.slice(0, 7);
}

const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export function formatYearMonthFR(yearMonth: string): string {
  const [y, m] = yearMonth.split("-");
  const idx = Number.parseInt(m, 10) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx > 11) return yearMonth;
  return `${MONTHS_FR[idx]} ${y}`;
}

export function currentYearMonth(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${m}`;
}

export function groupByYearMonth(
  entries: AccountingEntry[],
): Map<string, AccountingEntry[]> {
  const map = new Map<string, AccountingEntry[]>();
  // assume entries already in date desc; preserve order
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  for (const e of sorted) {
    const k = toYearMonth(e.date);
    const arr = map.get(k);
    if (arr) arr.push(e);
    else map.set(k, [e]);
  }
  return map;
}

export type AccountingKpi = {
  expensesTotalEur: number;
  incomesTotalEur: number;
  netBalanceEur: number;
  countExpenses: number;
  countIncomes: number;
};

export function computeAccountingKpis(entries: AccountingEntry[]): AccountingKpi {
  let expensesTotalEur = 0;
  let incomesTotalEur = 0;
  let countExpenses = 0;
  let countIncomes = 0;
  for (const e of entries) {
    if (e.kind === "expense") {
      expensesTotalEur += e.amount_eur;
      countExpenses += 1;
    } else {
      incomesTotalEur += e.amount_eur;
      countIncomes += 1;
    }
  }
  return {
    expensesTotalEur,
    incomesTotalEur,
    netBalanceEur: incomesTotalEur - expensesTotalEur,
    countExpenses,
    countIncomes,
  };
}

export function computeMargeNetteGlobaleEur(
  margeVentesEur: number,
  netBalanceEur: number,
): number {
  return margeVentesEur + netBalanceEur;
}

export function computeRatioDepensesCa(
  expensesTotalEur: number,
  caEur: number,
): number | null {
  if (caEur === 0) return null;
  return (expensesTotalEur / caEur) * 100;
}

export function applyAccountingFilters(
  entries: AccountingEntry[],
  filters: AccountingFilters,
): AccountingEntry[] {
  let result = entries;

  if (filters.kind !== "all") {
    result = result.filter((e) => e.kind === filters.kind);
  }

  if (filters.category !== "all") {
    result = result.filter((e) => e.category === filters.category);
  }

  const q = filters.search.trim().toLowerCase();
  if (q) {
    result = result.filter((e) => e.note.toLowerCase().includes(q));
  }

  const sorted = [...result];
  switch (filters.sort) {
    case "date_desc":
      sorted.sort((a, b) => b.date.localeCompare(a.date));
      break;
    case "date_asc":
      sorted.sort((a, b) => a.date.localeCompare(b.date));
      break;
    case "amount_desc":
      sorted.sort((a, b) => b.amount_eur - a.amount_eur);
      break;
    case "amount_asc":
      sorted.sort((a, b) => a.amount_eur - b.amount_eur);
      break;
  }
  return sorted;
}

export function formatDateShortFR(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(d);
}

export const KIND_COLOR = {
  expense: "#EF4444",
  income: "#10B981",
} as const;

export const KIND_LABEL: Record<AccountingKind, string> = {
  expense: "DÉPENSE",
  income: "GAIN",
};