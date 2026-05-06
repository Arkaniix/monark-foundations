type Props = { kind: "lbc" | "vinted" | "ebay"; size?: number };

export default function PlatformWordmark({ kind, size = 14 }: Props) {
  if (kind === "lbc") {
    return <span className="font-semibold tracking-tight" style={{ color: "#c2410c", fontSize: size, letterSpacing: "-0.02em" }}>l*boncoin</span>;
  }
  if (kind === "vinted") {
    return <span className="italic font-semibold tracking-tight" style={{ color: "#0d9488", fontSize: size }}>vint*d</span>;
  }
  return (
    <span style={{ fontSize: size, fontWeight: 700, letterSpacing: "-0.02em" }}>
      <span style={{ color: "#dc2626" }}>*</span>
      <span style={{ color: "#1d4ed8" }}>b</span>
      <span style={{ color: "#ca8a04" }}>a</span>
      <span style={{ color: "#15803d" }}>y</span>
    </span>
  );
}