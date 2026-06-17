import { useState, type CSSProperties } from "react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";

const bar: CSSProperties = {
  background: "rgba(245,158,11,0.12)",
  borderBottom: "1px solid rgba(245,158,11,0.30)",
  color: "#FDE68A",
  padding: "10px 16px",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 16,
  flexWrap: "wrap",
};

const btn: CSSProperties = {
  border: "1px solid rgba(245,158,11,0.50)",
  borderRadius: 6,
  padding: "6px 14px",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "#FFFFFF",
  background: "rgba(245,158,11,0.20)",
  cursor: "pointer",
};

type Status = "idle" | "sending" | "sent" | "error";

export default function EmailNotVerifiedBanner() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>("idle");

  if (user?.email_verified !== false) return null;

  async function handleResend() {
    if (status === "sending" || status === "sent") return;
    setStatus("sending");
    try {
      await authApi.resendVerification();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const label =
    status === "sending"
      ? "ENVOI…"
      : status === "sent"
        ? "E-MAIL ENVOYÉ ✓"
        : status === "error"
          ? "RÉESSAYER"
          : "RENVOYER L'E-MAIL";

  const disabled = status === "sending" || status === "sent";

  return (
    <div style={bar} role="alert">
      <span>Confirme ton adresse e-mail pour sécuriser ton compte.</span>
      <button
        type="button"
        onClick={handleResend}
        style={{ ...btn, opacity: disabled ? 0.7 : 1, cursor: status === "sending" ? "wait" : disabled ? "default" : "pointer" }}
        disabled={disabled}
      >
        {label}
      </button>
    </div>
  );
}