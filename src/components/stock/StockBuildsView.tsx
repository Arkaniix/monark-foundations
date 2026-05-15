import { useMemo, useState } from "react";
import { Settings, Pencil, Copy, Trash2, Euro, Tag, ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";
import {
  type Build,
  type BuildsFilters,
  DEFAULT_BUILDS_FILTERS,
  applyBuildsFilters,
  computeBuildsKpis,
} from "./buildsDatasets";
import type { StockDensity } from "./datasets";
import StockBuildsKpiTiles from "./StockBuildsKpiTiles";
import StockBuildsFilterBar from "./StockBuildsFilterBar";
import StockBuildsTable from "./StockBuildsTable";
import type { KebabAction } from "./StockKebabMenu";

type Actions = {
  onOpenDrawer: (b: Build) => void;
  onCreate: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkAsListed: (id: string) => void;
  onMarkAsDelisted: (id: string) => void;
  onMarkAsTested: (id: string) => void;
  onMarkAsUntested: (id: string) => void;
  onOpenSold: (b: Build) => void;
  onResume: (id: string) => void;
};

type Props = Actions & {
  builds: Build[];
  density: StockDensity;
  onChangeDensity: (d: StockDensity) => void;
};

export default function StockBuildsView({
  builds,
  density,
  onChangeDensity,
  onOpenDrawer,
  onCreate,
  onDuplicate,
  onDelete,
  onMarkAsListed,
  onMarkAsDelisted,
  onMarkAsTested,
  onMarkAsUntested,
  onOpenSold,
  onResume,
}: Props) {
  const [filters, setFilters] = useState<BuildsFilters>(DEFAULT_BUILDS_FILTERS);
  const kpis = useMemo(() => computeBuildsKpis(builds), [builds]);
  const visible = useMemo(() => applyBuildsFilters(builds, filters), [builds, filters]);

  if (builds.length === 0) {
    return (
      <div className="mk-card-flat-soft flex flex-col items-center gap-5 px-6 py-16 text-center">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background: "rgba(59,130,246,0.10)",
            boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.22)",
          }}
        >
          <Settings className="h-5 w-5" style={{ color: "#3B82F6" }} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="text-[15px] font-medium text-zinc-100">
            Aucun build pour le moment
          </div>
          <div className="max-w-md text-[13px] leading-relaxed text-zinc-400">
            Composez un build à partir de pièces du stock, d'achats neufs et de
            pièces que vous détenez déjà. Suivez son coût, sa marge et son cycle
            de vie jusqu'à la vente.
          </div>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="ease-expo flex items-center gap-2 rounded-md px-4 py-2 transition-colors"
          style={{ background: "rgba(59,130,246,0.14)" }}
        >
          <span
            className="font-mono text-[12px] tracking-wider"
            style={{ color: "#3B82F6" }}
          >
            + AJOUTER UN BUILD
          </span>
        </button>
      </div>
    );
  }

  const buildActions = (b: Build): KebabAction[] => {
    const actions: KebabAction[] = [
      {
        key: "open",
        label: "Ouvrir le build",
        icon: Pencil,
        onClick: () => onOpenDrawer(b),
      },
    ];
    if (b.status === "in_progress") {
      actions.push({
        key: "tested",
        label: "Marquer testé",
        icon: ShieldCheck,
        onClick: () => onMarkAsTested(b.id),
      });
    }
    if (b.status === "tested") {
      actions.push(
        {
          key: "listed",
          label: "Mettre en vente",
          icon: Tag,
          onClick: () => onMarkAsListed(b.id),
        },
        {
          key: "untested",
          label: "Retour au montage",
          icon: ArrowLeft,
          onClick: () => onMarkAsUntested(b.id),
        },
      );
    }
    if (b.status === "listed") {
      actions.push(
        {
          key: "sold",
          label: "Marquer comme vendu",
          icon: Euro,
          onClick: () => onOpenSold(b),
        },
        {
          key: "delisted",
          label: "Retirer de la vente",
          icon: ArrowLeft,
          onClick: () => onMarkAsDelisted(b.id),
        },
      );
    }
    if (b.status === "failed") {
      actions.push({
        key: "resume",
        label: "Reprendre le build",
        icon: RefreshCw,
        onClick: () => onResume(b.id),
      });
    }
    actions.push(
      {
        key: "duplicate",
        label: "Dupliquer",
        icon: Copy,
        separatorBefore: true,
        onClick: () => onDuplicate(b.id),
      },
      {
        key: "delete",
        label: "Supprimer",
        icon: Trash2,
        destructive: true,
        separatorBefore: true,
        onClick: () => onDelete(b.id),
      },
    );
    return actions;
  };

  return (
    <div className="flex flex-col gap-6">
      <StockBuildsKpiTiles kpis={kpis} />
      <StockBuildsFilterBar
        filters={filters}
        density={density}
        onChangeFilters={setFilters}
        onChangeDensity={onChangeDensity}
      />
      {visible.length === 0 ? (
        <div className="mk-card-flat-soft px-6 py-12 text-center text-[13px] text-zinc-500">
          Aucun build ne correspond aux filtres actifs.
        </div>
      ) : (
        <StockBuildsTable
          builds={visible}
          density={density}
          onRowClick={onOpenDrawer}
          buildActions={buildActions}
        />
      )}
    </div>
  );
}