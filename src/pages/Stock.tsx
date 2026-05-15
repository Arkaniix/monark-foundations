import { useEffect, useMemo, useState } from "react";
import { Pencil, Tag, Euro, Trash2, ArrowLeft, RefreshCw } from "lucide-react";
import FadeInSection from "@/components/ui/FadeInSection";
import { useStockItems } from "@/lib/useStockItems";
import {
  DEFAULT_STOCK_FILTERS,
  type StockFilters,
  type StockDensity,
  type StockTab,
  type StockItem,
  applyActifsFilters,
  isActif,
  loadStockDensity,
  saveStockDensity,
  applyHistoriqueFilters,
  DEFAULT_STOCK_HISTORIQUE_FILTERS,
} from "@/components/stock/datasets";
import StockHeader from "@/components/stock/StockHeader";
import StockSegmentedTabs from "@/components/stock/StockSegmentedTabs";
import StockKpiActifs from "@/components/stock/StockKpiActifs";
import StockFilterBar from "@/components/stock/StockFilterBar";
import StockTableActifs from "@/components/stock/StockTableActifs";
import StockEmptyState from "@/components/stock/StockEmptyState";
import StockPlaceholderTab from "@/components/stock/StockPlaceholderTab";
import AddStockItemModal from "@/components/stock/AddStockItemModal";
import MarkAsSoldModal from "@/components/stock/MarkAsSoldModal";
import EditStockItemModal, {
  type EditStockItemMode,
} from "@/components/stock/EditStockItemModal";
import StockDrawer from "@/components/stock/StockDrawer";
import StockHistoriqueView from "@/components/stock/StockHistoriqueView";
import type { KebabAction } from "@/components/stock/StockKebabMenu";

export default function Stock() {
  const stock = useStockItems();
  const [activeTab, setActiveTab] = useState<StockTab>("actifs");
  const [filters, setFilters] = useState<StockFilters>(DEFAULT_STOCK_FILTERS);
  const [density, setDensity] = useState<StockDensity>(() => loadStockDensity());
  const [modalOpen, setModalOpen] = useState(false);
  const [soldItem, setSoldItem] = useState<StockItem | null>(null);
  const [editItem, setEditItem] = useState<StockItem | null>(null);
  const [editMode, setEditMode] = useState<EditStockItemMode>("edit");
  const [drawerId, setDrawerId] = useState<string | null>(null);

  useEffect(() => {
    saveStockDensity(density);
  }, [density]);

  const actifsCount = useMemo(
    () => stock.items.filter(isActif).length,
    [stock.items],
  );

  const tabCounts = {
    actifs: actifsCount,
    historique: stock.historique.length,
    comptes: 0,
    builds: 0,
  };

  const visibleActifs = useMemo(
    () => applyActifsFilters(stock.items, filters),
    [stock.items, filters],
  );
  const visibleHistorique = useMemo(
    () =>
      applyHistoriqueFilters(stock.items, DEFAULT_STOCK_HISTORIQUE_FILTERS),
    [stock.items],
  );

  const drawerItem = drawerId ? stock.getById(drawerId) : null;
  const drawerVisibleList =
    activeTab === "historique" ? visibleHistorique : visibleActifs;

  const openEdit = (item: StockItem, mode: EditStockItemMode) => {
    setEditItem(item);
    setEditMode(mode);
  };

  const buildActifsActions = (item: StockItem): KebabAction[] => {
    const isListed = item.status === "listed";
    return [
      {
        key: "edit",
        label: "Modifier",
        icon: Pencil,
        onClick: () => openEdit(item, "edit"),
      },
      isListed
        ? {
            key: "unlisted",
            label: "Retirer de la vente",
            icon: ArrowLeft,
            onClick: () => stock.markAsUnlisted(item.id),
          }
        : {
            key: "listed",
            label: "Marquer comme listé",
            icon: Tag,
            onClick: () => stock.markAsListed(item.id),
          },
      {
        key: "sold",
        label: "Marquer comme vendu",
        icon: Euro,
        onClick: () => setSoldItem(item),
      },
      {
        key: "delete",
        label: "Supprimer",
        icon: Trash2,
        destructive: true,
        separatorBefore: true,
        onClick: () => stock.remove(item.id),
      },
    ];
  };

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
                  onRowClick={(it) => setDrawerId(it.id)}
                  buildActions={buildActifsActions}
                />
              )}
            </div>
          )}
        </FadeInSection>
      )}

      {activeTab === "historique" && (
        <FadeInSection>
          {stock.historique.length === 0 ? (
            <div className="mk-card-flat-soft px-6 py-16 text-center text-[13px] text-zinc-500">
              Aucune vente enregistrée pour le moment. Vendez un item pour le
              voir apparaître ici.
            </div>
          ) : (
            <StockHistoriqueView
              items={stock.items}
              density={density}
              onChangeDensity={setDensity}
              onRowClick={(it) => setDrawerId(it.id)}
              onEditSale={(it) => openEdit(it, "edit-sale")}
              onCancelSale={(it) => stock.cancelSale(it.id, "in_stock")}
              onReSell={(it) => setSoldItem(it)}
              onDelete={stock.remove}
            />
          )}
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

      <MarkAsSoldModal
        open={soldItem !== null}
        item={soldItem}
        onClose={() => setSoldItem(null)}
        onConfirm={(sale) => {
          if (soldItem) stock.markAsSold(soldItem.id, sale);
          setSoldItem(null);
        }}
      />

      <EditStockItemModal
        open={editItem !== null}
        item={editItem}
        mode={editMode}
        onClose={() => setEditItem(null)}
        onSave={(patch) => {
          if (editItem) stock.update(editItem.id, patch);
        }}
      />

      <StockDrawer
        open={drawerItem !== null}
        item={drawerItem}
        visibleItems={drawerVisibleList}
        onClose={() => setDrawerId(null)}
        onSelectItem={(id) => setDrawerId(id)}
        onUpdate={stock.update}
        onMarkAsListed={stock.markAsListed}
        onMarkAsUnlisted={stock.markAsUnlisted}
        onOpenSoldModal={(it) => setSoldItem(it)}
        onOpenEditModal={openEdit}
        onCancelSale={stock.cancelSale}
        onDelete={stock.remove}
      />
    </div>
  );
}