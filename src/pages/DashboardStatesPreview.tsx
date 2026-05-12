import { useMemo, useState } from "react";
import Dashboard, { type FetchState } from "./Dashboard";
import type {
  DashboardOverview,
  RecentEstimation,
  StatTileData,
  WatchlistItem,
} from "@/components/dashboard/datasets";

/**
 * Preview dev — page interne pour visualiser les 4 états du Dashboard sans
 * manipuler les fixtures mock.
 *
 * 4 états togglables :
 *   - loading  : skeletons sur les 3 sections
 *   - success  : données peuplées (5 estimations + 4 watchlist items + stats)
 *   - empty    : stats peuplées mais recent_estimations=[] et watchlist_preview=[]
 *   - error    : DashboardError pleine page avec Retry
 *
 * Utilise le prop __devForceState exposé par Dashboard.tsx (préfixe __ pour
 * signaler usage dev exclusivement). Aucune modification des fixtures mock.
 */

type PreviewState = "loading" | "success" | "empty" | "error";

const PREVIEW_LABELS: Record<PreviewState, string> = {
  loading: "Loading",
  success: "Success peuplé",
  empty: "Empty (sections vides)",
  error: "Error pleine page",
};

// Données fixes pour les états success et empty
function buildSuccessData(): DashboardOverview {
  const stats: StatTileData[] = [
    {
      id: "estimations_month",
      label: "ESTIMATIONS CE MOIS",
      value: 12,
      delta_pct: 33.3,
      sparkline: Array.from({ length: 30 }, (_, i) => 0.4 + Math.random() * 0.3),
      format_hint: "integer",
      accent_color: "#3B82F6",
    },
    {
      id: "average_margin",
      label: "MARGE MOYENNE",
      value: 85,
      delta_pct: 8.2,
      sparkline: Array.from({ length: 30 }, () => 80 + Math.random() * 12),
      format_hint: "euro",
      accent_color: "#10B981",
    },
    {
      id: "watchlist_count",
      label: "MODÈLES SUIVIS",
      value: 27,
      delta_pct: 12.5,
      sparkline: Array.from({ length: 30 }, () => 24 + Math.random() * 4),
      format_hint: "integer",
      accent_color: "#3B82F6",
    },
    {
      id: "credits_remaining",
      label: "CRÉDITS RESTANTS",
      value: 89,
      delta_pct: null,
      sparkline: Array.from({ length: 30 }, () => 85 + Math.random() * 6),
      format_hint: "ratio",
      accent_color: "#10B981",
    },
  ];

  const hoursAgo = (h: number) =>
    new Date(Date.now() - h * 3600 * 1000).toISOString();

  const recent_estimations: RecentEstimation[] = [
    {
      id: "p_01",
      model_name: "RTX 4070 SUPER",
      category: "GPU",
      verdict: "FONCER",
      listing_price_eur: 480,
      net_margin_eur: 95,
      created_at: hoursAgo(2),
    },
    {
      id: "p_02",
      model_name: "7800X3D",
      category: "CPU",
      verdict: "NÉGOCIER",
      listing_price_eur: 320,
      net_margin_eur: 42,
      created_at: hoursAgo(8),
    },
    {
      id: "p_03",
      model_name: "DDR5-6000 32GB",
      category: "RAM",
      verdict: "TENTER",
      listing_price_eur: 110,
      net_margin_eur: 18,
      created_at: hoursAgo(26),
    },
    {
      id: "p_04",
      model_name: "RTX 4090",
      category: "GPU",
      verdict: "PASSER",
      listing_price_eur: 1850,
      net_margin_eur: -45,
      created_at: hoursAgo(48),
    },
    {
      id: "p_05",
      model_name: "B650 TOMAHAWK",
      category: "MOBO",
      verdict: "FONCER",
      listing_price_eur: 140,
      net_margin_eur: 35,
      created_at: hoursAgo(72),
    },
  ];

  const watchlist_preview: WatchlistItem[] = [
    {
      id: "p_wl_01",
      model_name: "RTX 4080 SUPER",
      category: "GPU",
      average_price_7d: 920,
      delta_pct_vs_14d: -3.8,
      sparkline: Array.from({ length: 7 }, () => 920 + (Math.random() - 0.5) * 40),
    },
    {
      id: "p_wl_02",
      model_name: "7900X3D",
      category: "CPU",
      average_price_7d: 425,
      delta_pct_vs_14d: 2.1,
      sparkline: Array.from({ length: 7 }, () => 425 + (Math.random() - 0.5) * 20),
    },
    {
      id: "p_wl_03",
      model_name: "990 PRO 2TB",
      category: "SSD",
      average_price_7d: 165,
      delta_pct_vs_14d: -7.2,
      sparkline: Array.from({ length: 7 }, () => 165 + (Math.random() - 0.5) * 18),
    },
    {
      id: "p_wl_04",
      model_name: "X670E HERO",
      category: "MOBO",
      average_price_7d: 380,
      delta_pct_vs_14d: 0.4,
      sparkline: Array.from({ length: 7 }, () => 380 + (Math.random() - 0.5) * 10),
    },
  ];

  return {
    stats,
    recent_estimations,
    watchlist_preview,
    generated_at: new Date().toISOString(),
  };
}

function buildEmptyData(): DashboardOverview {
  const successData = buildSuccessData();
  return {
    ...successData,
    recent_estimations: [],
    watchlist_preview: [],
  };
}

export default function DashboardStatesPreview() {
  const [current, setCurrent] = useState<PreviewState>("success");

  // Mémoïse pour éviter de regénérer les fixtures aléatoires à chaque toggle
  const successData = useMemo(() => buildSuccessData(), []);
  const emptyData = useMemo(() => buildEmptyData(), []);

  const forcedState: FetchState = useMemo(() => {
    switch (current) {
      case "loading":
        return { status: "loading" };
      case "success":
        return { status: "success", data: successData };
      case "empty":
        return { status: "success", data: emptyData };
      case "error":
        return {
          status: "error",
          message: "Erreur fictive — Network timeout (dev preview)",
        };
    }
  }, [current, successData, emptyData]);

  return (
    <div className="flex min-h-screen flex-col gap-8 bg-[#0A0A0B] p-8">
      {/* Header preview */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
            DEV / PREVIEW
          </div>
          <div className="h-px w-10 bg-white/10" />
          <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
            DASHBOARD STATES
          </div>
        </div>
        <h1 className="text-[22px] font-semibold tracking-tight text-zinc-100">
          Aperçu des 4 états du Dashboard
        </h1>
        <p className="text-[13px] text-zinc-400">
          Page interne pour visualiser tous les états sans manipuler les
          fixtures mock. Le Dashboard rendu ci-dessous utilise le prop{" "}
          <code className="font-mono text-[12px] text-zinc-300">
            __devForceState
          </code>{" "}
          qui court-circuite le fetch normal.
        </p>

        {/* Toggle buttons */}
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(PREVIEW_LABELS) as PreviewState[]).map((s) => {
            const active = current === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setCurrent(s)}
                className="ease-expo rounded-md border px-3 py-1.5 transition-colors"
                style={{
                  background: active
                    ? "rgba(59,130,246,0.14)"
                    : "rgba(255,255,255,0.02)",
                  borderColor: active
                    ? "rgba(59,130,246,0.4)"
                    : "rgba(255,255,255,0.08)",
                }}
              >
                <span
                  className="font-mono text-[11px] tracking-wider"
                  style={{ color: active ? "#93c5fd" : "#a1a1aa" }}
                >
                  {PREVIEW_LABELS[s].toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rendu Dashboard avec state forcé */}
      <Dashboard __devForceState={forcedState} />
    </div>
  );
}
