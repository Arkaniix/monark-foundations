import { useEffect, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { ImportPreview } from "@/lib/dataExport";
import { formatBytes, formatExportedAt } from "@/lib/dataExport";

type Props = {
  open: boolean;
  preview: ImportPreview | null;
  onClose: () => void;
  onConfirm: () => void;
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  zIndex: 110,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};

const modalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 480,
  background: "#0E0E10",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
};

const rowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "6px 0",
  fontSize: 12,
  color: "#D4D4D8",
};

const rowKeyStyle: CSSProperties = { color: "#A1A1AA" };
const rowValueStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  color: "#FAFAFA",
};

function Row({ k, v }: { k: string; v: number | string }) {
  return (
    <div style={rowStyle}>
      <span style={rowKeyStyle}>{k}</span>
      <span style={rowValueStyle}>{v}</span>
    </div>
  );
}

export default function ImportConfirmModal({ open, preview, onClose, onConfirm }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !preview) return null;

  return createPortal(
    <div
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={modalStyle} role="dialog" aria-modal="true" aria-label="Confirmer l'import">
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 500, color: "#FAFAFA" }}>
            Confirmer l'import
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            style={{
              background: "transparent",
              border: "none",
              color: "#A1A1AA",
              cursor: "pointer",
              padding: 4,
              display: "flex",
            }}
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              padding: "10px 12px",
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: 6,
              fontSize: 12,
              color: "#FBBF24",
              lineHeight: 1.5,
            }}
          >
            ⚠ Cette opération remplacera toutes vos données et préférences actuelles.
          </div>

          <div
            style={{
              padding: "12px 14px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 6,
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "#71717A",
                marginBottom: 8,
              }}
            >
              Exporté le {formatExportedAt(preview.exported_at)}
            </div>
            <Row k="Items de stock" v={preview.stock_items} />
            <Row k="Builds" v={preview.builds} />
            <Row k="Entrées de comptabilité" v={preview.accounting_entries} />
            <Row k="Favoris catalogue" v={preview.catalog_favorites} />
            <Row k="Historique estimations" v={preview.estimator_history} />
            <Row k="Préférences" v={preview.preferences_keys} />
            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: "1px solid rgba(255,255,255,0.05)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "#A1A1AA",
              }}
            >
              Taille du fichier : {formatBytes(preview.total_size_bytes)} · {preview.keys_count} clés au total
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            padding: "12px 18px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 14px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 6,
              color: "#D4D4D8",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "8px 14px",
              background: "#EF4444",
              border: "1px solid #EF4444",
              borderRadius: 6,
              color: "#FAFAFA",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Remplacer mes données
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
