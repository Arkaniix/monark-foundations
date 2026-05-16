import type { CSSProperties, ReactNode } from "react";

type Props = {
  label: string;
  sublabel?: string;
  children: ReactNode;
  status?: "deferred";
  isFirst?: boolean;
};

const containerBase: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 24,
  padding: "14px 0",
};

const badgeStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9,
  letterSpacing: "0.12em",
  padding: "1px 6px",
  background: "rgba(161,161,170,0.10)",
  color: "#71717A",
  borderRadius: 3,
  marginLeft: 8,
  display: "inline-block",
  verticalAlign: "middle",
};

export default function SettingsRow({
  label,
  sublabel,
  children,
  status,
  isFirst,
}: Props) {
  const style: CSSProperties = {
    ...containerBase,
    borderTop: isFirst ? undefined : "1px solid rgba(255,255,255,0.04)",
  };
  return (
    <div style={style}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div>
          <span
            style={{
              fontSize: 13,
              color: "#FAFAFA",
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            {label}
          </span>
          {status === "deferred" && (
            <span style={badgeStyle}>ACTIVATION PROGRESSIVE</span>
          )}
        </div>
        {sublabel && (
          <div
            style={{
              fontSize: 11,
              color: "#71717A",
              marginTop: 2,
              lineHeight: 1.5,
            }}
          >
            {sublabel}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}