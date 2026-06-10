import { useMemo, useState } from "react";
import { History, X, RefreshCw, Trash2 } from "lucide-react";
import {
  type EstimatorHistoryEntry,
  formatRelativeTime,
  formatShortDate,
  isStale,
} from "@/lib/estimatorHistory";
import type {
  EstimatorInputs,
  Platform,
  Verdict,
} from "./datasets";
import { VERDICT_COLORS, VERDICT_DISPLAY_LABELS } from "./datasets";

const PLATFORM_COLORS: Record<Platform, string> = {
  LBC: "#FF6E14",
  eBay: "#0064D2",
  Vinted: "#09B1BA",
};

function scoreColor(score: number): string {
  if (score >= 75) return "#10B981";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
}

function marginColor(eur: number): string {
  if (eur >= 50) return "#10B981";
  if (eur >= 0) return "#F59E0B";
  return "#EF4444";
}

type EstimatorHistoryDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  entries: EstimatorHistoryEntry[];
  cap: number;
  onLoad: (entry: EstimatorHistoryEntry) => void;
  onReevaluate: (inputs: EstimatorInputs) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
};

export default function EstimatorHistoryDrawer({
  isOpen,
  onClose,
  entries,
  cap,
  onLoad,
  onReevaluate,
  onDelete,
  onClearAll,
}: EstimatorHistoryDrawerProps) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.toLowerCase().trim();
    if (!q) return entries;
    return entries.filter((e) => e.inputs.model.toLowerCase().includes(q));
  }, [entries, filter]);

  const handleClearAll = () => {
    if (entries.length === 0) return;
    if (
      window.confirm(
        `Effacer les ${entries.length} évaluation${entries.length > 1 ? "s" : ""} de l'historique ? Cette action est irréversible.`,
      )
    ) {
      onClearAll();
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Historique des évaluations"
        className={`fixed top-0 right-0 bottom-0 z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          width: "min(480px, 92%)",
          background: "#0A0A0B",
          borderLeft: "0.5px solid rgba(255,255,255,0.12)",
          boxShadow: "-20px 0 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="flex items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-2.5">
            <History className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.8} />
            <span className="font-mono text-[11px] tracking-[0.2em] font-medium text-zinc-200">
              HISTORIQUE
            </span>
            <span className="font-mono text-[10.5px] text-zinc-600">
              — {entries.length} / {cap}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer l'historique"
            className="rounded p-1 text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-zinc-300"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        {entries.length > 0 && (
          <div
            className="px-5 py-3"
            style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
          >
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrer par modèle... (ex: RTX 4080)"
              className="w-full rounded-md px-3 py-2 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/40"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "0.5px solid rgba(255,255,255,0.10)",
              }}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <EmptyState />
          ) : filtered.length === 0 ? (
            <NoResultsState filter={filter} />
          ) : (
            filtered.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onLoad={() => {
                  onLoad(entry);
                  onClose();
                }}

                onReevaluate={() => {
                  onReevaluate(entry.inputs);
                  onClose();
                }}
                onDelete={() => onDelete(entry.id)}
              />
            ))
          )}
        </div>

        <div
          className="flex items-center justify-between gap-3 px-5 py-3"
          style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <span className="font-mono text-[10.5px] text-zinc-600">
            {entries.length === 0
              ? "Aucune évaluation"
              : `${entries.length} / ${cap} stockée${entries.length > 1 ? "s" : ""}`}
          </span>
          {entries.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded px-2 py-1 font-mono text-[10.5px] tracking-wider text-zinc-500 transition-colors hover:bg-red-500/[0.06] hover:text-red-400"
            >
              TOUT EFFACER
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3.5 px-8 py-16 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-lg text-zinc-600"
        style={{ border: "0.5px solid rgba(255,255,255,0.10)" }}
        aria-hidden="true"
      >
        <History className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <div className="text-[13px] text-zinc-400">Aucune évaluation</div>
      <div className="max-w-[280px] text-[11.5px] leading-relaxed text-zinc-600">
        Les évaluations apparaîtront ici automatiquement, en commençant par la
        plus récente.
      </div>
    </div>
  );
}

function NoResultsState({ filter }: { filter: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
      <div className="text-[13px] text-zinc-400">Aucun résultat</div>
      <div className="text-[11.5px] text-zinc-600">
        Aucune évaluation ne correspond à « {filter} ».
      </div>
    </div>
  );
}

function EntryCard({
  entry,
  onLoad,
  onReevaluate,
  onDelete,
}: {
  entry: EstimatorHistoryEntry;
  onLoad: () => void;
  onReevaluate: () => void;
  onDelete: () => void;
}) {
  const { result, inputs } = entry;
  const verdict: Verdict = result.verdict;
  const score = result.score_total;
  const stale = isStale(entry);

  const topPick = result.resale_where?.platforms.find((p) => p.is_top_pick);
  const topPickPlatform =
    topPick?.platform ??
    result.resale_where?.platforms[0]?.platform ??
    inputs.platform;
  const topPickMargin = topPick?.net_margin_eur ?? 0;

  const confidence = result.confidence_pct;
  const confidenceDisplay =
    typeof confidence === "number" ? `${confidence} %` : "—";

  const landmarks = result.landmarks ?? null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onLoad}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onLoad();
        }
      }}
      className="group relative flex cursor-pointer flex-col gap-2.5 px-5 py-4 transition-colors hover:bg-white/[0.025]"
      style={{ borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}
    >
      <div
        className="absolute right-4 top-4 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onReevaluate}
          aria-label="Re-évaluer avec les données marché actuelles"
          title="Re-évaluer"
          className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-zinc-200"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "0.5px solid rgba(255,255,255,0.10)",
          }}
        >
          <RefreshCw className="h-3 w-3" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Supprimer cette évaluation"
          title="Supprimer"
          className="rounded p-1.5 text-zinc-400 transition-colors hover:border-red-500/40 hover:bg-white/[0.08] hover:text-red-400"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "0.5px solid rgba(255,255,255,0.10)",
          }}
        >
          <Trash2 className="h-3 w-3" strokeWidth={2} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-2.5 pr-16">
        <span className="truncate font-mono text-[13px] font-medium text-zinc-200">
          {inputs.model}
        </span>
        <div
          className="flex flex-shrink-0 items-center gap-1.5 font-mono text-[10px] font-medium tracking-[0.1em]"
          style={{ color: VERDICT_COLORS[verdict] }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: VERDICT_COLORS[verdict] }}
            aria-hidden="true"
          />
          {VERDICT_DISPLAY_LABELS[verdict]} · {score}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] tracking-[0.08em] text-zinc-600">
          SCORE
        </span>
        <div
          className="flex-1 overflow-hidden rounded-sm"
          style={{ height: "3px", background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-sm transition-all duration-500"
            style={{
              width: `${Math.max(0, Math.min(100, score))}%`,
              background: scoreColor(score),
            }}
          />
        </div>
        <span
          className="font-mono text-[11px] font-medium tabular-nums"
          style={{ color: scoreColor(score) }}
        >
          {score} / 100
        </span>
      </div>

      <div className="flex items-center gap-2.5 font-mono text-[10.5px] text-zinc-500">
        <span>{inputs.ask_price_eur} €</span>
        <span className="text-zinc-700">·</span>
        <span>{inputs.state}</span>
        <span className="text-zinc-700">·</span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-1 w-1 rounded-full"
            style={{ background: PLATFORM_COLORS[inputs.platform] }}
            aria-hidden="true"
          />
          {inputs.platform === "eBay" ? "eBay" : inputs.platform}
        </span>
      </div>

      <div
        className="grid grid-cols-3 gap-2 rounded-md px-3 py-2.5"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "0.5px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[8.5px] tracking-[0.08em] text-zinc-600">
            MARGE NETTE
          </span>
          <span
            className="font-mono text-[12px] font-medium tabular-nums"
            style={{ color: marginColor(topPickMargin) }}
          >
            {topPickMargin >= 0 ? "+" : ""}
            {topPickMargin} €
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[8.5px] tracking-[0.08em] text-zinc-600">
            TOP PICK
          </span>
          <span
            className="font-mono text-[12px] font-medium"
            style={{ color: topPickPlatform ? PLATFORM_COLORS[topPickPlatform] : "#a1a1aa" }}
          >
            {topPickPlatform === "eBay" ? "eBay" : (topPickPlatform ?? "—")}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[8.5px] tracking-[0.08em] text-zinc-600">
            CONFIANCE
          </span>
          <span className="font-mono text-[12px] font-medium tabular-nums text-zinc-300">
            {confidenceDisplay}
          </span>
        </div>
      </div>

      {landmarks && (
        <div
          className="flex items-center gap-3.5 pt-2 font-mono text-[10px] text-zinc-500"
          style={{ borderTop: "0.5px solid rgba(255,255,255,0.04)" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: "#52525b" }}
              aria-hidden="true"
            />
            plancher {landmarks.floor_resale_eur} €
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: VERDICT_COLORS[verdict] }}
              aria-hidden="true"
            />
            <span className="text-zinc-300">
              optimal {landmarks.optimal_buy_eur} €
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: "#52525b" }}
              aria-hidden="true"
            />
            plafond {landmarks.ceiling_buy_eur} €
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-zinc-600">
        <span className="inline-flex items-center gap-1.5">
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.7 }}
          >
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
          {formatRelativeTime(entry.ts)}
        </span>
        {stale && (
          <span
            className="rounded px-1.5 py-0.5 font-mono text-[9px] tracking-wider"
            style={{
              background: "rgba(245,158,11,0.08)",
              color: "#f59e0b",
              border: "0.5px solid rgba(245,158,11,0.25)",
            }}
            title="Données potentiellement obsolètes — utilise « Re-évaluer » pour rafraîchir"
          >
            DONNÉES DU {formatShortDate(entry.ts)}
          </span>
        )}
      </div>
    </div>
  );
}

export { EstimatorHistoryDrawer };