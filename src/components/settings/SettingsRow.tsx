import type { CSSProperties, ReactNode } from "react";
import { Link } from "@tanstack/react-router";

type Props = {
  label: string;
  sublabel?: string;
  children: ReactNode;
  status?: "deferred" | "soon";
  isFirst?: boolean;
  footerAction?: { label: string; href: string };
  labelBadge?: ReactNode;
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

const soonBadgeStyle: CSSProperties = {
  ...badgeStyle,
  background: "rgba(245,158,11,0.12)",
  color: "#F59E0B",
};

export default function SettingsRow({
  label,
  sublabel,
  children,
  status,
  isFirst,
  footerAction,
  labelBadge,
}: Props) {
  const style: CSSProperties = {
    ...containerBase,
    flexDirection: "column",
    borderTop: isFirst ? undefined : "1px solid rgba(255,255,255,0.04)",
  };
  return (
    <div style={style}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 24,
          width: "100%",
        }}
      >
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
            {labelBadge}
            {status === "deferred" && (
              <span style={badgeStyle}>ACTIVATION PROGRESSIVE</span>
            )}
            {status === "soon" && <span style={soonBadgeStyle}>PROCHAINEMENT</span>}
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
      {footerAction && (
        <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <Link
            to={footerAction.href}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.08em",
              color: "#71717A",
              textDecoration: "none",
              transition: "color 200ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FAFAFA")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#71717A")}
          >
            {footerAction.label}
          </Link>
        </div>
      )}
    </div>
  );
}