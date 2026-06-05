import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import type { EstimatorResult } from "./datasets";

type EstimatorWarning = NonNullable<EstimatorResult["warnings"]>[number];

type EstimatorWarningsProps = {
  warnings: NonNullable<EstimatorResult["warnings"]>;
};

const SEVERITY_COLOR: Record<EstimatorWarning["severity"], string> = {
  danger: "#EF4444",
  warning: "#F59E0B",
};

const ACTION_META: Record<
  NonNullable<EstimatorWarning["recommended_action"]>,
  { label: string; color: string }
> = {
  buy_now: { label: "ACHÈTE MAINTENANT", color: "#10B981" },
  verify_then_buy: { label: "VÉRIFIE PUIS ACHÈTE", color: "#F59E0B" },
  avoid: { label: "À ÉVITER", color: "#EF4444" },
};

/**
 * Signal affiché sous le § 01.
 * - Forme enrichie (anti-arnaque) si le back fournit headline / scam_signals /
 *   recommended_action : carte structurée (signaux, étapes de vérif, action).
 * - Sinon, bannière sobre (code + message), non bloquante.
 */
export default function EstimatorWarnings({ warnings }: EstimatorWarningsProps) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {warnings.map((w, i) =>
        isEnriched(w) ? (
          <AntiScamCard key={`${w.code}-${i}`} warning={w} />
        ) : (
          <FlatWarning key={`${w.code}-${i}`} warning={w} />
        ),
      )}
    </div>
  );
}

function isEnriched(w: EstimatorWarning): boolean {
  return Boolean(
    w.headline ||
      w.recommended_action ||
      (w.scam_signals && w.scam_signals.length > 0) ||
      (w.verification_steps && w.verification_steps.length > 0),
  );
}

function FlatWarning({ warning: w }: { warning: EstimatorWarning }) {
  const color =
    w.severity === "danger" ? SEVERITY_COLOR.danger : SEVERITY_COLOR.warning;
  const Icon = w.severity === "danger" ? AlertTriangle : Info;
  return (
    <div
      className="flex items-start gap-3 rounded-lg border bg-white/[0.015] px-4 py-3"
      style={{ borderColor: `${color}40` }}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color }} />
      <div className="flex-1 flex flex-col gap-1">
        <div className="font-mono text-[10px] tracking-wider" style={{ color }}>
          {w.code}
        </div>
        <p className="text-[13px] text-zinc-300 leading-relaxed">{w.message}</p>
      </div>
    </div>
  );
}

function AntiScamCard({ warning: w }: { warning: EstimatorWarning }) {
  const color =
    w.severity === "danger" ? SEVERITY_COLOR.danger : SEVERITY_COLOR.warning;
  const action = w.recommended_action ? ACTION_META[w.recommended_action] : null;

  return (
    <div
      className="rounded-2xl border bg-white/[0.02] p-6 flex flex-col gap-5"
      style={{ borderColor: `${color}40` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldAlert
            className="w-5 h-5 mt-0.5 flex-shrink-0"
            style={{ color }}
          />
          <div className="flex flex-col gap-1.5">
            <div
              className="font-mono text-[10px] tracking-[0.2em]"
              style={{ color }}
            >
              {w.code}
            </div>
            <p className="text-[15px] font-semibold text-zinc-100 leading-snug">
              {w.headline ?? w.message}
            </p>
            {typeof w.delta_vs_market_pct === "number" && (
              <div className="font-mono text-[11px] text-zinc-400 tabular-nums">
                {w.delta_vs_market_pct > 0 ? "+" : ""}
                {w.delta_vs_market_pct}% vs marché
              </div>
            )}
          </div>
        </div>
        {action && (
          <span
            className="px-2.5 py-1 rounded-md font-mono text-[10px] tracking-wider border whitespace-nowrap shrink-0"
            style={{
              color: action.color,
              borderColor: `${action.color}55`,
              background: `${action.color}12`,
            }}
          >
            {action.label}
          </span>
        )}
      </div>

      {w.scam_signals && w.scam_signals.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="font-mono text-[9.5px] tracking-[0.2em] text-zinc-600">
            SIGNAUX À VÉRIFIER
          </div>
          <ul className="flex flex-col gap-1.5">
            {w.scam_signals.map((s, i) => (
              <li key={i} className="flex gap-2.5 items-start">
                <ShieldAlert
                  className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                  style={{ color: SEVERITY_COLOR.danger }}
                />
                <span className="text-[13px] text-zinc-300 leading-relaxed">
                  {s}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {w.verification_steps && w.verification_steps.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="font-mono text-[9.5px] tracking-[0.2em] text-zinc-600">
            AVANT D'ACHETER
          </div>
          <ol className="flex flex-col gap-1.5">
            {w.verification_steps.map((s, i) => (
              <li key={i} className="flex gap-2.5 items-start">
                <span className="font-mono text-[11px] text-zinc-500 tabular-nums mt-0.5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[13px] text-zinc-300 leading-relaxed">
                  {s}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {w.action_rationale && (
        <p className="text-[13px] text-zinc-400 leading-relaxed pt-3 border-t border-white/5">
          {w.action_rationale}
        </p>
      )}
    </div>
  );
}

export { EstimatorWarnings };
