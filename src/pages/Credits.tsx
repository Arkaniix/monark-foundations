import { getNumberLocale } from "@/lib/numberFormat";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchCreditPacks, createTopup, type CreditPack } from "@/lib/api/billing";
import { ApiException } from "@/lib/api/client";

const eur = (cents: number) =>
  (cents / 100).toLocaleString(getNumberLocale(), { style: "currency", currency: "EUR" });

const eurPerCredit = (priceCents: number, credits: number) =>
  (priceCents / 100 / credits).toLocaleString(getNumberLocale(), {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

const discountPct = (p?: { price_cents: number; original_price_cents?: number | null }) =>
  p?.original_price_cents ? Math.round((1 - p.price_cents / p.original_price_cents) * 100) : 0;

type PackState = {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
};

type FetchState =
  | { kind: "loading" }
  | { kind: "ready"; packs: CreditPack[] }
  | { kind: "error"; message: string };

export default function Credits() {
  const { user, refreshUser } = useAuth();
  const [fetchState, setFetchState] = useState<FetchState>({ kind: "loading" });
  const [packStates, setPackStates] = useState<Record<number, PackState>>({});

  const loadPacks = useCallback(async () => {
    setFetchState({ kind: "loading" });
    try {
      const packs = await fetchCreditPacks();
      setFetchState({ kind: "ready", packs });
    } catch (err) {
      const message =
        err instanceof ApiException
          ? err.message
          : "Impossible de charger les packs disponibles.";
      setFetchState({ kind: "error", message });
    }
  }, []);

  useEffect(() => {
    void loadPacks();
  }, [loadPacks]);

  const handleTopup = useCallback(
    async (pack: CreditPack) => {
      setPackStates((prev) => ({ ...prev, [pack.id]: { status: "loading" } }));
      try {
        const res = await createTopup(pack.id);
        if (res.checkout_url) {
          window.location.href = res.checkout_url;
          return;
        }
        if (res.status === "completed") {
          await refreshUser();
          const balance = res.new_balance ?? null;
          setPackStates((prev) => ({
            ...prev,
            [pack.id]: {
              status: "success",
              message:
                balance !== null
                  ? `+${pack.credits_per_cycle} crédits — nouveau solde ${balance}`
                  : `+${pack.credits_per_cycle} crédits ajoutés`,
            },
          }));
          return;
        }
        setPackStates((prev) => ({
          ...prev,
          [pack.id]: { status: "error", message: "Recharge en attente." },
        }));
      } catch (err) {
        const message =
          err instanceof ApiException
            ? err.message
            : "Échec de la recharge. Réessayez.";
        setPackStates((prev) => ({
          ...prev,
          [pack.id]: { status: "error", message },
        }));
      }
    },
    [refreshUser],
  );

  const currentBalance = user?.credits_remaining ?? 0;

  const packs = fetchState.kind === "ready" ? fetchState.packs : [];
  let highlightId: number | null = null;
  let bestPct = 0;
  for (const p of packs) {
    const pct = discountPct(p);
    if (pct > bestPct) {
      bestPct = pct;
      highlightId = p.id;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="font-mono text-[11px] tracking-[0.20em] text-zinc-600">
        § 01 — RECHARGER
      </div>

      {/* Solde courant */}
      <div className="mk-card p-6">
        <div className="font-mono text-[10px] tracking-[0.20em] text-zinc-500">
          SOLDE ACTUEL
        </div>
        <div className="mt-3 flex items-baseline">
          <span
            className="font-mono tabular-nums"
            style={{
              fontSize: 48,
              fontWeight: 500,
              color: "#10B981",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {currentBalance}
          </span>
          <span className="ml-3 font-mono text-[12px] uppercase tracking-[0.12em] text-zinc-500">
            crédits
          </span>
        </div>
      </div>

      {/* Bandeau d'info */}
      <div className="mk-subcard-soft px-4 py-3 text-[12px] leading-relaxed text-zinc-400">
        Recharge gratuite — paiement Stripe bientôt.
      </div>

      {/* Grille de packs */}
      {fetchState.kind === "loading" && (
        <div className="font-mono text-[11px] tracking-[0.08em] text-zinc-500">
          CHARGEMENT…
        </div>
      )}

      {fetchState.kind === "error" && (
        <div className="mk-card flex flex-col gap-4 p-5">
          <div className="text-[12px] leading-relaxed text-zinc-400">
            {fetchState.message}
          </div>
          <button
            type="button"
            onClick={() => void loadPacks()}
            className="ease-expo self-start rounded-md border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.10em] transition-colors"
            style={{
              borderColor: "rgba(59,130,246,0.30)",
              color: "#3B82F6",
              background: "transparent",
            }}
          >
            Réessayer
          </button>
        </div>
      )}

      {fetchState.kind === "ready" && fetchState.packs.length === 0 && (
        <div className="mk-card p-5 text-[12px] leading-relaxed text-zinc-400">
          Aucun pack disponible pour le moment.
        </div>
      )}

      {fetchState.kind === "ready" && fetchState.packs.length > 0 && (
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
          {fetchState.packs.map((pack) => {
            const st = packStates[pack.id] ?? { status: "idle" as const };
            const loading = st.status === "loading";
            const pct = discountPct(pack);
            const isHighlight = pack.id === highlightId && bestPct >= 1;

            return (
              <div
                key={pack.id}
                className="mk-card relative flex h-full flex-col p-5"
                style={
                  isHighlight
                    ? { background: "var(--mk-surface-2)" }
                    : undefined
                }
              >
                {/* Slot badge — hauteur fixe sur toutes les cartes pour aligner les lignes suivantes */}
                <div className="mb-3 flex h-6 items-center">
                  {isHighlight && (
                    <span
                      className="inline-block font-mono text-[9px] uppercase tracking-[0.14em]"
                      style={{
                        color: "#3B82F6",
                        background: "rgba(59,130,246,0.08)",
                        borderRadius: 4,
                        padding: "3px 7px",
                      }}
                    >
                      MEILLEUR RAPPORT
                    </span>
                  )}
                </div>

                {/* 1. Crédits + pill réduction */}
                <div className="flex items-start justify-between">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="font-mono tabular-nums"
                      style={{
                        fontSize: 32,
                        fontWeight: 500,
                        color: "#10B981",
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {pack.credits_per_cycle}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                      crédits
                    </span>
                  </div>
                  {pct >= 1 && (
                    <span
                      className="font-mono text-[10px] tracking-[0.06em] tabular-nums"
                      style={{
                        color: "#10B981",
                        background: "rgba(16,185,129,0.08)",
                        borderRadius: 4,
                        padding: "3px 7px",
                      }}
                    >
                      −{pct} %
                    </span>
                  )}
                </div>

                {/* 2. Nom + desc */}
                <div className="mt-4">
                  <div className="text-[13px] font-medium text-zinc-200">
                    {pack.name}
                  </div>
                  {pack.description && (
                    <div className="mt-1 line-clamp-1 text-[12px] text-zinc-500">
                      {pack.description}
                    </div>
                  )}
                </div>

                {/* 3. Prix */}
                <div className="mt-4">
                  {pack.price_cents != null && (
                    <>
                      <div className="flex items-baseline gap-2">
                        {pack.original_price_cents && (
                          <span
                            className="font-mono tabular-nums text-zinc-600 line-through"
                            style={{ fontSize: 14 }}
                          >
                            {eur(pack.original_price_cents)}
                          </span>
                        )}
                        <span
                          className="font-mono tabular-nums text-zinc-100"
                          style={{ fontSize: 22, fontWeight: 500 }}
                        >
                          {eur(pack.price_cents)}
                        </span>
                      </div>
                      <div className="mt-1 font-mono text-[10px] tabular-nums text-zinc-500">
                        {eurPerCredit(pack.price_cents, pack.credits_per_cycle)} /crédit
                      </div>
                    </>
                  )}
                </div>

                {/* Pied de carte — épinglé en bas */}
                <div className="mt-auto">
                  <div
                    className="mt-5"
                    style={{
                      height: 1,
                      background: "var(--mk-divider-soft)",
                    }}
                  />
                  <button
                  type="button"
                  disabled={loading}
                  onClick={() => void handleTopup(pack)}
                  className="ease-expo mt-4 w-full rounded-md py-2.5 font-mono text-[11px] uppercase tracking-[0.10em] transition-colors"
                  style={
                    isHighlight
                      ? {
                          background: "#3B82F6",
                          border: "1px solid #3B82F6",
                          color: "#FAFAFA",
                          opacity: loading ? 0.5 : 1,
                          cursor: loading ? "not-allowed" : "pointer",
                        }
                      : {
                          background: "transparent",
                          border: "1px solid rgba(59,130,246,0.25)",
                          color: "#3B82F6",
                          opacity: loading ? 0.5 : 1,
                          cursor: loading ? "not-allowed" : "pointer",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (loading || isHighlight) return;
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(59,130,246,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    if (loading || isHighlight) return;
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                  }}
                >
                  {loading ? "Recharge…" : "Recharger"}
                  </button>

                  {st.status === "success" && st.message && (
                    <div
                      className="mt-3 font-mono text-[11px]"
                      style={{ color: "#10B981" }}
                    >
                      {st.message}
                    </div>
                  )}
                  {st.status === "error" && st.message && (
                    <div
                      className="mt-3 font-mono text-[11px]"
                      style={{ color: "#EF4444" }}
                    >
                      {st.message}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}