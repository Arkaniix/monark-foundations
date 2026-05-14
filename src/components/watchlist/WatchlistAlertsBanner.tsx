import { Bell } from "lucide-react";

type Props = {
  count: number;
  thresholdPct: number;
};

export default function WatchlistAlertsBanner({ count, thresholdPct }: Props) {
  if (count === 0) return null;

  return (
    <div
      className="relative flex items-center gap-3 overflow-hidden rounded-md px-4 py-3"
      style={{
        background: "rgba(59,130,246,0.06)",
        border: "0.5px solid rgba(59,130,246,0.32)",
      }}
    >
      <span
        className="absolute inset-y-0 left-0 w-[2px]"
        style={{ background: "#3B82F6" }}
      />
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md"
        style={{
          background: "rgba(59,130,246,0.12)",
          border: "0.5px solid rgba(59,130,246,0.30)",
        }}
      >
        <Bell size={14} strokeWidth={1.75} style={{ color: "#60A5FA" }} />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="text-[12.5px] font-medium text-zinc-100">
          {count}{" "}
          {count === 1
            ? "mouvement significatif détecté"
            : "mouvements significatifs détectés"}
        </div>
        <div className="font-mono text-[10.5px] tracking-[0.06em] text-zinc-500">
          Seuil ±{thresholdPct}% — médiane actuelle vs snapshot à l'activation
          de l'alerte.
        </div>
      </div>
    </div>
  );
}