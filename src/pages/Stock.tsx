import { useEffect, useMemo, useState } from "react";
import FadeInSection from "@/components/ui/FadeInSection";
import { useStockItems } from "@/lib/useStockItems";
import {
  DEFAULT_STOCK_FILTERS,
  type StockFilters,
  type StockDensity,
  type StockTab,
  applyActifsFilters,
  isActif,
  loadStockDensity,
  saveStockDensity,
} from "@/components/stock/datasets";
import StockHeader from "@/components/stock/StockHeader";
import StockSegmentedTabs from "@/components/stock/StockSegmentedTabs";
import StockKpiActifs from "@/components/stock/StockKpiActifs";
import StockFilterBar from "@/components/stock/StockFilterBar";
import StockTableActifs from "@/components/stock/StockTableActifs";
import StockEmptyState from "@/components/stock/StockEmptyState";
import StockPlaceholderTab from "@/components/stock/StockPlaceholderTab";
import AddStockItemModal from "@/components/stock/AddStockItemModal";

export default function Stock() {
  const stock = useStockItems();
  const [activeTab, setActiveTab] = useState<StockTab>("actifs");
  const [filters, setFilters] = useState<StockFilters>(DEFAULT_STOCK_FILTERS);
  const [density, setDensity] = useState<StockDensity>(() => loadStockDensity());
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    saveStockDensity(density);
  }, [density]);

  const actifsCount = useMemo(
    () => stock.items.filter(isActif).length,
    [stock.items],
  );

  const tabCounts = {
    actifs: actifsCount,
    historique: 0,
    comptes: 0,
    builds: 0,
  };

  const visibleActifs = useMemo(
    () => applyActifsFilters(stock.items, filters),
    [stock.items, filters],
  );

  return (
    <div className="flex flex-col gap-8">
      <StockHeader onOpenAdd={() => setModalOpen(true)} />

      <StockSegmentedTabs
        value={activeTab}
        counts={tabCounts}
        onChange={setActiveTab}
      />

      {activeTab === "actifs" && (
        <FadeInSection>
          {actifsCount === 0 ? (
            <StockEmptyState onOpenAdd={() => setModalOpen(true)} />
          ) : (
            <div className="flex flex-col gap-6">
              <StockKpiActifs items={stock.items} />
              <StockFilterBar
                filters={filters}
                density={density}
                onChangeFilters={setFilters}
                onChangeDensity={setDensity}
              />
              {visibleActifs.length === 0 ? (
                <div className="mk-card-flat-soft px-6 py-12 text-center text-[13px] text-zinc-500">
                  Aucun item ne correspond aux filtres actifs.
                </div>
              ) : (
                <StockTableActifs
                  items={visibleActifs}
                  density={density}
                  onDelete={stock.remove}
                />
              )}
            </div>
          )}
        </FadeInSection>
      )}

      {activeTab === "historique" && (
        <FadeInSection>
          <StockPlaceholderTab
            title="Historique des ventes"
            description="Marge réalisée, ROI, courbes de performance par catégorie. Disponible au prochain patch."
            patchLabel="P1B"
          />
        </FadeInSection>
      )}

      {activeTab === "comptes" && (
        <FadeInSection>
          <StockPlaceholderTab
            title="Comptes plateformes"
            description="Suivi des comptes LBC / Vinted / eBay, indicateurs de réputation, frais et plafonds."
            patchLabel="P1C"
          />
        </FadeInSection>
      )}

      {activeTab === "builds" && (
        <FadeInSection>
          <StockPlaceholderTab
            title="Builds & assemblages"
            description="Composition de configurations à partir des items en stock, marge théorique, BOM."
            patchLabel="P1D"
          />
        </FadeInSection>
      )}

      <AddStockItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={stock.add}
      />
    </div>
  );
}