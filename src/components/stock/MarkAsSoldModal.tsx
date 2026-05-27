import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  type StockItem,
  type PlatformKey,
  PLATFORMS,
  PLATFORM_LABELS,
  formatDateShortFR,
  formatEur,
} from "./datasets";
import { useCatalogModelMap } from "@/lib/useCatalogModelMap";
import type { HardwareCategory } from "@/components/catalog/datasets";
import ModelImage from "@/components/catalog/ModelImage";

type Props = {
  open: boolean;
  item: StockItem | null;
  onClose: () => void;
  onConfirm: (sale: {
    sale_price_eur: number;
    sale_date: string;
    sale_platform: PlatformKey;
    fees_eur: number;
  }) => void;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function MarkAsSoldModal({
  open,
  item,
  onClose,
  onConfirm,
}: Props) {
  const [priceStr, setPriceStr] = useState("");
  const [date, setDate] = useState<string>(todayIso());
  const [platform, setPlatform] = useState<PlatformKey>("LBC");
  const { byId } = useCatalogModelMap();
  const [feesStr, setFeesStr] = useState("0");

  useEffect(() => {
    if (open && item) {
      setPriceStr("");
      setDate(todayIso());
      setPlatform(item.purchase_platform);
      setFeesStr("0");
    }
  }, [open, item]);

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

  const catalogModel = useMemo(
    () => (item?.model_id ? (byId.get(item.model_id) ?? null) : null),
    [item, byId],
  );

  if (!open || !item) return null;

  const price = Number.parseFloat(priceStr.replace(",", "."));
  const fees = Number.parseFloat(feesStr.replace(",", ".")) || 0;
  const dateOk = date.length === 10 && new Date(date).getTime() <= Date.now();
  const isValid = Number.isFinite(price) && price > 0 && dateOk;

  const margeBrute = Number.isFinite(price) ? price - item.purchase_price_eur : null;
  const margeNette = margeBrute != null ? margeBrute - fees : null;
  const margeNettePct =
    margeNette != null && item.purchase_price_eur > 0
      ? (margeNette / item.purchase_price_eur) * 100
      : null;

  const margeColor = (v: number | null) =>
    v == null ? "#71717A" : v > 0 ? "#10B981" : v < 0 ? "#EF4444" : "#71717A";

  const isHwCat = item.category_snapshot !== "OTHER";
  const p90 = catalogModel ? Math.round(catalogModel.median_eur * 1.18) : null;

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm({
      sale_price_eur: Math.round(price),
      sale_date: date,
      sale_platform: platform,
      fees_eur: Math.round(fees),
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
      style={{ background: "rgba(0,0,0,0.72)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] overflow-hidden rounded-lg"
        style={{
          background: "#0F0F11",
          boxShadow:
            "0 24px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08)",
          animation: "stock-modal-in 180ms cubic-bezier(0.16,1,0.3,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <style>{`
          @keyframes stock-modal-in {
            from { opacity: 0; transform: translateY(8px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--mk-divider-soft)" }}
        >
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-600">
              INVENTAIRE · TRANSITION
            </div>
            <div className="mt-1 text-[15px] font-medium text-zinc-100">
              Marquer comme vendu
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

        <div className="flex flex-col gap-4 px-5 py-5">
          {/* Item rappelé */}
          <div
            className="flex items-center gap-3 rounded-md p-3"
            style={{
              background: "rgba(255,255,255,0.02)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded"
              style={{
                background: "rgba(255,255,255,0.03)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
              }}
            >
              {isHwCat ? (
                <ModelImage
                  category={item.category_snapshot as HardwareCategory}
                  url={null}
                  className="opacity-70"
                />
              ) : (
                <span className="font-mono text-[9px] text-zinc-600">—</span>
              )}
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="truncate text-[13px] text-zinc-100">
                {item.model_name_snapshot}
              </div>
              <div className="font-mono text-[10.5px] tabular-nums text-zinc-500">
                achat {formatEur(item.purchase_price_eur)} € ·{" "}
                {formatDateShortFR(item.purchase_date)}
              </div>
            </div>
          </div>

          <Field label="Prix de vente" required>
            <div className="flex items-stretch gap-2">
              <div
                className="flex flex-1 items-center gap-2 rounded-md px-3 py-2.5"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                }}
              >
                <input
                  type="text"
                  inputMode="decimal"
                  value={priceStr}
                  onChange={(e) => setPriceStr(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-transparent text-[13px] tabular-nums text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                />
                <span className="font-mono text-[11px] text-zinc-500">€</span>
              </div>
              {p90 != null && (
                <button
                  type="button"
                  onClick={() => setPriceStr(String(p90))}
                  className="ease-expo rounded-md px-2.5 py-2 font-mono text-[10px] tracking-[0.1em] transition-colors"
                  style={{
                    color: "#10B981",
                    background: "rgba(16,185,129,0.06)",
                    boxShadow: "inset 0 0 0 1px rgba(16,185,129,0.22)",
                  }}
                  title="Plafond P90 du marché"
                >
                  P90: {p90} €
                </button>
              )}
            </div>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Date de vente" required>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={todayIso()}
                className="w-full rounded-md bg-transparent px-3 py-2.5 text-[13px] tabular-nums text-zinc-100 focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                  colorScheme: "dark",
                }}
              />
            </Field>

            <Field label="Frais (port, commission)">
              <div
                className="flex items-center gap-2 rounded-md px-3 py-2.5"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                }}
              >
                <input
                  type="text"
                  inputMode="decimal"
                  value={feesStr}
                  onChange={(e) => setFeesStr(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-transparent text-[13px] tabular-nums text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                />
                <span className="font-mono text-[11px] text-zinc-500">€</span>
              </div>
            </Field>
          </div>

          <Field label="Plateforme de vente" required>
            <div
              className="flex items-center gap-0.5 rounded-md p-[2px]"
              style={{
                background: "rgba(255,255,255,0.02)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            >
              {PLATFORMS.map((p) => {
                const isActive = p === platform;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className="ease-expo flex-1 rounded-[4px] px-2 py-1.5 font-mono text-[10px] tracking-[0.08em] transition-colors"
                    style={{
                      background: isActive ? "#27272A" : "transparent",
                      color: isActive ? "#FAFAFA" : "#71717A",
                    }}
                  >
                    {PLATFORM_LABELS[p]}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Marge live */}
          <div
            className="flex flex-col gap-1 rounded-md p-3"
            style={{
              background: "rgba(255,255,255,0.02)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            <div className="font-mono text-[10px] tracking-[0.18em] text-zinc-600">
              MARGE ESTIMÉE
            </div>
            <div className="mt-1 grid grid-cols-3 gap-2">
              <MargeStat
                label="Brute"
                value={
                  margeBrute != null
                    ? `${margeBrute >= 0 ? "+" : ""}${formatEur(margeBrute)} €`
                    : "—"
                }
                color={margeColor(margeBrute)}
              />
              <MargeStat
                label="Nette"
                value={
                  margeNette != null
                    ? `${margeNette >= 0 ? "+" : ""}${formatEur(margeNette)} €`
                    : "—"
                }
                color={margeColor(margeNette)}
              />
              <MargeStat
                label="Nette %"
                value={
                  margeNettePct != null
                    ? `${margeNettePct >= 0 ? "+" : ""}${margeNettePct.toFixed(1)}%`
                    : "—"
                }
                color={margeColor(margeNettePct)}
              />
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-end gap-2 px-5 py-4"
          style={{ borderTop: "1px solid var(--mk-divider-soft)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="ease-expo rounded-md px-3 py-2 font-mono text-[11px] tracking-[0.1em] text-zinc-400 transition-colors hover:text-zinc-100"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isValid}
            className="ease-expo rounded-md px-4 py-2 font-mono text-[11px] tracking-[0.1em] transition-all"
            style={{
              background: isValid ? "#10B981" : "rgba(16,185,129,0.18)",
              color: isValid ? "#FFFFFF" : "#71717A",
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            CONFIRMER LA VENTE
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="font-mono text-[10px] tracking-[0.14em] text-zinc-500">
        {label.toUpperCase()}
        {required && <span style={{ color: "#10B981" }}> *</span>}
      </div>
      {children}
    </div>
  );
}

function MargeStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="font-mono text-[9.5px] tracking-[0.14em] text-zinc-600">
        {label.toUpperCase()}
      </div>
      <div
        className="mt-0.5 font-mono text-[14px] font-medium tabular-nums"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}