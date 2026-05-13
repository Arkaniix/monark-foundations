import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import SectionLabel from "../ui/SectionLabel";
import ModelImage from "./ModelImage";
import type { CatalogModelDetail } from "./modelDetail";
import { getScoreColor, getLiquidityColor, getTrendColor } from "./datasets";

type Props = { detail: CatalogModelDetail };

export default function CatalogFicheOverview({ detail }: Props) {
  const scoreColor = getScoreColor(detail.score);
  const trendColor = getTrendColor(detail.trend_30d_pct);
  const liqColor = getLiquidityColor(detail.liquidity_pct);
  const trendSign = detail.trend_30d_pct > 0 ? "+" : "";
  const delta90d =
    detail.sparkline_90d.length >= 2
      ? ((detail.sparkline_90d[detail.sparkline_90d.length - 1] -
          detail.sparkline_90d[0]) /
          detail.sparkline_90d[0]) *
        100
      : 0;
  const delta90dColor = getTrendColor(delta90d);
  const TrendIcon =
    detail.trend_30d_pct > 0.5 ? TrendingUp : detail.trend_30d_pct < -0.5 ? TrendingDown : Minus;

  return (
    <section className="flex flex-col gap-3.5">
      <SectionLabel idx={1} label="VUE D'ENSEMBLE" />
      <div
        className="rounded-xl p-6"
        style={{
          background: "var(--mk-surface-1)",
          border: "0.5px solid var(--mk-section-border)",
        }}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[180px_1fr] md:items-stretch">
          <div
            className="mx-auto w-full max-w-[220px] overflow-hidden rounded-lg md:mx-0 md:w-[180px] md:max-w-none"
            style={{
              aspectRatio: "1 / 1",
              border: "0.5px solid var(--mk-divider-soft)",
            }}
          >
            <ModelImage category={detail.category} url={detail.image_url} />
          </div>

          <div className="flex flex-col justify-center">
            <div className="mb-5 grid grid-cols-[auto_1fr_auto] items-center gap-6">
              <div className="text-center">
                <div
                  className="font-mono text-[42px] font-medium leading-none tabular-nums"
                  style={{ color: scoreColor, letterSpacing: "-0.02em" }}
                >
                  {detail.score}
                </div>
                <div className="mt-2 font-mono text-[9px] tracking-[0.2em] text-zinc-600">
                  SCORE / 100
                </div>
              </div>
              <div
                className="text-center"
                style={{
                  borderLeft: "0.5px solid rgba(255,255,255,0.05)",
                  borderRight: "0.5px solid rgba(255,255,255,0.05)",
                  padding: "0 24px",
                }}
              >
                <div
                  className="font-mono text-[32px] font-medium leading-none tabular-nums text-zinc-100"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {formatPrice(detail.median_eur)}
                </div>
                <div className="mt-2 font-mono text-[9.5px] tracking-[0.18em] text-zinc-600">
                  MÉDIANE 30 J · {detail.n_obs} OBS
                </div>
              </div>
              <div>
                <Sparkline90d points={detail.sparkline_90d} color={delta90dColor} />
                <div className="mt-1 flex justify-between font-mono text-[9px] tracking-[0.12em] text-zinc-600">
                  <span>90 J</span>
                  <span style={{ color: delta90dColor }}>
                    {delta90d > 0 ? "+" : ""}
                    {delta90d.toFixed(1)}%
                  </span>
                  <span>AUJOURD'HUI</span>
                </div>
              </div>
            </div>

            <div
              className="grid grid-cols-3 gap-3 pt-5"
              style={{ borderTop: "0.5px solid rgba(255,255,255,0.05)" }}
            >
              <Stat label="TENDANCE 30 J" sub="vs il y a 30 jours">
                <span className="font-mono text-[18px] font-medium tabular-nums" style={{ color: trendColor }}>
                  {trendSign}
                  {detail.trend_30d_pct.toFixed(1)}%
                </span>
                <TrendIcon size={13} style={{ color: trendColor }} strokeWidth={1.75} />
              </Stat>
              <Stat
                label="LIQUIDITÉ"
                sub={`vente médiane ${Math.max(1, Math.round(30 - detail.liquidity_pct * 0.25))} j`}
              >
                <span className="font-mono text-[18px] font-medium tabular-nums" style={{ color: liqColor }}>
                  {detail.liquidity_pct}%
                </span>
              </Stat>
              <Stat
                label="MARGE POTENTIELLE"
                sub={`~ ${Math.round(detail.median_eur * (detail.margin_pct / 100))} € sur médiane`}
              >
                <span className="font-mono text-[18px] font-medium tabular-nums" style={{ color: trendColor }}>
                  {detail.margin_pct}%
                </span>
              </Stat>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[9px] tracking-[0.18em] text-zinc-600">{label}</div>
      <div className="flex items-baseline gap-1.5">{children}</div>
      <div className="mt-0.5 font-mono text-[9.5px] tracking-[0.05em] text-zinc-500">{sub}</div>
    </div>
  );
}

function formatPrice(eur: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(eur) + " €";
}

function Sparkline90d({ points, color }: { points: number[]; color: string }) {
  const w = 170;
  const h = 46;
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = h - 4 - ((p - min) / range) * (h - 8);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={path} fill="none" stroke={color} strokeWidth={1.2} />
      <line x1="0" y1={h - 4} x2={w} y2={h - 4} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
    </svg>
  );
}
