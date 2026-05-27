import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Lock, Info } from "lucide-react";
import { useAccountingSettings } from "@/lib/useAccountingSettings";
import {
  ACCOUNTING_CATEGORIES_META,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  KIND_COLOR,
  newAccountingEntryId,
  type AccountingCategory,
  type AccountingEntry,
  type AccountingKind,
  type ExpenseCategory,
  type IncomeCategory,
} from "./accountingDatasets";

const todayIso = () => new Date().toISOString().slice(0, 10);

type Props = {
  open: boolean;
  mode: "add" | "edit";
  initial?: AccountingEntry | null;
  onClose: () => void;
  onSubmit: (entry: AccountingEntry) => void;
};

export default function AccountingEntryModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: Props) {
  const [kind, setKind] = useState<AccountingKind>("expense");
  const [category, setCategory] = useState<AccountingCategory>("shipping_out");
  const [amountStr, setAmountStr] = useState("");
  const [date, setDate] = useState<string>(todayIso());
  const [note, setNote] = useState("");
  const [isProfessional, setIsProfessional] = useState(false);

  const { settings } = useAccountingSettings();
  const regime = settings.regime;

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setKind(initial.kind);
      setCategory(initial.category);
      setAmountStr(String(initial.amount_eur));
      setDate(initial.date);
      setNote(initial.note);
      setIsProfessional(initial.is_professional);
    } else {
      setKind("expense");
      setCategory("shipping_out");
      setAmountStr("");
      setDate(todayIso());
      setNote("");
      setIsProfessional(false);
    }
  }, [open, mode, initial]);

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

  const handleKindChange = (next: AccountingKind) => {
    if (mode === "edit") return;
    if (next === kind) return;
    setKind(next);
    setCategory(next === "expense" ? "shipping_out" : "refund");
  };

  const categoryOptions: AccountingCategory[] = useMemo(
    () =>
      kind === "expense"
        ? (EXPENSE_CATEGORIES as ExpenseCategory[])
        : (INCOME_CATEGORIES as IncomeCategory[]),
    [kind],
  );

  if (!open) return null;

  const amount = Number.parseFloat(amountStr.replace(",", "."));
  const amountValid = Number.isFinite(amount) && amount > 0;
  const dateValid =
    date.length === 10 && new Date(date).getTime() <= Date.now();
  const isValid = amountValid && dateValid && category != null;

  const accent = KIND_COLOR[kind];
  const submitLabel =
    mode === "edit"
      ? "ENREGISTRER LES MODIFICATIONS"
      : kind === "expense"
        ? "ENREGISTRER LA DÉPENSE"
        : "ENREGISTRER LE GAIN";

  const handleSubmit = () => {
    if (!isValid) return;
    if (mode === "edit" && initial) {
      const patched: AccountingEntry = {
        ...initial,
        category,
        amount_eur: Math.round(Math.abs(amount) * 100) / 100,
        date,
        note: note.trim(),
        is_professional: kind === "expense" ? isProfessional : false,
      };
      onSubmit(patched);
    } else {
      const entry: AccountingEntry = {
        id: newAccountingEntryId(),
        kind,
        category,
        amount_eur: Math.round(Math.abs(amount) * 100) / 100,
        date,
        note: note.trim(),
        is_professional: kind === "expense" ? isProfessional : false,
        created_at: new Date().toISOString(),
      };
      onSubmit(entry);
    }
    onClose();
  };

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
              COMPTES · {mode === "edit" ? "MODIFIER UNE ENTRÉE" : "AJOUTER UNE ENTRÉE"}
            </div>
            <div className="mt-1 text-[15px] font-medium text-zinc-100">
              {mode === "edit" ? "Modifier l'entrée" : "Nouvelle entrée comptable"}
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
          <Field label="Type" required>
            <KindSegment
              value={kind}
              onChange={handleKindChange}
              locked={mode === "edit"}
            />
          </Field>

          <Field label="Catégorie" required>
            <CategoryDropdown
              value={category}
              options={categoryOptions}
              onChange={setCategory}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Montant" required>
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
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-[13px] tabular-nums text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                />
                <span className="font-mono text-[11px] text-zinc-500">€</span>
              </div>
            </Field>

            <Field label="Date" required>
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
          </div>

          <Field label="Note (optionnel)">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder={
                kind === "expense"
                  ? "Description (ex: Mondial Relay vente RTX 4080)"
                  : "Description (ex: Remboursement LBC litige X)"
              }
              className="w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.02)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            />
          </Field>

          {kind === "expense" && regime !== "particulier" && (
            <ProfessionalToggle
              value={isProfessional}
              onChange={setIsProfessional}
              regime={regime}
            />
          )}
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
              background: isValid ? accent : "rgba(255,255,255,0.06)",
              color: isValid ? "#FFFFFF" : "#71717A",
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            {submitLabel}
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

function KindSegment({
  value,
  onChange,
  locked,
}: {
  value: AccountingKind;
  onChange: (next: AccountingKind) => void;
  locked?: boolean;
}) {
  const opts: Array<{ key: AccountingKind; label: string; color: string }> = [
    { key: "expense", label: "DÉPENSE", color: KIND_COLOR.expense },
    { key: "income", label: "GAIN", color: KIND_COLOR.income },
  ];
  return (
    <div
      className="flex items-center gap-1 rounded-md p-[3px]"
      style={{
        background: "rgba(255,255,255,0.02)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        opacity: locked ? 0.6 : 1,
        cursor: locked ? "not-allowed" : "default",
      }}
    >
      {opts.map((opt) => {
        const isActive = opt.key === value;
        return (
          <button
            key={opt.key}
            type="button"
            disabled={locked}
            onClick={() => onChange(opt.key)}
            className="ease-expo flex-1 rounded-[4px] px-3 py-2 font-mono text-[11px] tracking-[0.12em] transition-colors"
            style={{
              background: isActive
                ? opt.key === "expense"
                  ? "rgba(239,68,68,0.10)"
                  : "rgba(16,185,129,0.10)"
                : "transparent",
              color: isActive ? opt.color : "#71717A",
              boxShadow: isActive ? `inset 0 0 0 1px ${opt.color}` : undefined,
              cursor: locked ? "not-allowed" : "pointer",
            }}
          >
            {opt.label}
            {locked && isActive && (
              <Lock
                className="ml-1.5 inline-block h-3 w-3"
                strokeWidth={1.5}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function CategoryDropdown({
  value,
  options,
  onChange,
}: {
  value: AccountingCategory;
  options: AccountingCategory[];
  onChange: (next: AccountingCategory) => void;
}) {
  return (
    <div
      className="rounded-md"
      style={{
        background: "rgba(255,255,255,0.02)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AccountingCategory)}
        className="w-full bg-transparent px-3 py-2.5 text-[13px] text-zinc-100 focus:outline-none"
        style={{ colorScheme: "dark" }}
      >
        {options.map((cat) => {
          const meta = ACCOUNTING_CATEGORIES_META[cat];
          return (
            <option key={cat} value={cat} style={{ background: "#18181B" }}>
              {meta.label}
            </option>
          );
        })}
      </select>
    </div>
  );
}
function ProfessionalToggle({
  value,
  onChange,
  regime,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  regime: "particulier" | "micro_bic" | "reel";
}) {
  const isReel = regime === "reel";
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="ease-expo flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
        style={{
          background: "rgba(255,255,255,0.02)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        }}
        aria-pressed={value}
      >
        <span
          className="ease-expo relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
          style={{
            background: value
              ? "rgba(16,185,129,0.4)"
              : "rgba(255,255,255,0.08)",
          }}
        >
          <span
            className="ease-expo absolute h-4 w-4 rounded-full bg-white transition-transform"
            style={{ transform: value ? "translateX(18px)" : "translateX(2px)" }}
          />
        </span>
        <div className="flex flex-col">
          <span className="text-[13px] font-medium text-zinc-100">
            Dépense professionnelle
          </span>
          <span className="text-[11px] text-zinc-500">
            {isReel
              ? value
                ? "Sera déduite du bénéfice imposable au régime réel."
                : "Coche si cette dépense est liée à ton activité."
              : "En micro-BIC, l'abattement forfaitaire de 71 % remplace toute déduction. Le marquage reste utile pour ton suivi."}
          </span>
        </div>
      </button>
      {!isReel && (
        <div className="flex items-start gap-1.5 px-1 text-[10.5px] leading-relaxed text-zinc-600">
          <Info className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={1.5} />
          <span>Champ informatif tant que tu restes en micro-BIC.</span>
        </div>
      )}
    </div>
  );
}
