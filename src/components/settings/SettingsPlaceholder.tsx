import { Construction } from "lucide-react";

type Props = { label: string };

export default function SettingsPlaceholder({ label }: Props) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.015)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 8,
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 12,
          color: "#52525B",
        }}
      >
        <Construction size={24} strokeWidth={1.5} />
      </div>
      <div style={{ fontSize: 13, color: "#A1A1AA" }}>{label}</div>
    </div>
  );
}