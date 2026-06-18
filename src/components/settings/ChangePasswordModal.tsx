import { useEffect, useState, type CSSProperties } from "react";
import { authApi } from "@/lib/api";
import { ApiException } from "@/lib/api/client";

type Props = {
  open: boolean;
  onClose: () => void;
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
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 10,
  padding: 24,
  maxWidth: 480,
  width: "100%",
  color: "#FAFAFA",
};

const labelStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.10em",
  color: "#A1A1AA",
  marginBottom: 6,
  display: "block",
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

const hintStyle: CSSProperties = {
  fontSize: 11,
  color: "#F59E0B",
  marginTop: 6,
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

const primaryBtn: CSSProperties = {
  border: "1px solid rgba(59,130,246,0.40)",
  borderRadius: 6,
  padding: "8px 16px",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "#FFFFFF",
  background: "rgba(59,130,246,0.20)",
  cursor: "pointer",
};

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) {
      setCurrent("");
      setNext("");
      setConfirm("");
      setError(null);
      setLoading(false);
      setDone(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  const lenOk = next.length >= 8;
  const matchOk = next === confirm;
  const diffOk = next !== current;
  const canSubmit =
    current.length > 0 && lenOk && matchOk && diffOk && !loading && !done;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await authApi.changePassword(current, next);
      setDone(true);
      setTimeout(() => onClose(), 1200);
    } catch (e) {
      if (e instanceof ApiException && e.status === 400) {
        setError("Mot de passe actuel incorrect.");
      } else {
        setError(e instanceof Error ? e.message : "Une erreur est survenue.");
      }
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
            color: "#3B82F6",
            marginBottom: 12,
          }}
        >
          § SÉCURITÉ
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 500, margin: 0, marginBottom: 16 }}>
          Modifier le mot de passe
        </h2>

        {done ? (
          <div style={{ fontSize: 13, color: "#10B981", padding: "12px 0" }}>
            ✓ Mot de passe modifié.
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Mot de passe actuel</label>
              <input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                style={inputStyle}
                autoFocus
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nouveau mot de passe</label>
              <input
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                style={inputStyle}
                disabled={loading}
                autoComplete="new-password"
              />
              {next.length > 0 && !lenOk && (
                <div style={hintStyle}>Au moins 8 caractères.</div>
              )}
              {next.length > 0 && lenOk && !diffOk && (
                <div style={hintStyle}>
                  Le nouveau mot de passe doit être différent de l'actuel.
                </div>
              )}
            </div>

            <div>
              <label style={labelStyle}>Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                style={inputStyle}
                disabled={loading}
                autoComplete="new-password"
              />
              {confirm.length > 0 && !matchOk && (
                <div style={hintStyle}>Les mots de passe ne correspondent pas.</div>
              )}
            </div>

            {error && (
              <div style={{ fontSize: 12, color: "#EF4444", marginTop: 12 }}>
                {error}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={ghostBtn}
                disabled={loading}
              >
                ANNULER
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{
                  ...primaryBtn,
                  opacity: canSubmit ? 1 : 0.45,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                }}
              >
                {loading ? "MODIFICATION…" : "CHANGER LE MOT DE PASSE"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}