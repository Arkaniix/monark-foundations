import { Link } from "@tanstack/react-router";
import {
  User,
  Sliders,
  Receipt,
  Bell,
  Database,
  Info,
  type LucideIcon,
} from "lucide-react";
import type { SettingsCategoryDef } from "./datasets";

const ICON_MAP: Record<string, LucideIcon> = {
  user: User,
  sliders: Sliders,
  receipt: Receipt,
  bell: Bell,
  database: Database,
  info: Info,
};

type Props = { category: SettingsCategoryDef };

export default function SettingsCategoryTile({ category }: Props) {
  const Icon = ICON_MAP[category.iconName] ?? Info;
  const isSoon = category.status === "soon";

  const inner = (
    <>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
          background: category.iconBgRgba,
          color: category.iconColorHex,
        }}
      >
        <Icon size={16} strokeWidth={1.5} />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 2,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#FAFAFA",
          }}
        >
          {category.label}
        </span>
        {category.status === "p2" && (
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              letterSpacing: "0.12em",
              padding: "1px 5px",
              borderRadius: 4,
              background: "rgba(245,158,11,0.10)",
              color: "#F59E0B",
            }}
          >
            P2
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#71717A",
          lineHeight: 1.5,
        }}
      >
        {category.tileSublabel}
      </div>
    </>
  );

  if (isSoon) {
    return (
      <div
        aria-disabled="true"
        style={{
          position: "relative",
          overflow: "hidden",
          display: "block",
          padding: 16,
          borderRadius: 8,
          background: "rgba(255,255,255,0.015)",
          border: "1px solid rgba(255,255,255,0.06)",
          opacity: 0.7,
          cursor: "not-allowed",
          userSelect: "none",
        }}
      >
        {inner}
        <span className="soon-ribbon">Prochainement</span>
      </div>
    );
  }

  return (
    <Link
      to={category.path}
      style={{
        display: "block",
        textDecoration: "none",
        padding: 16,
        borderRadius: 8,
        background: "rgba(255,255,255,0.015)",
        border: "1px solid rgba(255,255,255,0.06)",
        cursor: "pointer",
        transition:
          "background 200ms cubic-bezier(0.16,1,0.3,1), border-color 200ms cubic-bezier(0.16,1,0.3,1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.030)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.015)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
      }}
    >
      {inner}
    </Link>
  );
}
