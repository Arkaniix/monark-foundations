import type { SellResult } from "./datasets";

type Props = { result: SellResult };

export default function EstimatorSellPresentation({ result }: Props) {
  const p = result.presentation;
  if (!p) return null;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
          § 06
        </div>
        <div className="h-px w-10 bg-white/10" />
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
          PRÉSENTATION
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-3 mk-card p-6 flex flex-col gap-4">
          <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
            COMPLÉTUDE DE L'ANNONCE
          </div>
          {p.completeness.length === 0 ? (
            <p className="text-[12.5px] text-zinc-500">
              Pas de checklist spécifique pour ce modèle.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {p.completeness.map((tip, i) => (
                <li
                  key={i}
                  className="flex gap-3 items-start text-[13.5px] text-zinc-300 leading-relaxed"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 rounded-full shrink-0"
                    style={{
                      background: "#10B981",
                      boxShadow: "0 0 6px #10B98166",
                    }}
                    aria-hidden="true"
                  />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}

          {p.condition_framing && (
            <div className="mt-2 pt-4 border-t border-white/5 flex flex-col gap-2">
              <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
                FORMULATION DE L'ÉTAT
              </div>
              <p className="text-[13px] text-zinc-300 leading-relaxed">
                {p.condition_framing}
              </p>
            </div>
          )}

          {p.category_tip && (
            <div
              className="mt-2 pt-4 border-t border-white/5 flex flex-col gap-2"
            >
              <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
                TIP CATÉGORIE
              </div>
              <p className="text-[13px] text-zinc-300 leading-relaxed">
                {p.category_tip}
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 mk-card p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="font-mono text-[9.5px] tracking-[0.2em] text-zinc-600">
              À METTRE EN AVANT
            </div>
            <div className="flex flex-wrap gap-1.5">
              {p.terms_to_favor.length === 0 ? (
                <span className="text-[11px] text-zinc-600">—</span>
              ) : (
                p.terms_to_favor.map((kw) => (
                  <Chip key={kw} word={kw} type="favor" />
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="font-mono text-[9.5px] tracking-[0.2em] text-zinc-600">
              À ÉVITER DANS TON ANNONCE
            </div>
            <div className="flex flex-wrap gap-1.5">
              {p.terms_to_avoid.length === 0 ? (
                <span className="text-[11px] text-zinc-600">—</span>
              ) : (
                p.terms_to_avoid.map((kw) => (
                  <Chip key={kw} word={kw} type="avoid" />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Chip({ word, type }: { word: string; type: "favor" | "avoid" }) {
  const color = type === "favor" ? "#10B981" : "#EF4444";
  return (
    <span
      className="px-2 py-1 rounded-md text-[11px] font-mono border"
      style={{
        color,
        borderColor: `${color}33`,
        background: `${color}10`,
      }}
    >
      {word}
    </span>
  );
}

export { EstimatorSellPresentation };