import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "@tanstack/react-router";
import {
  X,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Tag,
  Euro,
  Pencil,
  ExternalLink,
  Trash2,
  ArrowLeft,
  Calculator,
  RefreshCw,
} from "lucide-react";
import {
  type StockItem,
  type PlatformKey,
  type ConditionKey,
  type StockStatus,
  PLATFORMS,
  PLATFORM_LABELS,
  PLATFORM_DOT_COLOR,
  CONDITIONS,
  CONDITION_LABELS,
  STATUS_LABELS,
  STATUS_BADGE_STYLE,
  STOCK_EVENT_LABEL,
  STOCK_EVENT_COLOR,
  daysHeld,
  agingColor,
  formatDateShortFR,
  formatEur,
  getMargeBrute,
  getMargeNette,
  getMargeNettePct,
  getDureeVente,
} from "./datasets";
import { CATALOG_MODELS } from "@/components/catalog/mockData";
import type { HardwareCategory } from "@/components/catalog/datasets";
import ModelImage from "@/components/catalog/ModelImage";
import Sparkline from "@/components/ui/Sparkline";

const MARKET_TOGGLE_KEY = "monark.stock.drawer.show_market.v1";

function loadShowMarket(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(MARKET_TOGGLE_KEY);
    if (raw === "false") return false;
    return true;
  } catch {
    return true;
  }
}

function saveShowMarket(v: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MARKET_TOGGLE_KEY, v ? "true" : "false");
  } catch {
    /* noop */
  }
}

function relativeTimeFR(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "à l'instant";
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const days = Math.floor(h / 24);
  if (days < 30) return `il y a ${days} j`;
  return formatDateShortFR(iso);
}

type Props = {
  open: boolean;
  item: StockItem | null;
  visibleItems: StockItem[];
  onClose: () => void;
  onSelectItem: (id: string) => void;
  onUpdate: (id: string, patch: Partial<StockItem>) => void;
  onMarkAsListed: (id: string) => void;
  onMarkAsUnlisted: (id: string) => void;
  onOpenSoldModal: (item: StockItem) => void;
  onOpenEditModal: (item: StockItem, mode: "edit" | "edit-sale") => void;
  onCancelSale: (id: string, newStatus: "in_stock" | "returned") => void;
  onDelete: (id: string) => void;
};

export default function StockDrawer({
  open,
  item,
  visibleItems,
  onClose,
  onSelectItem,
  onUpdate,
  onMarkAsListed,
  onMarkAsUnlisted,
  onOpenSoldModal,
  onOpenEditModal,
  onCancelSale,
  onDelete,
}: Props) {
  const navigate = useNavigate();
  const [showMarket, setShowMarket] = useState<boolean>(() => loadShowMarket());
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    saveShowMarket(showMarket);
  }, [showMarket]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) setConfirmCancel(false);
  }, [open, item?.id]);

  const idx = useMemo(() => {
    if (!item) return -1;
    return visibleItems.findIndex((it) => it.id === item.id);
  }, [item, visibleItems]);

  if (!open || !item) return null;

  const canPrev = idx > 0;
  const canNext = idx >= 0 && idx < visibleItems.length - 1;

  const goPrev = () => {
    if (canPrev) onSelectItem(visibleItems[idx - 1].id);
  };
  const goNext = () => {
    if (canNext) onSelectItem(visibleItems[idx + 1].id);
  };

  const catalogModel = item.model_id
    ? CATALOG_MODELS.find((m) => m.id === item.model_id) ?? null
    : null;

  const isHwCat = item.category_snapshot !== "OTHER";
  const badge = STATUS_BADGE_STYLE[item.status];

  const goToEstimator = () =>
    navigate({
      to: "/estimator",
      search: { model: item.model_name_snapshot } as never,
    });
  const goToFiche = () => {
    if (!item.model_id) return;
    navigate({
      to: "/catalogue_/$modelId",
      params: { modelId: item.model_id },
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <style>{`
        @keyframes mk-drawer-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mk-drawer-slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.4)",
          animation: "mk-drawer-fade 180ms cubic-bezier(0.16,1,0.3,1) both",
        }}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className="absolute right-0 top-0 flex h-full w-full max-w-[480px] flex-col overflow-hidden"
        style={{
          background: "#0F0F11",
          boxShadow:
            "-12px 0 36px rgba(0,0,0,0.45), inset 1px 0 0 rgba(255,255,255,0.06)",
          animation: "mk-drawer-slide 220ms cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* Header sticky */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{
            background: "#101012",
            borderBottom: "1px solid var(--mk-divider-soft)",
          }}
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canPrev}
              aria-label="Item précédent"
              className="ease-expo flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-white/[0.06] disabled:opacity-40"
            >
              <ChevronUp className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canNext}
              aria-label="Item suivant"
              className="ease-expo flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-white/[0.06] disabled:opacity-40"
            >
              <ChevronDown className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            </button>
            <span className="ml-1 font-mono text-[10px] tracking-[0.18em] text-zinc-500 tabular-nums">
              {idx + 1} / {visibleItems.length}
            </span>
          </div>

          <div className="flex flex-1 items-center gap-2.5 min-w-0">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded"
              style={{
                background: "rgba(255,255,255,0.03)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
              }}
            >
              <ModelImage
                category={
                  isHwCat
                    ? (item.category_snapshot as HardwareCategory)
                    : "OTHER"
                }
                url={null}
                className="opacity-70"
              />
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="truncate text-[15px] font-medium text-zinc-100">
                {item.model_name_snapshot}
              </div>
              <div className="font-mono text-[10px] tracking-[0.16em] text-zinc-500">
                {item.source === "custom"
                  ? "OTHER · pièce hors-catalogue"
                  : `${item.category_snapshot}${catalogModel?.manufacturer ? ` · ${catalogModel.manufacturer}` : ""}`}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="ease-expo flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-white/[0.06]"
          >
            <X className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
          </button>
        </div>

        {/* Status badge bar */}
        <div className="flex items-center gap-2 px-5 py-2.5"
          style={{ borderBottom: "1px solid var(--mk-divider-soft)" }}
        >
          <span
            className="inline-flex items-center rounded px-2 py-0.5 font-mono text-[10px] tracking-[0.18em]"
            style={{ background: badge.bg, color: badge.fg }}
          >
            {STATUS_LABELS[item.status].toUpperCase()}
          </span>
          <span className="font-mono text-[10px] tracking-[0.16em] text-zinc-600">
            ID · {item.id.slice(-6).toUpperCase()}
          </span>
        </div>

        {/* Body scroll */}
        <div className="flex-1 overflow-y-auto">
          {/* §01 ACHAT */}
          <SectionHeader idx="01" label="ACHAT" />
          <div className="grid grid-cols-2 gap-3 px-5 py-4">
            <InlinePriceField
              label="PRIX"
              value={item.purchase_price_eur}
              onSave={(v) => onUpdate(item.id, { purchase_price_eur: v })}
              big
            />
            <InlineDateField
              label="DATE"
              value={item.purchase_date}
              onSave={(v) => onUpdate(item.id, { purchase_date: v })}
            />
            <InlinePlatformField
              label="PLATEFORME"
              value={item.purchase_platform}
              onSave={(v) => onUpdate(item.id, { purchase_platform: v })}
            />
            <InlineConditionField
              label="ÉTAT"
              value={item.condition}
              onSave={(v) => onUpdate(item.id, { condition: v })}
            />
          </div>

          {/* §02 MARCHÉ ou §02 VENTE selon status */}
          {item.status === "sold" || item.status === "returned" ? (
            <SaleSection item={item} />
          ) : catalogModel ? (
            <MarketSection
              purchasePrice={item.purchase_price_eur}
              median={catalogModel.median_eur}
              trendPct={catalogModel.trend_30d_pct}
              sparkline={catalogModel.sparkline_30d}
              show={showMarket}
              onToggle={() => setShowMarket((v) => !v)}
            />
          ) : null}

          {/* §03 AGING ou TIMING */}
          {item.status === "sold" || item.status === "returned" ? (
            <TimingSection item={item} />
          ) : (
            <AgingSection item={item} />
          )}

          {/* §04 NOTES */}
          <NotesSection
            value={item.notes}
            onSave={(notes) => onUpdate(item.id, { notes })}
          />

          {/* §05 HISTORIQUE events */}
          <SectionHeader idx="05" label="HISTORIQUE" />
          <div className="px-5 pb-6 pt-3">
            <ol className="flex flex-col gap-2.5">
              {[...(item.events ?? [])].reverse().map((ev, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: STOCK_EVENT_COLOR[ev.type] }}
                  />
                  <div className="flex flex-1 items-baseline justify-between gap-2">
                    <span className="text-[12px] text-zinc-300">
                      {STOCK_EVENT_LABEL[ev.type]}
                      {ev.payload?.price_eur != null && (
                        <span className="font-mono text-[11px] tabular-nums text-zinc-500">
                          {" "}
                          · {formatEur(ev.payload.price_eur)} €
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-[10px] tabular-nums text-zinc-600">
                      {relativeTimeFR(ev.at)}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer sticky */}
        <div
          className="flex flex-col gap-2 px-4 py-3"
          style={{
            background: "#101012",
            borderTop: "1px solid var(--mk-divider-soft)",
          }}
        >
          {item.status === "in_stock" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <PrimaryBtn
                  color="#F59E0B"
                  icon={<Tag className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  onClick={() => onMarkAsListed(item.id)}
                >
                  MARQUER COMME LISTÉ
                </PrimaryBtn>
                <PrimaryBtn
                  color="#10B981"
                  icon={<Euro className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  onClick={() => onOpenSoldModal(item)}
                >
                  MARQUER COMME VENDU
                </PrimaryBtn>
              </div>
              {item.model_id && (
              <div className="grid grid-cols-2 gap-2">
                <SecondaryBtn
                  icon={<Calculator className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  onClick={() =>
                    navigate({
                      to: "/estimator",
                      search: { model: item.model_name_snapshot } as never,
                    })
                  }
                >
                  ESTIMER LA REVENTE
                </SecondaryBtn>
                <SecondaryBtn
                  icon={<ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  disabled={!item.model_id}
                  onClick={() => {
                    if (!item.model_id) return;
                    goToFiche();
                  }}
                >
                  VOIR FICHE MODÈLE
                </SecondaryBtn>
              </div>
              )}
            </>
          )}

          {item.status === "listed" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <PrimaryBtn
                  color="#71717A"
                  icon={<ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  onClick={() => onMarkAsUnlisted(item.id)}
                >
                  RETIRER DE LA VENTE
                </PrimaryBtn>
                <PrimaryBtn
                  color="#10B981"
                  icon={<Euro className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  onClick={() => onOpenSoldModal(item)}
                >
                  MARQUER COMME VENDU
                </PrimaryBtn>
              </div>
              {item.model_id && (
              <div className="grid grid-cols-2 gap-2">
                <SecondaryBtn
                  icon={<Calculator className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  onClick={goToEstimator}
                >
                  ESTIMER LA REVENTE
                </SecondaryBtn>
                <SecondaryBtn
                  icon={<ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  disabled={!item.model_id}
                  onClick={goToFiche}
                >
                  VOIR FICHE MODÈLE
                </SecondaryBtn>
              </div>
              )}
            </>
          )}

          {item.status === "sold" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <PrimaryBtn
                  color="#3B82F6"
                  icon={<Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  onClick={() => onOpenEditModal(item, "edit-sale")}
                >
                  MODIFIER LA VENTE
                </PrimaryBtn>
                {confirmCancel ? (
                  <div className="flex gap-1">
                    <PrimaryBtn
                      color="#3B82F6"
                      onClick={() => {
                        onCancelSale(item.id, "in_stock");
                        setConfirmCancel(false);
                      }}
                    >
                      REMETTRE EN STOCK
                    </PrimaryBtn>
                    <PrimaryBtn
                      color="#71717A"
                      onClick={() => {
                        onCancelSale(item.id, "returned");
                        setConfirmCancel(false);
                      }}
                    >
                      RETOURNÉ
                    </PrimaryBtn>
                  </div>
                ) : (
                  <PrimaryBtn
                    color="#71717A"
                    icon={<RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />}
                    onClick={() => setConfirmCancel(true)}
                  >
                    ANNULER LA VENTE
                  </PrimaryBtn>
                )}
              </div>
              {item.model_id && (
                <SecondaryBtn
                  icon={<ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  onClick={goToFiche}
                >
                  VOIR FICHE MODÈLE
                </SecondaryBtn>
              )}
            </>
          )}

          {item.status === "returned" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <PrimaryBtn
                  color="#10B981"
                  icon={<Euro className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  onClick={() => onOpenSoldModal(item)}
                >
                  RE-MARQUER VENDU
                </PrimaryBtn>
                <PrimaryBtn
                  color="#3B82F6"
                  icon={<ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  onClick={() => onCancelSale(item.id, "in_stock")}
                >
                  REMETTRE EN STOCK
                </PrimaryBtn>
              </div>
              {item.model_id && (
                <SecondaryBtn
                  icon={<ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  onClick={goToFiche}
                >
                  VOIR FICHE MODÈLE
                </SecondaryBtn>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => {
              onDelete(item.id);
              onClose();
            }}
            className="ease-expo flex items-center justify-center gap-1.5 rounded-md py-2 font-mono text-[10.5px] tracking-[0.14em] text-zinc-600 transition-colors hover:bg-red-500/[0.08] hover:text-red-400"
          >
            <Trash2 className="h-3 w-3" strokeWidth={1.5} />
            Supprimer cet item
          </button>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

// ===========================================================================
// Sections
// ===========================================================================

function SectionHeader({ idx, label }: { idx: string; label: string }) {
  return (
    <div
      className="flex items-center gap-3 px-5 pt-5"
    >
      <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-600">
        § {idx}
      </span>
      <span className="h-px flex-1" style={{ background: "var(--mk-divider-soft)" }} />
      <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
        {label}
      </span>
    </div>
  );
}

function MarketSection({
  purchasePrice,
  median,
  trendPct,
  sparkline,
  show,
  onToggle,
}: {
  purchasePrice: number;
  median: number;
  trendPct: number;
  sparkline: number[];
  show: boolean;
  onToggle: () => void;
}) {
  const dEur = median - purchasePrice;
  const dPct = purchasePrice > 0 ? (dEur / purchasePrice) * 100 : 0;
  const color = dEur > 0 ? "#10B981" : dEur < 0 ? "#EF4444" : "#71717A";
  return (
    <>
      <div className="flex items-center gap-3 px-5 pt-5">
        <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-600">
          § 02
        </span>
        <span
          className="h-px flex-1"
          style={{ background: "var(--mk-divider-soft)" }}
        />
        <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
          MARCHÉ
        </span>
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Replier" : "Déplier"}
          className="ease-expo flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/[0.06]"
        >
          {show ? (
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} />
          )}
        </button>
      </div>
      {show ? (
        <div className="flex flex-col gap-3 px-5 py-4">
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col">
              <div className="font-mono text-[10px] tracking-[0.16em] text-zinc-600">
                MÉDIANE ACTUELLE
              </div>
              <div className="mt-0.5 font-mono text-[20px] font-medium tabular-nums text-zinc-100">
                {formatEur(median)} €
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="font-mono text-[10px] tracking-[0.16em] text-zinc-600">
                Δ POTENTIEL
              </div>
              <div
                className="mt-0.5 font-mono text-[14px] tabular-nums"
                style={{ color }}
              >
                {dEur >= 0 ? "+" : ""}
                {formatEur(dEur)} €
              </div>
              <div className="font-mono text-[10px] tabular-nums" style={{ color }}>
                {dPct >= 0 ? "+" : ""}
                {dPct.toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="h-9">
            <Sparkline points={sparkline} color={color} fillHeight fill animate={false} />
          </div>
          <div className="font-mono text-[10px] tabular-nums text-zinc-600">
            tendance 30j ·{" "}
            <span style={{ color: trendPct >= 0 ? "#10B981" : "#EF4444" }}>
              {trendPct >= 0 ? "+" : ""}
              {trendPct.toFixed(1)}%
            </span>
          </div>
        </div>
      ) : (
        <div className="px-5 pb-3 pt-2">
          <div className="font-mono text-[11px] tabular-nums text-zinc-500">
            Médiane: {formatEur(median)} €{" "}
            <span style={{ color }}>
              ({dPct >= 0 ? "+" : ""}
              {dPct.toFixed(1)}%)
            </span>
          </div>
        </div>
      )}
    </>
  );
}

function SaleSection({ item }: { item: StockItem }) {
  const brute = getMargeBrute(item);
  const nette = getMargeNette(item);
  const pct = getMargeNettePct(item);
  const color = (v: number | null) =>
    v == null ? "#71717A" : v > 0 ? "#10B981" : v < 0 ? "#EF4444" : "#71717A";
  return (
    <>
      <SectionHeader idx="02" label="VENTE" />
      <div className="grid grid-cols-2 gap-3 px-5 py-4">
        <ReadStat label="PRIX VENTE" value={item.sale_price_eur != null ? `${formatEur(item.sale_price_eur)} €` : "—"} />
        <ReadStat label="DATE VENTE" value={item.sale_date ? formatDateShortFR(item.sale_date) : "—"} />
        <ReadStat
          label="PLATEFORME"
          value={
            item.sale_platform ? (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: PLATFORM_DOT_COLOR[item.sale_platform] }}
                />
                {PLATFORM_LABELS[item.sale_platform]}
              </span>
            ) : (
              "—"
            )
          }
        />
        <ReadStat label="FRAIS" value={`${formatEur(item.fees_eur ?? 0)} €`} />
        <ReadStat
          label="MARGE BRUTE"
          value={brute != null ? `${brute >= 0 ? "+" : ""}${formatEur(brute)} €` : "—"}
          valueColor={color(brute)}
        />
        <ReadStat
          label="MARGE NETTE"
          value={
            nette != null
              ? `${nette >= 0 ? "+" : ""}${formatEur(nette)} €${pct != null ? ` · ${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%` : ""}`
              : "—"
          }
          valueColor={color(nette)}
        />
      </div>
    </>
  );
}

function ReadStat({
  label,
  value,
  valueColor = "#FAFAFA",
}: {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <div
      className="flex flex-col gap-1 rounded-md px-3 py-2.5"
      style={{
        background: "rgba(255,255,255,0.02)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      <div className="font-mono text-[9.5px] tracking-[0.16em] text-zinc-600">
        {label}
      </div>
      <div className="font-mono text-[13px] tabular-nums" style={{ color: valueColor }}>
        {value}
      </div>
    </div>
  );
}

function AgingSection({ item }: { item: StockItem }) {
  const days = daysHeld(item);
  const color = agingColor(days);
  const pos = Math.min(220, (Math.min(days, 120) / 120) * 220);
  return (
    <>
      <SectionHeader idx="03" label="AGING" />
      <div className="flex flex-col gap-3 px-5 py-4">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[24px] font-medium tabular-nums" style={{ color }}>
            {days}
          </span>
          <span className="font-mono text-[12px] text-zinc-500">jours en stock</span>
          <span className="ml-1 h-2 w-2 rounded-full" style={{ background: color }} />
        </div>
        <div className="font-mono text-[10px] text-zinc-600">
          acheté {formatDateShortFR(item.purchase_date)} · il y a {days} j
        </div>
        <div className="relative h-1.5 w-[220px] rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${(30 / 120) * 100}%`,
              background: "rgba(113,113,122,0.4)",
            }}
          />
          <div
            className="absolute inset-y-0 rounded-full"
            style={{
              left: `${(30 / 120) * 100}%`,
              width: `${(30 / 120) * 100}%`,
              background: "rgba(245,158,11,0.4)",
            }}
          />
          <div
            className="absolute inset-y-0 rounded-full"
            style={{
              left: `${(60 / 120) * 100}%`,
              width: `${(60 / 120) * 100}%`,
              background: "rgba(239,68,68,0.4)",
            }}
          />
          <div
            className="absolute -top-0.5 h-2.5 w-0.5 rounded-full"
            style={{ left: pos - 1, background: "#FAFAFA" }}
          />
        </div>
        <div className="flex w-[220px] justify-between font-mono text-[9px] tabular-nums text-zinc-600">
          <span>0j</span>
          <span>30j</span>
          <span>60j</span>
          <span>90j</span>
          <span>120j+</span>
        </div>
      </div>
    </>
  );
}

function TimingSection({ item }: { item: StockItem }) {
  const duree = getDureeVente(item);
  if (duree == null) return null;
  const label = duree < 7 ? "rapide" : duree <= 30 ? "standard" : "lent";
  const color = duree < 7 ? "#10B981" : duree <= 30 ? "#F59E0B" : "#EF4444";
  return (
    <>
      <SectionHeader idx="03" label="TIMING DE VENTE" />
      <div className="flex items-baseline gap-2 px-5 py-4">
        <span className="font-mono text-[24px] font-medium tabular-nums text-zinc-100">
          {duree}
        </span>
        <span className="font-mono text-[12px] text-zinc-500">
          jours d'achat à vente
        </span>
        <span
          className="ml-2 inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.14em]"
          style={{ background: `${color}1A`, color }}
        >
          {label.toUpperCase()}
        </span>
      </div>
    </>
  );
}

function NotesSection({
  value,
  onSave,
}: {
  value: string | null;
  onSave: (next: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.setSelectionRange(ref.current.value.length, ref.current.value.length);
    }
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    onSave(next || null);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(value ?? "");
    setEditing(false);
  };

  return (
    <>
      <div className="flex items-center gap-3 px-5 pt-5">
        <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-600">
          § 04
        </span>
        <span className="h-px flex-1" style={{ background: "var(--mk-divider-soft)" }} />
        <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
          NOTES
        </span>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="ease-expo font-mono text-[10px] tracking-[0.14em] text-zinc-500 transition-colors hover:text-zinc-200"
          >
            éditer ↵
          </button>
        )}
      </div>
      <div className="px-5 py-3">
        {editing ? (
          <textarea
            ref={ref}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commit();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                cancel();
              }
            }}
            rows={3}
            placeholder="Ajouter une note…"
            className="w-full resize-none rounded-md bg-transparent px-3 py-2 text-[12.5px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
            style={{
              background: "rgba(255,255,255,0.02)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          />
        ) : value ? (
          <p
            onClick={() => setEditing(true)}
            className="ease-expo cursor-text rounded-md px-3 py-2 text-[12.5px] leading-relaxed text-zinc-400 transition-colors hover:bg-white/[0.02]"
          >
            {value}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="ease-expo w-full rounded-md px-3 py-2 text-left text-[12.5px] text-zinc-600 transition-colors hover:bg-white/[0.02]"
          >
            Ajouter une note…
          </button>
        )}
      </div>
    </>
  );
}

// ===========================================================================
// Inline editable fields
// ===========================================================================

function InlineFieldShell({
  label,
  big = false,
  children,
}: {
  label: string;
  big?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-1 rounded-md px-3 py-2.5"
      style={{
        background: "rgba(255,255,255,0.02)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        minHeight: big ? 72 : undefined,
      }}
    >
      <div className="font-mono text-[9.5px] tracking-[0.16em] text-zinc-600">
        {label}
      </div>
      {children}
    </div>
  );
}

function InlinePriceField({
  label,
  value,
  onSave,
  big,
}: {
  label: string;
  value: number;
  onSave: (v: number) => void;
  big?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft(String(value)), [value]);
  useEffect(() => {
    if (editing && ref.current) ref.current.select();
  }, [editing]);

  const commit = () => {
    const n = Math.round(Number.parseFloat(draft.replace(",", ".")));
    if (Number.isFinite(n) && n > 0) onSave(n);
    else setDraft(String(value));
    setEditing(false);
  };

  return (
    <InlineFieldShell label={label} big={big}>
      {editing ? (
        <input
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(String(value));
              setEditing(false);
            }
          }}
          className={`bg-transparent font-mono ${big ? "text-[20px]" : "text-[13px]"} font-medium tabular-nums text-zinc-100 focus:outline-none`}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`ease-expo text-left font-mono ${big ? "text-[20px]" : "text-[13px]"} font-medium tabular-nums text-zinc-100 transition-colors hover:text-white`}
        >
          {formatEur(value)} €
        </button>
      )}
    </InlineFieldShell>
  );
}

function InlineDateField({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (editing && ref.current) ref.current.focus();
  }, [editing]);

  const commit = () => {
    if (
      draft.length === 10 &&
      new Date(draft).getTime() <= Date.now()
    ) {
      onSave(draft);
    } else {
      setDraft(value);
    }
    setEditing(false);
  };

  return (
    <InlineFieldShell label={label}>
      {editing ? (
        <input
          ref={ref}
          type="date"
          value={draft}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          className="bg-transparent font-mono text-[13px] tabular-nums text-zinc-100 focus:outline-none"
          style={{ colorScheme: "dark" }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="ease-expo text-left font-mono text-[13px] tabular-nums text-zinc-100 transition-colors hover:text-white"
        >
          {formatDateShortFR(value)}
        </button>
      )}
    </InlineFieldShell>
  );
}

function InlinePlatformField({
  label,
  value,
  onSave,
}: {
  label: string;
  value: PlatformKey;
  onSave: (v: PlatformKey) => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <InlineFieldShell label={label}>
      {editing ? (
        <select
          autoFocus
          value={value}
          onChange={(e) => {
            onSave(e.target.value as PlatformKey);
            setEditing(false);
          }}
          onBlur={() => setEditing(false)}
          className="bg-transparent font-mono text-[13px] text-zinc-100 focus:outline-none"
          style={{ colorScheme: "dark" }}
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p} style={{ background: "#18181B" }}>
              {PLATFORM_LABELS[p]}
            </option>
          ))}
        </select>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="ease-expo flex items-center gap-1.5 text-left text-[13px] text-zinc-100 transition-colors hover:text-white"
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: PLATFORM_DOT_COLOR[value] }}
          />
          {PLATFORM_LABELS[value]}
        </button>
      )}
    </InlineFieldShell>
  );
}

function InlineConditionField({
  label,
  value,
  onSave,
}: {
  label: string;
  value: ConditionKey;
  onSave: (v: ConditionKey) => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <InlineFieldShell label={label}>
      {editing ? (
        <select
          autoFocus
          value={value}
          onChange={(e) => {
            onSave(e.target.value as ConditionKey);
            setEditing(false);
          }}
          onBlur={() => setEditing(false)}
          className="bg-transparent font-mono text-[13px] text-zinc-100 focus:outline-none"
          style={{ colorScheme: "dark" }}
        >
          {CONDITIONS.map((c) => (
            <option key={c} value={c} style={{ background: "#18181B" }}>
              {CONDITION_LABELS[c]}
            </option>
          ))}
        </select>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="ease-expo text-left font-mono text-[13px] text-zinc-100 transition-colors hover:text-white"
        >
          {CONDITION_LABELS[value]}
        </button>
      )}
    </InlineFieldShell>
  );
}

// ===========================================================================
// Footer buttons
// ===========================================================================

function PrimaryBtn({
  color,
  icon,
  onClick,
  children,
}: {
  color: string;
  icon?: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ease-expo flex items-center justify-center gap-1.5 rounded-md py-2.5 font-mono text-[10.5px] tracking-[0.14em] text-white transition-all"
      style={{
        background: color,
        boxShadow: `0 6px 20px -8px ${color}`,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function SecondaryBtn({
  icon,
  onClick,
  children,
  disabled = false,
}: {
  icon?: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="ease-expo flex items-center justify-center gap-1.5 rounded-md py-2.5 font-mono text-[10.5px] tracking-[0.14em] text-zinc-300 transition-colors disabled:opacity-40"
      style={{
        background: "rgba(255,255,255,0.03)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      {icon}
      {children}
    </button>
  );
}