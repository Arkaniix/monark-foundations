import GlossaryTooltip from "@/components/ui/GlossaryTooltip";
import type { GlossaryKey } from "@/lib/glossary";

export type MarketStatusTone = "positive" | "neutral" | "negative";

export type MarketStatDatapoint = {
  label: string;
  value: string;
  tone?: MarketStatusTone;
};

type MarketStatCardProps = {
  label: string;
  status: string;
  statusTone: MarketStatusTone;
  datapoints: MarketStatDatapoint[];
  narrative: string;
  termKey?: GlossaryKey;
};

const TONE_COLORS: Record<MarketStatusTone, string> = {
  positive: "#10B981",
  neutral: "#F59E0B",
  negative: "#EF4444",
};

/**
 * Carte générique pour le triptyque §02 Tendance / Liquidité / Décote vs neuf.
 */
export default function MarketStatCard({
  label,
  status,
  statusTone,
  datapoints,
  narrative,
  termKey,
}: MarketStatCardProps) {
  const statusColor = TONE_COLORS[statusTone];
  const labelEl = (
    <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">{label}</span>
  );

  return (
    <div className="mk-card-flat-soft p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>{termKey ? <GlossaryTooltip term={termKey}>{labelEl}</GlossaryTooltip> : labelEl}</div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: statusColor }}
            aria-hidden="true"
          />
          <span
            className="font-mono text-[11px] font-medium"
            style={{ color: statusColor }}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {datapoints.map((dp, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="font-mono text-[9.5px] tracking-wider text-zinc-600">
              {dp.label}
            </div>
            <div
              className="font-mono text-[15px] font-medium"
              style={{ color: dp.tone ? TONE_COLORS[dp.tone] : "#fafafa" }}
            >
              {dp.value}
            </div>
          </div>
        ))}
      </div>

      <div
        className="pt-3"
        style={{ borderTop: "1px solid var(--mk-divider-soft)" }}
      >
        <p className="text-[12.5px] text-zinc-400 leading-relaxed">
          {narrative}
        </p>
      </div>
    </div>
  );
}

export { MarketStatCard };
