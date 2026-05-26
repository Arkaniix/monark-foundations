import { useEffect, useMemo, useState } from "react";
import { Pencil, Tag, Euro, Trash2, ArrowLeft } from "lucide-react";
import FadeInSection from "@/components/ui/FadeInSection";
import { useStockItems } from "@/lib/useStockItems";
import { useAccountingEntries } from "@/lib/useAccountingEntries";
import { useBuilds } from "@/lib/useBuilds";
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
import AddStockItemModal from "@/components/stock/AddStockItemModal";
import MarkAsSoldModal from "@/components/stock/MarkAsSoldModal";
import EditStockItemModal, {
  type EditStockItemMode,
} from "@/components/stock/EditStockItemModal";
import StockDrawer from "@/components/stock/StockDrawer";
import StockHistoriqueView from "@/components/stock/StockHistoriqueView";
import type { KebabAction } from "@/components/stock/StockKebabMenu";
import StockComptesView from "@/components/stock/StockComptesView";
import AccountingEntryModal from "@/components/stock/AccountingEntryModal";
import type { AccountingEntry } from "@/components/stock/accountingDatasets";
import StockBuildsView from "@/components/stock/StockBuildsView";
import BuildDrawer from "@/components/stock/BuildDrawer";
import MarkBuildAsSoldModal from "@/components/stock/MarkBuildAsSoldModal";
import type { Build } from "@/components/stock/buildsDatasets";
import StockBilanView from "@/components/stock/StockBilanView";

export default function Stock() {
  const stock = useStockItems();
  const accounting = useAccountingEntries();
  const builds = useBuilds({ refreshStock: stock.refresh });
  const [activeTab, setActiveTab] = useState<StockTab>("actifs");
  const [filters, setFilters] = useState<StockFilters>(DEFAULT_STOCK_FILTERS);
  const [density, setDensity] = useState<StockDensity>(() => loadStockDensity());
  const [modalOpen, setModalOpen] = useState(false);
  const [soldItem, setSoldItem] = useState<StockItem | null>(null);
  const [editItem, setEditItem] = useState<StockItem | null>(null);
  const [editMode, setEditMode] = useState<EditStockItemMode>("edit");
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [accModalOpen, setAccModalOpen] = useState(false);
  const [accEditEntry, setAccEditEntry] = useState<AccountingEntry | null>(null);
  const [buildDrawerId, setBuildDrawerId] = useState<string | null>(null);
  const [soldBuild, setSoldBuild] = useState<Build | null>(null);
  const [bilanYear, setBilanYear] = useState<number>(() =>
    new Date().getFullYear(),
  );

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
    comptes: accounting.entries.length,
    builds: builds.builds.length,
    bilan: bilanYear,
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

  const buildDrawerItem = buildDrawerId ? builds.getById(buildDrawerId) : null;
  const availableStockItems = useMemo(
    () =>
      stock.items.filter(
        (it) => it.status === "in_stock" && it.build_id === null,
      ),
    [stock.items],
  );

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

  const handleHeaderAdd = () => {
    if (activeTab === "comptes") {
      setAccModalOpen(true);
    } else if (activeTab === "builds") {
      void builds.createEmpty().then((created) => setBuildDrawerId(created.id));
    } else if (activeTab === "actifs" || activeTab === "historique") {
      setModalOpen(true);
    }
  };

  const headerAddLabel =
    activeTab === "comptes"
      ? "+ AJOUTER UNE ENTRÉE"
      : activeTab === "builds"
        ? "+ AJOUTER UN BUILD"
        : "+ AJOUTER UN ITEM";
  const headerAddDisabled = false;
  const showHeaderAdd = activeTab !== "bilan";

  return (
    <div className="flex flex-col gap-8">
      <StockHeader
        onOpenAdd={handleHeaderAdd}
        addLabel={headerAddLabel}
        addDisabled={headerAddDisabled}
        showAdd={showHeaderAdd}
      />

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
          <StockComptesView
            entries={accounting.entries}
            stockItems={stock.items}
            onOpenAdd={() => setAccModalOpen(true)}
            onEdit={(entry) => setAccEditEntry(entry)}
            onDelete={accounting.remove}
          />
        </FadeInSection>
      )}

      {activeTab === "builds" && (
        <FadeInSection>
          <StockBuildsView
            builds={builds.builds}
            density={density}
            onChangeDensity={setDensity}
            onOpenDrawer={(b) => setBuildDrawerId(b.id)}
            onCreate={() => {
              void builds.createEmpty().then((created) => setBuildDrawerId(created.id));
            }}
            onDuplicate={(id) => {
              void builds.duplicate(id).then((clone) => {
                if (clone) setBuildDrawerId(clone.id);
              });
            }}
            onDelete={builds.remove}
            onMarkAsListed={builds.markAsListed}
            onMarkAsDelisted={builds.markAsDelisted}
            onMarkAsTested={builds.markAsTested}
            onMarkAsUntested={builds.markAsUntested}
            onOpenSold={(b) => setSoldBuild(b)}
            onResume={(id) => builds.resumeFromFailed(id, "reinject")}
          />
        </FadeInSection>
      )}

      {activeTab === "bilan" && (
        <FadeInSection>
          <StockBilanView
            stockItems={stock.items}
            builds={builds.builds}
            accountingEntries={accounting.entries}
            onYearChange={setBilanYear}
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

      <AccountingEntryModal
        open={accModalOpen}
        mode="add"
        onClose={() => setAccModalOpen(false)}
        onSubmit={(entry) => accounting.add(entry)}
      />

      <AccountingEntryModal
        open={accEditEntry !== null}
        mode="edit"
        initial={accEditEntry}
        onClose={() => setAccEditEntry(null)}
        onSubmit={(entry) => {
          if (accEditEntry) {
            accounting.update(accEditEntry.id, {
              category: entry.category,
              amount_eur: entry.amount_eur,
              date: entry.date,
              note: entry.note,
            });
          }
        }}
      />

      <BuildDrawer
        open={buildDrawerItem !== null}
        build={buildDrawerItem}
        visibleBuilds={builds.builds}
        availableStockItems={availableStockItems}
        onClose={() => setBuildDrawerId(null)}
        onSelectBuild={(id) => setBuildDrawerId(id)}
        onUpdate={builds.update}
        onAddComponent={(id, c) => {
          void builds.addComponent(id, c);
          return true;
        }}
        onRemoveComponent={builds.removeComponent}
        onMarkAsTested={builds.markAsTested}
        onMarkAsUntested={builds.markAsUntested}
        onMarkAsListed={builds.markAsListed}
        onMarkAsDelisted={builds.markAsDelisted}
        onOpenSold={(b) => setSoldBuild(b)}
        onCancelSale={builds.cancelSale}
        onMarkAsFailed={builds.markAsFailed}
        onResume={builds.resumeFromFailed}
        onReSellFromReturned={builds.reSellFromReturned}
        onDuplicate={(id) => {
          void builds.duplicate(id).then((clone) => {
            if (clone) setBuildDrawerId(clone.id);
          });
        }}
        onDelete={builds.remove}
      />

      <MarkBuildAsSoldModal
        open={soldBuild !== null}
        build={soldBuild}
        onClose={() => setSoldBuild(null)}
        onConfirm={(sale) => {
          if (soldBuild) builds.markAsSold(soldBuild.id, sale);
          setSoldBuild(null);
        }}
      />
    </div>
  );
}