import { Download } from "lucide-react";
import SettingsHeader from "../components/settings/SettingsHeader";
import SettingsCategoryTile from "../components/settings/SettingsCategoryTile";
import { SETTINGS_CATEGORIES } from "../components/settings/datasets";
import { buildExportPayload, downloadPayloadAsFile } from "@/lib/dataExport";
import { useState } from "react";

export default function Settings() {
  const [exported, setExported] = useState(false);
  function handleExport() {
    downloadPayloadAsFile(buildExportPayload());
    setExported(true);
    window.setTimeout(() => setExported(false), 3000);
  }
  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      {/* Fil d'ariane non cliquable */}
      <div
        className="flex items-center"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.22em",
          marginBottom: 16,
        }}
      >
        <span style={{ color: "#71717A", padding: "2px 4px" }}>
          MONARK FOUNDATIONS
        </span>
        <span style={{ color: "#52525B", padding: "0 4px" }}>/</span>
        <span style={{ color: "#52525B", padding: "2px 4px" }}>PARAMÈTRES</span>
      </div>

      <SettingsHeader
        sectionLabel="§ 01 — PARAMÈTRES"
        title="Configurer votre compte et vos préférences"
        subtitle="Tout est stocké localement. Exportable, importable et réinitialisable à tout moment."
        marginBottom={28}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {SETTINGS_CATEGORIES.map((c) => (
          <SettingsCategoryTile key={c.key} category={c} />
        ))}
      </div>

      {/* Footer hub */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 14,
          marginTop: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "#71717A",
          }}
        >
          STORAGE · LOCAL UNIQUEMENT · NAVIGATEUR DE CE POSTE
        </div>
        <button
          type="button"
          onClick={handleExport}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 6,
            padding: "7px 14px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: exported ? "#10B981" : "#D4D4D8",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <Download size={12} strokeWidth={1.5} />
          {exported ? "Exporté" : "Exporter tout"}
        </button>
      </div>
    </div>
  );
}