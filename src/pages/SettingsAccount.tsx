import { useState, type CSSProperties } from "react";
import SettingsBreadcrumb from "../components/settings/SettingsBreadcrumb";
import SettingsHeader from "../components/settings/SettingsHeader";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";

type SubscriptionTier = "free" | "standard" | "pro";

const PLAN_INFO: Record<SubscriptionTier, {
  label: string;
  priceText: string;
  cap: number;
  capLabel: string;
}> = {
  free: { label: "Découverte", priceText: "Gratuit", cap: 10, capLabel: "10 estimations" },
  standard: { label: "Standard", priceText: "49 €/mois", cap: 180, capLabel: "180 estimations" },
  pro: { label: "Pro", priceText: "149 €/mois", cap: 600, capLabel: "600 estimations" },
};

const DISABLED_TOOLTIP = "Synchronisation backend en cours d'intégration · P2";

function formatIsoDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysSince(iso: string): number {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 0;
  const diff = Date.now() - d.getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

function nextRenewalLabel(): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(next);
}

const cardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.015)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 8,
  padding: 16,
};

const dangerCardStyle: CSSProperties = {
  ...cardStyle,
  border: "1px solid rgba(239,68,68,0.20)",
};

const subLabelStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.20em",
  color: "#52525B",
  marginBottom: 10,
};

const dangerSubLabelStyle: CSSProperties = { ...subLabelStyle, color: "#EF4444" };

const inputStyle: CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 6,
  padding: "8px 12px",
  fontSize: 12,
  color: "#FAFAFA",
  outline: "none",
};

const ghostBtnStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 6,
  padding: "7px 14px",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "#A1A1AA",
  background: "transparent",
  cursor: "pointer",
};

const primaryBtnStyle: CSSProperties = {
  border: "1px solid rgba(59,130,246,0.40)",
  borderRadius: 6,
  padding: "7px 14px",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "#FFFFFF",
  background: "rgba(59,130,246,0.20)",
  cursor: "pointer",
};

const dangerBtnStyle: CSSProperties = {
  border: "1px solid rgba(239,68,68,0.40)",
  borderRadius: 6,
  padding: "7px 14px",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "#EF4444",
  background: "transparent",
  cursor: "pointer",
};

const disabledOverride: CSSProperties = { opacity: 0.45, cursor: "not-allowed" };

const rowLabelStyle: CSSProperties = { fontSize: 12, color: "#A1A1AA" };
const titleStyle: CSSProperties = { fontSize: 13, color: "#FAFAFA", marginBottom: 2 };
const subTitleStyle: CSSProperties = { fontSize: 11, color: "#71717A" };

type DisabledBtnProps = {
  label: string;
  variant?: "ghost" | "primary" | "danger";
};
function DisabledBtn({ label, variant = "ghost" }: DisabledBtnProps) {
  const base =
    variant === "primary" ? primaryBtnStyle : variant === "danger" ? dangerBtnStyle : ghostBtnStyle;
  return (
    <button
      type="button"
      aria-disabled="true"
      onClick={(e) => e.preventDefault()}
      title={DISABLED_TOOLTIP}
      style={{ ...base, ...disabledOverride }}
    >
      {label}
    </button>
  );
}

type RecoveryStatus = "idle" | "sending" | "sent";

export default function SettingsAccount() {
  const { user } = useAuth();
  if (!user) return null;

  const initialFullName = user.full_name ?? "";
  const initialEmail = user.email;

  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail);
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryStatus>("idle");

  const tier = (user.subscription_tier ?? "free") as SubscriptionTier;
  const plan = PLAN_INFO[tier];
  const credits = user.credits_remaining ?? 0;
  const pct = Math.max(0, Math.min(100, (credits / plan.cap) * 100));
  const fillColor = pct > 50 ? "#10B981" : pct > 20 ? "#F59E0B" : "#EF4444";

  function handleCancel() {
    setFullName(initialFullName);
    setEmail(initialEmail);
  }

  async function handleSendRecovery() {
    if (recoveryStatus !== "idle") return;
    setRecoveryStatus("sending");
    try {
      await authApi.forgotPassword(user!.email);
      setRecoveryStatus("sent");
      setTimeout(() => setRecoveryStatus("idle"), 5000);
    } catch {
      setRecoveryStatus("idle");
    }
  }

  const recoveryLabel =
    recoveryStatus === "sending"
      ? "ENVOI EN COURS…"
      : recoveryStatus === "sent"
        ? "✓ EMAIL ENVOYÉ"
        : "ENVOYER →";
  const recoveryBtnStyle: CSSProperties = {
    ...ghostBtnStyle,
    ...(recoveryStatus === "sending" ? { opacity: 0.6, cursor: "wait" } : {}),
    ...(recoveryStatus === "sent" ? { color: "#10B981" } : {}),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SettingsBreadcrumb
        parentLabel="PARAMÈTRES"
        parentPath="/settings"
        currentLabel="COMPTE"
      />
      <SettingsHeader
        sectionLabel="§ 01 — COMPTE"
        title="Identité, plan et sécurité"
        marginBottom={24}
      />

      {/* § 01.1 IDENTITÉ */}
      <section>
        <div style={subLabelStyle}>§ 01.1 — IDENTITÉ</div>
        <div style={cardStyle}>
          {[
            {
              label: "Nom complet",
              node: (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={inputStyle}
                />
              ),
            },
            {
              label: "Email",
              node: (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              ),
            },
            {
              label: "Membre depuis",
              node: (
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    color: "#71717A",
                  }}
                >
                  {formatIsoDate(user.created_at)} · {daysSince(user.created_at)} jours
                </div>
              ),
            },
          ].map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                gap: 12,
                alignItems: "center",
                marginBottom: i < 2 ? 12 : 0,
              }}
            >
              <div style={rowLabelStyle}>{row.label}</div>
              <div>{row.node}</div>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 14,
            }}
          >
            <button type="button" onClick={handleCancel} style={ghostBtnStyle}>
              ANNULER
            </button>
            <DisabledBtn label="ENREGISTRER" variant="primary" />
          </div>
        </div>
      </section>

      {/* § 01.2 PLAN & CRÉDITS */}
      <section>
        <div style={subLabelStyle}>§ 01.2 — PLAN & CRÉDITS</div>
        <div style={cardStyle}>
          <div className="settings-account-plan-row">
            <div className="settings-account-plan-left">
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  color: "#71717A",
                  marginBottom: 8,
                }}
              >
                PLAN ACTUEL
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 18, fontWeight: 500, color: "#FAFAFA" }}>
                  {plan.label}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: "rgba(59,130,246,0.10)",
                    color: "#3B82F6",
                  }}
                >
                  ACTIF
                </span>
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: "#A1A1AA",
                  marginTop: 6,
                }}
              >
                {plan.capLabel} · {plan.priceText}
              </div>
              <div style={{ marginTop: 12 }}>
                <DisabledBtn label="CHANGER DE PLAN →" />
              </div>
            </div>
            <div className="settings-account-plan-right">
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  color: "#71717A",
                  marginBottom: 8,
                }}
              >
                CRÉDITS RESTANTS
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 22,
                    fontWeight: 500,
                    color: "#FAFAFA",
                  }}
                >
                  {credits}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    color: "#71717A",
                  }}
                >
                  / {plan.cap}
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 2,
                  overflow: "hidden",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: fillColor,
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: "#71717A" }}>
                Renouvellement le {nextRenewalLabel()}.
              </div>
            </div>
          </div>
        </div>
        <style>{`
          .settings-account-plan-row {
            display: flex;
            gap: 20px;
            align-items: stretch;
          }
          .settings-account-plan-left {
            flex: 1;
            padding-right: 20px;
            border-right: 1px solid rgba(255,255,255,0.06);
          }
          .settings-account-plan-right { flex: 1; }
          @media (max-width: 639px) {
            .settings-account-plan-row { flex-direction: column; }
            .settings-account-plan-left {
              padding-right: 0;
              padding-bottom: 16px;
              border-right: none;
              border-bottom: 1px solid rgba(255,255,255,0.06);
            }
          }
        `}</style>
      </section>

      {/* § 01.3 SÉCURITÉ */}
      <section>
        <div style={subLabelStyle}>§ 01.3 — SÉCURITÉ</div>
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <div style={titleStyle}>Mot de passe</div>
              <div style={subTitleStyle}>
                Modifiable une fois le backend câblé
              </div>
            </div>
            <DisabledBtn label="MODIFIER →" />
          </div>
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.04)",
              margin: "14px 0",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <div style={titleStyle}>Lien de récupération</div>
              <div style={subTitleStyle}>
                Reçoit un email avec un lien de réinitialisation de mot de passe
              </div>
            </div>
            <button
              type="button"
              onClick={handleSendRecovery}
              style={recoveryBtnStyle}
              aria-disabled={recoveryStatus === "sending"}
            >
              {recoveryLabel}
            </button>
          </div>
        </div>
      </section>

      {/* § 01.4 ZONE DANGEREUSE */}
      <section>
        <div style={dangerSubLabelStyle}>§ 01.4 — ZONE DANGEREUSE</div>
        <div style={dangerCardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <div style={titleStyle}>Déconnexion globale</div>
              <div style={subTitleStyle}>
                Révoque tous les appareils actuellement connectés à ce compte
              </div>
            </div>
            <DisabledBtn label="DÉCONNECTER PARTOUT" variant="danger" />
          </div>
          <div
            style={{
              height: 1,
              background: "rgba(239,68,68,0.10)",
              margin: "14px 0",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <div style={titleStyle}>Supprimer mon compte</div>
              <div style={subTitleStyle}>
                Action irréversible. Toutes les données locales et serveur seront effacées.
              </div>
            </div>
            <DisabledBtn label="SUPPRIMER LE COMPTE" variant="danger" />
          </div>
        </div>
      </section>
    </div>
  );
}