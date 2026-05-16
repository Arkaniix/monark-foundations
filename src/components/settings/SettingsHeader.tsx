type Props = {
  sectionLabel: string;
  title: string;
  subtitle?: string;
  marginBottom?: number;
};

export default function SettingsHeader({
  sectionLabel,
  title,
  subtitle,
  marginBottom,
}: Props) {
  return (
    <div style={{ marginBottom: marginBottom ?? 28 }}>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.18em",
          color: "#71717A",
          marginBottom: 6,
        }}
      >
        {sectionLabel}
      </div>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 500,
          color: "#FAFAFA",
          letterSpacing: "-0.01em",
          lineHeight: 1.3,
          margin: 0,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <div
          style={{
            fontSize: 12,
            color: "#A1A1AA",
            marginTop: 4,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}