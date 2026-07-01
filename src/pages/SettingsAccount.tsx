import { useState, type CSSProperties } from "react";
import SettingsBreadcrumb from "../components/settings/SettingsBreadcrumb";
import SettingsHeader from "../components/settings/SettingsHeader";
import DeleteAccountModal from "../components/settings/DeleteAccountModal";
import ChangePasswordModal from "../components/settings/ChangePasswordModal";

import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";

type SubscriptionTier = "free" | "standard" | "pro";

const PLAN_INFO: Record<SubscriptionTier, {
  label: string;
  priceText: string;
  cap: number;
  capLabel: string;
}> = {
  free: { label: "Free", priceText: "Gratuit", cap: 10, capLabel: "10 crédits / mois" },
  standard: { label: "Standard", priceText: "11,99 €/mois", cap: 180, capLabel: "180 crédits / mois" },
  pro: { label: "Pro", priceText: "24,99 €/mois", cap: 600, capLabel: "600 crédits / mois" },
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
type SaveStatus = "idle" | "saving" | "saved" | "error";
type LogoutAllStatus = "idle" | "confirm" | "loading";
type ResendStatus = "idle" | "sending" | "sent" | "error";

export default function SettingsAccount() {
  const { user, refreshUser, logoutEverywhere } = useAuth();
  if (!user) return null;

  const initialFullName = user.full_name ?? "";

  const [fullName, setFullName] = useState(initialFullName);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryStatus>("idle");
  const [resendStatus, setResendStatus] = useState<ResendStatus>("idle");
  const [logoutAllStatus, setLogoutAllStatus] = useState<LogoutAllStatus>("idle");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  const tier = (user.subscription_tier ?? "free") as SubscriptionTier;
  const plan = PLAN_INFO[tier];
  const credits = user.credits_remaining ?? 0;
  const cap = plan.cap;
  const pct = cap > 0 ? Math.min(100, Math.max(0, (credits / cap) * 100)) : 0;
  const fillColor = pct > 50 ? "#10B981" : pct > 20 ? "#F59E0B" : "#EF4444";

  const trimmedName = fullName.trim();
  const isDirty = trimmedName !== initialFullName;

  function handleCancel() {
    setFullName(initialFullName);
    setSaveStatus("idle");
    setSaveError(null);
  }

  async function handleSaveProfile() {
    if (!isDirty || saveStatus === "saving") return;
    setSaveStatus("saving");
    setSaveError(null);
    try {
      await authApi.updateProfile({
        display_name: trimmedName.length > 0 ? trimmedName : null,
      });
      await refreshUser();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Échec de l'enregistrement.");
      setSaveStatus("error");
    }
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

  async function handleResendVerification() {
    if (resendStatus === "sending" || resendStatus === "sent") return;
    setResendStatus("sending");
    try {
      await authApi.resendVerification();
      setResendStatus("sent");
      setTimeout(() => setResendStatus("idle"), 5000);
    } catch {
      setResendStatus("error");
      setTimeout(() => setResendStatus("idle"), 4000);
    }
  }

  async function handleLogoutAll() {
    if (logoutAllStatus === "idle") {
      setLogoutAllStatus("confirm");
      return;
    }
    if (logoutAllStatus === "confirm") {
      setLogoutAllStatus("loading");
      try {
        await logoutEverywhere();
        // RequireAuth redirige vers /auth quand le statut passe a "unauthenticated".
      } catch {
        setLogoutAllStatus("idle");
      }
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
          {/* Nom complet — éditable */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              gap: 12,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={rowLabelStyle}>Nom complet</div>
            <div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Votre nom"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Email — lecture seule + état de vérification */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              gap: 12,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={rowLabelStyle}>Email</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "#D4D4D8",
                }}
              >
                {user.email}
              </span>
              {user.email_verified ? (
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: "0.10em",
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: "rgba(16,185,129,0.10)",
                    color: "#10B981",
                  }}
                >
                  ✓ VÉRIFIÉ
                </span>
              ) : (
                <>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      letterSpacing: "0.10em",
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "rgba(245,158,11,0.10)",
                      color: "#F59E0B",
                    }}
                  >
                    ⚠ NON VÉRIFIÉ
                  </span>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    style={{
                      ...ghostBtnStyle,
                      ...(resendStatus === "sent" ? { color: "#10B981" } : {}),
                      ...(resendStatus === "sending"
                        ? { opacity: 0.6, cursor: "wait" }
                        : {}),
                    }}
                  >
                    {resendStatus === "sending"
                      ? "ENVOI…"
                      : resendStatus === "sent"
                        ? "✓ EMAIL ENVOYÉ"
                        : resendStatus === "error"
                          ? "ÉCHEC — RÉESSAYER"
                          : "RENVOYER LA VÉRIFICATION →"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Membre depuis */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              gap: 12,
              alignItems: "center",
              marginBottom: 0,
            }}
          >
            <div style={rowLabelStyle}>Membre depuis</div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: "#71717A",
              }}
            >
              {formatIsoDate(user.created_at)} · {daysSince(user.created_at)} jours
            </div>
          </div>

          {saveError && (
            <div
              style={{
                marginTop: 12,
                padding: "8px 12px",
                background: "rgba(239,68,68,0.10)",
                border: "1px solid rgba(239,68,68,0.30)",
                borderRadius: 6,
                fontSize: 12,
                color: "#EF4444",
              }}
            >
              {saveError}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 14,
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              disabled={!isDirty || saveStatus === "saving"}
              style={{
                ...ghostBtnStyle,
                opacity: !isDirty || saveStatus === "saving" ? 0.45 : 1,
                cursor:
                  !isDirty || saveStatus === "saving" ? "not-allowed" : "pointer",
              }}
            >
              ANNULER
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={!isDirty || saveStatus === "saving"}
              style={{
                ...primaryBtnStyle,
                ...(saveStatus === "saved"
                  ? {
                      color: "#10B981",
                      borderColor: "rgba(16,185,129,0.40)",
                      background: "rgba(16,185,129,0.15)",
                    }
                  : {}),
                opacity: !isDirty && saveStatus !== "saved" ? 0.45 : 1,
                cursor:
                  !isDirty || saveStatus === "saving" ? "not-allowed" : "pointer",
              }}
            >
              {saveStatus === "saving"
                ? "ENREGISTREMENT…"
                : saveStatus === "saved"
                  ? "✓ ENREGISTRÉ"
                  : "ENREGISTRER"}
            </button>
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
                {plan.cap > 0 && (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      color: "#71717A",
                    }}
                  >
                    / {plan.cap}
                  </span>
                )}
              </div>
              <div
                className="mt-2 h-1 overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: fillColor,
                    transition: "width 700ms cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: "#71717A", marginTop: 6 }}>
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
                Modifiez votre mot de passe (8 caractères minimum)
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPwdOpen(true)}
              style={ghostBtnStyle}
            >
              MODIFIER →
            </button>
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
                {logoutAllStatus === "confirm"
                  ? "Confirmer ? Tous les appareils connectés seront déconnectés."
                  : "Révoque tous les appareils actuellement connectés à ce compte"}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogoutAll}
              disabled={logoutAllStatus === "loading"}
              style={{
                ...dangerBtnStyle,
                ...(logoutAllStatus === "confirm"
                  ? { color: "#FFFFFF", background: "rgba(239,68,68,0.20)" }
                  : {}),
                ...(logoutAllStatus === "loading"
                  ? { opacity: 0.6, cursor: "wait" }
                  : {}),
              }}
            >
              {logoutAllStatus === "loading"
                ? "DÉCONNEXION…"
                : logoutAllStatus === "confirm"
                  ? "CONFIRMER"
                  : "DÉCONNECTER PARTOUT"}
            </button>
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
                Désactive le compte avec un délai de grâce de 30 jours avant suppression définitive. Restaurable pendant ce délai.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              style={dangerBtnStyle}
            >
              SUPPRIMER LE COMPTE
            </button>
          </div>
        </div>
      </section>
      <DeleteAccountModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirmed={() => {
          void refreshUser();
        }}
      />
      <ChangePasswordModal
        open={pwdOpen}
        onClose={() => setPwdOpen(false)}
      />
    </div>
  );
}