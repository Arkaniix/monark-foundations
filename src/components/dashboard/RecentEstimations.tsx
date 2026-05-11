import { Pill } from "@/components/ui";
import type {
  RecentEstimation,
  Verdict,
} from "./datasets";
import { VERDICT_COLORS } from "./datasets";

type RecentEstimationsProps = {
  data: RecentEstimation[];
};

/**
 * Table compacte des dernières estimations du user (§02 du Dashboard).
 *
 * 6 colonnes :
 *   1. Modèle (mono, ex. "RTX 4070 SUPER")
 *   2. Catégorie (span mono uppercase plus discret — réserve des pills aux verdicts)
 *   3. Verdict (Pill colorée FONCER/NÉGOCIER/TENTER/PASSER)
 *   4. Prix annonce (€ mono tabular-nums)
 *   5. Marge nette (€ mono colorée vert si positive, rouge si négative)
 *   6. Date relative (mono, "il y a 2h")
 *
 * Lignes hover bg-white/[0.02], séparateurs hairline var(--mk-divider-soft).
 * Pas de bordure extérieure (règle design Monark).
 *
 * Responsive : sur mobile (< sm), masque les colonnes Catégorie + Date.
 * Le user reste avec Modèle / Verdict / Prix / Marge — l'essentiel.
 */
export function RecentEstimations({ data }: RecentEstimationsProps) {
  return (
    <div className="mk-card overflow-hidden">
      {/* Header */}
      <div
        className="grid grid-cols-[1.6fr_0.7fr_1fr_0.9fr_0.9fr_0.8fr] items-center gap-4 px-5 py-3"
        style={{ borderBottom: "1px solid var(--mk-divider-soft)" }}
      >
        <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
          MODÈLE
        </span>
        <span className="hidden font-mono text-[10px] tracking-[0.2em] text-zinc-500 sm:inline">
          CAT.
        </span>
        <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
          VERDICT
        </span>
        <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
          PRIX
        </span>
        <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
          MARGE
        </span>
        <span className="hidden font-mono text-[10px] tracking-[0.2em] text-zinc-500 sm:inline">
          QUAND
        </span>
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {data.map((est, idx) => (
          <Row key={est.id} estimation={est} isLast={idx === data.length - 1} />
        ))}
      </div>
    </div>
  );
}

type RowProps = {
  estimation: RecentEstimation;
  isLast: boolean;
};

function Row({ estimation, isLast }: RowProps) {
  const isPositiveMargin = estimation.net_margin_eur >= 0;
  const marginColor = isPositiveMargin ? "#10B981" : "#EF4444";
  const marginSign = isPositiveMargin ? "+" : "";

  return (
    <div
      className="ease-expo grid grid-cols-[1.6fr_0.7fr_1fr_0.9fr_0.9fr_0.8fr] items-center gap-4 px-5 py-3 transition-colors hover:bg-white/[0.02]"
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--mk-divider-soft)",
      }}
    >
      <span className="truncate font-mono text-[13px] text-zinc-100">
        {estimation.model_name}
      </span>
      <span className="hidden font-mono text-[11px] tracking-wider text-zinc-500 sm:inline">
        {estimation.category}
      </span>
      <span>
        <VerdictPill verdict={estimation.verdict} />
      </span>
      <span className="font-mono text-[13px] tabular-nums text-zinc-200">
        {estimation.listing_price_eur} €
      </span>
      <span
        className="font-mono text-[13px] tabular-nums"
        style={{ color: marginColor }}
      >
        {marginSign}
        {estimation.net_margin_eur} €
      </span>
      <span className="hidden font-mono text-[11px] text-zinc-500 sm:inline">
        {formatRelative(estimation.created_at)}
      </span>
    </div>
  );
}

function VerdictPill({ verdict }: { verdict: Verdict }) {
  return <Pill label={verdict} color={VERDICT_COLORS[verdict]} />;
}

/**
 * Format de date relative en français court : "il y a 2h", "il y a 3j".
 * Pas de bibliothèque (date-fns désinstallé en cleanup). Implémentation minimale.
 */
function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 3600));
  if (diffHours < 1) return "à l'instant";
  if (diffHours < 24) return `il y a ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `il y a ${diffDays}j`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `il y a ${diffWeeks}sem`;
}

export default RecentEstimations;
