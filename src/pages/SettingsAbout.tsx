import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Mail, Info, X } from "lucide-react";
import { GLOSSARY } from "@/lib/glossary";
import Logo from "@/components/ui/Logo";
import SettingsBreadcrumb from "@/components/settings/SettingsBreadcrumb";
import SettingsHeader from "@/components/settings/SettingsHeader";
import { getSettingsCategory } from "@/components/settings/datasets";

const APP_INFO = {
  name: "Monark Foundations",
  version: "1.0.0",
  environment: import.meta.env.MODE,
  buildDate: "—",
  releaseChannel: "stable",
} as const;

const STACK = [
  { label: "React", version: "19.2" },
  { label: "TanStack Router", version: "1.168" },
  { label: "Tailwind CSS", version: "4.2" },
  { label: "TypeScript", version: "5.8" },
  { label: "Vite", version: "7.3" },
  { label: "Lucide", version: "1.14" },
] as const;

const SUPPORT_EMAIL = "support@monark-market.fr";

type LegalKey = "cgu" | "privacy" | "mentions";

const LEGAL_TITLES: Record<LegalKey, string> = {
  cgu: "Conditions générales d'utilisation",
  privacy: "Politique de confidentialité",
  mentions: "Mentions légales",
};

const cardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.015)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 8,
  padding: 20,
};

const sectionLabelStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10,
  letterSpacing: "0.18em",
  color: "#52525B",
  marginBottom: 12,
};

const monoLabel: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  color: "#71717A",
};

const monoValue: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 12,
  color: "#FAFAFA",
};

export default function SettingsAbout() {
  const c = getSettingsCategory("about");
  const [legalModal, setLegalModal] = useState<LegalKey | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <SettingsBreadcrumb
        parentLabel="PARAMÈTRES"
        parentPath="/settings"
        currentLabel={c.sectionTitle}
      />
      <SettingsHeader
        sectionLabel={`${c.sectionNumber} — ${c.sectionTitle}`}
        title={c.pageSubtitle}
        marginBottom={8}
      />

      {/* § 06.1 APPLICATION */}
      <section style={cardStyle}>
        <div style={sectionLabelStyle}>§ 06.1 — APPLICATION</div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col items-start gap-3">
            <div style={{ transform: "scale(1.4)", transformOrigin: "left top", marginTop: 8 }}>
              <Logo />
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.18em",
                color: "#71717A",
                marginTop: 20,
              }}
            >
              MONARK FOUNDATIONS
            </div>
          </div>
          <div className="flex flex-col">
            {[
              ["Version", APP_INFO.version],
              ["Environnement", APP_INFO.environment],
              ["Canal", APP_INFO.releaseChannel],
              ["Build", APP_INFO.buildDate],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between"
                style={{
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span style={monoLabel}>{k}</span>
                <span style={monoValue}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            fontStyle: "italic",
            color: "#52525B",
            marginTop: 16,
          }}
        >
          Conçu pour les revendeurs de hardware PC d'occasion. Construit avec ❤ à Paris, France.
        </div>
      </section>

      {/* § 06.2 GLOSSAIRE */}
      <section style={cardStyle}>
        <div style={sectionLabelStyle}>§ 06.2 — GLOSSAIRE</div>
        <div style={{ fontSize: 12, color: "#A1A1AA", marginBottom: 16 }}>
          Les termes statistiques et indicateurs utilisés dans l'application. Cliquez sur une entrée pour la déplier.
        </div>
        <GlossaryAccordion />
      </section>

      {/* § 06.3 INFORMATIONS LÉGALES */}
      <section style={cardStyle}>
        <div style={sectionLabelStyle}>§ 06.3 — INFORMATIONS LÉGALES</div>
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          {(
            [
              {
                key: "cgu" as LegalKey,
                label: "Conditions générales d'utilisation",
                sub: "Termes et conditions d'usage de Monark Foundations",
              },
              {
                key: "privacy" as LegalKey,
                label: "Politique de confidentialité",
                sub: "Traitement des données personnelles et RGPD",
              },
              {
                key: "mentions" as LegalKey,
                label: "Mentions légales",
                sub: "Éditeur, hébergement, contact",
              },
            ]
          ).map((row, i) => (
            <LegalRow
              key={row.key}
              label={row.label}
              sublabel={row.sub}
              withTopBorder={i > 0}
              onClick={() => setLegalModal(row.key)}
            />
          ))}
        </div>
      </section>

      {/* § 06.4 CONTACT & STACK */}
      <section style={cardStyle}>
        <div style={sectionLabelStyle}>§ 06.4 — CONTACT & STACK</div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div style={sectionLabelStyle}>CONTACT</div>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="ease-expo inline-flex items-center gap-2 transition-colors"
              style={{ fontSize: 13, color: "#3B82F6", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FAFAFA")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#3B82F6")}
            >
              <Mail size={14} strokeWidth={1.5} />
              {SUPPORT_EMAIL}
            </a>
            <div style={{ fontSize: 11, color: "#71717A", marginTop: 6 }}>
              Réponse sous 48 h ouvrées
            </div>
          </div>
          <div>
            <div style={sectionLabelStyle}>CONSTRUIT AVEC</div>
            <div className="flex flex-col">
              {STACK.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between"
                  style={{ padding: "4px 0" }}
                >
                  <span style={{ fontSize: 11, color: "#A1A1AA" }}>
                    {s.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      color: "#71717A",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {s.version}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: 11,
                fontStyle: "italic",
                color: "#52525B",
                marginTop: 8,
              }}
            >
              + Lovable pour le scaffolding ✨
            </div>
          </div>
        </div>
      </section>

      {legalModal &&
        createPortal(
          <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />,
          document.body,
        )}
    </div>
  );
}

function GlossaryAccordion() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const entries = Object.entries(GLOSSARY);

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.04)",
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      {entries.map(([key, entry], i) => {
        const isOpen = openKey === key;
        return (
          <div
            key={key}
            style={{
              borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}
          >
            <button
              type="button"
              onClick={() => setOpenKey(isOpen ? null : key)}
              className="ease-expo flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors"
              style={{
                background: isOpen ? "rgba(255,255,255,0.02)" : "transparent",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isOpen)
                  e.currentTarget.style.background = "rgba(255,255,255,0.015)";
              }}
              onMouseLeave={(e) => {
                if (!isOpen) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 12, color: "#FAFAFA" }}>
                {entry.title}
              </span>
              <ChevronDown
                size={14}
                strokeWidth={1.5}
                style={{
                  color: "#71717A",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 220ms cubic-bezier(0.16,1,0.3,1)",
                }}
              />
            </button>
            {isOpen && (
              <div style={{ padding: "8px 12px 14px 12px" }}>
                <div style={{ fontSize: 12, color: "#A1A1AA", lineHeight: 1.55 }}>
                  {entry.body}
                </div>
                {entry.example && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#71717A",
                      fontStyle: "italic",
                      marginTop: 6,
                    }}
                  >
                    Exemple : {entry.example}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LegalRow({
  label,
  sublabel,
  withTopBorder,
  onClick,
}: {
  label: string;
  sublabel: string;
  withTopBorder: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ease-expo flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors"
      style={{
        background: "transparent",
        border: "none",
        borderTop: withTopBorder ? "1px solid rgba(255,255,255,0.04)" : "none",
        cursor: "pointer",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.015)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div className="flex flex-col">
        <span style={{ fontSize: 13, color: "#FAFAFA" }}>{label}</span>
        <span style={{ fontSize: 11, color: "#71717A", marginTop: 2 }}>
          {sublabel}
        </span>
      </div>
      <ChevronDown
        size={14}
        strokeWidth={1.5}
        style={{ color: "#71717A", transform: "rotate(-90deg)" }}
      />
    </button>
  );
}

function LegalModal({
  type,
  onClose,
}: {
  type: LegalKey;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#0A0A0B",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: 24,
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-start justify-between gap-3" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 500, color: "#FAFAFA", margin: 0 }}>
            {LEGAL_TITLES[type]}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            style={{
              background: "transparent",
              border: "none",
              color: "#71717A",
              cursor: "pointer",
              padding: 2,
            }}
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div
          style={{
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.20)",
            borderRadius: 6,
            padding: 14,
            display: "flex",
            gap: 10,
          }}
        >
          <Info size={16} strokeWidth={1.5} style={{ color: "#3B82F6", flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 12, color: "#FAFAFA", lineHeight: 1.5 }}>
              Ce document est en cours de rédaction et sera publié avant la sortie publique de Monark Foundations.
            </div>
            <div style={{ fontSize: 11, color: "#A1A1AA", marginTop: 6 }}>
              Pour toute question légale en attendant, contactez{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                style={{ color: "#3B82F6", textDecoration: "none" }}
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </div>
          </div>
        </div>

        <div className="flex justify-end" style={{ marginTop: 18 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 6,
              padding: "8px 16px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#FAFAFA",
              cursor: "pointer",
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}