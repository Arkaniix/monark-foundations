import { type CSSProperties } from "react";
import Tooltip from "@/components/ui/Tooltip";

type CreditsBalanceBarProps = {
  currentMonth: number;
  previousMonth: number;
  bonus: number;
  cap?: number | null;
};

const COLOR_CURRENT = "#60A5FA"; // accent clair
const COLOR_PREVIOUS = "#1D4ED8"; // accent foncé
const COLOR_BONUS = "#F59E0B"; // accent distinct (highlight)
const COLOR_TRACK = "rgba(255,255,255,0.06)";

const labelStyle: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  color: "#A1A1AA",
};

const dotStyle = (color: string): CSSProperties => ({
  display: "inline-block",
  width: 8,
  height: 8,
  borderRadius: 2,
  background: color,
  marginRight: 6,
});

function fmt(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export default function CreditsBalanceBar({
  currentMonth,
  previousMonth,
  bonus,
  cap,
}: CreditsBalanceBarProps) {
  const total = currentMonth + previousMonth + bonus;
  const hasCap = typeof cap === "number" && cap > 0;
  const denom = hasCap ? Math.max(cap, total) : total;

  const pct = (v: number) =>
    denom > 0 ? (v / denom) * 100 : 0;

  const segments: Array<{ key: string; value: number; color: string }> = [
    { key: "current", value: currentMonth, color: COLOR_CURRENT },
    { key: "previous", value: previousMonth, color: COLOR_PREVIOUS },
    { key: "bonus", value: bonus, color: COLOR_BONUS },
  ];

  const tooltipContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <span><span style={dotStyle(COLOR_CURRENT)} />Ce mois-ci</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(currentMonth)} crédits</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <span><span style={dotStyle(COLOR_PREVIOUS)} />Mois précédent</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(previousMonth)} crédits</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <span><span style={dotStyle(COLOR_BONUS)} />Bonus extension</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(bonus)} crédits</span>
      </div>
      <div
        style={{
          marginTop: 4,
          paddingTop: 4,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          color: "#FAFAFA",
        }}
      >
        <span>Total</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(total)} crédits</span>
      </div>
    </div>
  );

  return (
    <div style={{ width: "100%" }}>
      <Tooltip content={tooltipContent} position="top" delayMs={120}>
        <span style={{ display: "block", width: "100%", cursor: "default" }}>
          <div
            role="img"
            aria-label={`Solde de crédits : ${fmt(total)}`}
            style={{
              position: "relative",
              display: "flex",
              width: "100%",
              height: 6,
              background: COLOR_TRACK,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            {total === 0
              ? null
              : segments
                  .filter((s) => s.value > 0)
                  .map((s) => (
                    <div
                      key={s.key}
                      style={{
                        width: `${pct(s.value)}%`,
                        height: "100%",
                        background: s.color,
                      }}
                    />
                  ))}
          </div>
        </span>
      </Tooltip>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 8,
          ...labelStyle,
        }}
      >
        {currentMonth > 0 && (
          <span><span style={dotStyle(COLOR_CURRENT)} />Ce mois-ci</span>
        )}
        {previousMonth > 0 && (
          <span><span style={dotStyle(COLOR_PREVIOUS)} />Mois précédent</span>
        )}
        {bonus > 0 && (
          <span><span style={dotStyle(COLOR_BONUS)} />Bonus extension</span>
        )}
      </div>

      <div style={{ ...labelStyle, marginTop: 6, color: "#71717A", fontFamily: "inherit", fontSize: 11 }}>
        Les crédits s'accumulent jusqu'à l'équivalent de 2 mois d'abonnement.
      </div>
    </div>
  );
}