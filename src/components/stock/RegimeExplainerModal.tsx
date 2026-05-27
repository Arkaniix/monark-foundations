import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ArrowRight, ArrowLeft, Info } from "lucide-react";
import type { AccountingRegime } from "@/lib/useAccountingSettings";
import {
  ABATTEMENT_MICRO_BIC_MARCHANDISES,
  URSSAF_TAUX_MARCHANDISES,
  IR_LIBERATOIRE_TAUX_MARCHANDISES,
  SEUIL_FRANCHISE_TVA_MARCHANDISES_2026,
  SEUIL_REGIME_MICRO_2026,
  formatEurInt,
} from "./bilanCalculations";

type Props = {
  open: boolean;
  currentRegime: AccountingRegime;
  expectedAnnualCaEur: number;
  onClose: () => void;
  onPickRegime: (regime: AccountingRegime) => void;
};

const ACCENT = "#09B1BA";

/**
 * Modale d'information neutre sur les régimes fiscaux (FR).
 * Objectif : informer sans orienter. Aucun régime n'est "recommandé" ni mis en
 * avant ; l'utilisateur garde la décision. 3 volets factuels + écran de choix.
 */
export default function RegimeExplainerModal({
  open,
  currentRegime,
  expectedAnnualCaEur,
  onClose,
  onPickRegime,
}: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const ca = Number.isFinite(expectedAnnualCaEur) ? Math.max(0, expectedAnnualCaEur) : 0;
  const abattementPct = Math.round(ABATTEMENT_MICRO_BIC_MARCHANDISES * 100);
  const baseImposablePct = Math.round((1 - ABATTEMENT_MICRO_BIC_MARCHANDISES) * 100);
  const irLiberatoirePct = IR_LIBERATOIRE_TAUX_MARCHANDISES * 100;
  const urssafPct = URSSAF_TAUX_MARCHANDISES * 100;

  const cotisations = Math.round(ca * URSSAF_TAUX_MARCHANDISES);
  const irLiberatoire = Math.round(ca * IR_LIBERATOIRE_TAUX_MARCHANDISES);
  const chargeTotale = cotisations + irLiberatoire;
  const pctTotal = ca > 0 ? Math.round((chargeTotale / ca) * 100) : 0;

  const STEPS = ["FAITS", "RÉGIMES", "EN EUROS", "À TOI DE VOIR"];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
      style={{ background: "rgba(0,0,0,0.72)" }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden rounded-lg"
        style={{
          background: "#0F0F11",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08)",
          animation: "regime-modal-in 180ms cubic-bezier(0.16,1,0.3,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <style>{`
          @keyframes regime-modal-in {
            from { opacity: 0; transform: translateY(8px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--mk-divider-soft)" }}
        >
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-600">
              FISCALITÉ · INFORMATION
            </div>
            <div className="mt-1 text-[15px] font-medium text-zinc-100">Comprendre les régimes</div>
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

        {/* Stepper */}
        <div className="flex items-center gap-1.5 px-5 pt-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col gap-1.5">
              <div
                className="h-0.5 w-full rounded-full"
                style={{
                  background: i <= step ? ACCENT : "rgba(255,255,255,0.08)",
                }}
              />
              <span
                className="font-mono text-[8.5px] tracking-[0.12em]"
                style={{ color: i === step ? ACCENT : "#52525B" }}
              >
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step === 0 && <StepFaits />}
          {step === 1 && <StepRegimes />}
          {step === 2 && (
            <StepEuros
              ca={ca}
              baseImposablePct={baseImposablePct}
              abattementPct={abattementPct}
              irLiberatoirePct={irLiberatoirePct}
              urssafPct={urssafPct}
              cotisations={cotisations}
              irLiberatoire={irLiberatoire}
              chargeTotale={chargeTotale}
              pctTotal={pctTotal}
            />
          )}
          {step === 3 && (
            <StepChoix
              currentRegime={currentRegime}
              onPick={(r) => {
                onPickRegime(r);
                onClose();
              }}
            />
          )}
        </div>

        {/* Disclaimer + nav */}
        <div
          className="flex flex-col gap-3 px-5 py-4"
          style={{ borderTop: "1px solid var(--mk-divider-soft)" }}
        >
          <div className="flex items-start gap-2 text-[11px] leading-relaxed text-zinc-500">
            <Info className="mt-0.5 h-3 w-3 shrink-0 text-zinc-600" strokeWidth={1.5} />
            <span>
              Information générale, pas un conseil fiscal. Pour ta situation précise, consulte un
              expert-comptable.
            </span>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="ease-expo flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] transition-colors disabled:opacity-30"
              style={{ color: "#a1a1aa" }}
            >
              <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
              RETOUR
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(3, s + 1))}
                className="ease-expo flex items-center gap-1.5 rounded-md px-4 py-1.5 font-mono text-[10px] tracking-[0.14em] transition-colors"
                style={{
                  background: "rgba(9,177,186,0.1)",
                  boxShadow: `inset 0 0 0 1px ${ACCENT}55`,
                  color: ACCENT,
                }}
              >
                SUIVANT
                <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="ease-expo rounded-md px-4 py-1.5 font-mono text-[10px] tracking-[0.14em] text-zinc-300 transition-colors hover:bg-white/[0.05]"
              >
                FERMER
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );

  // ---- Volet 1 : faits juridiques ----
  function StepFaits() {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[13px] leading-relaxed text-zinc-300">
          Ce qui distingue une vente occasionnelle d'une activité ne dépend pas d'un montant, mais
          de la nature de l'acte.
        </p>
        <FactRow
          title="Vendre son propre matériel d'occasion"
          body="Revendre ce qu'on possédait pour son usage personnel, de façon ponctuelle, n'entre pas dans le champ commercial. Aucune déclaration."
        />
        <FactRow
          title="Acheter pour revendre"
          body="Acheter un bien dans le but de le revendre avec une intention de profit est un acte de commerce. Dans ce cas, l'activité est déclarable dès le premier euro — le critère est la nature de l'acte, pas un seuil."
        />
        <FactRow
          title="Le seuil 2 000 € / 30 ventes"
          body="C'est un seuil de signalement : au-delà, les plateformes transmettent automatiquement les données au fisc. Ce n'est pas un seuil d'exonération — être en dessous ne rend pas une activité de revente exonérée."
        />
      </div>
    );
  }

  // ---- Volet 2 : comparatif neutre ----
  function StepRegimes() {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[13px] leading-relaxed text-zinc-300">
          Ce que chaque régime implique, sans classement.
        </p>
        <RegimeCard
          name="Particulier"
          points={[
            "Vente occasionnelle de ses propres biens : rien à déclarer.",
            "Ne couvre pas l'achat-revente habituel, qui sort de ce cadre.",
          ]}
        />
        <RegimeCard
          name="Micro-entreprise"
          points={[
            `Abattement de ${abattementPct} % : imposition sur ${baseImposablePct} % du CA seulement.`,
            `Versement libératoire optionnel : IR à ${irLiberatoirePct} % du CA.`,
            `Cotisations sociales ~${urssafPct} % du CA. ACRE allégée au démarrage.`,
            `Seuils : franchise TVA ${formatEurInt(SEUIL_FRANCHISE_TVA_MARCHANDISES_2026)} · plafond micro ${formatEurInt(SEUIL_REGIME_MICRO_2026)}.`,
            "0 € encaissé = 0 € de charges.",
          ]}
        />
        <RegimeCard
          name="Régime réel"
          points={[
            "Déduction des charges réelles et amortissements.",
            "Pertinent si les charges réelles dépassent l'abattement forfaitaire.",
            "Comptabilité plus détaillée à tenir.",
          ]}
        />
      </div>
    );
  }
}

// ---- Volet 3 : chiffres ----
function StepEuros({
  ca,
  baseImposablePct,
  abattementPct,
  irLiberatoirePct,
  urssafPct,
  cotisations,
  irLiberatoire,
  chargeTotale,
  pctTotal,
}: {
  ca: number;
  baseImposablePct: number;
  abattementPct: number;
  irLiberatoirePct: number;
  urssafPct: number;
  cotisations: number;
  irLiberatoire: number;
  chargeTotale: number;
  pctTotal: number;
}) {
  if (ca <= 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[13px] leading-relaxed text-zinc-300">
          Renseigne un CA annuel prévisionnel dans les paramètres micro-BIC pour voir l'estimation
          chiffrée ici.
        </p>
        <p className="text-[12px] leading-relaxed text-zinc-500">
          À retenir : en micro, on n'est imposé que sur {baseImposablePct} % du CA (abattement{" "}
          {abattementPct} %), et 0 € encaissé = 0 € de charges.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] leading-relaxed text-zinc-300">
        Pour un CA de {formatEurInt(ca)} en micro-entreprise (estimation indicative) :
      </p>
      <div className="flex flex-col gap-2">
        <EuroRow
          label={`Cotisations sociales (~${urssafPct} %)`}
          value={formatEurInt(cotisations)}
        />
        <EuroRow
          label={`IR versement libératoire (${irLiberatoirePct} %)`}
          value={formatEurInt(irLiberatoire)}
        />
        <div className="my-1 h-px w-full bg-white/[0.06]" />
        <EuroRow
          label={`Charge totale estimée (~${pctTotal} % du CA)`}
          value={formatEurInt(chargeTotale)}
          strong
        />
      </div>
      <p className="text-[12px] leading-relaxed text-zinc-500">
        Soit un net estimé de {formatEurInt(ca - chargeTotale)} avant impôt au barème si tu n'optes
        pas pour le versement libératoire. L'abattement de {abattementPct} % signifie que
        l'imposition ne porte que sur {baseImposablePct} % du CA.
      </p>
    </div>
  );
}

// ---- Volet 4 : choix ----
function StepChoix({
  currentRegime,
  onPick,
}: {
  currentRegime: AccountingRegime;
  onPick: (r: AccountingRegime) => void;
}) {
  const OPTIONS: { regime: AccountingRegime; label: string }[] = [
    { regime: "micro_bic", label: "Je me déclare en micro-entreprise" },
    { regime: "reel", label: "Je passe au régime réel" },
    { regime: "particulier", label: "Je reste en particulier pour l'instant" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[13px] leading-relaxed text-zinc-300">
          Tu as les faits. Le choix t'appartient — tu peux le changer à tout moment.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {OPTIONS.map((o) => {
          const active = currentRegime === o.regime;
          return (
            <button
              key={o.regime}
              type="button"
              onClick={() => onPick(o.regime)}
              className="ease-expo flex items-center justify-between rounded-lg px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
              style={{
                background: "rgba(255,255,255,0.02)",
                boxShadow: active
                  ? `inset 0 0 0 1px ${ACCENT}66`
                  : "inset 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            >
              <span className="text-[13px] text-zinc-200">{o.label}</span>
              <span className="flex items-center gap-2">
                {active && (
                  <span
                    className="font-mono text-[9px] tracking-[0.14em]"
                    style={{ color: ACCENT }}
                  >
                    ACTUEL
                  </span>
                )}
                <ArrowRight className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- petites briques ----
function FactRow({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="rounded-lg px-4 py-3"
      style={{
        background: "rgba(255,255,255,0.015)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <div className="text-[13px] font-medium text-zinc-100">{title}</div>
      <div className="mt-1 text-[12px] leading-relaxed text-zinc-400">{body}</div>
    </div>
  );
}

function RegimeCard({ name, points }: { name: string; points: string[] }) {
  return (
    <div
      className="rounded-lg px-4 py-3"
      style={{
        background: "rgba(255,255,255,0.015)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <div className="text-[13px] font-medium text-zinc-100">{name}</div>
      <ul className="mt-2 flex flex-col gap-1.5">
        {points.map((p, i) => (
          <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-zinc-400">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EuroRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px]" style={{ color: strong ? "#E4E4E7" : "#a1a1aa" }}>
        {label}
      </span>
      <span
        className="font-mono text-[13px] tabular-nums"
        style={{ color: strong ? "#E4E4E7" : "#d4d4d8" }}
      >
        {value}
      </span>
    </div>
  );
}
