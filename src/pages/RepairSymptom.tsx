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

  function openDeepForm() {
    setDeepState("form");
    setDeepError(null);
    setDeepErrorStatus(null);
    if (symptom) {
      repairApi
        .getModels(symptom.category)
        .then(setModels)
        .catch(() => setModels([]));
    }
  }

  function resetDeep() {
    setDeepState("idle");
    setDeepResult(null);
    setDeepError(null);
    setDeepErrorStatus(null);
  }

  const canSubmitDeep =
    (!useCustom && modelId !== null) || (useCustom && customName.trim().length > 0);

  async function runDeep() {
    if (!symptom || !canSubmitDeep) return;
    setDeepState("loading");
    setDeepError(null);
    setDeepErrorStatus(null);
    try {
      const res = await repairApi.postDeepDiagnostic({
        symptom_id: symptom.id,
        model_id: useCustom ? null : modelId,
        custom_name: useCustom ? customName.trim() : null,
        context: context.trim() || null,
      });
      setDeepResult(res);
      setDeepState("result");
    } catch (err) {
      const ex = err as { status?: number; message?: string };
      const status = ex?.status ?? null;
      setDeepErrorStatus(status);
      if (status === 402) {
        setDeepError(ex.message || "Crédits insuffisants pour lancer l'analyse.");
      } else if (status === 400) {
        setDeepError("Veuillez sélectionner un modèle ou en saisir un.");
      } else {
        setDeepError("L'analyse a échoué. Réessayez dans un instant.");
      }
      setDeepState("error");
    }
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
        <DeepDiagnosticSection
          deepState={deepState}
          deepResult={deepResult}
          deepError={deepError}
          deepErrorStatus={deepErrorStatus}
          models={models}
          brand={brand}
          setBrand={(b: string | null) => { setBrand(b); setModelId(null); }}
          modelId={modelId}
          setModelId={setModelId}
          useCustom={useCustom}
          setUseCustom={setUseCustom}
          customName={customName}
          setCustomName={setCustomName}
          context={context}
          setContext={setContext}
          canSubmit={canSubmitDeep}
          onOpenForm={openDeepForm}
          onCancel={resetDeep}
          onSubmit={runDeep}
          onRetry={() => setDeepState("form")}
          onRerun={() => setDeepState("form")}
          symptomTitle={symptom.title}
        />
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

/* ============================================================
   § 02.6 — DIAGNOSTIC PERSONNALISÉ IA
   ============================================================ */

type DeepSectionProps = {
  deepState: DeepState;
  deepResult: DeepDiagnosticResponse | null;
  deepError: string | null;
  deepErrorStatus: number | null;
  models: RepairHardwareModel[];
  brand: string | null;
  setBrand: (b: string | null) => void;
  modelId: number | null;
  setModelId: (id: number | null) => void;
  useCustom: boolean;
  setUseCustom: (v: boolean) => void;
  customName: string;
  setCustomName: (s: string) => void;
  context: string;
  setContext: (s: string) => void;
  canSubmit: boolean;
  onOpenForm: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  onRetry: () => void;
  onRerun: () => void;
  symptomTitle: string;
};

function DeepDiagnosticSection(p: DeepSectionProps) {
  if (p.deepState === "result" && p.deepResult) {
    return (
      <DeepResultPanel
        result={p.deepResult}
        symptomTitle={p.symptomTitle}
        onRerun={p.onRerun}
      />
    );
  }

  // States idle / form / loading / error → bloc bleu commun
  return (
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
          {p.deepState === "loading" ? (
            <Brain size={20} strokeWidth={1.5} className="animate-pulse" />
          ) : (
            <Brain size={20} strokeWidth={1.5} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {p.deepState === "idle" && <DeepIdle onOpenForm={p.onOpenForm} />}
          {p.deepState === "form" && <DeepForm {...p} />}
          {p.deepState === "loading" && <DeepLoading />}
          {p.deepState === "error" && (
            <DeepErrorBlock
              error={p.deepError}
              status={p.deepErrorStatus}
              onRetry={p.onRetry}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DeepIdle({ onOpenForm }: { onOpenForm: () => void }) {
  return (
    <>
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
          onClick={onOpenForm}
          className="font-mono text-[11px] tracking-wider px-3 py-2 rounded-md inline-flex items-center gap-2"
          style={{
            background: "#3B82F6",
            color: "#FAFAFA",
            border: "1px solid rgba(59,130,246,0.6)",
          }}
        >
          <Sparkles size={13} />
          LANCER LE DIAGNOSTIC IA
        </button>
        <span className="font-mono text-[10px] tracking-wider" style={{ color: "#71717A" }}>
          COÛT : {DEEP_DIAGNOSTIC_COST} CRÉDITS · CACHE 30 JOURS
        </span>
      </div>
    </>
  );
}

function DeepLoading() {
  return (
    <>
      <div className="flex items-center gap-2 text-[14px] font-medium" style={{ color: "#FAFAFA" }}>
        <Loader2 size={14} className="animate-spin" style={{ color: "#60A5FA" }} />
        Analyse en cours…
      </div>
      <div className="mt-1 text-[12px]" style={{ color: "#A1A1AA" }}>
        L'IA examine votre modèle et le contexte fourni. Cela prend quelques secondes.
      </div>
    </>
  );
}

function DeepErrorBlock({
  error,
  status,
  onRetry,
}: {
  error: string | null;
  status: number | null;
  onRetry: () => void;
}) {
  return (
    <>
      <div className="text-[14px] font-medium" style={{ color: "#FAFAFA" }}>
        Analyse impossible
      </div>
      <div
        className="mt-2 rounded-md p-3 text-[12px]"
        style={{
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.25)",
          color: "#FCA5A5",
        }}
      >
        {error}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="font-mono text-[11px] tracking-wider px-3 py-2 rounded-md"
          style={{
            background: "rgba(255,255,255,0.04)",
            color: "#FAFAFA",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          RÉESSAYER
        </button>
        {status === 402 && (
          <button
            type="button"
            className="font-mono text-[11px] tracking-wider underline-offset-4 hover:underline"
            style={{ color: "#60A5FA" }}
          >
            Recharger mes crédits
          </button>
        )}
      </div>
    </>
  );
}

function DeepForm(p: DeepSectionProps) {
  const brands = useMemo(
    () => Array.from(new Set(p.models.map((m) => m.brand))).sort(),
    [p.models],
  );
  const brandItems: DropdownItem<string>[] = [
    { type: "option", value: "__none__", label: "— Choisir une marque —" },
    ...brands.map((b) => ({ type: "option" as const, value: b, label: b })),
  ];
  const filteredModels = p.brand ? p.models.filter((m) => m.brand === p.brand) : [];
  const modelItems: DropdownItem<string>[] = [
    { type: "option", value: "__none__", label: p.brand ? "— Choisir un modèle —" : "— Choisir une marque d'abord —" },
    ...filteredModels.map((m) => ({ type: "option" as const, value: String(m.id), label: m.name })),
  ];
  const currentBrandLabel = p.brand ?? "Marque";
  const currentModelLabel =
    p.modelId != null ? p.models.find((m) => m.id === p.modelId)?.name ?? "Modèle" : "Modèle";

  return (
    <div className="w-full">
      <div className="text-[14px] font-medium" style={{ color: "#FAFAFA" }}>
        Diagnostic IA personnalisé
      </div>
      <div className="mt-1 text-[12px]" style={{ color: "#A1A1AA" }}>
        Sélectionnez votre matériel et décrivez votre contexte si utile.
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {!p.useCustom ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <DropdownSelect<string>
                value={p.brand ?? "__none__"}
                label={currentBrandLabel}
                items={brandItems}
                onChange={(v) => p.setBrand(v === "__none__" ? null : v)}
                minWidth={180}
              />
              <div style={{ opacity: p.brand ? 1 : 0.5, pointerEvents: p.brand ? "auto" : "none" }}>
                <DropdownSelect<string>
                  value={p.modelId != null ? String(p.modelId) : "__none__"}
                  label={currentModelLabel}
                  items={modelItems}
                  onChange={(v) => p.setModelId(v === "__none__" ? null : Number(v))}
                  minWidth={260}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                p.setUseCustom(true);
                p.setBrand(null);
                p.setModelId(null);
              }}
              className="font-mono text-[10.5px] tracking-wider self-start hover:underline underline-offset-4"
              style={{ color: "#60A5FA" }}
            >
              Mon modèle n'est pas dans la liste
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={p.customName}
              onChange={(e) => p.setCustomName(e.target.value)}
              placeholder="Ex : RTX 4070 Ti Super"
              maxLength={120}
              className="rounded-md px-3 py-2 text-[13px] outline-none"
              style={{
                background: "rgba(255,255,255,0.02)",
                color: "#FAFAFA",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
            <button
              type="button"
              onClick={() => {
                p.setUseCustom(false);
                p.setCustomName("");
              }}
              className="font-mono text-[10.5px] tracking-wider self-start hover:underline underline-offset-4"
              style={{ color: "#60A5FA" }}
            >
              Choisir dans la liste
            </button>
          </>
        )}

        <div className="relative">
          <label
            className="font-mono text-[10px] tracking-wider block mb-1"
            style={{ color: "#71717A" }}
          >
            CONTEXTE (OPTIONNEL)
          </label>
          <textarea
            value={p.context}
            onChange={(e) => p.setContext(e.target.value)}
            placeholder="Décrivez ce que vous observez, depuis quand, dans quelles conditions…"
            maxLength={1000}
            rows={3}
            className="w-full rounded-md px-3 py-2 text-[12px] outline-none resize-none"
            style={{
              background: "rgba(255,255,255,0.02)",
              color: "#FAFAFA",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
          <div
            className="absolute bottom-2 right-3 font-mono text-[10px]"
            style={{ color: "#52525B" }}
          >
            {p.context.length}/1000
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={p.onSubmit}
          aria-disabled={!p.canSubmit}
          title={!p.canSubmit ? "Sélectionnez un modèle ou saisissez-en un" : undefined}
          className="font-mono text-[11px] tracking-wider px-3 py-2 rounded-md inline-flex items-center gap-2"
          style={{
            background: p.canSubmit ? "#3B82F6" : "rgba(59,130,246,0.20)",
            color: p.canSubmit ? "#FAFAFA" : "#71717A",
            border: `1px solid ${p.canSubmit ? "rgba(59,130,246,0.6)" : "rgba(59,130,246,0.20)"}`,
            cursor: p.canSubmit ? "pointer" : "not-allowed",
          }}
        >
          <Sparkles size={13} />
          LANCER L'ANALYSE
        </button>
        <button
          type="button"
          onClick={p.onCancel}
          className="font-mono text-[11px] tracking-wider px-3 py-2 rounded-md"
          style={{
            background: "rgba(255,255,255,0.02)",
            color: "#A1A1AA",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          ANNULER
        </button>
        <span className="font-mono text-[10px] tracking-wider" style={{ color: "#71717A" }}>
          {DEEP_DIAGNOSTIC_COST} CRÉDITS · GRATUIT SI CACHE
        </span>
      </div>
    </div>
  );
}

function DeepResultPanel({
  result,
  symptomTitle,
  onRerun,
}: {
  result: DeepDiagnosticResponse;
  symptomTitle: string;
  onRerun: () => void;
}) {
  const deep: DeepAnalysis = result.deep_analysis;
  const confColor = CONFIDENCE_COLORS[deep.confidence];
  const roiPositive = deep.roi_estimate.roi_pct >= 0;
  const roiColor = roiPositive ? "#10B981" : "#EF4444";
  const roiBg = roiPositive ? "rgba(16,185,129,0.04)" : "rgba(239,68,68,0.05)";
  const roiBorder = roiPositive ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.25)";

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[15px] font-medium leading-tight" style={{ color: "#FAFAFA" }}>
            {result.model_name ?? "Modèle non spécifié"}
            <span style={{ color: "#52525B" }}> · </span>
            <span style={{ color: "#D4D4D8" }}>{symptomTitle}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="font-mono text-[10px] tracking-wider px-2 py-1 rounded"
            style={{
              color: confColor,
              background: severityBgFromHex(confColor),
              border: `1px solid ${confColor}33`,
            }}
          >
            {CONFIDENCE_LABELS[deep.confidence].toUpperCase()}
          </span>
          {result.cached ? (
            <span
              className="font-mono text-[10px] tracking-wider px-2 py-1 rounded inline-flex items-center gap-1"
              style={{
                color: "#09B1BA",
                background: "rgba(9,177,186,0.10)",
                border: "1px solid rgba(9,177,186,0.30)",
              }}
            >
              <Database size={11} />
              CACHE · 0 CRÉDIT
            </span>
          ) : (
            <span
              className="font-mono text-[10px] tracking-wider px-2 py-1 rounded"
              style={{
                color: "#A1A1AA",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {result.credits_spent} CRÉDIT{result.credits_spent > 1 ? "S" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Notes spécifiques */}
      <div
        className="rounded-lg p-4 mb-4"
        style={{
          background: "rgba(9,177,186,0.04)",
          border: "1px solid rgba(9,177,186,0.20)",
        }}
      >
        <div
          className="font-mono text-[10px] tracking-wider mb-2"
          style={{ color: "#09B1BA" }}
        >
          NOTES SPÉCIFIQUES AU MODÈLE
        </div>
        <div className="text-[12px]" style={{ color: "#D4D4D8", lineHeight: 1.6 }}>
          {deep.model_specific_notes}
        </div>
        {deep.known_issues.length > 0 && (
          <div className="mt-3">
            <div
              className="font-mono text-[9.5px] tracking-wider mb-1.5"
              style={{ color: "#71717A" }}
            >
              PROBLÈMES CONNUS SUR CE MODÈLE
            </div>
            <ul className="flex flex-col gap-1">
              {deep.known_issues.map((iss, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: "#A1A1AA" }}>
                  <span style={{ color: "#09B1BA", lineHeight: 1.6 }}>—</span>
                  <span style={{ lineHeight: 1.6 }}>{iss}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Diagnostic perso */}
      {deep.personalized_diagnostic.length > 0 && (
        <div className="mb-4">
          <div
            className="font-mono text-[10px] tracking-wider mb-2"
            style={{ color: "#71717A" }}
          >
            DIAGNOSTIC PERSONNALISÉ
          </div>
          <div
            className="rounded-lg p-4"
            style={{
              background: "rgba(255,255,255,0.015)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex flex-col">
              {deep.personalized_diagnostic.map((step, idx) => (
                <div
                  key={step.order}
                  style={{
                    paddingTop: idx === 0 ? 0 : 12,
                    paddingBottom: 12,
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
                        background: "rgba(9,177,186,0.12)",
                        color: "#09B1BA",
                      }}
                    >
                      {step.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium" style={{ color: "#FAFAFA" }}>
                        {step.title}
                      </div>
                      <div className="mt-1 text-[12px]" style={{ color: "#A1A1AA", lineHeight: 1.6 }}>
                        {step.description}
                      </div>
                      <div
                        className="mt-1.5 text-[12px] italic flex items-start gap-1.5"
                        style={{ color: "#10B981", lineHeight: 1.6 }}
                      >
                        <span style={{ flexShrink: 0 }}>↪</span>
                        <span>{step.expected_result}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scénarios de réparation */}
      {deep.personalized_repair.length > 0 && (
        <div className="mb-4">
          <div
            className="font-mono text-[10px] tracking-wider mb-2"
            style={{ color: "#71717A" }}
          >
            SCÉNARIOS DE RÉPARATION
          </div>
          <div className="flex flex-col gap-2">
            {deep.personalized_repair.map((sc, i) => (
              <div
                key={i}
                className="rounded-lg p-4"
                style={{
                  background: "rgba(255,255,255,0.015)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="text-[14px] font-medium min-w-0" style={{ color: "#FAFAFA" }}>
                    {sc.scenario}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="font-mono text-[10px] tracking-wider px-2 py-0.5 rounded"
                      style={{
                        color: "#A1A1AA",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {sc.probability_pct} %
                    </span>
                    <Pill
                      label={DIFFICULTY_LABELS[sc.difficulty]}
                      color={DIFFICULTY_COLORS[sc.difficulty]}
                    />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <KpiTile label="COÛT" value={`${sc.estimated_cost_eur} €`} color="#FAFAFA" />
                  <KpiTile label="TEMPS" value={`${sc.estimated_time_min} min`} color="#FAFAFA" />
                </div>
                {sc.steps.length > 0 && (
                  <ol className="mt-3 flex flex-col gap-2">
                    {sc.steps.map((s, k) => (
                      <li key={k} className="flex items-start gap-2.5">
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
                          {k + 1}
                        </span>
                        <span className="text-[12px]" style={{ color: "#D4D4D8", lineHeight: 1.6 }}>
                          {s}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
                {sc.materials.length > 0 && (
                  <div
                    className="mt-3 rounded-md p-3"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div
                      className="font-mono text-[10px] tracking-wider mb-2"
                      style={{ color: "#71717A" }}
                    >
                      MATÉRIEL
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {sc.materials.map((m, k) => (
                        <div key={k} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-[12px]" style={{ color: "#D4D4D8" }}>
                              {m.name}
                            </span>
                            {m.spec && (
                              <span className="text-[11px]" style={{ color: "#71717A" }}>
                                {" "}— {m.spec}
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[11px] shrink-0" style={{ color: "#A1A1AA" }}>
                            {m.est_price_eur} €
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROI */}
      <div className="mb-4">
        <div
          className="font-mono text-[10px] tracking-wider mb-2"
          style={{ color: "#71717A" }}
        >
          ESTIMATION ROI
        </div>
        <div
          className="rounded-lg p-4"
          style={{ background: roiBg, border: `1px solid ${roiBorder}` }}
        >
          <div className="grid grid-cols-3 gap-2">
            <KpiTile
              label="COÛT RÉPARATION"
              value={`${deep.roi_estimate.total_repair_cost_eur} €`}
              color="#FAFAFA"
            />
            <KpiTile
              label="VALEUR APRÈS RÉPA"
              value={`${deep.roi_estimate.estimated_value_repaired_eur} €`}
              color="#FAFAFA"
            />
            <KpiTile
              label="ROI"
              value={`${roiPositive ? "+" : ""}${deep.roi_estimate.roi_pct} %`}
              color={roiColor}
            />
          </div>
          <div className="mt-3 text-[12px]" style={{ color: "#D4D4D8", lineHeight: 1.6 }}>
            <span style={{ color: roiColor, fontWeight: 500 }}>Recommandation : </span>
            {deep.roi_estimate.recommendation}
          </div>
        </div>
      </div>

      {/* Warnings */}
      {deep.warnings.length > 0 && (
        <div className="mb-4">
          <div
            className="rounded-lg p-4"
            style={{
              background: "rgba(245,158,11,0.05)",
              border: "1px solid rgba(245,158,11,0.20)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle size={13} style={{ color: "#F59E0B" }} />
              <span
                className="font-mono text-[10px] tracking-wider"
                style={{ color: "#F59E0B" }}
              >
                AVERTISSEMENTS
              </span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {deep.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: "#D4D4D8" }}>
                  <AlertTriangle size={12} style={{ color: "#F59E0B", flexShrink: 0, marginTop: 3 }} />
                  <span style={{ lineHeight: 1.6 }}>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Pied */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRerun}
          className="font-mono text-[11px] tracking-wider px-3 py-2 rounded-md inline-flex items-center gap-2"
          style={{
            background: "rgba(255,255,255,0.02)",
            color: "#A1A1AA",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <RotateCcw size={12} />
          RELANCER UNE ANALYSE
        </button>
      </div>
    </div>
  );
}
