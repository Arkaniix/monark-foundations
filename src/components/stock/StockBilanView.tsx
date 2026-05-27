import { useEffect, useMemo, useRef, useState } from "react";
import { Settings as SettingsIcon, Download, Info, AlertTriangle, HelpCircle } from "lucide-react";
import type { StockItem } from "./datasets";
import type { Build } from "./buildsDatasets";
import type { AccountingEntry } from "./accountingDatasets";
import DropdownSelect, { type DropdownItem } from "./DropdownSelect";
import RegimeExplainerModal from "./RegimeExplainerModal";
import {
  useAccountingSettings,
  type AccountingRegime,
  type CaCompositionToggle,
} from "@/lib/useAccountingSettings";
import {
  COMPOSITION_LABELS,
  COMPOSITION_RECOMMENDATION,
  RECOMMENDATION_LABEL,
  REGIME_BADGE_LABEL,
  REGIME_LABELS,
  REGIME_DESCRIPTIONS,
  buildBilanCsv,
  computeCaDeclarable,
  computeCaMensuelAnnuel,
  computeCaPerToggle,
  computeCotisationsMicroBic,
  computeDepensesAnnuelles,
  computeMargeNetteGlobaleAnnuelle,
  computeResteASoi,
  computeSeuilsTva,
  downloadCsv,
  formatEurInt,
  formatEurSignedInt,
  formatPctSigned,
  loadExpandedYear,
  loadSettingsOpen,
  monthLabel,
  projectCaMensuelRestant,
  saveExpandedYear,
  saveSettingsOpen,
} from "./bilanCalculations";

type Props = {
  stockItems: StockItem[];
  builds: Build[];
  accountingEntries: AccountingEntry[];
  onYearChange?: (year: number) => void;
};

const NBSP = "\u00A0";

export default function StockBilanView({
  stockItems,
  builds,
  accountingEntries,
  onYearChange,
}: Props) {
  const { settings, updateRegime, updateComposition, updateMicroBic } =
    useAccountingSettings();
  const [year, setYear] = useState<number>(() => loadExpandedYear());
  const [settingsOpen, setSettingsOpen] = useState<boolean>(() =>
    loadSettingsOpen(),
  );
  const [explainerOpen, setExplainerOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    saveExpandedYear(year);
    onYearChange?.(year);
  }, [year, onYearChange]);

  useEffect(() => {
    saveSettingsOpen(settingsOpen);
  }, [settingsOpen]);

  // ----- Calculs (mémoïsés) ------------------------------------------------
  const ca = useMemo(
    () =>
      computeCaDeclarable(
        year,
        settings.composition,
        stockItems,
        builds,
        accountingEntries,
      ),
    [year, settings.composition, stockItems, builds, accountingEntries],
  );
  const caN1 = useMemo(
    () =>
      computeCaDeclarable(
        year - 1,
        settings.composition,
        stockItems,
        builds,
        accountingEntries,
      ),
    [year, settings.composition, stockItems, builds, accountingEntries],
  );
  const marge = useMemo(
    () =>
      computeMargeNetteGlobaleAnnuelle(
        year,
        stockItems,
        builds,
        accountingEntries,
        settings.composition,
      ),
    [year, stockItems, builds, accountingEntries, settings.composition],
  );
  const dep = useMemo(
    () => computeDepensesAnnuelles(year, accountingEntries, ca.totalEur),
    [year, accountingEntries, ca.totalEur],
  );
  const cotis = useMemo(
    () => computeCotisationsMicroBic(ca.totalEur, settings.micro_bic),
    [ca.totalEur, settings.micro_bic],
  );
  const tva = useMemo(
    () =>
      computeSeuilsTva(
        year,
        ca.totalEur,
        settings.micro_bic.activity_start_date,
      ),
    [year, ca.totalEur, settings.micro_bic.activity_start_date],
  );
  const reste = computeResteASoi(
    marge.margeNetteGlobaleEur,
    settings.regime === "micro_bic" ? cotis.totalCotisEur : 0,
  );
  const evolution = useMemo(() => {
    const reel = computeCaMensuelAnnuel(
      year,
      settings.composition,
      stockItems,
      builds,
      accountingEntries,
    );
    const reelN1 = computeCaMensuelAnnuel(
      year - 1,
      settings.composition,
      stockItems,
      builds,
      accountingEntries,
    );
    const now = new Date();
    const currentMonth =
      now.getFullYear() === year ? now.getMonth() : 11;
    const projection = projectCaMensuelRestant(reel, currentMonth);
    return { reel, reelN1, projection, currentMonth };
  }, [year, settings.composition, stockItems, builds, accountingEntries]);

  const caEvolutionPct =
    caN1.totalEur > 0
      ? ((ca.totalEur - caN1.totalEur) / caN1.totalEur) * 100
      : null;

  const caPerToggle = useMemo(
    () => computeCaPerToggle(year, stockItems, builds, accountingEntries),
    [year, stockItems, builds, accountingEntries],
  );

  // ----- Année dropdown ----------------------------------------------------
  const currentY = new Date().getFullYear();
  const yearItems: DropdownItem<string>[] = [
    currentY,
    currentY - 1,
    currentY - 2,
    currentY - 3,
  ].map((y) => ({ type: "option", value: String(y), label: String(y) }));

  const scrollToSettings = () => {
    setSettingsOpen(true);
    setTimeout(() => {
      settingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleExport = () => {
    const csv = buildBilanCsv(year, stockItems, builds, accountingEntries);
    downloadCsv(csv, `monark-bilan-${year}.csv`);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Sub-header */}
      <div className="flex items-center justify-between gap-3">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
          BILAN ANNUEL · {year}
        </div>
        <div className="flex items-center gap-2">
          <DropdownSelect
            value={String(year)}
            label={String(year)}
            items={yearItems}
            onChange={(v) => setYear(parseInt(v, 10))}
            minWidth={100}
          />
          <button
            type="button"
            onClick={scrollToSettings}
            className="ease-expo flex h-[30px] items-center gap-2 rounded-md px-3 transition-colors"
            style={{
              background: "rgba(9,177,186,0.06)",
              boxShadow: "inset 0 0 0 1px rgba(9,177,186,0.22)",
            }}
          >
            <span
              className="font-mono text-[10.5px] tracking-[0.16em]"
              style={{ color: "#09B1BA" }}
            >
              {REGIME_BADGE_LABEL[settings.regime]}
            </span>
            <SettingsIcon className="h-3 w-3" style={{ color: "#09B1BA" }} />
          </button>
        </div>
      </div>

      {/* § 01 — KPI tiles */}
      <Section number="01" label="SYNTHÈSE ANNUELLE">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <KpiTile
            label="CA DÉCLARABLE"
            value={`${formatEurInt(ca.totalEur)}${NBSP}€`}
            subtitle={
              caEvolutionPct == null
                ? "vs N-1 indisponible"
                : `${formatPctSigned(caEvolutionPct)} vs ${year - 1}`
            }
            subtitleColor={
              caEvolutionPct == null
                ? "#71717A"
                : caEvolutionPct >= 0
                  ? "#10B981"
                  : "#EF4444"
            }
          />
          <KpiTile
            label="MARGE NETTE GLOBALE"
            value={formatEurSignedInt(marge.margeNetteGlobaleEur)}
            valueColor={marge.margeNetteGlobaleEur >= 0 ? "#10B981" : "#EF4444"}
            subtitle={
              marge.margeMoyennePct == null
                ? "—"
                : `marge moy. ${marge.margeMoyennePct.toFixed(1)}%`
            }
            bg="rgba(16,185,129,0.04)"
            ring="rgba(16,185,129,0.22)"
          />
          <KpiTile
            label="DÉPENSES EXTERNES"
            value={`−${formatEurInt(dep.totalEur)}${NBSP}€`}
            valueColor="#EF4444"
            subtitle={
              dep.ratioOverCa == null
                ? "aucun CA"
                : `${dep.ratioOverCa.toFixed(1)}% du CA`
            }
            bg="rgba(239,68,68,0.04)"
            ring="rgba(239,68,68,0.22)"
          />
          <KpiTile
            label="COTIS. PROJETÉES"
            value={
              settings.regime === "micro_bic"
                ? `−${formatEurInt(cotis.totalCotisEur)}${NBSP}€`
                : settings.regime === "particulier"
                  ? "—"
                  : "non simulé"
            }
            valueColor={settings.regime === "micro_bic" ? "#F59E0B" : "#71717A"}
            subtitle={
              settings.regime === "micro_bic"
                ? "URSSAF + IR estimés"
                : settings.regime === "particulier"
                  ? "non applicable"
                  : "régime réel"
            }
            bg={
              settings.regime === "micro_bic"
                ? "rgba(245,158,11,0.04)"
                : "rgba(255,255,255,0.02)"
            }
            ring={
              settings.regime === "micro_bic"
                ? "rgba(245,158,11,0.22)"
                : "rgba(255,255,255,0.05)"
            }
          />
          <KpiTile
            label="RESTE À SOI"
            value={formatEurSignedInt(reste)}
            valueColor={reste >= 0 ? "#10B981" : "#EF4444"}
            subtitle="marge − dép. − cotis"
            bg="rgba(16,185,129,0.06)"
            ring="rgba(16,185,129,0.32)"
          />
        </div>
      </Section>

      {/* § 02 — Line chart */}
      <Section number="02" label={`CA MENSUEL ${year} VS ${year - 1}`}>
        <CaMensuelChart
          year={year}
          reel={evolution.reel}
          reelN1={evolution.reelN1}
          projection={evolution.projection}
          currentMonth={evolution.currentMonth}
        />
      </Section>

      {/* § 03 — Répartition */}
      <Section number="03" label="RÉPARTITION DU CA ET DES DÉPENSES">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DonutCa byCategory={ca.byCategory} totalEur={ca.totalEur} />
          <BarDepenses byCategory={dep.byCategory} totalEur={dep.totalEur} />
        </div>
      </Section>

      {/* § 04 — Projection fiscale */}
      <Section number="04" label="PROJECTION FISCALE">
        {settings.regime === "micro_bic" && (
          <MicroBicProjection
            ca={ca.totalEur}
            cotis={cotis}
            tva={tva}
            tmi={settings.micro_bic.tmi_percent}
            versementLib={settings.micro_bic.versement_liberatoire}
            onEditSettings={scrollToSettings}
          />
        )}
        {settings.regime === "particulier" && (
          <InfoBanner
            tone="blue"
            text="Vous n'êtes pas redevable de cotisations professionnelles en tant que particulier. Si vos reventes dépassent l'équivalent d'une activité régulière, vous devez vous déclarer (BIC ou BNC). Consultez un expert-comptable pour évaluer votre situation."
          />
        )}
        {settings.regime === "reel" && (
          <InfoBanner
            tone="amber"
            text="Le régime réel utilise vos écritures comptables réelles, non simulables ici. Votre expert-comptable est votre référence. Le BILAN reste disponible pour la vue agrégée."
          />
        )}
      </Section>

      {/* § 05 — Paramètres fiscaux pliables */}
      <div ref={settingsRef}>
        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          className="mb-4 flex w-full items-center gap-3 text-left"
        >
          <span className="font-mono text-[10.5px] tracking-[0.22em] text-zinc-600">
            § 05
          </span>
          <span className="h-px w-10 bg-white/10" />
          <span className="font-mono text-[10.5px] tracking-[0.22em] text-zinc-500">
            PARAMÈTRES FISCAUX
          </span>
          <span className="ml-auto font-mono text-[12px] text-zinc-500">
            {settingsOpen ? "⌃" : "⌄"}
          </span>
        </button>

        {settingsOpen && (
          <div className="flex flex-col gap-6">
            {/* Régime */}
            <SubSection label="Régime fiscal">
              <button
                type="button"
                onClick={() => setExplainerOpen(true)}
                className="ease-expo mb-3 flex w-full items-center gap-2.5 rounded-lg px-4 py-2.5 text-left transition-colors hover:brightness-110"
                style={{
                  background: "rgba(9,177,186,0.08)",
                  boxShadow: "inset 0 0 0 1px rgba(9,177,186,0.4)",
                }}
              >
                <HelpCircle
                  className="h-4 w-4 shrink-0"
                  style={{ color: "#09B1BA" }}
                  strokeWidth={1.75}
                />
                <span
                  className="text-[13px] font-medium"
                  style={{ color: "#09B1BA" }}
                >
                  Pas sûr de ton régime ? Comprendre les options
                </span>
                <span className="ml-auto font-mono text-[16px] leading-none" style={{ color: "#09B1BA" }}>
                  →
                </span>
              </button>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {(["particulier", "micro_bic", "reel"] as AccountingRegime[]).map(
                  (r, idx) => {
                    const active = settings.regime === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => updateRegime(r)}
                        className="ease-expo flex flex-col gap-2 rounded-lg p-4 text-left transition-colors"
                        style={{
                          background: active
                            ? "rgba(9,177,186,0.06)"
                            : "rgba(255,255,255,0.02)",
                          boxShadow: active
                            ? "inset 0 0 0 2px #09B1BA"
                            : "inset 0 0 0 1px rgba(255,255,255,0.06)",
                          minHeight: 120,
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <span
                            className="font-mono text-[10px] tracking-[0.18em]"
                            style={{ color: active ? "#09B1BA" : "#71717A" }}
                          >
                            OPTION {idx + 1}
                            {active ? " · ACTIF" : ""}
                          </span>
                          <span
                            className="flex h-3.5 w-3.5 items-center justify-center rounded-full"
                            style={{
                              boxShadow: `inset 0 0 0 1px ${active ? "#09B1BA" : "#52525B"}`,
                              background: active ? "#09B1BA" : "transparent",
                            }}
                          >
                            {active && (
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: "#0a0a0a" }}
                              />
                            )}
                          </span>
                        </div>
                        <div className="text-[14px] font-medium text-zinc-100">
                          {REGIME_LABELS[r]}
                        </div>
                        <div className="text-[12px] leading-relaxed text-zinc-500">
                          {REGIME_DESCRIPTIONS[r]}
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            </SubSection>

            {/* Composition CA */}
            <SubSection label="Composition du CA">
              <p className="mb-3 text-[12px] text-zinc-400">
                Sélectionnez ce que vous considérez comme partie de votre CA
                déclarable. Le calcul de l'URSSAF et de l'IR s'adapte en temps
                réel.
              </p>
              <div className="flex flex-col gap-1">
                {(
                  Object.keys(settings.composition) as Array<
                    keyof CaCompositionToggle
                  >
                ).map((k) => {
                  const on = settings.composition[k];
                  const reco = COMPOSITION_RECOMMENDATION[k];
                  return (
                    <div
                      key={k}
                      className="flex items-center gap-3 rounded-md px-3 py-2"
                      style={{
                        background: "rgba(255,255,255,0.015)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateComposition({ [k]: !on })}
                        aria-pressed={on}
                        className="ease-expo relative flex-shrink-0 rounded-full transition-colors"
                        style={{
                          width: 32,
                          height: 18,
                          background: on ? "#10B981" : "rgba(255,255,255,0.08)",
                        }}
                      >
                        <span
                          className="ease-expo absolute top-1/2 -translate-y-1/2 rounded-full transition-all"
                          style={{
                            width: 14,
                            height: 14,
                            background: "#fff",
                            left: on ? 16 : 2,
                          }}
                        />
                      </button>
                      <span
                        className="flex-1 text-[13px]"
                        style={{ color: on ? "#E4E4E7" : "#71717A" }}
                      >
                        {COMPOSITION_LABELS[k]}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-zinc-500">
                        +{formatEurInt(caPerToggle[k])}
                        {NBSP}€
                      </span>
                      <span className="w-24 text-right font-mono text-[10px] text-zinc-600">
                        {RECOMMENDATION_LABEL[reco]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </SubSection>

            {/* Paramètres micro-BIC */}
            {settings.regime === "micro_bic" && (
              <SubSection label="Paramètres micro-BIC">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Versement libératoire IR">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateMicroBic({
                            versement_liberatoire:
                              !settings.micro_bic.versement_liberatoire,
                          })
                        }
                        aria-pressed={settings.micro_bic.versement_liberatoire}
                        className="ease-expo relative flex-shrink-0 rounded-full transition-colors"
                        style={{
                          width: 32,
                          height: 18,
                          background: settings.micro_bic.versement_liberatoire
                            ? "#10B981"
                            : "rgba(255,255,255,0.08)",
                        }}
                      >
                        <span
                          className="ease-expo absolute top-1/2 -translate-y-1/2 rounded-full transition-all"
                          style={{
                            width: 14,
                            height: 14,
                            background: "#fff",
                            left: settings.micro_bic.versement_liberatoire
                              ? 16
                              : 2,
                          }}
                        />
                      </button>
                      <span className="text-[12px] text-zinc-500">
                        IR prélevé directement à 1% du CA. Désactivez pour basculer
                        au barème.
                      </span>
                    </div>
                  </Field>
                  <Field
                    label="TMI (Tranche marginale d'imposition)"
                    hint="utilisée pour comparer l'IR au barème"
                  >
                    <DropdownSelect
                      value={String(settings.micro_bic.tmi_percent)}
                      label={`${settings.micro_bic.tmi_percent}%`}
                      items={[
                        { type: "option", value: "11", label: "11%" },
                        { type: "option", value: "30", label: "30%" },
                        { type: "option", value: "41", label: "41%" },
                        { type: "option", value: "45", label: "45%" },
                      ]}
                      onChange={(v) =>
                        updateMicroBic({
                          tmi_percent: parseInt(v, 10) as 11 | 30 | 41 | 45,
                        })
                      }
                      minWidth={100}
                    />
                  </Field>
                  <Field label="Date début d'activité">
                    <input
                      type="date"
                      value={settings.micro_bic.activity_start_date}
                      onChange={(e) =>
                        updateMicroBic({ activity_start_date: e.target.value })
                      }
                      className="h-[30px] rounded-md px-3 font-mono text-[12px] text-zinc-200 focus:outline-none"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                      }}
                    />
                  </Field>
                  <Field label="CA prévisionnel annuel">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={settings.micro_bic.expected_annual_ca_eur}
                        onChange={(e) =>
                          updateMicroBic({
                            expected_annual_ca_eur:
                              parseFloat(e.target.value) || 0,
                          })
                        }
                        className="h-[30px] w-32 rounded-md px-3 font-mono text-[12px] text-zinc-200 tabular-nums focus:outline-none"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                        }}
                      />
                      <span className="font-mono text-[12px] text-zinc-500">
                        €
                      </span>
                    </div>
                  </Field>
                </div>
              </SubSection>
            )}
          </div>
        )}
      </div>

      {/* Footer export */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleExport}
          className="ease-expo flex h-[34px] items-center gap-2 rounded-md px-4 transition-colors"
          style={{
            background: "rgba(255,255,255,0.02)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <Download className="h-3.5 w-3.5 text-zinc-300" />
          <span className="font-mono text-[11px] tracking-[0.08em] text-zinc-300">
            EXPORTER CSV {year}
          </span>
        </button>
      </div>
      <RegimeExplainerModal
        open={explainerOpen}
        currentRegime={settings.regime}
        expectedAnnualCaEur={settings.micro_bic.expected_annual_ca_eur}
        onClose={() => setExplainerOpen(false)}
        onPickRegime={updateRegime}
      />
    </div>
  );
}

// =============================================================================
// Sous-composants
// =============================================================================

function Section({
  number,
  label,
  children,
}: {
  number: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="font-mono text-[10.5px] tracking-[0.22em] text-zinc-600">
          § {number}
        </span>
        <span className="h-px w-10 bg-white/10" />
        <span className="font-mono text-[10.5px] tracking-[0.22em] text-zinc-500">
          {label}
        </span>
      </div>
      {children}
    </section>
  );
}

function SubSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 font-mono text-[10.5px] tracking-[0.18em] text-zinc-500">
        {label.toUpperCase()}
      </div>
      {children}
    </div>
  );
}

function KpiTile({
  label,
  value,
  subtitle,
  valueColor = "#FAFAFA",
  subtitleColor = "#71717A",
  bg = "rgba(255,255,255,0.02)",
  ring = "rgba(255,255,255,0.05)",
}: {
  label: string;
  value: string;
  subtitle: string;
  valueColor?: string;
  subtitleColor?: string;
  bg?: string;
  ring?: string;
}) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ background: bg, boxShadow: `inset 0 0 0 1px ${ring}` }}
    >
      <div className="font-mono text-[10.5px] tracking-[0.18em] text-zinc-600">
        {label}
      </div>
      <div
        className="mt-3 font-mono text-[22px] font-medium tabular-nums"
        style={{ color: valueColor }}
      >
        {value}
      </div>
      <div
        className="mt-1 font-mono text-[10.5px]"
        style={{ color: subtitleColor }}
      >
        {subtitle}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="font-mono text-[10.5px] tracking-[0.14em] text-zinc-600">
          {label.toUpperCase()}
        </div>
        {hint && (
          <div className="mt-0.5 font-mono text-[11px] text-zinc-500">
            {hint}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function InfoBanner({
  tone,
  text,
}: {
  tone: "blue" | "amber";
  text: string;
}) {
  const colors =
    tone === "blue"
      ? { bg: "rgba(59,130,246,0.04)", ring: "rgba(59,130,246,0.22)", fg: "#60A5FA" }
      : { bg: "rgba(245,158,11,0.04)", ring: "rgba(245,158,11,0.22)", fg: "#F59E0B" };
  const Icon = tone === "blue" ? Info : AlertTriangle;
  return (
    <div
      className="flex items-start gap-3 rounded-lg p-4"
      style={{
        background: colors.bg,
        boxShadow: `inset 0 0 0 1px ${colors.ring}`,
      }}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: colors.fg }} />
      <p className="text-[13px] leading-relaxed text-zinc-300">{text}</p>
    </div>
  );
}

// ----- § 02 Line chart -------------------------------------------------------

function CaMensuelChart({
  year,
  reel,
  reelN1,
  projection,
  currentMonth,
}: {
  year: number;
  reel: number[];
  reelN1: number[];
  projection: number[];
  currentMonth: number;
}) {
  const W = 820;
  const H = 244;
  const padL = 50;
  const padR = 20;
  const padT = 24;
  const padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const allValues = [...reel, ...reelN1, ...projection];
  const rawMax = Math.max(100, ...allValues);
  const niceMax = niceCeil(rawMax);
  const ticks = 4;

  const x = (i: number) => padL + (i * innerW) / 11;
  const y = (v: number) => padT + innerH - (v / niceMax) * innerH;

  const linePath = (vals: number[], from = 0, to = 11) => {
    let d = "";
    for (let i = from; i <= to; i++) {
      d += `${i === from ? "M" : "L"} ${x(i)} ${y(vals[i])} `;
    }
    return d;
  };

  const [hover, setHover] = useState<number | null>(null);
  const reelTo = currentMonth;

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: "rgba(255,255,255,0.02)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      {/* Légende */}
      <div className="mb-2 flex items-center gap-4 font-mono text-[10.5px] text-zinc-500">
        <LegendDot color="#3B82F6" label={`CA ${year}`} />
        <LegendDot color="#52525B" label={`CA ${year - 1}`} />
        <LegendDot color="#10B981" label="Projection fin d'année" opacity={0.5} />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: W }}>
        {/* Grid */}
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const v = (niceMax * i) / ticks;
          const yy = y(v);
          return (
            <g key={i}>
              <line
                x1={padL}
                x2={W - padR}
                y1={yy}
                y2={yy}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth={1}
              />
              <text
                x={padL - 8}
                y={yy + 3}
                textAnchor="end"
                fontSize={9}
                fontFamily="monospace"
                fill="#52525B"
              >
                {formatCompactEur(v)}
              </text>
            </g>
          );
        })}

        {/* Line N-1 (pointillés gris) */}
        <path
          d={linePath(reelN1)}
          fill="none"
          stroke="#52525B"
          strokeWidth={1.6}
          strokeDasharray="4,3"
        />

        {/* Line N réel */}
        <path
          d={linePath(reel, 0, reelTo)}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2.2}
        />

        {/* Projection en pointillés vert */}
        {reelTo < 11 && (
          <path
            d={linePath(projection, reelTo, 11)}
            fill="none"
            stroke="#10B981"
            strokeWidth={1.6}
            strokeDasharray="3,3"
            opacity={0.7}
          />
        )}

        {/* Dots N */}
        {reel.map((v, i) =>
          i <= reelTo ? (
            <circle
              key={`dN-${i}`}
              cx={x(i)}
              cy={y(v)}
              r={i === reelTo ? 4 : 2.5}
              fill="#3B82F6"
              stroke={i === reelTo ? "#fff" : "none"}
              strokeWidth={i === reelTo ? 1.5 : 0}
            />
          ) : null,
        )}

        {/* Hover hit areas */}
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={`hit-${i}`}
            x={x(i) - innerW / 24}
            y={padT}
            width={innerW / 12}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "pointer" }}
          />
        ))}

        {/* Tooltip */}
        {hover != null && (
          <g pointerEvents="none">
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={padT}
              y2={padT + innerH}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
            {(() => {
              const tx = Math.min(W - padR - 134, Math.max(padL, x(hover) + 10));
              const ty = padT + 4;
              const vN = hover <= reelTo ? reel[hover] : projection[hover];
              const vN1 = reelN1[hover];
              const diff = vN1 > 0 ? ((vN - vN1) / vN1) * 100 : null;
              return (
                <g transform={`translate(${tx}, ${ty})`}>
                  <rect
                    width={130}
                    height={64}
                    rx={4}
                    fill="#18181B"
                    stroke="rgba(255,255,255,0.08)"
                  />
                  <text
                    x={8}
                    y={14}
                    fontSize={9}
                    fontFamily="monospace"
                    fill="#71717A"
                    style={{ letterSpacing: "0.1em" }}
                  >
                    {monthLabel(hover).toUpperCase()} {year}
                  </text>
                  <text
                    x={8}
                    y={32}
                    fontSize={11}
                    fontFamily="monospace"
                    fill="#3B82F6"
                  >
                    CA · {formatEurInt(vN)} €
                  </text>
                  <text
                    x={8}
                    y={50}
                    fontSize={9.5}
                    fontFamily="monospace"
                    fill="#52525B"
                  >
                    {diff == null
                      ? `vs ${monthLabel(hover)} ${year - 1}: —`
                      : `${formatPctSigned(diff)} vs ${monthLabel(hover)} ${year - 1}`}
                  </text>
                </g>
              );
            })()}
          </g>
        )}

        {/* Mois labels */}
        {Array.from({ length: 12 }).map((_, i) => (
          <text
            key={`m-${i}`}
            x={x(i)}
            y={H - 10}
            textAnchor="middle"
            fontSize={9.5}
            fontFamily="monospace"
            fill={i === currentMonth ? "#FAFAFA" : "#52525B"}
            fontWeight={i === currentMonth ? 500 : 400}
          >
            {monthLabel(i)}
          </text>
        ))}
      </svg>
    </div>
  );
}

function LegendDot({
  color,
  label,
  opacity = 1,
}: {
  color: string;
  label: string;
  opacity?: number;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-2 w-2 rounded-sm"
        style={{ background: color, opacity }}
      />
      {label}
    </span>
  );
}

function niceCeil(v: number): number {
  if (v <= 0) return 100;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const m = v / exp;
  let nice;
  if (m <= 1) nice = 1;
  else if (m <= 2) nice = 2;
  else if (m <= 5) nice = 5;
  else nice = 10;
  return nice * exp;
}

function formatCompactEur(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
  return formatEurInt(v);
}

// ----- § 03 Donut ------------------------------------------------------------

function DonutCa({
  byCategory,
  totalEur,
}: {
  byCategory: Array<{
    key: string;
    label: string;
    amountEur: number;
    pct: number;
    color: string;
  }>;
  totalEur: number;
}) {
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const r = 56;
  const inner = 34;

  let cum = 0;
  const segments = byCategory.map((c) => {
    const start = cum;
    cum += c.pct / 100;
    const end = cum;
    return { ...c, start, end };
  });

  const arc = (start: number, end: number) => {
    const a0 = start * Math.PI * 2 - Math.PI / 2;
    const a1 = end * Math.PI * 2 - Math.PI / 2;
    const large = end - start > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const xi1 = cx + inner * Math.cos(a1);
    const yi1 = cy + inner * Math.sin(a1);
    const xi0 = cx + inner * Math.cos(a0);
    const yi0 = cy + inner * Math.sin(a0);
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${inner} ${inner} 0 ${large} 0 ${xi0} ${yi0} Z`;
  };

  return (
    <div
      className="flex flex-col gap-3 rounded-lg p-4"
      style={{
        background: "rgba(255,255,255,0.02)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <div className="font-mono text-[10.5px] tracking-[0.16em] text-zinc-500">
        SOURCES DU CA
      </div>
      {totalEur === 0 ? (
        <div className="py-12 text-center font-mono text-[11px] text-zinc-600">
          Aucun CA déclarable cette année.
        </div>
      ) : (
        <div className="flex items-center gap-5">
          <svg width={size} height={size}>
            {segments.length === 1 ? (
              <>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={segments[0].color}
                />
                <circle cx={cx} cy={cy} r={inner} fill="#0a0a0a" />
              </>
            ) : (
              segments.map((s) => (
                <path key={s.key} d={arc(s.start, s.end)} fill={s.color} />
              ))
            )}
            <text
              x={cx}
              y={cy - 2}
              textAnchor="middle"
              fontSize={13}
              fontFamily="monospace"
              fill="#FAFAFA"
              fontWeight={500}
            >
              {formatEurInt(totalEur)}
            </text>
            <text
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              fontSize={9}
              fontFamily="monospace"
              fill="#71717A"
            >
              € CA total
            </text>
          </svg>
          <div className="flex-1 flex-col gap-1.5">
            {byCategory.slice(0, 5).map((c) => (
              <div key={c.key} className="flex items-center gap-2 py-0.5">
                <span
                  className="inline-block h-2 w-2 rounded-sm flex-shrink-0"
                  style={{ background: c.color }}
                />
                <span className="flex-1 truncate text-[11.5px] text-zinc-300">
                  {c.label}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-zinc-400">
                  {formatEurInt(c.amountEur)}
                  {NBSP}€
                </span>
                <span className="w-10 text-right font-mono text-[10px] tabular-nums text-zinc-600">
                  {c.pct.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-1 font-mono text-[10px] text-zinc-600">
        Configurable dans § 05
      </div>
    </div>
  );
}

// ----- § 03 Bar dépenses -----------------------------------------------------

function BarDepenses({
  byCategory,
  totalEur,
}: {
  byCategory: Array<{ category: string; label: string; amountEur: number }>;
  totalEur: number;
}) {
  const max = byCategory.reduce((m, c) => Math.max(m, c.amountEur), 0);
  const visible = byCategory.slice(0, 7);

  return (
    <div
      className="flex flex-col gap-3 rounded-lg p-4"
      style={{
        background: "rgba(255,255,255,0.02)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10.5px] tracking-[0.16em] text-zinc-500">
          DÉPENSES PAR CATÉGORIE
        </div>
        <div className="font-mono text-[11px] tabular-nums text-zinc-400">
          −{formatEurInt(totalEur)}
          {NBSP}€
        </div>
      </div>
      {visible.length === 0 ? (
        <div className="py-12 text-center font-mono text-[11px] text-zinc-600">
          Aucune dépense cette année.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((c) => {
            const pct = max > 0 ? (c.amountEur / max) * 100 : 0;
            return (
              <div key={c.category} className="flex items-center gap-3">
                <div className="w-32 truncate text-right text-[11.5px] text-zinc-400">
                  {c.label}
                </div>
                <div className="relative h-2.5 flex-1 rounded-sm bg-white/5">
                  <div
                    className="absolute inset-y-0 left-0 rounded-sm"
                    style={{ width: `${pct}%`, background: "#EF4444" }}
                  />
                </div>
                <div className="w-20 text-right font-mono text-[11px] tabular-nums text-zinc-400">
                  −{formatEurInt(c.amountEur)}
                  {NBSP}€
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ----- § 04 Projection micro-BIC --------------------------------------------

function MicroBicProjection({
  ca,
  cotis,
  tva,
  tmi,
  versementLib,
  onEditSettings,
}: {
  ca: number;
  cotis: ReturnType<typeof computeCotisationsMicroBic>;
  tva: ReturnType<typeof computeSeuilsTva>;
  tmi: number;
  versementLib: boolean;
  onEditSettings: () => void;
}) {
  return (
    <div
      className="rounded-lg p-5"
      style={{
        background: "rgba(9,177,186,0.04)",
        boxShadow: "inset 0 0 0 1px rgba(9,177,186,0.22)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="font-mono text-[10.5px] tracking-[0.16em] text-zinc-500">
          ESTIMATIONS MICRO-BIC · VENTE DE MARCHANDISES
        </div>
        <button
          type="button"
          onClick={onEditSettings}
          className="font-mono text-[10px] text-blue-400 transition-colors hover:text-blue-300"
        >
          Modifier mes paramètres →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ProjCell
          label="URSSAF · VENTE MARCHANDISES"
          value={`−${formatEurInt(cotis.urssafEur)}${NBSP}€`}
          subtitle={`12.3% de ${formatEurInt(ca)} €`}
          color="#F59E0B"
        />
        <ProjCell
          label="IR · VERSEMENT LIBÉRATOIRE"
          value={
            cotis.irLiberatoireEur != null
              ? `−${formatEurInt(cotis.irLiberatoireEur)}${NBSP}€`
              : "—"
          }
          subtitle={
            versementLib ? "1% du CA · option active" : "option désactivée"
          }
          color={versementLib ? "#F59E0B" : "#52525B"}
        />
        <ProjCell
          label="IR · BARÈME ALTERNATIF"
          value={`−${formatEurInt(cotis.irBaremeAlternatifEur)}${NBSP}€`}
          subtitle={`TMI ${tmi}% sur ${formatEurInt(cotis.revenuImposableEur)} € imposable`}
          color="#71717A"
        />
        <ProjCell
          label="TVA"
          value={
            tva.status === "exceeded" ? "REDEVABLE · 20%" : "N/A · Franchise"
          }
          subtitle={`${formatEurInt(tva.caCourant)} / ${formatEurInt(tva.seuilFranchiseTva)} €`}
          color={tva.status === "exceeded" ? "#EF4444" : "#10B981"}
          smallValue={tva.status === "exceeded"}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="font-mono text-[10px] tracking-[0.16em] text-zinc-600">
          SEUILS DE FRANCHISE 2026
        </div>
        <SeuilBar
          label={`TVA · ${formatEurInt(tva.seuilFranchiseTva)} €`}
          pct={tva.pctFranchise}
          current={tva.caCourant}
          seuil={tva.seuilFranchiseTva}
        />
        <SeuilBar
          label={`Micro · ${formatEurInt(tva.seuilRegimeMicro)} €`}
          pct={tva.pctRegimeMicro}
          current={tva.caCourant}
          seuil={tva.seuilRegimeMicro}
        />
      </div>

      <div className="mt-4 font-mono text-[9.5px] text-zinc-600">
        Estimations indicatives, valeurs 2026. Pour vos déclarations réelles,
        consultez votre expert-comptable.
      </div>
    </div>
  );
}

function ProjCell({
  label,
  value,
  subtitle,
  color,
  smallValue = false,
}: {
  label: string;
  value: string;
  subtitle: string;
  color: string;
  smallValue?: boolean;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-[0.14em] text-zinc-600">
        {label}
      </div>
      <div
        className="mt-2 font-mono font-medium tabular-nums"
        style={{ color, fontSize: smallValue ? 14 : 20 }}
      >
        {value}
      </div>
      <div className="mt-1 font-mono text-[10px] text-zinc-500">{subtitle}</div>
    </div>
  );
}

function SeuilBar({
  label,
  pct,
  current,
  seuil,
}: {
  label: string;
  pct: number;
  current: number;
  seuil: number;
}) {
  const exceeded = pct > 100;
  const warning = pct >= 80 && !exceeded;
  const fill = exceeded ? "#EF4444" : warning ? "#F59E0B" : "#10B981";
  return (
    <div className="flex items-center gap-3">
      <div className="w-44 font-mono text-[11px] text-zinc-400">{label}</div>
      <div className="relative h-2 flex-1 rounded-sm bg-white/5">
        <div
          className="absolute inset-y-0 left-0 rounded-sm"
          style={{ width: `${Math.min(100, pct)}%`, background: fill }}
        />
      </div>
      <div
        className="w-12 text-right font-mono text-[10.5px] tabular-nums"
        style={{ color: exceeded ? "#EF4444" : "#A1A1AA" }}
      >
        {pct.toFixed(0)}%
      </div>
      <div className="w-28 text-right font-mono text-[10.5px] tabular-nums text-zinc-500">
        {formatEurInt(current)} / {formatEurInt(seuil)}
      </div>
    </div>
  );
}