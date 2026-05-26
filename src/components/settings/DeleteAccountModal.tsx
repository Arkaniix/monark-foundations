import { useEffect, useState, type CSSProperties } from "react";
import { authApi } from "@/lib/api";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirmed: () => void;
};

const backdrop: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 16,
};

const modal: CSSProperties = {
  background: "#0A0A0A",
  border: "1px solid rgba(239,68,68,0.30)",
  borderRadius: 10,
  padding: 24,
  maxWidth: 520,
  width: "100%",
  color: "#FAFAFA",
};

const inputStyle: CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 6,
  padding: "8px 12px",
  fontSize: 12,
  color: "#FAFAFA",
  outline: "none",
  fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: "0.10em",
};

const ghostBtn: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 6,
  padding: "8px 16px",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "#A1A1AA",
  background: "transparent",
  cursor: "pointer",
};

const dangerBtn: CSSProperties = {
  border: "1px solid rgba(239,68,68,0.40)",
  borderRadius: 6,
  padding: "8px 16px",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "#FFFFFF",
  background: "rgba(239,68,68,0.20)",
  cursor: "pointer",
};

export default function DeleteAccountModal({ open, onClose, onConfirmed }: Props) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setValue("");
      setError(null);
      setLoading(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  const isMatch = value.trim().toUpperCase() === "SUPPRIMER";
  const canConfirm = isMatch && !loading;

  async function handleConfirm() {
    if (!canConfirm) return;
    setLoading(true);
    setError(null);
    try {
      await authApi.deleteAccount();
      onConfirmed();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suppression impossible.");
      setLoading(false);
    }
  }

  return (
    <div
      style={backdrop}
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.20em",
            color: "#EF4444",
            marginBottom: 12,
          }}
        >
          § ZONE DANGEREUSE
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 500, margin: 0, marginBottom: 12 }}>
          Supprimer mon compte
        </h2>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "#A1A1AA", marginBottom: 16 }}>
          Votre compte sera désactivé et programmé pour suppression définitive dans 30 jours.
          Pendant ce délai, vous pouvez le restaurer à tout moment en vous reconnectant.
          Passé 30 jours, toutes vos données personnelles seront définitivement effacées.
          Cette action est irréversible au terme du délai.
        </p>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="SUPPRIMER"
          style={inputStyle}
          autoFocus
          disabled={loading}
        />
        <div style={{ fontSize: 11, color: "#71717A", marginTop: 6 }}>
          Tapez SUPPRIMER pour confirmer.
        </div>
        {error && (
          <div style={{ fontSize: 12, color: "#EF4444", marginTop: 10 }}>{error}</div>
        )}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 20,
          }}
        >
          <button type="button" onClick={onClose} style={ghostBtn} disabled={loading}>
            ANNULER
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              ...dangerBtn,
              opacity: canConfirm ? 1 : 0.45,
              cursor: canConfirm ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "SUPPRESSION…" : "CONFIRMER LA SUPPRESSION"}
          </button>
        </div>
      </div>
    </div>
  );
}