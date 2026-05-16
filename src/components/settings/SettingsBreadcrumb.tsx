import { Link } from "@tanstack/react-router";

type Props = {
  parentLabel: string;
  parentPath: string;
  currentLabel: string;
};

export default function SettingsBreadcrumb({
  parentLabel,
  parentPath,
  currentLabel,
}: Props) {
  return (
    <div
      className="flex items-center"
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.22em",
        marginBottom: 16,
      }}
    >
      <Link
        to={parentPath}
        className="ease-expo transition-colors"
        style={{
          color: "#A1A1AA",
          padding: "2px 4px",
          cursor: "pointer",
          transition: "color 200ms cubic-bezier(0.16,1,0.3,1)",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#FAFAFA";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#A1A1AA";
        }}
      >
        ← {parentLabel}
      </Link>
      <span style={{ color: "#52525B", padding: "0 4px" }}>/</span>
      <span style={{ color: "#52525B", padding: "2px 4px" }}>
        {currentLabel}
      </span>
    </div>
  );
}