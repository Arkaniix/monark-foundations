import { useState, type CSSProperties } from "react";
import { Download, Upload, Check } from "lucide-react";
import SettingsBreadcrumb from "../components/settings/SettingsBreadcrumb";
import SettingsHeader from "../components/settings/SettingsHeader";
import { fetchAndDownloadServerExport } from "@/lib/dataExport";
import { ApiException } from "@/lib/api/client";

const cardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.015)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 8,
  padding: 18,
};

const dangerCardStyle: CSSProperties = {
  ...cardStyle,
  border: "1px solid rgba(239,68,68,0.20)",
};

// Cartes « Prochainement » : ruban diagonal ambre + carte atténuée.
const soonCardStyle: CSSProperties = {
  ...cardStyle,
  position: "relative",
  overflow: "hidden",
  opacity: 0.7,
};

const soonDangerCardStyle: CSSProperties = {
  ...dangerCardStyle,
  position: "relative",
  overflow: "hidden",
  opacity: 0.7,
};

const subLabelStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.20em",
  color: "#52525B",
  marginBottom: 12,
};

const dangerSubLabelStyle: CSSProperties = { ...subLabelStyle, color: "#EF4444" };

const titleStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "#FAFAFA",
  marginBottom: 4,
};

const descStyle: CSSProperties = {
  fontSize: 12,
  color: "#A1A1AA",
  lineHeight: 1.5,
  marginBottom: 12,
};

const primaryBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "#3B82F6",
  border: "1px solid #3B82F6",
  borderRadius: 6,
  padding: "8px 16px",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#FAFAFA",
  cursor: "pointer",
};

const successBtn: CSSProperties = {
  ...primaryBtn,
  background: "#10B981",
  border: "1px solid #10B981",
};

const loadingBtn: CSSProperties = {
  ...primaryBtn,
  cursor: "wait",
  opacity: 0.8,
};

const ghostBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 6,
  padding: "8px 16px",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#D4D4D8",
  cursor: "pointer",
};

const dangerBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "transparent",
  border: "1px solid rgba(239,68,68,0.40)",
  borderRadius: 6,
  padding: "8px 16px",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#EF4444",
  cursor: "pointer",
};

const disabledGhostBtn: CSSProperties = { ...ghostBtn, cursor: "not-allowed", opacity: 0.5 };
const disabledDangerBtn: CSSProperties = { ...dangerBtn, cursor: "not-allowed", opacity: 0.5 };

const errorBox: CSSProperties = {
  marginTop: 12,
  padding: "10px 12px",
  background: "rgba(239,68,68,0.10)",
  border: "1px solid rgba(239,68,68,0.30)",
  borderRadius: 6,
  fontSize: 12,
  color: "#EF4444",
};

export default function SettingsData() {
  const [exportStatus, setExportStatus] = useState<"idle" | "loading" | "success">("idle");
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleExport() {
    setExportError(null);
    setExportStatus("loading");
    try {
      await fetchAndDownloadServerExport();
      setExportStatus("success");
      window.setTimeout(() => setExportStatus("idle"), 3000);
    } catch (err) {
      setExportStatus("idle");
      setExportError(
        err instanceof ApiException
          ? `Échec de l'export (erreur ${err.status}). Réessayez dans un instant.`
          : "Échec de l'export. Vérifiez votre connexion et réessayez.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SettingsBreadcrumb parentLabel="PARAMÈTRES" parentPath="/settings" currentLabel="DONNÉES" />
      <SettingsHeader
        sectionLabel="§ 05 — DONNÉES"
        title="Export, import et réinitialisation"
        marginBottom={24}
      />

      {/* § 05.1 EXPORT — fonctionnel (serveur) */}
      <div style={cardStyle}>
        <div style={subLabelStyle}>§ 05.1 — EXPORT</div>
        <div style={titleStyle}>Télécharger l'export de vos données</div>
        <div style={descStyle}>
          Génère un fichier JSON contenant l'ensemble des données enregistrées sur votre compte :
          profil, réglages, stock, builds, comptabilité, favoris, estimations, alertes et historique
          de réparation. Conservez-le comme sauvegarde ou pour vos démarches de portabilité.
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exportStatus === "loading"}
          style={
            exportStatus === "success"
              ? successBtn
              : exportStatus === "loading"
                ? loadingBtn
                : primaryBtn
          }
        >
          {exportStatus === "success" ? (
            <>
              <Check size={12} strokeWidth={2} />
              Téléchargé
            </>
          ) : exportStatus === "loading" ? (
            <>
              <Download size={12} strokeWidth={1.5} />
              Export en cours…
            </>
          ) : (
            <>
              <Download size={12} strokeWidth={1.5} />
              Télécharger l'export
            </>
          )}
        </button>
        {exportError && <div style={errorBox}>{exportError}</div>}
      </div>

      {/* § 05.2 IMPORT — Prochainement */}
      <div style={soonCardStyle}>
        <span className="soon-ribbon">Prochainement</span>
        <div style={subLabelStyle}>§ 05.2 — IMPORT</div>
        <div style={titleStyle}>Importer un fichier d'export</div>
        <div style={descStyle}>
          L'import d'un fichier d'export pour restaurer vos données sera disponible prochainement.
        </div>
        <button type="button" disabled aria-disabled="true" style={disabledGhostBtn}>
          <Upload size={12} strokeWidth={1.5} />
          Choisir un fichier
        </button>
      </div>

      {/* § 05.3 RÉINITIALISATION — Prochainement */}
      <div style={soonDangerCardStyle}>
        <span className="soon-ribbon">Prochainement</span>
        <div style={dangerSubLabelStyle}>§ 05.3 — ZONE DANGEREUSE</div>
        <div style={titleStyle}>Réinitialiser toutes les données</div>
        <div style={descStyle}>
          La réinitialisation de l'ensemble de vos données depuis le serveur sera disponible
          prochainement.
        </div>
        <button type="button" disabled aria-disabled="true" style={disabledDangerBtn}>
          Réinitialiser toutes les données
        </button>
      </div>
    </div>
  );
}
