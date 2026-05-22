import { useState, useEffect, useMemo, type ComponentType } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  CornerDownRight,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Brain,
  Wrench,
  Monitor,
  Cpu,
  MemoryStick,
  HardDrive,
  CircuitBoard,
  Plug,
  Tv,
  TvMinimal,
  AlertTriangle,
  RotateCw,
  Thermometer,
  AudioWaveform,
  PlugZap,
  Bug,
  Power,
  TrendingDown,
  GripHorizontal,
  AlertOctagon,
  SearchX,
  Gauge,
  LayoutGrid,
  Activity,
  FileX,
  Lock,
  Usb,
  Flame,
  CircleDot,
  AlarmClockOff,
  Eye,
  ShieldAlert,
  UserCog,
  Database,
  Sparkles,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { repairApi } from "@/lib/api";
import {
  REPAIR_CATEGORIES,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  CONFIDENCE_LABELS,
  CONFIDENCE_COLORS,
  DEEP_DIAGNOSTIC_COST,
  type StaticGuideRead,
  type RepairSeverity,
  type DiagnosticOutcome,
  type RepairProcedure,
  type DeepDiagnosticResponse,
  type DeepAnalysis,
  type RepairHardwareModel,
} from "@/components/repair/datasets";
import DropdownSelect, { type DropdownItem } from "@/components/stock/DropdownSelect";

type DeepState = "idle" | "form" | "loading" | "result" | "error";

type IconCmp = ComponentType<{ size?: number; className?: string; strokeWidth?: number; style?: React.CSSProperties }>;

const ICON_MAP: Record<string, IconCmp> = {
  "device-desktop": Monitor,
  "cpu": Cpu,
  "server-2": MemoryStick,
  "database": HardDrive,
  "circuit-changeover": CircuitBoard,
  "plug-connected": Plug,
  "device-tv": Tv,
  "device-tv-off": TvMinimal,
  "alert-triangle": AlertTriangle,
  "rotate-clockwise-2": RotateCw,
  "temperature-celsius": Thermometer,
  "wave-sine": AudioWaveform,
  "plug-x": PlugZap,
  "bug": Bug,
  "power": Power,
  "trending-down": TrendingDown,
  "grip-horizontal": GripHorizontal,
  "alert-octagon": AlertOctagon,
  "search-off": SearchX,
  "gauge": Gauge,
  "layout-grid": LayoutGrid,
  "activity": Activity,
  "file-x": FileX,
  "lock": Lock,
  "usb": Usb,
  "flame": Flame,
  "circle-dot": CircleDot,
  "clock-x": AlarmClockOff,
};

function getIcon(slug: string | null | undefined): IconCmp {
  if (!slug) return Wrench;
  return ICON_MAP[slug] ?? Wrench;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function severityBg(sev: RepairSeverity): string {
  const c = SEVERITY_COLORS[sev];
  // hex → rgba 10%
  const m = c.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return "rgba(255,255,255,0.04)";
  const [r, g, b] = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  return `rgba(${r},${g},${b},0.10)`;
}

function shortCauseLabel(cause: string): string {
  if (cause.length <= 24) return cause;
  // tronque sur la 1re parenthèse ou à 22 chars
  const paren = cause.indexOf(" (");
  if (paren > 0 && paren <= 26) return cause.slice(0, paren);
  return cause.slice(0, 22).trimEnd() + "…";
}

function probColor(p: number): string {
  if (p > 40) return "#EF4444";
  if (p > 20) return "#F59E0B";
  return "#71717A";
}

export default function RepairSymptom({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const [data, setData] = useState<StaticGuideRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedProcedure, setExpandedProcedure] = useState<string | null>(null);
  const [highlightedProcedure, setHighlightedProcedure] = useState<string | null>(null);

  // § 02.6 — Deep diagnostic state
  const [deepState, setDeepState] = useState<DeepState>("idle");
  const [deepResult, setDeepResult] = useState<DeepDiagnosticResponse | null>(null);
  const [deepError, setDeepError] = useState<string | null>(null);
  const [deepErrorStatus, setDeepErrorStatus] = useState<number | null>(null);
  const [models, setModels] = useState<RepairHardwareModel[]>([]);
  const [brand, setBrand] = useState<string | null>(null);
  const [modelId, setModelId] = useState<number | null>(null);
  const [useCustom, setUseCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [context, setContext] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setData(null);
    repairApi
      .getGuide(slug)
      .then((res) => {
        if (!mounted) return;
        setData(res);
        setLoading(false);
        // expand first procedure by default
        const first = res.guide?.repair_procedures?.[0]?.cause_ref ?? null;
        setExpandedProcedure(first);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  const guide = data?.guide ?? null;
  const symptom = data?.symptom ?? null;
  const category = symptom ? REPAIR_CATEGORIES.find((c) => c.slug === symptom.category) : undefined;
  const Icon = getIcon(symptom?.icon);

  const minTime = useMemo(() => {
    if (!guide?.repair_procedures.length) return null;
    return Math.min(...guide.repair_procedures.map((p) => p.estimated_time_min));
  }, [guide]);

  const sortedCauses = useMemo(
    () => (guide ? [...guide.common_causes].sort((a, b) => b.probability_pct - a.probability_pct) : []),
    [guide]
  );

  function scrollToProcedure(causeName: string) {
    const proc = guide?.repair_procedures.find((p) => p.cause_ref === causeName);
    if (!proc) {
      if (import.meta.env.DEV) console.warn(`[Repair] outcome points_to_cause "${causeName}" not found in repair_procedures`);
      const section = document.getElementById("section-procedures");
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setExpandedProcedure(causeName);
    requestAnimationFrame(() => {
      const el = document.getElementById(`procedure-${slugify(causeName)}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedProcedure(causeName);
      setTimeout(() => setHighlightedProcedure(null), 2000);
    });
  }

  if (loading) {
    return (
      <div>
        <div className="font-mono text-[11px] tracking-wider" style={{ color: "#71717A" }}>
          Chargement…
        </div>
      </div>
    );
  }

  if (!symptom) {
    return (
      <div>
        <Breadcrumb categoryLabel={null} symptomTitle={slug} />
        <div className="mt-6 text-[14px]" style={{ color: "#A1A1AA" }}>
          Symptôme introuvable.
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb categoryLabel={category?.label ?? null} symptomTitle={symptom.title} />

      {/* Header symptôme */}
      <div className="mb-8 flex items-start gap-4">
        <div
          className="flex shrink-0 items-center justify-center"
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            background: category?.bgRgba ?? "rgba(255,255,255,0.04)",
            color: category?.colorHex ?? "#A1A1AA",
          }}
        >
          <Icon size={22} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[11px] tracking-wider" style={{ color: "#71717A" }}>
            § 02 — DIAGNOSTIC SYMPTÔME
          </div>
          <h1 className="mt-1 text-[22px] font-medium leading-tight" style={{ color: "#FAFAFA" }}>
            {symptom.title}
          </h1>
          {symptom.description && (
            <p className="mt-1 text-[12px]" style={{ color: "#A1A1AA" }}>
              {symptom.description}
            </p>
          )}
        </div>
      </div>

      {!guide ? (
        <div
          className="rounded-lg p-6 mb-6"
          style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="font-mono text-[10px] tracking-wider" style={{ color: "#71717A" }}>
            GUIDE NON DISPONIBLE
          </div>
          <div className="mt-2 text-[13px]" style={{ color: "#D4D4D8" }}>
            Aucun guide détaillé pour ce symptôme pour l'instant. Vous pouvez lancer un diagnostic personnalisé
            par IA ci-dessous pour obtenir une analyse adaptée à votre matériel.
          </div>
        </div>
      ) : (
        <>
          {/* § 02.1 — APERÇU */}
          <Section label="§ 02.1 — APERÇU">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px]">
              <KpiTile
                label="SÉVÉRITÉ"
                value={SEVERITY_LABELS[guide.severity]}
                color={SEVERITY_COLORS[guide.severity]}
              />
              <KpiTile
                label="DIFFICULTÉ"
                value={DIFFICULTY_LABELS[guide.difficulty]}
                color={DIFFICULTY_COLORS[guide.difficulty]}
              />
              <KpiTile
                label="TAUX DE RÉUSSITE"
                value={guide.success_rate_pct != null ? `${guide.success_rate_pct} %` : "—"}
                color="#10B981"
              />
              <KpiTile
                label="TEMPS ESTIMÉ"
                value={minTime != null ? `${minTime} min` : "—"}
                color="#FAFAFA"
              />
            </div>
          </Section>

          {/* § 02.2 — CAUSES PROBABLES */}
          <Section label="§ 02.2 — CAUSES PROBABLES">
            <Card>
              <div className="flex flex-col gap-3">
                {sortedCauses.map((c) => (
                  <div key={c.cause}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[13px] truncate" style={{ color: "#FAFAFA" }}>
                          {c.cause}
                        </span>
                        <Pill
                          label={DIFFICULTY_LABELS[c.repair_difficulty]}
                          color={DIFFICULTY_COLORS[c.repair_difficulty]}
                        />
                      </div>
                      <span className="font-mono text-[12px] shrink-0" style={{ color: "#A1A1AA" }}>
                        {c.probability_pct} %
                      </span>
                    </div>
                    <div
                      className="mt-1.5 h-1 w-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.04)", borderRadius: 2 }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${c.probability_pct}%`,
                          background: probColor(c.probability_pct),
                          transition: "width 500ms cubic-bezier(0.16,1,0.3,1)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Section>

          {/* § 02.3 — ÉTAPES DE DIAGNOSTIC */}
          <Section label="§ 02.3 — ÉTAPES DE DIAGNOSTIC">
            <p className="mb-3 text-[12px]" style={{ color: "#A1A1AA" }}>
              Suivez les étapes dans l'ordre. À chaque étape, ce que vous observez vous oriente vers
              une cause précise — cliquez pour aller à sa réparation.
            </p>
            <Card>
              <div className="flex flex-col">
                {[...guide.diagnostic_steps]
                  .sort((a, b) => a.order - b.order)
                  .map((step, idx) => (
                    <div
                      key={step.order}
                      style={{
                        paddingTop: idx === 0 ? 0 : 14,
                        paddingBottom: 14,
                        borderTop: idx === 0 ? "none" : "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex shrink-0 items-center justify-center font-mono text-[11px]"
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 999,
                            background: "rgba(59,130,246,0.10)",
                            color: "#3B82F6",
                          }}
                        >
                          {step.order}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium" style={{ color: "#FAFAFA" }}>
                            {step.title}
                          </div>
                          <div className="mt-1 text-[12px]" style={{ color: "#A1A1AA" }}>
                            {step.description}
                          </div>
                          {step.tools_needed.length > 0 && (
                            <div
                              className="mt-1.5 font-mono text-[10px] tracking-wider"
                              style={{ color: "#52525B" }}
                            >
                              OUTILS : {step.tools_needed.join(", ")}
                            </div>
                          )}

                          {step.detailed_instructions && step.detailed_instructions.length > 0 && (
                            <div className="mt-3" style={{ paddingLeft: 4 }}>
                              <div
                                className="font-mono text-[10px] mb-1.5"
                                style={{ color: "#52525B", letterSpacing: "0.10em" }}
                              >
                                COMMENT FAIRE
                              </div>
                              <ol className="flex flex-col" style={{ gap: 4, paddingLeft: 4 }}>
                                {step.detailed_instructions.map((ins, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span
                                      className="font-mono text-[11px] shrink-0"
                                      style={{ color: "#52525B", lineHeight: 1.7, minWidth: 16 }}
                                    >
                                      {i + 1}.
                                    </span>
                                    <span
                                      className="text-[12px]"
                                      style={{ color: "#A1A1AA", lineHeight: 1.7 }}
                                    >
                                      {ins}
                                    </span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {step.what_to_observe && (
                            <div
                              className="mt-3"
                              style={{
                                background: "rgba(59,130,246,0.05)",
                                borderLeft: "2px solid rgba(59,130,246,0.30)",
                                padding: "8px 12px",
                                borderRadius: "0 6px 6px 0",
                              }}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <Eye size={13} style={{ color: "#3B82F6" }} />
                                <span
                                  className="font-mono text-[9px]"
                                  style={{ color: "#3B82F6", letterSpacing: "0.14em" }}
                                >
                                  CE QUE VOUS CHERCHEZ
                                </span>
                              </div>
                              <div
                                className="text-[12px]"
                                style={{ color: "#D4D4D8", lineHeight: 1.6 }}
                              >
                                {step.what_to_observe}
                              </div>
                            </div>
                          )}

                          {step.outcomes && step.outcomes.length > 0 && (
                            <div
                              className="mt-3"
                              style={{ paddingLeft: 12, borderLeft: "2px solid rgba(255,255,255,0.06)" }}
                            >
                              <div
                                className="font-mono text-[9px] tracking-wider mb-2"
                                style={{ color: "#52525B" }}
                              >
                                SELON CE QUE VOUS OBSERVEZ
                              </div>
                              <div className="flex flex-col gap-1.5">
                                {step.outcomes.map((o, i) => (
                                  <OutcomeRow
                                    key={i}
                                    outcome={o}
                                    onLocal={(cause) => scrollToProcedure(cause)}
                                    onExternal={(targetSlug) =>
                                      navigate({ to: "/repair/$slug", params: { slug: targetSlug } })
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </Section>

          {/* § 02.4 — RÉPARATIONS */}
          <Section label="§ 02.4 — RÉPARATIONS" id="section-procedures">
            <div className="flex flex-col gap-2">
              {guide.repair_procedures.map((proc) => {
                const isOpen = expandedProcedure === proc.cause_ref;
                const isHighlighted = highlightedProcedure === proc.cause_ref;
                const causeMeta = guide.common_causes.find((c) => c.cause === proc.cause_ref);
                return (
                  <ProcedureCard
                    key={proc.cause_ref}
                    proc={proc}
                    isOpen={isOpen}
                    isHighlighted={isHighlighted}
                    probability={causeMeta?.probability_pct ?? null}
                    difficulty={causeMeta?.repair_difficulty ?? null}
                    onToggle={() =>
                      setExpandedProcedure((cur) => (cur === proc.cause_ref ? null : proc.cause_ref))
                    }
                  />
                );
              })}
            </div>
          </Section>

          {/* § 02.5 — CONSEILS D'EXPERT */}
          {guide.pro_tips.length > 0 && (
            <Section label="§ 02.5 — CONSEILS D'EXPERT">
              <Card>
                <div className="flex flex-col gap-2.5">
                  {guide.pro_tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <Lightbulb size={14} style={{ color: "#F59E0B", flexShrink: 0, marginTop: 2 }} />
                      <span className="text-[12px]" style={{ color: "#D4D4D8" }}>
                        {tip}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </Section>
          )}
        </>
      )}

      {/* § 02.6 — DIAGNOSTIC PERSONNALISÉ (placeholder P2C) */}
      <Section label="§ 02.6 — DIAGNOSTIC PERSONNALISÉ">
        <div
          className="rounded-lg p-5"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(168,85,247,0.06))",
            border: "1px solid rgba(59,130,246,0.20)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex shrink-0 items-center justify-center"
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "rgba(59,130,246,0.12)",
                color: "#60A5FA",
              }}
            >
              <Brain size={20} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium" style={{ color: "#FAFAFA" }}>
                Affiner avec un diagnostic IA personnalisé
              </div>
              <div className="mt-1 text-[12px]" style={{ color: "#A1A1AA" }}>
                Indiquez votre matériel et votre contexte. L'IA produira une analyse spécifique avec
                scénarios de réparation, matériaux, ROI et avertissements.
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    // P2C placeholder
                  }}
                  className="font-mono text-[11px] tracking-wider px-3 py-2 rounded-md"
                  style={{
                    background: "#3B82F6",
                    color: "#FAFAFA",
                    border: "1px solid rgba(59,130,246,0.6)",
                  }}
                >
                  LANCER LE DIAGNOSTIC IA
                </button>
                <span className="font-mono text-[10px] tracking-wider" style={{ color: "#71717A" }}>
                  COÛT : 5 CRÉDITS · CACHE 30 JOURS
                </span>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function Breadcrumb({
  categoryLabel,
  symptomTitle,
}: {
  categoryLabel: string | null;
  symptomTitle: string;
}) {
  return (
    <div
      className="flex items-center mb-4"
      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.22em" }}
    >
      <Link
        to="/repair"
        style={{ color: "#A1A1AA", padding: "2px 4px", textDecoration: "none" }}
        className="hover:text-zinc-100 transition-colors"
      >
        ← REPAIR GUIDE
      </Link>
      {categoryLabel && (
        <>
          <span style={{ color: "#52525B", padding: "0 4px" }}>/</span>
          <span style={{ color: "#52525B", padding: "2px 4px" }}>{categoryLabel.toUpperCase()}</span>
        </>
      )}
      <span style={{ color: "#52525B", padding: "0 4px" }}>/</span>
      <span style={{ color: "#52525B", padding: "2px 4px" }}>{symptomTitle.toUpperCase()}</span>
    </div>
  );
}

function Section({ label, id, children }: { label: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-6">
      <div
        className="font-mono text-[11px] tracking-wider mb-2"
        style={{ color: "#71717A" }}
      >
        {label}
      </div>
      {children}
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {children}
    </div>
  );
}

function KpiTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-lg"
      style={{
        padding: 14,
        background: "rgba(255,255,255,0.015)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="font-mono text-[10px] tracking-wider" style={{ color: "#71717A" }}>
        {label}
      </div>
      <div className="mt-1 text-[14px] font-medium" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="font-mono text-[9.5px] tracking-wider px-1.5 py-0.5 rounded shrink-0"
      style={{
        color,
        background: severityBgFromHex(color),
        border: `1px solid ${color}33`,
      }}
    >
      {label.toUpperCase()}
    </span>
  );
}

function severityBgFromHex(hex: string): string {
  const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return "rgba(255,255,255,0.04)";
  const [r, g, b] = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  return `rgba(${r},${g},${b},0.10)`;
}

function OutcomeRow({
  outcome,
  onLocal,
  onExternal,
}: {
  outcome: DiagnosticOutcome;
  onLocal: (cause: string) => void;
  onExternal: (slug: string) => void;
}) {
  const color = SEVERITY_COLORS[outcome.severity];
  const bg = severityBg(outcome.severity);
  const isExternal = !!outcome.points_to_symptom;

  return (
    <div
      className="flex items-center gap-2 ease-expo"
      style={{
        padding: "8px 10px",
        borderRadius: 6,
        background: "rgba(255,255,255,0.02)",
        transition: "background 200ms cubic-bezier(0.16,1,0.3,1)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
    >
      <CornerDownRight size={13} style={{ color: "#52525B", flexShrink: 0 }} />
      <span className="text-[12px] flex-1 min-w-0" style={{ color: "#D4D4D8" }}>
        {outcome.condition}
      </span>
      {isExternal ? (
        <button
          type="button"
          onClick={() => onExternal(outcome.points_to_symptom!)}
          className="font-mono text-[10.5px] tracking-wider px-2 py-1 rounded inline-flex items-center gap-1 shrink-0"
          style={{ background: bg, color, border: `1px solid ${color}33` }}
        >
          Voir : {outcome.points_to_symptom_title ?? outcome.points_to_symptom}
          <ArrowUpRight size={11} />
        </button>
      ) : outcome.points_to_cause ? (
        <button
          type="button"
          onClick={() => onLocal(outcome.points_to_cause!)}
          className="font-mono text-[10.5px] tracking-wider px-2 py-1 rounded inline-flex items-center gap-1 shrink-0"
          style={{ background: bg, color, border: `1px solid ${color}33` }}
        >
          {shortCauseLabel(outcome.points_to_cause)}
          <ArrowRight size={11} />
        </button>
      ) : null}
    </div>
  );
}

function ProcedureCard({
  proc,
  isOpen,
  isHighlighted,
  probability,
  difficulty,
  onToggle,
}: {
  proc: RepairProcedure;
  isOpen: boolean;
  isHighlighted: boolean;
  probability: number | null;
  difficulty: string | null;
  onToggle: () => void;
}) {
  const baseBorder = isHighlighted ? "1px solid rgba(245,158,11,0.30)" : "1px solid rgba(255,255,255,0.06)";
  const baseBg = isHighlighted ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.015)";
  const diffLabel = difficulty
    ? DIFFICULTY_LABELS[difficulty as keyof typeof DIFFICULTY_LABELS]
    : null;
  const diffColor = difficulty ? DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS] : "#71717A";

  return (
    <div
      id={`procedure-${slugify(proc.cause_ref)}`}
      className="rounded-lg ease-expo"
      style={{
        background: baseBg,
        border: baseBorder,
        transition: "background 400ms cubic-bezier(0.16,1,0.3,1), border-color 400ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left flex items-center gap-3 p-4"
      >
        {isOpen ? (
          <ChevronDown size={16} style={{ color: "#71717A", flexShrink: 0 }} />
        ) : (
          <ChevronRight size={16} style={{ color: "#71717A", flexShrink: 0 }} />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-medium" style={{ color: "#FAFAFA" }}>
            {proc.cause_ref}
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            {probability != null && (
              <span className="font-mono text-[10px] tracking-wider" style={{ color: "#A1A1AA" }}>
                {probability} %
              </span>
            )}
            {diffLabel && <Pill label={diffLabel} color={diffColor} />}
            {proc.requires_pro && (
              <span
                className="font-mono text-[9px] tracking-wider px-1.5 py-0.5 rounded shrink-0"
                style={{
                  color: "#EF4444",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}
              >
                PRO
              </span>
            )}
            <span className="font-mono text-[10px] tracking-wider" style={{ color: "#71717A" }}>
              · {proc.estimated_cost_eur === 0 ? "GRATUIT" : `~${proc.estimated_cost_eur} €`}
            </span>
            <span className="font-mono text-[10px] tracking-wider" style={{ color: "#71717A" }}>
              · {proc.estimated_time_min} MIN
            </span>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 14 }}>
          {proc.requires_pro && (
            <div
              className="mb-3"
              style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 8,
                padding: "12px 14px",
              }}
            >
              <div className="flex items-start gap-2">
                <UserCog size={14} style={{ color: "#EF4444", flexShrink: 0, marginTop: 2 }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium" style={{ color: "#EF4444" }}>
                    Réparation experte — à confier à un professionnel
                  </div>
                  <div className="mt-1 text-[11px]" style={{ color: "#A1A1AA", lineHeight: 1.6 }}>
                    Les étapes ci-dessous décrivent la procédure, mais elle nécessite un outillage
                    spécialisé et présente un risque de dommage irréversible. Sauf si vous êtes équipé
                    et expérimenté, mieux vaut faire appel à un atelier.
                  </div>
                </div>
              </div>
            </div>
          )}
          <ol className="flex flex-col gap-2">
            {proc.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="flex shrink-0 items-center justify-center font-mono text-[10px]"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.04)",
                    color: "#A1A1AA",
                    marginTop: 1,
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-[12px]" style={{ color: "#D4D4D8" }}>
                  {s}
                </span>
              </li>
            ))}
          </ol>

          {proc.safety_warnings && proc.safety_warnings.length > 0 && (
            <div
              className="mt-4"
              style={{
                background: "rgba(245,158,11,0.05)",
                border: "1px solid rgba(245,158,11,0.20)",
                borderRadius: 8,
                padding: "12px 14px",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <ShieldAlert size={13} style={{ color: "#F59E0B" }} />
                <span
                  className="font-mono text-[10px]"
                  style={{ color: "#F59E0B", letterSpacing: "0.14em" }}
                >
                  PRÉCAUTIONS
                </span>
              </div>
              <ul className="flex flex-col" style={{ gap: 6 }}>
                {proc.safety_warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className="shrink-0"
                      style={{ color: "#F59E0B", lineHeight: 1.6, fontSize: 12 }}
                    >
                      —
                    </span>
                    <span
                      className="text-[12px]"
                      style={{ color: "#D4D4D8", lineHeight: 1.6 }}
                    >
                      {w}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {proc.materials.length > 0 && (
            <div
              className="mt-4 rounded-md p-3"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div className="font-mono text-[10px] tracking-wider mb-2" style={{ color: "#71717A" }}>
                MATÉRIEL
              </div>
              <div className="flex flex-col gap-1.5">
                {proc.materials.map((m, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <span className="text-[12px]" style={{ color: "#D4D4D8" }}>
                      {m.name}
                    </span>
                    <span className="font-mono text-[11px]" style={{ color: "#A1A1AA" }}>
                      {m.est_price_eur} €
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
