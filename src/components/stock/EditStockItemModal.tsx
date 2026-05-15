import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  type StockItem,
  type PlatformKey,
  type ConditionKey,
  type StockStatus,
  PLATFORMS,
  PLATFORM_LABELS,
  CONDITIONS,
  CONDITION_LABELS,
  formatEur,
  formatDateShortFR,
} from "./datasets";
import { CATALOG_MODELS } from "@/components/catalog/mockData";
import type { HardwareCategory } from "@/components/catalog/datasets";
import ModelImage from "@/components/catalog/ModelImage";

export type EditStockItemMode = "edit" | "edit-sale";

type Props = {
  open: boolean;
  item: StockItem | null;
  mode: EditStockItemMode;
  onClose: () => void;
  onSave: (patch: Partial<StockItem>) => void;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function EditStockItemModal({
  open,
  item,
  mode,
  onClose,
  onSave,
}: Props) {
  // Achat
  const [priceStr, setPriceStr] = useState("");
  const [date, setDate] = useState<string>(todayIso());
  const [platform, setPlatform] = useState<PlatformKey>("LBC");
  const [condition, setCondition] = useState<ConditionKey>("TBE");
  const [status, setStatus] = useState<StockStatus>("in_stock");
  const [notes, setNotes] = useState("");
  // Vente
  const [salePriceStr, setSalePriceStr] = useState("");
  const [saleDate, setSaleDate] = useState<string>(todayIso());
  const [salePlatform, setSalePlatform] = useState<PlatformKey>("LBC");
  const [feesStr, setFeesStr] = useState("0");

  useEffect(() => {
    if (open && item) {
      setPriceStr(String(item.purchase_price_eur));
      setDate(item.purchase_date);
      setPlatform(item.purchase_platform);
      setCondition(item.condition);
      setStatus(item.status === "listed" ? "listed" : "in_stock");
      setNotes(item.notes ?? "");
      setSalePriceStr(item.sale_price_eur != null ? String(item.sale_price_eur) : "");
      setSaleDate(item.sale_date ?? todayIso());
      setSalePlatform(item.sale_platform ?? item.purchase_platform);
      setFeesStr(String(item.fees_eur ?? 0));
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

  if (!open || !item) return null;

  const price = Number.parseFloat(priceStr.replace(",", "."));
  const dateOk = date.length === 10 && new Date(date).getTime() <= Date.now();
  const baseValid = Number.isFinite(price) && price > 0 && dateOk;

  const salePrice = Number.parseFloat(salePriceStr.replace(",", "."));
  const fees = Number.parseFloat(feesStr.replace(",", ".")) || 0;
  const saleValid =
    Number.isFinite(salePrice) &&
    salePrice > 0 &&
    saleDate.length === 10 &&
    new Date(saleDate).getTime() <= Date.now();

  const isValid = mode === "edit-sale" ? baseValid && saleValid : baseValid;
  const isHwCat = item.category_snapshot !== "OTHER";
  const catalogModel = item.model_id
    ? CATALOG_MODELS.find((m) => m.id === item.model_id)
    : null;

  const handleSave = () => {
    if (!isValid) return;
    if (mode === "edit-sale") {
      onSave({
        sale_price_eur: Math.round(salePrice),
        sale_date: saleDate,
        sale_platform: salePlatform,
        fees_eur: Math.round(fees),
        notes: notes.trim() || null,
      });
    } else {
      onSave({
        purchase_price_eur: Math.round(price),
        purchase_date: date,
        purchase_platform: platform,
        condition,
        status,
        notes: notes.trim() || null,
      });
    }
    onClose();
  };

  const titleSub =
    mode === "edit-sale" ? "Modifier la vente" : "Modifier l'item";
  const ctaLabel =
    mode === "edit-sale" ? "ENREGISTRER LA VENTE" : "ENREGISTRER";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
      style={{ background: "rgba(0,0,0,0.72)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] overflow-hidden rounded-lg"
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
              INVENTAIRE · ÉDITION
            </div>
            <div className="mt-1 text-[15px] font-medium text-zinc-100">
              {titleSub}
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

        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-5 py-5">
          {/* Modèle (lecture seule) */}
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
                {catalogModel
                  ? `médiane ${formatEur(catalogModel.median_eur)} €`
                  : item.category_snapshot}
              </div>
            </div>
          </div>

          {/* Section ACHAT */}
          {mode === "edit-sale" ? (
            <div
              className="flex flex-col gap-1.5 rounded-md p-3"
              style={{
                background: "rgba(255,255,255,0.015)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
              }}
            >
              <div className="font-mono text-[10px] tracking-[0.18em] text-zinc-600">
                ACHAT (LECTURE SEULE)
              </div>
              <div className="font-mono text-[12px] tabular-nums text-zinc-300">
                {formatEur(item.purchase_price_eur)} € ·{" "}
                {formatDateShortFR(item.purchase_date)} ·{" "}
                {PLATFORM_LABELS[item.purchase_platform]} ·{" "}
                {CONDITION_LABELS[item.condition]}
              </div>
            </div>
          ) : (
            <>
              <Field label="Prix d'achat" required>
                <PriceInput value={priceStr} onChange={setPriceStr} />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Date d'achat" required>
                  <DateInput value={date} onChange={setDate} />
                </Field>
                <Field label="Plateforme d'achat">
                  <SegmentRow
                    options={PLATFORMS.map((p) => ({
                      key: p,
                      label: PLATFORM_LABELS[p],
                    }))}
                    value={platform}
                    onChange={(v) => setPlatform(v as PlatformKey)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="État">
                  <SegmentRow
                    compact
                    options={CONDITIONS.map((c) => ({
                      key: c,
                      label: CONDITION_LABELS[c],
                    }))}
                    value={condition}
                    onChange={(v) => setCondition(v as ConditionKey)}
                  />
                </Field>
                <Field label="Status">
                  <SegmentRow
                    options={[
                      { key: "in_stock", label: "En stock" },
                      { key: "listed", label: "Listé" },
                    ]}
                    value={status}
                    onChange={(v) => setStatus(v as StockStatus)}
                  />
                </Field>
              </div>
            </>
          )}

          {/* Section VENTE */}
          {mode === "edit-sale" && (
            <>
              <Field label="Prix de vente" required>
                <PriceInput value={salePriceStr} onChange={setSalePriceStr} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Date de vente" required>
                  <DateInput value={saleDate} onChange={setSaleDate} />
                </Field>
                <Field label="Frais">
                  <PriceInput value={feesStr} onChange={setFeesStr} />
                </Field>
              </div>
              <Field label="Plateforme de vente">
                <SegmentRow
                  options={PLATFORMS.map((p) => ({
                    key: p,
                    label: PLATFORM_LABELS[p],
                  }))}
                  value={salePlatform}
                  onChange={(v) => setSalePlatform(v as PlatformKey)}
                />
              </Field>
            </>
          )}

          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Vendeur, accessoires, remarques…"
              className="w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.02)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            />
          </Field>
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
            onClick={handleSave}
            disabled={!isValid}
            className="ease-expo rounded-md px-4 py-2 font-mono text-[11px] tracking-[0.1em] transition-all"
            style={{
              background: isValid ? "#3B82F6" : "rgba(59,130,246,0.18)",
              color: isValid ? "#FFFFFF" : "#71717A",
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            {ctaLabel}
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
        {required && <span style={{ color: "#3B82F6" }}> *</span>}
      </div>
      {children}
    </div>
  );
}

function PriceInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="flex-1 bg-transparent text-[13px] tabular-nums text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
      />
      <span className="font-mono text-[11px] text-zinc-500">€</span>
    </div>
  );
}

function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      max={todayIso()}
      className="w-full rounded-md bg-transparent px-3 py-2.5 text-[13px] tabular-nums text-zinc-100 focus:outline-none"
      style={{
        background: "rgba(255,255,255,0.02)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        colorScheme: "dark",
      }}
    />
  );
}

function SegmentRow({
  options,
  value,
  onChange,
  compact = false,
}: {
  options: Array<{ key: string; label: string }>;
  value: string;
  onChange: (next: string) => void;
  compact?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-0.5 rounded-md p-[2px]"
      style={{
        background: "rgba(255,255,255,0.02)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      {options.map((opt) => {
        const isActive = opt.key === value;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={`ease-expo flex-1 rounded-[4px] ${compact ? "px-1.5 py-1" : "px-2 py-1.5"} font-mono text-[10px] tracking-[0.08em] transition-colors`}
            style={{
              background: isActive ? "#27272A" : "transparent",
              color: isActive ? "#FAFAFA" : "#71717A",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}