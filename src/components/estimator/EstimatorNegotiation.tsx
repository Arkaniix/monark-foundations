import {
  type EstimatorResult,
  type NegotiationArgument,
  type NegotiationKeywords,
  type NegotiationOffer,
} from "./datasets";
import GlossaryTooltip from "@/components/ui/GlossaryTooltip";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import type { GlossaryKey } from "@/lib/glossary";

const OFFER_TIER_TERMS: Record<string, GlossaryKey> = {
  lowball: "offreLowball",
  negotiated: "offreNegociee",
  cordial: "offreCordiale",
};

type EstimatorNegotiationProps = {
  result: EstimatorResult;
};

/**
 * §04 — Négociation. Layout 2 colonnes lg:grid-cols-5 (3+2).
 */
export default function EstimatorNegotiation({ result }: EstimatorNegotiationProps) {
  const { negotiation } = result;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">§ 04</div>
        <div className="h-px w-10 bg-white/10" />
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">NÉGOCIATION</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Colonne gauche : offres tarifées */}
        <div className="lg:col-span-3 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">OFFRES TARIFÉES</div>

          <div className="flex flex-col gap-3">
            {negotiation.offers.map((offer) => (
              <OfferRow key={offer.tier} offer={offer} />
            ))}
          </div>

          <div className="mt-2 pt-4 border-t border-white/5 flex flex-col gap-2">
            <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">STRATÉGIE</div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {negotiation.strategy_narrative}
            </p>
          </div>
        </div>

        {/* Colonne droite : arguments + mots-clés */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col gap-4">
            <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">ARGUMENTS</div>
            <div className="flex flex-col gap-3">
              {negotiation.arguments.map((arg, i) => (
                <ArgumentRow key={i} argument={arg} />
              ))}
            </div>
          </div>

          <KeywordsBlock keywords={negotiation.keywords} />
        </div>
      </div>
    </section>
  );
}

function OfferRow({ offer }: { offer: NegotiationOffer }) {
  const marginSign = offer.estimated_net_margin_eur >= 0 ? "+" : "";
  const marginColor = offer.estimated_net_margin_eur >= 0 ? "#10B981" : "#EF4444";

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.015] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-400">
          <GlossaryTooltip term={OFFER_TIER_TERMS[offer.tier] ?? "offreNegociee"}>
            <span>{offer.label.toUpperCase()}</span>
          </GlossaryTooltip>
        </div>
      </div>

      <div className="flex items-baseline gap-3 flex-wrap">
        <div className="text-2xl font-semibold text-zinc-100 tabular-nums">
          <AnimatedCounter value={offer.amount_eur} suffix=" €" />
        </div>
        <div className="text-xs text-zinc-500 tabular-nums">
          <AnimatedCounter value={offer.pct_of_ask} suffix=" % du demandé" />
        </div>
        <div className="text-xs text-zinc-400 tabular-nums">
          Économise <AnimatedCounter value={offer.savings_eur} suffix=" €" />
        </div>
      </div>

      <div className="text-[11px] text-zinc-500 whitespace-nowrap">
        Marge si revente fair :{" "}
        <span className="tabular-nums font-medium" style={{ color: marginColor }}>
          <AnimatedCounter value={offer.estimated_net_margin_eur} prefix={marginSign} suffix=" €" />
        </span>
      </div>
    </div>
  );
}

function ArgumentRow({ argument }: { argument: NegotiationArgument }) {
  const color = "#10B981";
  return (
    <div className="flex gap-3 items-start">
      <div
        className="mt-1.5 h-2 w-2 rounded-full shrink-0"
        style={{ background: color, boxShadow: `0 0 8px ${color}66` }}
      />
      <div className="flex-1 flex flex-col gap-1">
        <p className="text-sm text-zinc-200 leading-relaxed">{argument.label}</p>
      </div>
    </div>
  );
}

function KeywordsBlock({ keywords }: { keywords: NegotiationKeywords }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col gap-4">
      <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
        RÉFLEXES DE NÉGO
      </div>
      <p className="text-[11px] text-zinc-500 leading-relaxed">
        Checklist générique — termes à repérer dans n'importe quelle annonce.
      </p>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="font-mono text-[9.5px] tracking-[0.2em] text-zinc-600">OPPORTUNITÉS</div>
          <div className="flex flex-wrap gap-1.5">
            {keywords.opportunity.map((kw) => (
              <KeywordChip key={kw} word={kw} type="opportunity" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="font-mono text-[9.5px] tracking-[0.2em] text-zinc-600">RED FLAGS</div>
          <div className="flex flex-wrap gap-1.5">
            {keywords.red_flag.map((kw) => (
              <KeywordChip key={kw} word={kw} type="red_flag" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KeywordChip({ word, type }: { word: string; type: "opportunity" | "red_flag" }) {
  const color = type === "opportunity" ? "#10B981" : "#EF4444";
  return (
    <span
      className="px-2 py-1 rounded-md text-[11px] font-mono border tabular-nums"
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

export { EstimatorNegotiation };
