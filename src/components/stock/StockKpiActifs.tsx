import { useMemo } from "react";
import { type StockItem, isActif, formatEur, isDormant } from "./datasets";
import { CATALOG_MODELS } from "@/components/catalog/mockData";

export default function StockKpiActifs({ items }: { items: StockItem[] }) {
  const actifs = useMemo(() => items.filter(isActif), [items]);
  const totalActifs = actifs.length;
  const totalImmo = actifs.reduce((s, it) => s + it.purchase_price_eur, 0);
  const totalMarche = actifs.reduce((s, it) => {
    if (it.model_id) {
      const m = CATALOG_MODELS.find((x) => x.id === it.model_id);
      return s + (m?.median_eur ?? it.purchase_price_eur);
    }
    return s + it.purchase_price_eur;
  }, 0);
  const dEur = totalMarche - totalImmo;
  const dPct = totalImmo > 0 ? (dEur / totalImmo) * 100 : 0;
  const dormants = actifs.filter((it) => isDormant(it)).length;
  const has = dormants > 0;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Tile label="ITEMS ACTIFS" value={String(totalActifs)} subtitle="en inventaire" />
      <Tile label="VALEUR IMMOBILISÉE" value={`${formatEur(totalImmo)} €`} subtitle="somme prix d'achat" />
      <Tile label="VALEUR MARCHÉ EST." value={`${formatEur(totalMarche)} €`}
        subtitle={totalImmo > 0 ? `${dEur >= 0 ? "+" : ""}${formatEur(dEur)} € potentiel (${dPct >= 0 ? "+" : ""}${dPct.toFixed(1)}%)` : "—"}
        subtitleColor={dEur > 0 ? "#10B981" : dEur < 0 ? "#EF4444" : "#71717A"} />
      <Tile label="ITEMS DORMANTS" value={String(dormants)}
        subtitle={has ? "à liquider" : "> 60 jours"}
        valueColor={has ? "#F59E0B" : "#FAFAFA"} subtitleColor={has ? "#F59E0B" : "#71717A"} accent={has} />
    </div>
  );
}

function Tile({ label, value, subtitle, valueColor = "#FAFAFA", subtitleColor = "#71717A", accent = false }: { label: string; value: string; subtitle: string; valueColor?: string; subtitleColor?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg p-4" style={{ background: accent ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.02)", boxShadow: accent ? "inset 0 0 0 1px rgba(245,158,11,0.22)" : "inset 0 0 0 1px rgba(255,255,255,0.05)" }}>
      <div className="font-mono text-[10.5px] tracking-[0.18em] text-zinc-600">{label}</div>
      <div className="mt-3 font-mono text-[22px] font-medium tabular-nums" style={{ color: valueColor }}>{value}</div>
      <div className="mt-1 font-mono text-[10.5px]" style={{ color: subtitleColor }}>{subtitle}</div>
    </div>
  );
}