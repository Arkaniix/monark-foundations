import { useCallback, useEffect, useState } from "react";

export type AccountingRegime = "particulier" | "micro_bic" | "reel";

export type CaCompositionToggle = {
  sales_items: boolean;
  sales_builds: boolean;
  external_sale: boolean;
  cashback: boolean;
  refund: boolean;
  donation_received: boolean;
  other_income: boolean;
};

export type MicroBicSettings = {
  versement_liberatoire: boolean;
  tmi_percent: 11 | 30 | 41 | 45;
  activity_start_date: string; // ISO YYYY-MM-DD
  expected_annual_ca_eur: number;
};

export type AccountingSettings = {
  regime: AccountingRegime;
  composition: CaCompositionToggle;
  micro_bic: MicroBicSettings;
};

const KEY = "monark.settings.accounting.v1";

function todayIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export const DEFAULT_ACCOUNTING_SETTINGS: AccountingSettings = {
  regime: "micro_bic",
  composition: {
    sales_items: true,
    sales_builds: true,
    external_sale: true,
    cashback: false,
    refund: false,
    donation_received: false,
    other_income: false,
  },
  micro_bic: {
    versement_liberatoire: true,
    tmi_percent: 30,
    activity_start_date: todayIso(),
    expected_annual_ca_eur: 0,
  },
};

function load(): AccountingSettings {
  if (typeof window === "undefined") return DEFAULT_ACCOUNTING_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_ACCOUNTING_SETTINGS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_ACCOUNTING_SETTINGS;
    const regime: AccountingRegime =
      parsed.regime === "particulier" ||
      parsed.regime === "micro_bic" ||
      parsed.regime === "reel"
        ? parsed.regime
        : DEFAULT_ACCOUNTING_SETTINGS.regime;
    return {
      regime,
      composition: {
        ...DEFAULT_ACCOUNTING_SETTINGS.composition,
        ...(parsed.composition ?? {}),
      },
      micro_bic: {
        ...DEFAULT_ACCOUNTING_SETTINGS.micro_bic,
        ...(parsed.micro_bic ?? {}),
      },
    };
  } catch {
    return DEFAULT_ACCOUNTING_SETTINGS;
  }
}

function save(s: AccountingSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
}

export function useAccountingSettings() {
  const [settings, setSettings] = useState<AccountingSettings>(() => load());

  useEffect(() => {
    save(settings);
  }, [settings]);

  const updateRegime = useCallback((regime: AccountingRegime) => {
    setSettings((prev) => ({ ...prev, regime }));
  }, []);

  const updateComposition = useCallback(
    (patch: Partial<CaCompositionToggle>) => {
      setSettings((prev) => ({
        ...prev,
        composition: { ...prev.composition, ...patch },
      }));
    },
    [],
  );

  const updateMicroBic = useCallback((patch: Partial<MicroBicSettings>) => {
    setSettings((prev) => ({
      ...prev,
      micro_bic: { ...prev.micro_bic, ...patch },
    }));
  }, []);

  return { settings, updateRegime, updateComposition, updateMicroBic };
}