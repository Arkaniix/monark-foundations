import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAccountingSettings, patchAccountingSettings } from "./api/settings";

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

export function useAccountingSettings() {
  const [settings, setSettings] = useState<AccountingSettings>(
    DEFAULT_ACCOUNTING_SETTINGS,
  );
  const [loading, setLoading] = useState(true);
  const hydrated = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    fetchAccountingSettings()
      .then((s) => {
        if (!alive) return;
        setSettings({
          regime: s?.regime ?? DEFAULT_ACCOUNTING_SETTINGS.regime,
          composition: {
            ...DEFAULT_ACCOUNTING_SETTINGS.composition,
            ...(s?.composition ?? {}),
          },
          micro_bic: {
            ...DEFAULT_ACCOUNTING_SETTINGS.micro_bic,
            ...(s?.micro_bic ?? {}),
          },
        });
      })
      .catch(() => {
        /* defaults */
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
          hydrated.current = true;
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void patchAccountingSettings(settings).catch(() => {});
    }, 600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [settings]);

  const updateRegime = useCallback(
    (regime: AccountingRegime) => setSettings((p) => ({ ...p, regime })),
    [],
  );
  const updateComposition = useCallback(
    (patch: Partial<CaCompositionToggle>) =>
      setSettings((p) => ({
        ...p,
        composition: { ...p.composition, ...patch },
      })),
    [],
  );
  const updateMicroBic = useCallback(
    (patch: Partial<MicroBicSettings>) =>
      setSettings((p) => ({ ...p, micro_bic: { ...p.micro_bic, ...patch } })),
    [],
  );

  return { settings, loading, updateRegime, updateComposition, updateMicroBic };
}