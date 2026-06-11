import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchCreditPacks, createTopup, type CreditPack } from "@/lib/api/billing";
import { ApiException } from "@/lib/api/client";

const sectionLabelStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.20em",
  color: "#52525B",
  marginBottom: 16,
};

const balanceLabelStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10,
  letterSpacing: "0.20em",
  color: "#71717A",
  marginBottom: 12,
};

const balanceNumberStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 48,
  fontWeight: 500,
  color: "#10B981",
  lineHeight: 1,
  letterSpacing: "-0.02em",
};

const balanceSuffixStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 13,
  color: "#71717A",
  marginLeft: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const infoBannerStyle: CSSProperties = {
  background: "rgba(255,255,255,0.015)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 8,
  padding: "12px 16px",
  fontSize: 12,
  color: "#A1A1AA",
  lineHeight: 1.5,
};

const packCardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 10,
  padding: 22,
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const packCreditsStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 36,
  fontWeight: 500,
  color: "#10B981",
  lineHeight: 1,
  letterSpacing: "-0.02em",
};

const packNameStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "#FAFAFA",
  marginBottom: 4,
};

const packDescStyle: CSSProperties = {
  fontSize: 12,
  color: "#A1A1AA",
  lineHeight: 1.5,
};

const badgeStyle: CSSProperties = {
  display: "inline-block",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10,
  letterSpacing: "0.12em",
  color: "#10B981",
  background: "rgba(16,185,129,0.10)",
  border: "1px solid rgba(16,185,129,0.25)",
  borderRadius: 4,
  padding: "3px 8px",
  alignSelf: "flex-start",
};

const primaryBtn: CSSProperties = {
  width: "100%",
  background: "#3B82F6",
  border: "1px solid #3B82F6",
  borderRadius: 6,
  padding: "10px 16px",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#FAFAFA",
  cursor: "pointer",
  transition: "opacity 200ms cubic-bezier(0.16,1,0.3,1)",
};

const disabledBtn: CSSProperties = {
  ...primaryBtn,
  opacity: 0.5,
  cursor: "not-allowed",
};

const successMsgStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  color: "#10B981",
  marginTop: 2,
};

const errorMsgStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  color: "#EF4444",
  marginTop: 2,
};

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

  return (
    <div className="flex flex-col gap-8">
      <div style={sectionLabelStyle}>§ 01 — RECHARGER</div>

      {/* Solde courant */}
      <div
        style={{
          background: "rgba(255,255,255,0.015)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10,
          padding: 24,
        }}
      >
        <div style={balanceLabelStyle}>SOLDE ACTUEL</div>
        <div className="flex items-baseline">
          <span style={balanceNumberStyle} className="tabular-nums">
            {currentBalance}
          </span>
          <span style={balanceSuffixStyle}>crédits</span>
        </div>
      </div>

      {/* Bandeau d'info */}
      <div style={infoBannerStyle}>
        Recharge gratuite — paiement Stripe bientôt.
      </div>

      {/* Grille de packs */}
      {fetchState.kind === "loading" && (
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "#71717A",
            letterSpacing: "0.08em",
          }}
        >
          CHARGEMENT…
        </div>
      )}

      {fetchState.kind === "error" && (
        <div style={packCardStyle}>
          <div style={packDescStyle}>{fetchState.message}</div>
          <button
            type="button"
            style={primaryBtn}
            onClick={() => void loadPacks()}
          >
            Réessayer
          </button>
        </div>
      )}

      {fetchState.kind === "ready" && fetchState.packs.length === 0 && (
        <div style={packCardStyle}>
          <div style={packDescStyle}>Aucun pack disponible pour le moment.</div>
        </div>
      )}

      {fetchState.kind === "ready" && fetchState.packs.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {fetchState.packs.map((pack) => {
            const st = packStates[pack.id] ?? { status: "idle" as const };
            const loading = st.status === "loading";
            return (
              <div key={pack.id} style={packCardStyle}>
                <div className="flex items-baseline gap-2">
                  <span style={packCreditsStyle} className="tabular-nums">
                    {pack.credits_per_cycle}
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      color: "#71717A",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    crédits
                  </span>
                </div>
                <div>
                  <div style={packNameStyle}>{pack.name}</div>
                  {pack.description && (
                    <div style={packDescStyle}>{pack.description}</div>
                  )}
                </div>
                <span style={badgeStyle}>GRATUIT</span>
                <button
                  type="button"
                  style={loading ? disabledBtn : primaryBtn}
                  disabled={loading}
                  onClick={() => void handleTopup(pack)}
                >
                  {loading ? "Recharge…" : "Recharger"}
                </button>
                {st.status === "success" && st.message && (
                  <div style={successMsgStyle}>{st.message}</div>
                )}
                {st.status === "error" && st.message && (
                  <div style={errorMsgStyle}>{st.message}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}