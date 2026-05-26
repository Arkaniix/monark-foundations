import { useState, type CSSProperties } from "react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

const bar: CSSProperties = {
  background: "rgba(239,68,68,0.12)",
  borderBottom: "1px solid rgba(239,68,68,0.30)",
  color: "#FECACA",
  padding: "10px 16px",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 16,
  flexWrap: "wrap",
};

const btn: CSSProperties = {
  border: "1px solid rgba(239,68,68,0.50)",
  borderRadius: 6,
  padding: "6px 14px",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "#FFFFFF",
  background: "rgba(239,68,68,0.20)",
  cursor: "pointer",
};

export default function PendingDeletionBanner() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!user?.pending_deletion) return null;

  async function handleRestore() {
    if (loading) return;
    setLoading(true);
    try {
      await authApi.restoreAccount();
      await refreshUser();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={bar} role="alert">
      <span>
        Compte programmé pour suppression le{" "}
        <strong style={{ color: "#FFFFFF" }}>{formatDate(user.deletion_scheduled_at)}</strong>.
      </span>
      <button
        type="button"
        onClick={handleRestore}
        style={{ ...btn, opacity: loading ? 0.6 : 1, cursor: loading ? "wait" : "pointer" }}
        disabled={loading}
      >
        {loading ? "RESTAURATION…" : "RESTAURER MON COMPTE"}
      </button>
    </div>
  );
}