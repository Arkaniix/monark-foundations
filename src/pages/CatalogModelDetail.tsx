import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { catalogApi } from "../lib/api";
import type { CatalogModelDetail as CatalogModelDetailT } from "../components/catalog/modelDetail";
import { useCatalogFavorites } from "../lib/catalogFavorites";
import { useCatalogAlerts } from "../lib/catalogAlerts";
import CatalogFicheHeader from "../components/catalog/CatalogFicheHeader";
import CatalogFicheOverview from "../components/catalog/CatalogFicheOverview";
import CatalogFichePercentiles from "../components/catalog/CatalogFichePercentiles";
import CatalogFicheVariants from "../components/catalog/CatalogFicheVariants";
import CatalogFicheMarketplaces from "../components/catalog/CatalogFicheMarketplaces";
import CatalogFicheHistory from "../components/catalog/CatalogFicheHistory";
import CatalogFicheCtaEstimer from "../components/catalog/CatalogFicheCtaEstimer";

type Props = { modelId: string };

export default function CatalogModelDetail({ modelId }: Props) {
  const navigate = useNavigate();
  const [detail, setDetail] = useState<CatalogModelDetailT | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, toggle: toggleFav } = useCatalogFavorites();
  const { hasAlert, toggle: toggleAlert } = useCatalogAlerts();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    catalogApi
      .getModelDetail(modelId)
      .then((d) => {
        if (cancelled) return;
        if (!d) setError("Modèle introuvable");
        else setDetail(d);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Erreur de chargement");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [modelId]);

  const handleEstimate = () => {
    if (!detail) return;
    navigate({ to: "/estimator", search: { model: detail.id } });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-[11px] tracking-[0.12em] text-zinc-500">
        CHARGEMENT…
      </div>
    );
  }
  if (error || !detail) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-[11px] tracking-[0.12em] text-zinc-500">
        {error ?? "Modèle introuvable"}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <CatalogFicheHeader
        detail={detail}
        isFavorite={isFavorite(detail.id)}
        hasAlert={hasAlert(detail.id)}
        onToggleFavorite={() => toggleFav(detail.id)}
        onToggleAlert={() => toggleAlert(detail.id)}
        onEstimate={handleEstimate}
      />
      <div className="flex flex-col gap-8 px-6 py-6">
        <CatalogFicheOverview detail={detail} />
        <CatalogFichePercentiles detail={detail} />
        <CatalogFicheVariants variants={detail.variants} familyLabel={detail.family} />
        <CatalogFicheMarketplaces by_platform={detail.by_platform} global_median_eur={detail.median_eur} />
        <CatalogFicheHistory monthly_history={detail.monthly_history} />
        <CatalogFicheCtaEstimer modelName={detail.name} onEstimate={handleEstimate} />
      </div>
    </div>
  );
}