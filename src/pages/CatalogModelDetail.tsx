import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { catalogApi } from "@/lib/api";
import type { CatalogModelDetail as CatalogModelDetailT } from "@/components/catalog/modelDetail";
import { useCatalogFavorites } from "@/lib/catalogFavorites";
import { useCatalogAlerts } from "@/lib/catalogAlerts";
import CatalogFicheHeader from "@/components/catalog/CatalogFicheHeader";
import CatalogFicheOverview from "@/components/catalog/CatalogFicheOverview";
import CatalogFichePercentiles from "@/components/catalog/CatalogFichePercentiles";
import CatalogFicheVariants from "@/components/catalog/CatalogFicheVariants";
import CatalogFicheMarketplaces from "@/components/catalog/CatalogFicheMarketplaces";
import CatalogFicheHistory from "@/components/catalog/CatalogFicheHistory";
import CatalogFicheCtaEstimer from "@/components/catalog/CatalogFicheCtaEstimer";
import CatalogFicheLoading from "@/components/catalog/CatalogFicheLoading";
import CatalogFicheNotFound from "@/components/catalog/CatalogFicheNotFound";

type Props = { modelId: string };

export default function CatalogModelDetail({ modelId }: Props) {
  const navigate = useNavigate();
  const [detail, setDetail] = useState<CatalogModelDetailT | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { has: isFavorite, toggle: toggleFav } = useCatalogFavorites();
  const { has: hasAlert, toggle: toggleAlert } = useCatalogAlerts();

  useEffect(() => {
    let cancelled = false;
    setNotFound(false);
    setError(null);

    // Scroll-top synchrone, avant le fetch. Garantit que chaque changement
    // de modèle (catalogue, clic variant, URL directe, refresh) démarre en haut.
    window.scrollTo({ top: 0, behavior: "auto" });

    if (detail) setIsTransitioning(true);

    catalogApi
      .getModelDetail(modelId)
      .then((d) => {
        if (cancelled) return;
        if (!d) {
          setNotFound(true);
          setDetail(null);
          setIsTransitioning(false);
          setIsFirstLoad(false);
          return;
        }
        setDetail(d);
        setIsFirstLoad(false);
        requestAnimationFrame(() => {
          if (cancelled) return;
          setIsTransitioning(false);
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        setIsTransitioning(false);
        setIsFirstLoad(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId]);

  const handleEstimate = useCallback(() => {
    if (!detail) return;
    navigate({ to: "/estimator", search: { model: detail.id } });
  }, [detail, navigate]);

  if (isFirstLoad && !detail) return <CatalogFicheLoading />;
  if (notFound) return <CatalogFicheNotFound />;
  if (error && !detail) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <div className="font-mono text-[10.5px] tracking-[0.16em] text-red-400">ERREUR API</div>
        <p className="text-[12px] text-zinc-500">{error}</p>
      </div>
    );
  }
  if (!detail) return <CatalogFicheLoading />;

  return (
    <div
      className="flex flex-col"
      style={{
        opacity: isTransitioning ? 0.4 : 1,
        transition: "opacity 200ms ease-out",
      }}
    >
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
        <CatalogFicheMarketplaces
          by_platform={detail.by_platform}
          global_median_eur={detail.median_eur}
        />
        <CatalogFicheHistory monthly_history={detail.monthly_history} />
        <CatalogFicheCtaEstimer modelName={detail.name} onEstimate={handleEstimate} />
      </div>
    </div>
  );
}