import { useNavigate } from "@tanstack/react-router";
import { Plus, TrendingUp, Wallet, Sparkles, Coins } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useDashboardData } from "@/lib/useDashboardData";
import { formatEurInt } from "@/components/stock/bilanCalculations";
import { Skeleton } from "@/components/ui";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PerfChart } from "@/components/dashboard/PerfChart";
import { CapitalDonut } from "@/components/dashboard/CapitalDonut";
import { StockTable } from "@/components/dashboard/StockTable";
import { MarketMovers } from "@/components/dashboard/MarketMovers";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { EmptyCockpit } from "@/components/dashboard/GhostCockpit";

function todayLabel(): string {
  return new Date()
    .toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, model } = useDashboardData();
  const firstName = user?.full_name?.trim().split(/\s+/)[0] ?? "";

  const isEmpty = !!model && model.kpis.stockCount === 0 && model.kpis.soldCount === 0;
  const hasSales = !!model && model.kpis.soldCount > 0;

  const subtitle = !model
    ? "Chargement de ton tableau de bord…"
    : isEmpty
      ? "Ton tableau de bord est prêt. Il prend vie dès ta première pièce en stock ou ta première vente."
      : `Capital engagé ${formatEurInt(model.kpis.capital)} € sur ${model.categoryCount} catégorie${model.categoryCount > 1 ? "s" : ""} · ${model.staleCount} pièce${model.staleCount > 1 ? "s" : ""} ${model.staleCount > 1 ? "dorment" : "dort"} dans le stock.`;

  const header = (
    <div className="sec-in flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <span className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">§ DASHBOARD</span>
          <span className="h-px w-8 bg-white/10" />
          <span className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">{todayLabel()}</span>
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight text-zinc-50">
          Bonjour{firstName ? ` ${firstName}` : ""}.
        </h1>
        <p className="mt-1.5 font-mono text-[12px] text-zinc-500">{subtitle}</p>
      </div>
      <button
        onClick={() => navigate({ to: "/estimator" })}
        className="btn-shimmer inline-flex items-center gap-2 self-start rounded-lg px-4 py-2.5 text-[13px] font-medium text-white"
        style={{ background: "#3B82F6" }}
      >
        <Plus size={16} /> Nouvelle estimation
      </button>
    </div>
  );

  if (loading || !model) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[120px] w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Skeleton className="h-72 rounded-xl lg:col-span-7" />
          <Skeleton className="h-72 rounded-xl lg:col-span-5" />
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Skeleton className="h-80 rounded-xl lg:col-span-7" />
          <Skeleton className="h-80 rounded-xl lg:col-span-5" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const k = model.kpis;

  if (isEmpty) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard idx={0} icon={TrendingUp} label="PROFIT · 30 JOURS" value={0} suffix=" €" sub="Aucune vente pour l'instant" accent="#10B981" />
          <KpiCard idx={1} icon={Wallet} label="CAPITAL ENGAGÉ" value={0} suffix=" €" sub="Aucune pièce en stock" accent="#60A5FA" />
          <KpiCard idx={2} icon={Sparkles} label="PROFIT POTENTIEL" value={0} suffix=" €" sub="Ajoute ton premier achat" accent="#A78BFA" />
          <KpiCard idx={3} icon={Coins} label="CRÉDITS" value={k.credits} sub={`sur ${k.creditsCap} · plan ${k.tier}`} accent="#F59E0B" />
        </div>
        <EmptyCockpit />
        <MarketMovers movers={model.movers} />
        <p className="text-center font-mono text-[10px] text-zinc-600">
          Les tendances marché sont mondiales — elles t'aident à acheter au bon moment, avant même ta première pièce.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {header}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard idx={0} icon={TrendingUp} label="PROFIT · 30 JOURS" value={k.profit30j} suffix=" €"
          sub={hasSales ? `${k.sold30jCount} vente${k.sold30jCount > 1 ? "s" : ""} réalisée${k.sold30jCount > 1 ? "s" : ""}` : "Aucune vente pour l'instant"}
          accent="#10B981" delta={hasSales ? k.profit30jDeltaPct : null} />
        <KpiCard idx={1} icon={Wallet} label="CAPITAL ENGAGÉ" value={k.capital} suffix=" €"
          sub={`${k.stockCount} pièce${k.stockCount > 1 ? "s" : ""} en stock`} accent="#60A5FA" />
        <KpiCard idx={2} icon={Sparkles} label="PROFIT POTENTIEL" value={k.potential} suffix=" €"
          sub="si tout le stock part" accent="#A78BFA" />
        <KpiCard idx={3} icon={Coins} label="CRÉDITS" value={k.credits}
          sub={`sur ${k.creditsCap} · plan ${k.tier}`} accent="#F59E0B" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7"><PerfChart weekly={model.weekly} empty={!hasSales} /></div>
        <div className="lg:col-span-5">
          <CapitalDonut capital={k.capital} byCategory={model.donutByCategory} byStatus={model.donutByStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StockTable rows={model.stockRows.slice(0, 8)} capital={k.capital} potential={k.potential} />
        </div>
        <div className="lg:col-span-5"><MarketMovers movers={model.movers} /></div>
      </div>

      <RecentActivity />
    </div>
  );
}