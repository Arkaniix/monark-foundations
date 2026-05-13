import type {
  EstimatorResult,
  Platform,
  ResaleWhenOption,
} from "./datasets";

const PLATFORM_BRAND_COLORS: Record<Platform, string> = {
  LBC: "#FF6E14",
  eBay: "#E53238",
  Vinted: "#09B1BA",
};

const OPTIMAL_COLOR = "#10B981";
const MARGIN_POSITIVE = "#10B981";
const MARGIN_NEGATIVE = "#EF4444";
const DELAY_FAST = "#10B981";
const DELAY_MEDIUM = "#F59E0B";
const DELAY_SLOW = "#EF4444";

type EstimatorResaleWhenProps = {
  result: EstimatorResult;
  selectedPlatform: Platform;
};

/**
 * §05b — QUAND REVENDRE · sur {platform}.
 * Pour la plateforme sélectionnée en §05a, 3 cards horizontales temporelles
 * (RAPIDE / OPTIMAL / PATIENT) avec ligne 0.5px traversante à mi-hauteur.
 */
export default function EstimatorResaleWhen({
  result,
  selectedPlatform,
}: EstimatorResaleWhenProps) {
  const brandColor = PLATFORM_BRAND_COLORS[selectedPlatform];
  const options = result.resale_when.by_platform[selectedPlatform];
  const platformLabel =
    selectedPlatform === "eBay" ? "EBAY" : selectedPlatform.toUpperCase();

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
          § 05b
        </div>
        <div className="h-px w-10 bg-white/10" />
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
          QUAND REVENDRE
        </div>
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-700">
          ·
        </div>
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
          sur
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: brandColor }}
            aria-hidden="true"
          />
          <span
            className="font-mono text-[10.5px] tracking-[0.2em]"
            style={{ color: brandColor }}
          >
            {platformLabel}
          </span>
        </div>
      </div>

      <div className="relative">
        <div
          className="hidden sm:block absolute left-0 right-0 top-1/2 pointer-events-none"
          style={{ height: 0.5, background: "rgba(255,255,255,0.10)" }}
          aria-hidden="true"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative">
          {options.map((opt) => (
            <TimingCard key={opt.timing} option={opt} />
          ))}
        </div>
      </div>

      <div className="text-[10.5px] text-zinc-600 leading-relaxed">
        Marge nette à ce timing = prix attendu × (1 − frais) − prix d'achat de
        référence ({result.resale_where.cost_basis_eur} €).
      </div>
    </section>
  );
}

function TimingCard({ option }: { option: ResaleWhenOption }) {
  const isOptimal = option.is_top_pick;
  const marginSign = option.net_margin_eur >= 0 ? "+" : "";
  const marginColor =
    option.net_margin_eur >= 0 ? MARGIN_POSITIVE : MARGIN_NEGATIVE;
  const delayColor =
    option.expected_delay_days <= 7
      ? DELAY_FAST
      : option.expected_delay_days <= 21
        ? DELAY_MEDIUM
        : DELAY_SLOW;
  const accColor =
    option.acceptance_probability_pct >= 75
      ? "#10B981"
      : option.acceptance_probability_pct >= 50
        ? "#F59E0B"
        : "#EF4444";

  return (
    <div className="mk-card-flat-soft p-5 flex flex-col gap-4 relative">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.15em] text-zinc-300">
          {option.timing}
        </span>
        {isOptimal && (
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: OPTIMAL_COLOR }}
              aria-hidden="true"
            />
            <span
              className="font-mono text-[10px] tracking-[0.15em] font-medium"
              style={{ color: OPTIMAL_COLOR }}
            >
              OPTIMAL
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">
            PRIX
          </div>
          <div className="font-mono text-[15px] font-medium tabular-nums text-zinc-200">
            {option.expected_price_eur} €
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">
            DÉLAI
          </div>
          <div
            className="font-mono text-[15px] font-medium tabular-nums"
            style={{ color: delayColor }}
          >
            ~{option.expected_delay_days} j
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">
            MARGE NETTE
          </div>
          <div
            className="font-mono text-[15px] font-medium tabular-nums"
            style={{ color: marginColor }}
          >
            {marginSign}
            {option.net_margin_eur} €
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">
            ACCEPTATION
          </div>
          <div
            className="font-mono text-[15px] font-medium tabular-nums"
            style={{ color: accColor }}
          >
            {option.acceptance_probability_pct} %
          </div>
        </div>
      </div>

      <div
        className="pt-3"
        style={{ borderTop: "1px solid var(--mk-divider-soft)" }}
      >
        <p className="text-[12.5px] text-zinc-400 leading-relaxed">
          {option.narrative}
        </p>
      </div>
    </div>
  );
}

export { EstimatorResaleWhen };