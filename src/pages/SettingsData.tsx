import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Download, Upload, Check } from "lucide-react";
import SettingsBreadcrumb from "../components/settings/SettingsBreadcrumb";
import SettingsHeader from "../components/settings/SettingsHeader";
import ImportConfirmModal from "../components/settings/ImportConfirmModal";
import ResetConfirmModal from "../components/settings/ResetConfirmModal";
import {
  applyImportPayload,
  buildExportPayload,
  buildImportPreview,
  downloadPayloadAsFile,
  formatBytes,
  readPayloadFromFile,
  resetAllSettings,
  type ExportPayload,
  type ImportPreview,
} from "@/lib/dataExport";

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

const statStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  color: "#71717A",
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

export default function SettingsData() {
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importPayload, setImportPayload] = useState<ExportPayload | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [currentDataSummary, setCurrentDataSummary] = useState<ImportPreview | null>(null);
  const [exportStatus, setExportStatus] = useState<"idle" | "success">("idle");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const payload = buildExportPayload();
    setCurrentDataSummary(buildImportPreview(payload));
  }, []);

  function handleExport() {
    const payload = buildExportPayload();
    downloadPayloadAsFile(payload);
    setCurrentDataSummary(buildImportPreview(payload));
    setExportStatus("success");
    window.setTimeout(() => setExportStatus("idle"), 3000);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      const payload = await readPayloadFromFile(file);
      const preview = buildImportPreview(payload);
      setImportPayload(payload);
      setImportPreview(preview);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Échec de la lecture du fichier.");
    } finally {
      e.target.value = "";
    }
  }

  function handleImportConfirm() {
    if (!importPayload) return;
    applyImportPayload(importPayload);
    setImportPayload(null);
    setImportPreview(null);
    window.location.reload();
  }

  function handleImportCancel() {
    setImportPayload(null);
    setImportPreview(null);
  }

  function handleResetConfirm() {
    resetAllSettings();
    setResetModalOpen(false);
    window.location.reload();
  }

  const keyCount = currentDataSummary?.keys_count ?? 0;
  const sizeBytes = currentDataSummary?.total_size_bytes ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <SettingsBreadcrumb
        parentLabel="PARAMÈTRES"
        parentPath="/settings"
        currentLabel="DONNÉES"
      />
      <SettingsHeader
        sectionLabel="§ 05 — DONNÉES"
        title="Export, import et réinitialisation"
        marginBottom={24}
      />

      {/* § 05.1 EXPORT */}
      <div style={cardStyle}>
        <div style={subLabelStyle}>§ 05.1 — EXPORT</div>
        <div style={titleStyle}>Télécharger un export de toutes vos données</div>
        <div style={descStyle}>
          Génère un fichier JSON contenant l'intégralité de vos données et préférences locales. Conservez-le pour transférer vers un autre navigateur ou en restaurer un état antérieur.
        </div>
        <div style={statStyle}>
          {keyCount} clés · {formatBytes(sizeBytes)}
        </div>
        <button
          type="button"
          onClick={handleExport}
          style={exportStatus === "success" ? successBtn : primaryBtn}
        >
          {exportStatus === "success" ? (
            <>
              <Check size={12} strokeWidth={2} />
              Téléchargé
            </>
          ) : (
            <>
              <Download size={12} strokeWidth={1.5} />
              Télécharger l'export
            </>
          )}
        </button>
      </div>

      {/* § 05.2 IMPORT */}
      <div style={cardStyle}>
        <div style={subLabelStyle}>§ 05.2 — IMPORT</div>
        <div style={titleStyle}>Importer un fichier d'export</div>
        <div style={descStyle}>
          Charge un fichier .json précédemment exporté. Toutes vos données actuelles seront remplacées.
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={ghostBtn}
        >
          <Upload size={12} strokeWidth={1.5} />
          Choisir un fichier
        </button>
        {importError && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              background: "rgba(239,68,68,0.10)",
              border: "1px solid rgba(239,68,68,0.30)",
              borderRadius: 6,
              fontSize: 12,
              color: "#EF4444",
            }}
          >
            {importError}
          </div>
        )}
      </div>

      {/* § 05.3 RÉINITIALISATION */}
      <div style={dangerCardStyle}>
        <div style={dangerSubLabelStyle}>§ 05.3 — ZONE DANGEREUSE</div>
        <div style={titleStyle}>Réinitialiser toutes les données</div>
        <div style={descStyle}>
          Efface définitivement toutes vos données métier (stock, builds, comptabilité, favoris) et toutes vos préférences. Cette action ne peut pas être annulée.
        </div>
        <div style={statStyle}>{keyCount} clés concernées</div>
        <button
          type="button"
          onClick={() => setResetModalOpen(true)}
          style={dangerBtn}
        >
          Réinitialiser toutes les données
        </button>
      </div>

      <ImportConfirmModal
        open={importPreview !== null}
        preview={importPreview}
        onClose={handleImportCancel}
        onConfirm={handleImportConfirm}
      />

      <ResetConfirmModal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={handleResetConfirm}
        countersSummary={currentDataSummary}
      />
    </div>
  );
}
