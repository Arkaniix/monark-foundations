import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Lock, Wrench, Info } from "lucide-react";
import type { CatalogModel } from "@/components/catalog/datasets";
import {
  type StockItem,
  type PlatformKey,
  type ConditionKey,
  type StockStatus,
  PLATFORMS,
  PLATFORM_LABELS,
  CONDITIONS,
  CONDITION_LABELS,
  newStockItemId,
  newStockEvent,
} from "./datasets";
import ModelPicker from "./ModelPicker";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (item: StockItem) => void;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function AddStockItemModal({ open, onClose, onAdd }: Props) {
  const [mode, setMode] = useState<"catalog" | "custom">("catalog");
  const [model, setModel] = useState<CatalogModel | null>(null);
  const [customName, setCustomName] = useState("");
  const [priceStr, setPriceStr] = useState("");
  const [date, setDate] = useState<string>(todayIso());
  const [platform, setPlatform] = useState<PlatformKey>("LBC");
  const [condition, setCondition] = useState<ConditionKey>("TBE");
  const [initialStatus, setInitialStatus] = useState<StockStatus>("in_stock");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) {
      setMode("catalog");
      setModel(null);
      setCustomName("");
      setPriceStr("");
      setDate(todayIso());
      setPlatform("LBC");
      setCondition("TBE");
      setInitialStatus("in_stock");
      setNotes("");
    }
  }, [open]);

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

  if (!open) return null;

  const price = Number.parseFloat(priceStr.replace(",", "."));
  const baseValid =
    Number.isFinite(price) &&
    price > 0 &&
    date.length === 10 &&
    new Date(date).getTime() <= Date.now();
  const modelValid =
    mode === "catalog" ? model !== null : customName.trim().length > 0;
  const isValid = baseValid && modelValid;

  const handleSubmit = () => {
    if (!isValid) return;
    const nowIso = new Date().toISOString();
    const isCustom = mode === "custom";
    const trimmedName = customName.trim();
    const item: StockItem = {
      id: newStockItemId(),
      source: isCustom ? "custom" : "catalog",
      model_id: isCustom ? null : model!.id,
      custom_name: isCustom ? trimmedName : null,
      custom_category: isCustom ? "OTHER" : null,
      model_name_snapshot: isCustom ? trimmedName : model!.name,
      category_snapshot: isCustom ? "OTHER" : model!.category,
      purchase_price_eur: Math.round(price),
      purchase_date: date,
      purchase_platform: platform,
      condition,
      notes: notes.trim() || null,
      status: initialStatus,
      sale_price_eur: null,
      sale_date: null,
      sale_platform: null,
      fees_eur: null,
      build_id: null,
      created_at: nowIso,
      events:
        initialStatus === "listed"
          ? [newStockEvent("added"), newStockEvent("listed")]
          : [newStockEvent("added")],
    };
    onAdd(item);
    onClose();
  };

  const suggestedPrice = mode === "catalog" ? model?.median_eur ?? null : null;

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
              INVENTAIRE · AJOUTER UN ITEM
            </div>
            <div className="mt-1 text-[15px] font-medium text-zinc-100">
              Nouvel item de stock
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
          {mode === "catalog" ? (
            <Field label="Modèle" required>
              <ModelPicker
                value={model}
                onChange={setModel}
                onSwitchToCustom={(initialName) => {
                  setMode("custom");
                  setCustomName(initialName);
                }}
              />
            </Field>
          ) : (
            <CustomModelBlock
              name={customName}
              onChangeName={setCustomName}
              onBackToCatalog={() => {
                setMode("catalog");
                setCustomName("");
              }}
            />
          )}

          <Field label="Prix d'achat" required>
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
              {suggestedPrice != null && (
                <button
                  type="button"
                  onClick={() => setPriceStr(String(suggestedPrice))}
                  className="ease-expo rounded-md px-2.5 py-2 font-mono text-[10px] tracking-[0.1em] transition-colors hover:bg-white/[0.04]"
                  style={{
                    color: "#3B82F6",
                    background: "rgba(59,130,246,0.06)",
                    boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.2)",
                  }}
                  title="Pré-remplir avec la médiane Monark"
                >
                  Médiane: {suggestedPrice} €
                </button>
              )}
            </div>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Date d'achat" required>
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
                options={CONDITIONS.map((c) => ({
                  key: c,
                  label: CONDITION_LABELS[c],
                }))}
                value={condition}
                onChange={(v) => setCondition(v as ConditionKey)}
                compact
              />
            </Field>

            <Field label="Status initial">
              <SegmentRow
                options={[
                  { key: "in_stock", label: "En stock" },
                  { key: "listed", label: "Déjà listé" },
                ]}
                value={initialStatus}
                onChange={(v) => setInitialStatus(v as StockStatus)}
              />
            </Field>
          </div>

          <Field label="Notes (optionnel)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Vendeur particulier, état précis, accessoires inclus…"
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
            onClick={handleSubmit}
            disabled={!isValid}
            className="ease-expo rounded-md px-4 py-2 font-mono text-[11px] tracking-[0.1em] transition-all"
            style={{
              background: isValid ? "#3B82F6" : "rgba(59,130,246,0.18)",
              color: isValid ? "#FFFFFF" : "#71717A",
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            AJOUTER À L'INVENTAIRE
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