import { Link } from "@tanstack/react-router";

export default function RepairHistory() {
  return (
    <div>
      <div className="mb-4 font-mono text-[11px] tracking-wider">
        <Link
          to="/repair"
          className="ease-expo transition-colors hover:text-zinc-100"
          style={{ color: "#A1A1AA" }}
        >
          ← REPAIR GUIDE
        </Link>
      </div>
      <div className="mb-8">
        <div className="font-mono text-[11px] tracking-wider" style={{ color: "#71717A" }}>
          § — HISTORIQUE
        </div>
        <h1 className="mt-1 text-[22px] font-medium" style={{ color: "#FAFAFA" }}>
          Historique des diagnostics
        </h1>
      </div>
      <div
        className="rounded-lg p-6"
        style={{
          background: "rgba(255,255,255,0.015)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="font-mono text-[11px] tracking-wider" style={{ color: "#71717A" }}>
          P2D
        </div>
        <div className="mt-2 text-[14px]" style={{ color: "#A1A1AA" }}>
          Historique — intégration prévue dans P2D.
        </div>
      </div>
    </div>
  );
}