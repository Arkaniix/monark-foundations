import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Brain,
  BookOpen,
  ChevronDown,
  ChevronRight,
  History as HistoryIcon,
  Check,
  X as XIcon,
  CircleSlash,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { repairApi } from "@/lib/api";
import {
  REPAIR_CATEGORIES,
  OUTCOME_LABELS,
  OUTCOME_COLORS,
  type RepairHistoryPage,
  type RepairHistoryRead,
  type RepairOutcome,
  type SymptomRead,
} from "@/components/repair/datasets";

const LIMIT = 20;

type FilterValue = "all" | "deep" | "consultations";

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Tout" },
  { value: "deep", label: "Diagnostics IA" },
  { value: "consultations", label: "Consultations" },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function categoryLabel(slug: string | null): string | null {
  if (!slug) return null;
  return REPAIR_CATEGORIES.find((c) => c.slug === slug)?.label ?? null;
}

export default function RepairHistory() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [data, setData] = useState<RepairHistoryPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detailById, setDetailById] = useState<Record<number, RepairHistoryRead>>({});
  const [detailLoading, setDetailLoading] = useState<number | null>(null);
  const [outcomePending, setOutcomePending] = useState<number | null>(null);
  const [symptomSlugById, setSymptomSlugById] = useState<Record<number, string>>({});

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    repairApi
      .getHistory(LIMIT, page * LIMIT)
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [page]);

  // Charge la table id→slug des symptômes (pour les liens "Revoir le diagnostic")
  useEffect(() => {
    let mounted = true;
    repairApi
      .getSymptoms()
      .then((list: SymptomRead[]) => {
        if (!mounted) return;
        const map: Record<number, string> = {};
        for (const s of list) map[s.id] = s.slug;
        setSymptomSlugById(map);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    if (filter === "deep") return data.items.filter((i) => i.used_deep);
    if (filter === "consultations") return data.items.filter((i) => !i.used_deep);
    return data.items;
  }, [data, filter]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1;

  async function handleExpand(item: RepairHistoryRead) {
    if (expandedId === item.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(item.id);
    if (!detailById[item.id]) {
      setDetailLoading(item.id);
      try {
        const d = await repairApi.getHistoryDetail(item.id);
        setDetailById((prev) => ({ ...prev, [item.id]: d }));
      } catch {
        // silencieux
      } finally {
        setDetailLoading(null);
      }
    }
  }

  async function setOutcome(item: RepairHistoryRead, outcome: RepairOutcome) {
    setOutcomePending(item.id);
    try {
      const updated = await repairApi.updateOutcome(item.id, { outcome });
      setData((prev) =>
        prev
          ? { ...prev, items: prev.items.map((i) => (i.id === item.id ? updated : i)) }
          : prev,
      );
      setDetailById((prev) => ({ ...prev, [item.id]: updated }));
    } catch {
      // silencieux
    } finally {
      setOutcomePending(null);
    }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div
        className="flex items-center"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.22em",
          marginBottom: 16,
        }}
      >
        <Link
          to="/repair"
          className="ease-expo transition-colors"
          style={{
            color: "#A1A1AA",
            padding: "2px 4px",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#FAFAFA";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#A1A1AA";
          }}
        >
          ← REPAIR GUIDE
        </Link>
        <span style={{ color: "#52525B", padding: "0 4px" }}>/</span>
        <span style={{ color: "#52525B", padding: "2px 4px" }}>HISTORIQUE</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div
          className="font-mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.22em",
            color: "#71717A",
          }}
        >
          § 01 — HISTORIQUE
        </div>
        <h1
          className="mt-1"
          style={{ fontSize: 22, fontWeight: 500, color: "#FAFAFA" }}
        >
          Vos diagnostics
        </h1>
        <p
          className="mt-2"
          style={{ fontSize: 12, color: "#A1A1AA", maxWidth: 640, lineHeight: 1.55 }}
        >
          Retrouvez vos consultations de guides et analyses IA. Indiquez si une
          réparation a réussi pour affiner vos prochains diagnostics.
        </p>
      </div>

      {/* Filtres */}
      <div style={{ marginBottom: 16 }}>
        <SegmentedFilter value={filter} onChange={setFilter} />
      </div>

      {/* Liste */}
      {loading ? (
        <div
          className="font-mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.22em",
            color: "#71717A",
            padding: "32px 0",
          }}
        >
          CHARGEMENT…
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState filter={filter} totalRaw={data?.items.length ?? 0} />
      ) : (
        <div className="flex flex-col" style={{ gap: 8 }}>
          {filteredItems.map((item) => (
            <HistoryRow
              key={item.id}
              item={item}
              expanded={expandedId === item.id}
              detail={detailById[item.id] ?? null}
              detailLoading={detailLoading === item.id}
              outcomeBusy={outcomePending === item.id}
              onToggle={() => handleExpand(item)}
              onSetOutcome={(o) => setOutcome(item, o)}
              onOpenGuide={() => {
                const slug = symptomSlugById[item.symptom_id];
                if (slug) navigate({ to: "/repair/$slug", params: { slug } });
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.total > LIMIT && (
        <div
          className="flex items-center justify-center"
          style={{ gap: 16, marginTop: 24 }}
        >
          <PageBtn
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            ← PRÉCÉDENT
          </PageBtn>
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              color: "#A1A1AA",
            }}
          >
            PAGE {page + 1} / {totalPages}
          </span>
          <PageBtn
            disabled={(page + 1) * LIMIT >= data.total}
            onClick={() => setPage((p) => p + 1)}
          >
            SUIVANT →
          </PageBtn>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   Segmented filter
   ========================================================= */

function SegmentedFilter({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Filtrer l'historique"
      style={{
        display: "inline-flex",
        gap: 2,
        padding: 2,
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 8,
      }}
    >
      {FILTER_OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.color = "#FAFAFA";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.color = "#A1A1AA";
            }}
            style={{
              padding: "7px 14px",
              fontSize: 12,
              background: active ? "#27272A" : "transparent",
              color: active ? "#FAFAFA" : "#A1A1AA",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              transition:
                "background 200ms cubic-bezier(0.16,1,0.3,1), color 200ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   Row
   ========================================================= */

function HistoryRow({
  item,
  expanded,
  detail,
  detailLoading,
  outcomeBusy,
  onToggle,
  onSetOutcome,
  onOpenGuide,
}: {
  item: RepairHistoryRead;
  expanded: boolean;
  detail: RepairHistoryRead | null;
  detailLoading: boolean;
  outcomeBusy: boolean;
  onToggle: () => void;
  onSetOutcome: (o: RepairOutcome) => void;
  onOpenGuide: () => void;
}) {
  const isDeep = item.used_deep;
  const Icon = isDeep ? Brain : BookOpen;
  const iconBg = isDeep ? "rgba(59,130,246,0.10)" : "rgba(255,255,255,0.04)";
  const iconColor = isDeep ? "#3B82F6" : "#71717A";

  const typeBadgeLabel = isDeep
    ? item.credits_spent === 0
      ? "IA · CACHE"
      : `IA · ${item.credits_spent} CR`
    : "CONSULTATION";
  const typeBadgeBg = isDeep
    ? "rgba(59,130,246,0.10)"
    : "rgba(255,255,255,0.04)";
  const typeBadgeColor = isDeep ? "#3B82F6" : "#A1A1AA";
  const typeBadgeBorder = isDeep
    ? "1px solid rgba(59,130,246,0.20)"
    : "1px solid rgba(255,255,255,0.06)";

  const showOutcomeBadge =
    item.outcome && item.outcome !== "pending" ? item.outcome : null;

  const subLine = [
    item.model_name ?? item.custom_name ?? "Modèle non précisé",
    categoryLabel(item.symptom_category),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.015)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 10,
        overflow: "hidden",
        transition: "border-color 200ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        {/* Icône type */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={16} color={iconColor} strokeWidth={1.75} />
        </div>

        {/* Centre */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              color: "#FAFAFA",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.symptom_title ?? "Diagnostic"}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#71717A",
              marginTop: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {subLine}
          </div>
        </div>

        {/* Droite */}
        <div className="flex items-center" style={{ gap: 10, flexShrink: 0 }}>
          {/* Type badge */}
          <span
            className="font-mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.18em",
              padding: "4px 8px",
              borderRadius: 4,
              background: typeBadgeBg,
              color: typeBadgeColor,
              border: typeBadgeBorder,
            }}
          >
            {typeBadgeLabel}
          </span>

          {/* Outcome badge */}
          {showOutcomeBadge ? (
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.18em",
                padding: "4px 8px",
                borderRadius: 4,
                background: `${OUTCOME_COLORS[showOutcomeBadge]}1A`,
                color: OUTCOME_COLORS[showOutcomeBadge],
                border: `1px solid ${OUTCOME_COLORS[showOutcomeBadge]}33`,
                textTransform: "uppercase",
              }}
            >
              {OUTCOME_LABELS[showOutcomeBadge]}
            </span>
          ) : (
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "#52525B",
              }}
            >
              — À RENSEIGNER
            </span>
          )}

          {/* Date */}
          <span
            className="font-mono"
            style={{ fontSize: 10, color: "#52525B", minWidth: 70, textAlign: "right" }}
          >
            {formatDate(item.created_at)}
          </span>

          {/* Chevron */}
          {expanded ? (
            <ChevronDown size={14} color="#71717A" />
          ) : (
            <ChevronRight size={14} color="#71717A" />
          )}
        </div>
      </button>

      {/* Détail */}
      {expanded && (
        <div
          style={{
            padding: "0 16px 16px 66px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {detailLoading ? (
            <div
              className="font-mono flex items-center"
              style={{
                gap: 8,
                fontSize: 11,
                letterSpacing: "0.22em",
                color: "#71717A",
                padding: "16px 0",
              }}
            >
              <Loader2 size={12} className="animate-spin" /> CHARGEMENT…
            </div>
          ) : (
            <DetailPanel
              detail={detail ?? item}
              onOpenGuide={onOpenGuide}
              onSetOutcome={onSetOutcome}
              outcomeBusy={outcomeBusy}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   Detail panel
   ========================================================= */

function DetailPanel({
  detail,
  onOpenGuide,
  onSetOutcome,
  outcomeBusy,
}: {
  detail: RepairHistoryRead;
  onOpenGuide: () => void;
  onSetOutcome: (o: RepairOutcome) => void;
  outcomeBusy: boolean;
}) {
  const hasNotes = !!detail.outcome_notes;

  return (
    <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Contexte / Notes */}
      {hasNotes && (
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 8,
            padding: "10px 12px",
          }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.22em",
              color: "#71717A",
              marginBottom: 6,
            }}
          >
            NOTES
          </div>
          <div style={{ fontSize: 12, color: "#D4D4D8", lineHeight: 1.5 }}>
            {detail.outcome_notes}
          </div>
        </div>
      )}

      {/* Lien vers guide */}
      <button
        type="button"
        onClick={onOpenGuide}
        className="flex items-center"
        style={{
          gap: 6,
          alignSelf: "flex-start",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontSize: 12,
          color: "#3B82F6",
        }}
      >
        {detail.used_deep ? "Revoir le diagnostic complet" : "Revoir le guide"}
        <ArrowUpRight size={12} />
      </button>

      {/* Feedback outcome */}
      <div
        style={{
          background: "rgba(255,255,255,0.015)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 8,
          padding: "12px 14px",
        }}
      >
        <div style={{ fontSize: 12, color: "#FAFAFA" }}>
          Cette réparation a-t-elle fonctionné ?
        </div>
        <div style={{ fontSize: 11, color: "#71717A", marginTop: 2 }}>
          Votre retour améliore les futurs diagnostics.
        </div>
        <div
          className="flex items-center"
          style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}
        >
          <OutcomeBtn
            label="RÉPARÉ"
            icon={<Check size={12} />}
            color="#10B981"
            active={detail.outcome === "repaired"}
            disabled={outcomeBusy}
            onClick={() => onSetOutcome("repaired")}
          />
          <OutcomeBtn
            label="NON RÉPARÉ"
            icon={<XIcon size={12} />}
            color="#EF4444"
            active={detail.outcome === "not_repaired"}
            disabled={outcomeBusy}
            onClick={() => onSetOutcome("not_repaired")}
          />
          <OutcomeBtn
            label="ABANDONNÉ"
            icon={<CircleSlash size={12} />}
            color="#71717A"
            active={detail.outcome === "gave_up"}
            disabled={outcomeBusy}
            onClick={() => onSetOutcome("gave_up")}
          />
        </div>
      </div>
    </div>
  );
}

function OutcomeBtn({
  label,
  icon,
  color,
  active,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 6,
    fontSize: 11,
    letterSpacing: "0.18em",
    fontFamily: "'JetBrains Mono', monospace",
    background: active ? `${color}1F` : "transparent",
    color,
    border: `1px solid ${active ? `${color}66` : `${color}33`}`,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition:
      "background 180ms cubic-bezier(0.16,1,0.3,1), border-color 180ms cubic-bezier(0.16,1,0.3,1)",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!active && !disabled)
          e.currentTarget.style.background = `${color}14`;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
      style={style}
    >
      {icon}
      {label}
    </button>
  );
}

/* =========================================================
   Pagination button
   ========================================================= */

function PageBtn({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: "6px 12px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.22em",
        color: disabled ? "#3F3F46" : "#A1A1AA",
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "color 180ms cubic-bezier(0.16,1,0.3,1)",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.color = "#FAFAFA";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.color = "#A1A1AA";
      }}
    >
      {children}
    </button>
  );
}

/* =========================================================
   Empty state
   ========================================================= */

function EmptyState({
  filter,
  totalRaw,
}: {
  filter: FilterValue;
  totalRaw: number;
}) {
  const isFilteredEmpty = filter !== "all" && totalRaw > 0;
  return (
    <div
      className="flex flex-col items-center text-center"
      style={{
        gap: 12,
        padding: "48px 16px",
        background: "rgba(255,255,255,0.015)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 10,
      }}
    >
      <HistoryIcon size={28} color="#52525B" strokeWidth={1.5} />
      <div style={{ fontSize: 13, color: "#A1A1AA" }}>
        {isFilteredEmpty
          ? "Aucun diagnostic ne correspond à ce filtre."
          : "Aucun diagnostic pour l'instant."}
      </div>
      {isFilteredEmpty ? (
        <div style={{ fontSize: 12, color: "#71717A" }}>
          Essayez un autre filtre.
        </div>
      ) : (
        <Link
          to="/repair"
          className="font-mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.22em",
            color: "#3B82F6",
            textDecoration: "none",
          }}
        >
          LANCER UN PREMIER DIAGNOSTIC →
        </Link>
      )}
    </div>
  );
}