import { getScoreColor, type EstimatorResult, type PlatformResaleStats } from "./datasets";

type EstimatorResaleWhereProps = {
  result: EstimatorResult;
};

const ACCENT = "#3B82F6";

export default function EstimatorResaleWhere({ result }: EstimatorResaleWhereProps) {
  const { resale_where } = result;
  const topPick = resale_where.platforms.find((p) => p.is_top_pick);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">§ 05a</div>
        <div className="h-px w-10 bg-white/10" />
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">OÙ REVENDRE</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="mk-card-flat-soft lg:col-span-2 p-6 flex flex-col">
          <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 mb-5">RECOMMANDATION</div>
          {topPick && (
            <>
              <div className="flex flex-col items-center text-center pt-2 pb-4">
                <div className="font-mono text-[10px] tracking-[0.2em] mb-3" style={{ color: ACCENT }}>
                  PLATEFORME OPTIMALE
                </div>
                <div className="text-[32px] font-semibold tracking-tight" style={{ color: ACCENT }}>
                  {topPick.platform}
                </div>
                <div className="mt-1 font-mono text-[10.5px] text-zinc-600">
                  SCORE {topPick.recommendation_score} / 100
                </div>
              </div>
              <div className="mt-2 pt-5 grid grid-cols-2 gap-4" style={{ borderTop: "1px solid var(--mk-divider-soft)" }}>
                <RecoCell
                  label="MARGE NETTE"
                  value={`${topPick.net_margin_eur >= 0 ? "+" : ""}${topPick.net_margin_eur} €`}
                  color={topPick.net_margin_eur >= 0 ? "#10B981" : "#EF4444"}
                />
                <RecoCell label="DÉLAI ESTIMÉ" value={`~${topPick.expected_delay_days} j`} color={ACCENT} />
              </div>
              <div className="mt-5 text-[13px] text-zinc-300 leading-relaxed">
                {resale_where.top_pick_narrative}
              </div>
            </>
          )}
        </div>

        <div className="mk-card-flat-soft lg:col-span-3 p-6 flex flex-col">
          <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 mb-4">COMPARAISON DES PLATEFORMES</div>
          <PlatformTableHeader />
          <div className="flex flex-col">
            {resale_where.platforms.map((p) => (
              <PlatformRow key={p.platform} platform={p} />
            ))}
          </div>
          <div className="mt-4 pt-4 text-[11px] text-zinc-600 leading-relaxed" style={{ borderTop: "1px solid var(--mk-divider-soft)" }}>
            Marge nette = prix de revente × (1 − frais) − prix d'achat de référence ({result.inputs.ask_price_eur} €). Délais estimés à partir de la liquidité catégorie sur 30 j.
          </div>
        </div>
      </div>
    </section>
  );
}

function RecoCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="font-mono text-[9.5px] tracking-wider text-zinc-500">{label}</div>
      <div className="font-mono text-[18px] font-medium tracking-tight" style={{ color }}>{value}</div>
    </div>
  );
}

const GRID_TEMPLATE = "minmax(120px, 1.3fr) minmax(72px, 0.9fr) minmax(72px, 0.9fr) minmax(72px, 0.9fr) minmax(72px, 0.9fr) minmax(150px, 1.6fr)";

function PlatformTableHeader() {
  return (
    <div className="grid items-baseline gap-3 pb-3 mb-1" style={{ gridTemplateColumns: GRID_TEMPLATE, borderBottom: "1px solid var(--mk-divider-soft)" }}>
      <HeaderCell>PLATEFORME</HeaderCell>
      <HeaderCell align="right">PRIX</HeaderCell>
      <HeaderCell align="right">FRAIS</HeaderCell>
      <HeaderCell align="right">MARGE</HeaderCell>
      <HeaderCell align="right">DÉLAI</HeaderCell>
      <HeaderCell>SCORE</HeaderCell>
    </div>
  );
}

function HeaderCell({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <div className="font-mono text-[9.5px] tracking-[0.15em] text-zinc-600" style={{ textAlign: align }}>
      {children}
    </div>
  );
}

function PlatformRow({ platform }: { platform: PlatformResaleStats }) {
  const marginSign = platform.net_margin_eur >= 0 ? "+" : "";
  const marginColor = platform.net_margin_eur >= 0 ? "#10B981" : "#EF4444";
  const scoreColor = getScoreColor(platform.recommendation_score);
  return (
    <div className="grid items-center gap-3 py-3" style={{ gridTemplateColumns: GRID_TEMPLATE, borderBottom: "1px solid var(--mk-divider-soft)" }}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-mono text-[13px] font-medium text-zinc-100 truncate">{platform.platform}</span>
        {platform.is_top_pick && (
          <span
            className="font-mono text-[8.5px] tracking-[0.15em] px-1.5 py-0.5 rounded flex-shrink-0"
            style={{ background: "rgba(59, 130, 246, 0.12)", color: ACCENT, border: `0.5px solid ${ACCENT}55` }}
          >
            TOP
          </span>
        )}
      </div>
      <div className="font-mono text-[13px] text-zinc-200 text-right">{platform.estimated_price_eur} €</div>
      <div className="font-mono text-[12px] text-zinc-500 text-right">{platform.fees_pct} %</div>
      <div className="font-mono text-[13px] font-medium text-right" style={{ color: marginColor }}>
        {marginSign}{platform.net_margin_eur} €
      </div>
      <div className="font-mono text-[12px] text-zinc-500 text-right">~{platform.expected_delay_days} j</div>
      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="h-full" style={{ width: `${platform.recommendation_score}%`, background: scoreColor, transition: "width 800ms cubic-bezier(0.16,1,0.3,1)" }} />
        </div>
        <span className="font-mono text-[11px] font-medium whitespace-nowrap" style={{ color: scoreColor }}>
          {platform.recommendation_score}
        </span>
      </div>
    </div>
  );
}

export { EstimatorResaleWhere };