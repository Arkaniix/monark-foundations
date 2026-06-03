import { AlertTriangle, Info } from "lucide-react";
import type { EstimatorResult } from "./datasets";

type EstimatorWarningsProps = {
  warnings: NonNullable<EstimatorResult["warnings"]>;
};

/**
 * Bannières sobres affichées sous le § 01.
 * Signal non bloquant : le verdict reste valable. Ton informatif, pas alarmiste.
 */
export default function EstimatorWarnings({ warnings }: EstimatorWarningsProps) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {warnings.map((w, i) => {
        const color =
          w.severity === "danger"
            ? "#EF4444"
            : w.severity === "warning"
              ? "#F59E0B"
              : "#71717A";
        const Icon = w.severity === "danger" ? AlertTriangle : Info;
        return (
          <div
            key={`${w.code}-${i}`}
            className="flex items-start gap-3 rounded-lg border bg-white/[0.015] px-4 py-3"
            style={{ borderColor: `${color}40` }}
          >
            <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color }} />
            <div className="flex-1 flex flex-col gap-1">
              <div
                className="font-mono text-[10px] tracking-wider"
                style={{ color }}
              >
                {w.code}
              </div>
              <p className="text-[13px] text-zinc-300 leading-relaxed">
                {w.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { EstimatorWarnings };