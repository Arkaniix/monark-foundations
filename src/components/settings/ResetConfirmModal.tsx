import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { ImportPreview } from "@/lib/dataExport";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  countersSummary: ImportPreview | null;
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
  border: "1px solid rgba(239,68,68,0.25)",
  borderRadius: 10,
  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
};

const rowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "4px 0",
  fontSize: 12,
  color: "#D4D4D8",
};

const KEYWORD = "RÉINITIALISER";

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default function ResetConfirmModal({ open, onClose, onConfirm, countersSummary }: Props) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const trimmed = typed.trim();
  const matches = trimmed === KEYWORD || normalize(trimmed) === normalize(KEYWORD);

  return createPortal(
    <div
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={modalStyle} role="dialog" aria-modal="true" aria-label="Réinitialiser toutes les données">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 500, color: "#EF4444" }}>
            Réinitialiser toutes les données
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

        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              padding: "10px 12px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.30)",
              borderRadius: 6,
              fontSize: 12,
              color: "#FCA5A5",
              lineHeight: 1.5,
            }}
          >
            Action irréversible. Toutes les données métier et préférences seront définitivement effacées de ce navigateur.
          </div>

          {countersSummary && (
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
                  letterSpacing: "0.18em",
                  color: "#71717A",
                  marginBottom: 8,
                }}
              >
                CE QUI SERA EFFACÉ
              </div>
              {[
                ["Items de stock", countersSummary.stock_items],
                ["Builds", countersSummary.builds],
                ["Entrées de comptabilité", countersSummary.accounting_entries],
                ["Favoris catalogue", countersSummary.catalog_favorites],
                ["Historique estimations", countersSummary.estimator_history],
                ["Préférences", countersSummary.preferences_keys],
              ].map(([k, v]) => (
                <div key={k as string} style={rowStyle}>
                  <span style={{ color: "#A1A1AA" }}>{k}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#FAFAFA" }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ fontSize: 11, color: "#A1A1AA" }}>
            Astuce : exportez d'abord vos données pour pouvoir les restaurer.
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "#D4D4D8",
                marginBottom: 6,
              }}
            >
              Tapez <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#FAFAFA" }}>{KEYWORD}</span> pour confirmer
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              autoFocus
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 13,
                color: "#FAFAFA",
                outline: "none",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          </div>
        </div>

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
            aria-disabled={!matches}
            onClick={() => {
              if (matches) onConfirm();
            }}
            style={{
              padding: "8px 14px",
              background: "#EF4444",
              border: "1px solid #EF4444",
              borderRadius: 6,
              color: "#FAFAFA",
              fontSize: 12,
              fontWeight: 500,
              cursor: matches ? "pointer" : "not-allowed",
              opacity: matches ? 1 : 0.45,
            }}
          >
            Tout effacer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
