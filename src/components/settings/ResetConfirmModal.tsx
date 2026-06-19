import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { resetServerData } from "@/lib/dataExport";
import { ApiException } from "@/lib/api/client";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirmed: () => void;
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

export default function ResetConfirmModal({ open, onClose, onConfirmed }: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setError(null);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, loading]);

  if (!open) return null;

  const canSubmit = password.length > 0 && !loading;

  async function handleConfirm() {
    if (password.length === 0 || loading) return;
    setError(null);
    setLoading(true);
    try {
      await resetServerData(password);
      onConfirmed();
    } catch (err) {
      setLoading(false);
      setError(
        err instanceof ApiException && err.status === 400
          ? "Mot de passe incorrect."
          : "Échec de la réinitialisation. Réessayez dans un instant.",
      );
    }
  }

  return createPortal(
    <div
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        style={modalStyle}
        role="dialog"
        aria-modal="true"
        aria-label="Réinitialiser toutes les données"
      >
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
            disabled={loading}
            aria-label="Fermer"
            style={{
              background: "transparent",
              border: "none",
              color: "#A1A1AA",
              cursor: loading ? "not-allowed" : "pointer",
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
            Action irréversible. Votre stock, vos builds, votre comptabilité, vos favoris, vos
            estimations, vos alertes et votre historique de réparation seront définitivement
            supprimés de votre compte. Votre compte, vos réglages et vos crédits sont conservés.
          </div>

          <div style={{ fontSize: 11, color: "#A1A1AA" }}>
            Astuce : téléchargez d'abord un export depuis la section ci-dessus pour pouvoir
            restaurer vos données plus tard.
          </div>

          <div>
            <label
              htmlFor="reset-password"
              style={{ display: "block", fontSize: 12, color: "#D4D4D8", marginBottom: 6 }}
            >
              Saisissez votre mot de passe pour confirmer
            </label>
            <input
              id="reset-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleConfirm();
              }}
              autoComplete="current-password"
              autoFocus
              disabled={loading}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 13,
                color: "#FAFAFA",
                outline: "none",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "10px 12px",
                background: "rgba(239,68,68,0.10)",
                border: "1px solid rgba(239,68,68,0.30)",
                borderRadius: 6,
                fontSize: 12,
                color: "#EF4444",
              }}
            >
              {error}
            </div>
          )}
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
            disabled={loading}
            style={{
              padding: "8px 14px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 6,
              color: "#D4D4D8",
              fontSize: 12,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!canSubmit}
            style={{
              padding: "8px 14px",
              background: "#EF4444",
              border: "1px solid #EF4444",
              borderRadius: 6,
              color: "#FAFAFA",
              fontSize: 12,
              fontWeight: 500,
              cursor: canSubmit ? "pointer" : "not-allowed",
              opacity: canSubmit ? 1 : 0.45,
            }}
          >
            {loading ? "Réinitialisation…" : "Tout effacer"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
