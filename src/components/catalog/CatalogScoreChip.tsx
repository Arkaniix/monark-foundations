import { getScoreColor } from "./datasets";

type Props = {
  score: number;
  size?: "sm" | "md";
};

export default function CatalogScoreChip({ score, size = "md" }: Props) {
  const color = getScoreColor(score);
  const px = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]";
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono tabular-nums ${px}`}
      style={{
        background: "rgba(9,9,11,0.85)",
        borderColor: `${color}55`,
        color,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {score}
    </div>
  );
}