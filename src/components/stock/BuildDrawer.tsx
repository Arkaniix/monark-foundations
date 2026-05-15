import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronUp,
  ChevronDown,
  Settings,
  Plus,
  Search,
  Trash2,
  Tag,
  Euro,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Copy,
  AlertTriangle,
} from "lucide-react";
import {
  type Build,
  type BuildComponent,
  type BuildComponentKind,
  BUILD_COMPONENT_KIND_BADGE,
  BUILD_EVENT_COLOR,
  BUILD_EVENT_LABEL,
  BUILD_STATUS_BADGE_STYLE,
  BUILD_STATUS_LABELS,
  buildComponentFromStockItem,
  getBuildTotalCost,
  getBuildComponentsBreakdown,
  getBuildDuration,
  getBuildMarge,
  newBuildComponentId,
} from "./buildsDatasets";
import {
  type StockItem,
  formatDateShortFR,
  formatEur,
} from "./datasets";
import {
  HARDWARE_CATEGORIES,
  type HardwareCategory,
} from "@/components/catalog/datasets";
import DropdownSelect, { type DropdownItem } from "./DropdownSelect";

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
  build: Build | null;
  visibleBuilds: Build[];
  availableStockItems: StockItem[];
  onClose: () => void;
  onSelectBuild: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Build>) => void;
  onAddComponent: (id: string, c: BuildComponent) => boolean;
  onRemoveComponent: (buildId: string, componentId: string) => void;
  onMarkAsTested: (id: string) => void;
  onMarkAsUntested: (id: string) => void;
  onMarkAsListed: (id: string) => void;
  onMarkAsDelisted: (id: string) => void;
  onOpenSold: (b: Build) => void;
  onCancelSale: (id: string, mode: "listed" | "returned") => void;
  onMarkAsFailed: (id: string) => void;
  onResume: (id: string, mode: "reinject" | "keep_pieces") => void;
  onReSellFromReturned: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function BuildDrawer({
  open,
  build,
  visibleBuilds,
  availableStockItems,
  onClose,
  onSelectBuild,
  onUpdate,
  onAddComponent,
  onRemoveComponent,
  onMarkAsTested,
  onMarkAsUntested,
  onMarkAsListed,
  onMarkAsDelisted,
  onOpenSold,
  onCancelSale,
  onMarkAsFailed,
  onResume,
  onReSellFromReturned,
  onDuplicate,
  onDelete,
}: Props) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmResume, setConfirmResume] = useState(false);
  const [confirmFailed, setConfirmFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
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
    setConfirmCancel(false);
    setConfirmResume(false);
    setConfirmFailed(false);
  }, [build?.id, open]);

  const idx = useMemo(() => {
    if (!build) return -1;
    return visibleBuilds.findIndex((b) => b.id === build.id);
  }, [build, visibleBuilds]);

  if (!open || !build) return null;

  const canPrev = idx > 0;
  const canNext = idx >= 0 && idx < visibleBuilds.length - 1;

  const goPrev = () => canPrev && onSelectBuild(visibleBuilds[idx - 1].id);
  const goNext = () => canNext && onSelectBuild(visibleBuilds[idx + 1].id);

  const badge = BUILD_STATUS_BADGE_STYLE[build.status];
  const cost = getBuildTotalCost(build);
  const marge = getBuildMarge(build);
  const duration = getBuildDuration(build);
  const breakdown = getBuildComponentsBreakdown(build);
  const isHistory =
    build.status === "sold" ||
    build.status === "returned" ||
    build.status === "failed";

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
        className="absolute right-0 top-0 flex h-full w-full max-w-[520px] flex-col overflow-hidden"
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
              aria-label="Build précédent"
              className="ease-expo flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-white/[0.06] disabled:opacity-40"
            >
              <ChevronUp className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canNext}
              aria-label="Build suivant"
              className="ease-expo flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-white/[0.06] disabled:opacity-40"
            >
              <ChevronDown className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            </button>
            <span className="ml-1 font-mono text-[10px] tracking-[0.18em] text-zinc-500 tabular-nums">
              {idx + 1} / {visibleBuilds.length}
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
              <Settings className="h-4 w-4 text-zinc-500" strokeWidth={1.5} />
            </div>
            <div className="flex min-w-0 flex-col">
              <InlineNameField
                value={build.name}
                onSave={(name) => onUpdate(build.id, { name })}
              />
              <div className="font-mono text-[10px] tracking-[0.16em] text-zinc-500">
                {build.short_id} · créé {formatDateShortFR(build.created_at)}
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

        {/* Status bar */}
        <div
          className="flex items-center gap-2 px-5 py-2.5"
          style={{ borderBottom: "1px solid var(--mk-divider-soft)" }}
        >
          <span
            className="inline-flex items-center rounded px-2 py-0.5 font-mono text-[10px] tracking-[0.18em]"
            style={{ background: badge.bg, color: badge.fg }}
          >
            {BUILD_STATUS_LABELS[build.status].toUpperCase()}
          </span>
          <span className="font-mono text-[10px] tracking-[0.16em] text-zinc-600">
            {build.components.length} pièce{build.components.length > 1 ? "s" : ""}
          </span>
          <span className="ml-auto font-mono text-[10px] tracking-[0.16em] text-zinc-600">
            {duration} j
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* §01 RÉSUMÉ */}
          <SectionHeader idx="01" label="RÉSUMÉ" />
          <div className="grid grid-cols-2 gap-3 px-5 py-4">
            <ReadStat
              label="COÛT TOTAL"
              value={`${formatEur(cost)} €`}
              big
            />
            <InlineNumberField
              label="PRIX VENTE ATTENDU"
              value={build.expected_sale_price_eur}
              onSave={(v) =>
                onUpdate(build.id, { expected_sale_price_eur: v })
              }
              placeholder="—"
            />
            <ReadStat
              label="MARGE"
              value={
                marge
                  ? `${marge.eur >= 0 ? "+" : ""}${formatEur(marge.eur)} € · ${marge.pct >= 0 ? "+" : ""}${marge.pct.toFixed(1)}%`
                  : "—"
              }
              valueColor={
                marge
                  ? marge.eur > 0
                    ? "#10B981"
                    : marge.eur < 0
                      ? "#EF4444"
                      : "#71717A"
                  : "#71717A"
              }
            />
            <ReadStat label="COMPOSITION" value={breakdown.formatted} />
            {build.status === "sold" || build.status === "returned" ? (
              <>
                <ReadStat
                  label="PRIX VENTE"
                  value={
                    build.sale_price_eur != null
                      ? `${formatEur(build.sale_price_eur)} €`
                      : "—"
                  }
                />
                <ReadStat
                  label="DATE VENTE"
                  value={
                    build.sale_date ? formatDateShortFR(build.sale_date) : "—"
                  }
                />
              </>
            ) : null}
          </div>

          {/* §02 COMPOSANTS */}
          <SectionHeader idx="02" label="COMPOSANTS" />
          <div className="flex flex-col gap-2 px-5 py-4">
            {build.components.length === 0 ? (
              <div className="rounded-md px-3 py-4 text-center text-[12px] text-zinc-500"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                }}
              >
                Aucun composant. Ajoutez votre première pièce ci-dessous.
              </div>
            ) : (
              build.components.map((c) => (
                <ComponentRow
                  key={c.id}
                  component={c}
                  onRemove={() => onRemoveComponent(build.id, c.id)}
                  removable={!isHistory}
                />
              ))
            )}

            {!isHistory && (
              <ComponentPicker
                buildId={build.id}
                availableStockItems={availableStockItems}
                onAdd={(c) => onAddComponent(build.id, c)}
              />
            )}
          </div>

          {/* §03 NOTES */}
          <NotesSection
            value={build.notes}
            onSave={(notes) => onUpdate(build.id, { notes })}
          />

          {/* §04 ÉVÉNEMENTS */}
          <SectionHeader idx="04" label="ÉVÉNEMENTS" />
          <div className="px-5 pb-6 pt-3">
            <ol className="flex flex-col gap-2.5">
              {[...(build.events ?? [])].reverse().map((ev, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: BUILD_EVENT_COLOR[ev.type] }}
                  />
                  <div className="flex flex-1 items-baseline justify-between gap-2">
                    <span className="text-[12px] text-zinc-300">
                      {BUILD_EVENT_LABEL[ev.type]}
                      {ev.payload?.component_label && (
                        <span className="font-mono text-[11px] text-zinc-500">
                          {" "}
                          · {ev.payload.component_label}
                        </span>
                      )}
                      {ev.payload?.sale_price_eur != null && (
                        <span className="font-mono text-[11px] tabular-nums text-zinc-500">
                          {" "}
                          · {formatEur(ev.payload.sale_price_eur)} €
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
          <FooterActions
            build={build}
            confirmCancel={confirmCancel}
            setConfirmCancel={setConfirmCancel}
            confirmResume={confirmResume}
            setConfirmResume={setConfirmResume}
            confirmFailed={confirmFailed}
            setConfirmFailed={setConfirmFailed}
            onMarkAsTested={() => onMarkAsTested(build.id)}
            onMarkAsUntested={() => onMarkAsUntested(build.id)}
            onMarkAsListed={() => onMarkAsListed(build.id)}
            onMarkAsDelisted={() => onMarkAsDelisted(build.id)}
            onMarkAsFailed={() => onMarkAsFailed(build.id)}
            onOpenSold={() => onOpenSold(build)}
            onCancelSaleListed={() => onCancelSale(build.id, "listed")}
            onCancelSaleReturned={() => onCancelSale(build.id, "returned")}
            onResumeReinject={() => onResume(build.id, "reinject")}
            onResumeKeep={() => onResume(build.id, "keep_pieces")}
            onReSell={() => onReSellFromReturned(build.id)}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDuplicate(build.id)}
              className="ease-expo flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 font-mono text-[10.5px] tracking-[0.14em] text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-100"
            >
              <Copy className="h-3 w-3" strokeWidth={1.5} />
              Dupliquer
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete(build.id);
                onClose();
              }}
              className="ease-expo flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 font-mono text-[10.5px] tracking-[0.14em] text-zinc-600 transition-colors hover:bg-red-500/[0.08] hover:text-red-400"
            >
              <Trash2 className="h-3 w-3" strokeWidth={1.5} />
              Supprimer
            </button>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

// ===========================================================================
// Footer actions par statut
// ===========================================================================

type FooterProps = {
  build: Build;
  confirmCancel: boolean;
  setConfirmCancel: (v: boolean) => void;
  confirmResume: boolean;
  setConfirmResume: (v: boolean) => void;
  confirmFailed: boolean;
  setConfirmFailed: (v: boolean) => void;
  onMarkAsTested: () => void;
  onMarkAsUntested: () => void;
  onMarkAsListed: () => void;
  onMarkAsDelisted: () => void;
  onMarkAsFailed: () => void;
  onOpenSold: () => void;
  onCancelSaleListed: () => void;
  onCancelSaleReturned: () => void;
  onResumeReinject: () => void;
  onResumeKeep: () => void;
  onReSell: () => void;
};

function FooterActions(p: FooterProps) {
  const { build } = p;
  const noComponents = build.components.length === 0;
  if (build.status === "in_progress") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <PrimaryBtn
          color="#09B1BA"
          icon={<ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />}
          onClick={p.onMarkAsTested}
          disabled={noComponents}
        >
          MARQUER TESTÉ
        </PrimaryBtn>
        {p.confirmFailed ? (
          <div className="flex gap-1">
            <PrimaryBtn color="#EF4444" onClick={p.onMarkAsFailed}>
              CONFIRMER ÉCHEC
            </PrimaryBtn>
            <PrimaryBtn
              color="#71717A"
              onClick={() => p.setConfirmFailed(false)}
            >
              ANNULER
            </PrimaryBtn>
          </div>
        ) : (
          <PrimaryBtn
            color="#EF4444"
            icon={<AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />}
            onClick={() => p.setConfirmFailed(true)}
            disabled={noComponents}
          >
            ÉCHEC TEST
          </PrimaryBtn>
        )}
      </div>
    );
  }
  if (build.status === "tested") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <PrimaryBtn
          color="#F59E0B"
          icon={<Tag className="h-3.5 w-3.5" strokeWidth={1.5} />}
          onClick={p.onMarkAsListed}
        >
          METTRE EN VENTE
        </PrimaryBtn>
        <PrimaryBtn
          color="#71717A"
          icon={<ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />}
          onClick={p.onMarkAsUntested}
        >
          RETOUR MONTAGE
        </PrimaryBtn>
      </div>
    );
  }
  if (build.status === "listed") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <PrimaryBtn
          color="#10B981"
          icon={<Euro className="h-3.5 w-3.5" strokeWidth={1.5} />}
          onClick={p.onOpenSold}
        >
          MARQUER VENDU
        </PrimaryBtn>
        <PrimaryBtn
          color="#71717A"
          icon={<ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />}
          onClick={p.onMarkAsDelisted}
        >
          RETIRER VENTE
        </PrimaryBtn>
      </div>
    );
  }
  if (build.status === "sold") {
    return p.confirmCancel ? (
      <div className="grid grid-cols-2 gap-2">
        <PrimaryBtn color="#3B82F6" onClick={p.onCancelSaleListed}>
          REMETTRE EN LISTÉ
        </PrimaryBtn>
        <PrimaryBtn color="#71717A" onClick={p.onCancelSaleReturned}>
          RETOURNÉ
        </PrimaryBtn>
      </div>
    ) : (
      <PrimaryBtn
        color="#71717A"
        icon={<RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />}
        onClick={() => p.setConfirmCancel(true)}
      >
        ANNULER LA VENTE
      </PrimaryBtn>
    );
  }
  if (build.status === "returned") {
    return (
      <PrimaryBtn
        color="#10B981"
        icon={<Euro className="h-3.5 w-3.5" strokeWidth={1.5} />}
        onClick={p.onReSell}
      >
        RE-MARQUER VENDU
      </PrimaryBtn>
    );
  }
  if (build.status === "failed") {
    return p.confirmResume ? (
      <div className="grid grid-cols-2 gap-2">
        <PrimaryBtn color="#3B82F6" onClick={p.onResumeReinject}>
          RÉINJECTER PIÈCES
        </PrimaryBtn>
        <PrimaryBtn color="#71717A" onClick={p.onResumeKeep}>
          GARDER CONSOMMÉES
        </PrimaryBtn>
      </div>
    ) : (
      <PrimaryBtn
        color="#3B82F6"
        icon={<RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />}
        onClick={() => p.setConfirmResume(true)}
      >
        REPRENDRE LE BUILD
      </PrimaryBtn>
    );
  }
  return null;
}

function PrimaryBtn({
  color,
  icon,
  children,
  onClick,
  disabled,
}: {
  color: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="ease-expo flex w-full items-center justify-center gap-1.5 rounded-md py-2 font-mono text-[10.5px] tracking-[0.14em] transition-all"
      style={{
        background: disabled ? "rgba(255,255,255,0.04)" : `${color}24`,
        color: disabled ? "#52525B" : color,
        boxShadow: disabled
          ? "inset 0 0 0 1px rgba(255,255,255,0.04)"
          : `inset 0 0 0 1px ${color}55`,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

// ===========================================================================
// Sections / helpers
// ===========================================================================

function SectionHeader({ idx, label }: { idx: string; label: string }) {
  return (
    <div className="flex items-center gap-3 px-5 pt-5">
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

function ReadStat({
  label,
  value,
  valueColor = "#FAFAFA",
  big,
}: {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
  big?: boolean;
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
      <div
        className={`font-mono ${big ? "text-[18px] font-medium" : "text-[13px]"} tabular-nums`}
        style={{ color: valueColor }}
      >
        {value}
      </div>
    </div>
  );
}

function InlineNumberField({
  label,
  value,
  onSave,
  placeholder,
}: {
  label: string;
  value: number | null;
  onSave: (v: number | null) => void;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value != null ? String(value) : "");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => setDraft(value != null ? String(value) : ""), [value]);
  useEffect(() => {
    if (editing && ref.current) ref.current.select();
  }, [editing]);
  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) onSave(null);
    else {
      const n = Math.round(Number.parseFloat(trimmed.replace(",", ".")));
      if (Number.isFinite(n) && n > 0) onSave(n);
    }
    setEditing(false);
  };
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
      {editing ? (
        <input
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(value != null ? String(value) : "");
              setEditing(false);
            }
          }}
          className="bg-transparent font-mono text-[13px] tabular-nums text-zinc-100 focus:outline-none"
          placeholder={placeholder}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="ease-expo text-left font-mono text-[13px] tabular-nums text-zinc-100 transition-colors hover:text-white"
        >
          {value != null ? `${formatEur(value)} €` : (placeholder ?? "—")}
        </button>
      )}
    </div>
  );
}

function InlineNameField({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (editing && ref.current) ref.current.select();
  }, [editing]);
  const commit = () => {
    const next = draft.trim();
    if (next) onSave(next);
    setEditing(false);
  };
  if (editing) {
    return (
      <input
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className="bg-transparent text-[15px] font-medium text-zinc-100 focus:outline-none"
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="ease-expo truncate text-left text-[15px] font-medium text-zinc-100 transition-colors hover:text-white"
    >
      {value}
    </button>
  );
}

function NotesSection({
  value,
  onSave,
}: {
  value: string | null;
  onSave: (v: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => setDraft(value ?? ""), [value]);
  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.setSelectionRange(
        ref.current.value.length,
        ref.current.value.length,
      );
    }
  }, [editing]);
  const commit = () => {
    onSave(draft.trim() || null);
    setEditing(false);
  };
  return (
    <>
      <div className="flex items-center gap-3 px-5 pt-5">
        <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-600">
          § 03
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
                setDraft(value ?? "");
                setEditing(false);
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
// Component row
// ===========================================================================

function ComponentRow({
  component,
  onRemove,
  removable,
}: {
  component: BuildComponent;
  onRemove: () => void;
  removable: boolean;
}) {
  const badge = BUILD_COMPONENT_KIND_BADGE[component.kind];
  return (
    <div
      className="group flex items-center gap-3 rounded-md px-3 py-2.5"
      style={{
        background: "rgba(255,255,255,0.02)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      <span
        className="inline-flex shrink-0 items-center rounded px-1.5 py-0.5 font-mono text-[9px] tracking-[0.14em]"
        style={{ background: badge.bg, color: badge.fg }}
      >
        {badge.label}
      </span>
      <span className="font-mono text-[10px] tracking-[0.14em] text-zinc-600">
        {component.category_snapshot}
      </span>
      <span className="flex-1 truncate text-[12.5px] text-zinc-100">
        {component.label}
      </span>
      <span className="font-mono text-[12px] tabular-nums text-zinc-300">
        {component.purchase_price_eur > 0
          ? `${formatEur(component.purchase_price_eur)} €`
          : "0 €"}
      </span>
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Retirer"
          className="ease-expo flex h-6 w-6 items-center justify-center rounded text-zinc-600 opacity-0 transition-all hover:bg-red-500/[0.08] hover:text-red-400 group-hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}

// ===========================================================================
// Multi-mode component picker (DU STOCK / ACHAT NEUF / DÉTENUE)
// ===========================================================================

type PickerMode = BuildComponentKind;

const PICKER_TABS: Array<{ key: PickerMode; label: string; color: string }> = [
  { key: "stock_item", label: "DU STOCK", color: "#60A5FA" },
  { key: "new_purchase", label: "ACHAT NEUF", color: "#F59E0B" },
  { key: "owned_no_cost", label: "DÉTENUE", color: "#A1A1AA" },
];

function ComponentPicker({
  buildId: _buildId,
  availableStockItems,
  onAdd,
}: {
  buildId: string;
  availableStockItems: StockItem[];
  onAdd: (c: BuildComponent) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PickerMode>("stock_item");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ease-expo flex items-center justify-center gap-2 rounded-md py-2.5 font-mono text-[11px] tracking-[0.12em] transition-colors"
        style={{
          background: "rgba(59,130,246,0.08)",
          color: "#60A5FA",
          boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.24)",
        }}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
        AJOUTER UNE PIÈCE
      </button>
    );
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-md p-3"
      style={{
        background: "rgba(255,255,255,0.02)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div
          className="flex h-[28px] flex-1 items-center gap-0.5 rounded-md p-[2px]"
          style={{
            background: "rgba(255,255,255,0.02)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {PICKER_TABS.map((t) => {
            const active = t.key === mode;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setMode(t.key)}
                className="ease-expo flex-1 rounded-[4px] py-1 font-mono text-[10px] tracking-[0.1em] transition-colors"
                style={{
                  background: active ? "#27272A" : "transparent",
                  color: active ? t.color : "#71717A",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fermer le sélecteur"
          className="ease-expo flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {mode === "stock_item" && (
        <StockFlow
          items={availableStockItems}
          onPick={(item) => {
            const ok = onAdd(buildComponentFromStockItem(item));
            if (ok) setOpen(false);
          }}
        />
      )}
      {mode === "new_purchase" && (
        <ManualFlow
          kind="new_purchase"
          onAdd={(c) => {
            const ok = onAdd(c);
            if (ok) setOpen(false);
          }}
        />
      )}
      {mode === "owned_no_cost" && (
        <ManualFlow
          kind="owned_no_cost"
          onAdd={(c) => {
            const ok = onAdd(c);
            if (ok) setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function StockFlow({
  items,
  onPick,
}: {
  items: StockItem[];
  onPick: (item: StockItem) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const norm = q.trim().toLowerCase();
    const base = items;
    if (!norm) return base.slice(0, 30);
    return base
      .filter(
        (it) =>
          it.model_name_snapshot.toLowerCase().includes(norm) ||
          it.category_snapshot.toLowerCase().includes(norm),
      )
      .slice(0, 30);
  }, [items, q]);

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex h-[30px] items-center gap-2 rounded-md px-3"
        style={{
          background: "rgba(255,255,255,0.02)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        <Search className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un item du stock…"
          className="flex-1 bg-transparent text-[12.5px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
        />
      </div>
      {items.length === 0 ? (
        <div className="rounded-md px-3 py-3 text-center text-[11.5px] text-zinc-500">
          Aucun item disponible (en stock et non rattaché à un build).
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md px-3 py-3 text-center text-[11.5px] text-zinc-500">
          Aucun résultat.
        </div>
      ) : (
        <div
          className="flex max-h-[260px] flex-col gap-1 overflow-y-auto rounded-md"
          style={{ scrollbarWidth: "thin" }}
        >
          {filtered.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => onPick(it)}
              className="ease-expo flex items-center gap-3 rounded px-2.5 py-2 text-left transition-colors hover:bg-white/[0.04]"
            >
              <span className="font-mono text-[10px] tracking-[0.14em] text-zinc-600">
                {it.category_snapshot}
              </span>
              <span className="flex-1 truncate text-[12px] text-zinc-100">
                {it.model_name_snapshot}
              </span>
              <span className="font-mono text-[11.5px] tabular-nums text-zinc-400">
                {formatEur(it.purchase_price_eur)} €
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const CATEGORY_PICK_OPTIONS: Array<DropdownItem<HardwareCategory | "OTHER">> = [
  ...HARDWARE_CATEGORIES.map((c) => ({
    type: "option" as const,
    value: c as HardwareCategory | "OTHER",
    label: c,
  })),
  { type: "option", value: "OTHER" as HardwareCategory | "OTHER", label: "OTHER" },
];

function ManualFlow({
  kind,
  onAdd,
}: {
  kind: "new_purchase" | "owned_no_cost";
  onAdd: (c: BuildComponent) => void;
}) {
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<HardwareCategory | "OTHER">("OTHER");
  const [priceStr, setPriceStr] = useState("");
  const [notes, setNotes] = useState("");
  const isNew = kind === "new_purchase";

  const price = isNew ? Number.parseFloat(priceStr.replace(",", ".")) : 0;
  const isValid =
    label.trim().length > 0 &&
    (!isNew || (Number.isFinite(price) && price >= 0));

  const submit = () => {
    if (!isValid) return;
    onAdd({
      id: newBuildComponentId(),
      kind,
      stock_item_id: null,
      label: label.trim(),
      category_snapshot: category,
      purchase_price_eur: isNew ? Math.round(price) : 0,
      notes: notes.trim() || null,
      added_at: new Date().toISOString(),
    });
    setLabel("");
    setPriceStr("");
    setNotes("");
  };

  return (
    <div className="flex flex-col gap-2.5">
      <ManualField label="LIBELLÉ">
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="ex. Câbles modulaires Corsair"
          className="w-full bg-transparent px-3 py-2 text-[12.5px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
          style={{
            background: "rgba(255,255,255,0.02)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
            borderRadius: 6,
          }}
        />
      </ManualField>
      <div className="grid grid-cols-2 gap-2">
        <ManualField label="CATÉGORIE">
          <DropdownSelect<HardwareCategory | "OTHER">
            value={category}
            label={category}
            items={CATEGORY_PICK_OPTIONS}
            onChange={setCategory}
            minWidth={120}
          />
        </ManualField>
        {isNew && (
          <ManualField label="PRIX (€)">
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{
                background: "rgba(255,255,255,0.02)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                borderRadius: 6,
              }}
            >
              <input
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                inputMode="decimal"
                placeholder="0"
                className="flex-1 bg-transparent text-[12.5px] tabular-nums text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
              />
              <span className="font-mono text-[10px] text-zinc-500">€</span>
            </div>
          </ManualField>
        )}
      </div>
      <ManualField label="NOTES (OPTIONNEL)">
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="—"
          className="w-full bg-transparent px-3 py-2 text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
          style={{
            background: "rgba(255,255,255,0.02)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
            borderRadius: 6,
          }}
        />
      </ManualField>
      <button
        type="button"
        onClick={submit}
        disabled={!isValid}
        className="ease-expo mt-1 flex items-center justify-center gap-1.5 rounded-md py-2 font-mono text-[10.5px] tracking-[0.14em] transition-all"
        style={{
          background: isValid ? "rgba(59,130,246,0.14)" : "rgba(255,255,255,0.04)",
          color: isValid ? "#3B82F6" : "#52525B",
          boxShadow: isValid
            ? "inset 0 0 0 1px rgba(59,130,246,0.32)"
            : "inset 0 0 0 1px rgba(255,255,255,0.04)",
          cursor: isValid ? "pointer" : "not-allowed",
        }}
      >
        <Plus className="h-3 w-3" strokeWidth={1.5} />
        AJOUTER LA PIÈCE
      </button>
    </div>
  );
}

function ManualField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="font-mono text-[9.5px] tracking-[0.14em] text-zinc-600">
        {label}
      </div>
      {children}
    </div>
  );
}
