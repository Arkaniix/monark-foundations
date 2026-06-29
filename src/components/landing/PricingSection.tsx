import { getNumberLocale } from "@/lib/numberFormat";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { SectionLabel } from "@/components/ui";
import { fetchSubscriptions, type Subscription } from "@/lib/api/billing";

type TierMeta = { code: string; name: string; features: string[]; cta: string; primary: boolean };

const TIERS_META: TierMeta[] = [
  { code: "free", name: "Free",
    features: ["Lens basique", "Estimator basic (1 cr)", "Verdict reseller", "Stock manager (5 lignes)"],
    cta: "Commencer", primary: false },
  { code: "standard", name: "Standard",
    features: ["Lens complet · 4 plateformes", "Estimator complete (3 cr)", "Stock manager illimité", "Modifiers + confiance bayésienne"],
    cta: "Choisir Standard", primary: true },
  { code: "pro", name: "Pro",
    features: ["Tout Standard", "Estimator pro tier (5 cr)", "Repair Guide deep diagnostic", "Historique price_observations 24 mois"],
    cta: "Choisir Pro", primary: false },
];

const eur = (cents: number) =>
  (cents / 100).toLocaleString(getNumberLocale(), { style: "currency", currency: "EUR" });

export default function PricingSection() {
  const [subs, setSubs] = useState<Subscription[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchSubscriptions()
      .then((s) => { if (alive) { setSubs(s); setLoading(false); } })
      .catch(() => { if (alive) { setSubs([]); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const byCode = new Map((subs ?? []).map((s) => [s.code, s]));
  const tiers = TIERS_META.map((meta) => {
    const sub = byCode.get(meta.code);
    const price = sub ? (sub.price_cents === 0 ? "0 €" : eur(sub.price_cents)) : null;
    const credits = sub ? `${sub.credits_per_cycle} crédits / mois` : null;
    return { ...meta, price, credits };
  });

  return (
    <section id="tarifs" className="py-24 border-t border-white/5">
      <div className="max-w-[1320px] mx-auto px-6">
        <SectionLabel idx={6} label="TARIFS" />
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
          <h2 className="text-[40px] leading-[1.05] font-semibold tracking-tight">
            Trois plans. <span className="text-zinc-500">Pas de palier caché.</span>
          </h2>
          <p className="font-mono text-[12px] text-zinc-500 max-w-sm">Crédit = unité de calcul. Reset mensuel. Pas d'engagement.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 pt-4">
          {tiers.map(t => (
            <div key={t.name} className={"relative rounded-xl p-7 pt-9 transition-all duration-200 ease-expo " + (t.primary ? "bg-white/[0.02] border border-blue-500/40 hover:bg-white/[0.03]" : "mk-card")}
              style={t.primary ? { boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.04), 0 0 40px -20px rgba(59,130,246,0.5)" } : {}}>
              {t.primary && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] tracking-wider px-3 py-1 rounded-full bg-blue-500 text-white shadow-[0_4px_24px_-4px_rgba(59,130,246,0.8)] z-10">
                  RECOMMANDÉ
                </div>
              )}
              <div className="relative">
                <div className="font-mono text-[11px] tracking-wider text-zinc-500 mb-4">{t.name.toUpperCase()}</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[40px] font-semibold tracking-tight font-mono">
                    {t.price ?? (loading ? "…" : "—")}
                  </span>
                  <span className="text-[12px] text-zinc-500">/ mois</span>
                </div>
                <div className="font-mono text-[12px] text-zinc-400 mb-6">
                  {t.credits ?? (loading ? "…" : "—")}
                </div>
                <ul className="space-y-2.5 mb-7">
                  {t.features.map(f => (
                    <li key={f} className="flex gap-2.5 text-[13px] text-zinc-300">
                      <Check className={"w-3.5 h-3.5 mt-0.5 shrink-0 " + (t.primary ? "text-blue-400" : "text-zinc-500")} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  search={{ plan: t.code as "free" | "standard" | "pro" }}
                  className={"btn-shimmer w-full py-2.5 rounded-md font-medium text-[13px] ease-expo transition-colors inline-flex items-center justify-center " +
                  (t.primary
                    ? "bg-blue-500 hover:bg-blue-400 text-white shadow-[0_8px_30px_-8px_rgba(59,130,246,0.6)]"
                    : "bg-white/5 hover:bg-white/10 text-zinc-200")}>
                  {t.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center font-mono text-[12px] text-zinc-500 max-w-2xl mx-auto leading-relaxed">
          <span className="text-zinc-300">1 estimation Pro coûte ~ 0,04 €.</span> Une seule annonce mal cotée vous coûte plus que ça.
        </div>
      </div>
    </section>
  );
}