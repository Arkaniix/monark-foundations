import { useCallback, useMemo, useState } from "react";
import { estimatorApi } from "@/lib/api";
import { ApiException } from "@/lib/api/client";
import { EstimatorForm } from "@/components/estimator/EstimatorForm";
import { EstimatorVerdict } from "@/components/estimator/EstimatorVerdict";
import { EstimatorIdle } from "@/components/estimator/EstimatorIdle";
import { EstimatorTerminal } from "@/components/estimator/EstimatorTerminal";
import { EstimatorError } from "@/components/estimator/EstimatorError";
import { EstimatorPositioning } from "@/components/estimator/EstimatorPositioning";
import { EstimatorScoreBreakdown } from "@/components/estimator/EstimatorScoreBreakdown";
import { EstimatorNegotiation } from "@/components/estimator/EstimatorNegotiation";
import { EstimatorResaleWhere } from "@/components/estimator/EstimatorResaleWhere";
import { EstimatorResaleWhen } from "@/components/estimator/EstimatorResaleWhen";
import { EstimatorWarnings } from "@/components/estimator/EstimatorWarnings";
import { EstimatorHistoryButton } from "@/components/estimator/EstimatorHistoryButton";
import { EstimatorHistoryDrawer } from "@/components/estimator/EstimatorHistoryDrawer";
import { EstimatorCapBlockModal } from "@/components/estimator/EstimatorCapBlockModal";
import { useEstimatorHistory } from "@/lib/estimatorHistory";
import FadeInSection from "@/components/ui/FadeInSection";
import { downloadEstimationCsv } from "@/lib/exportEstimation";
import type {
  EstimatorInputs,
  EstimatorResult,
  Platform,
  AnyEstimatorResult,
  SellResult,
} from "@/components/estimator/datasets";
import EstimatorSellRecommendation from "@/components/estimator/EstimatorSellRecommendation";
import EstimatorSellStrategies from "@/components/estimator/EstimatorSellStrategies";
import EstimatorSellWhere from "@/components/estimator/EstimatorSellWhere";
import EstimatorSellProjection from "@/components/estimator/EstimatorSellProjection";
import EstimatorSellDecay from "@/components/estimator/EstimatorSellDecay";
import EstimatorSellPresentation from "@/components/estimator/EstimatorSellPresentation";

export type EstimatorState =
  | { status: "idle" }
  | { status: "evaluating"; inputs: EstimatorInputs }
  | { status: "success"; result: AnyEstimatorResult }
  | { status: "error"; message: string; code?: number; lastInputs?: EstimatorInputs };

type EstimatorPageProps = {
  __devForceState?: EstimatorState;
  initialModelFromQuery?: string;
};

export default function Estimator({
  __devForceState,
  initialModelFromQuery,
}: EstimatorPageProps = {}) {
  const [state, setState] = useState<EstimatorState>(
    __devForceState ?? { status: "idle" },
  );
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCapModalOpen, setIsCapModalOpen] = useState(false);
  const [prefilledInputs, setPrefilledInputs] = useState<
    EstimatorInputs | undefined
  >(
    initialModelFromQuery
      ? { model: initialModelFromQuery, state: "Bon", ask_price_eur: 0, platform: "LBC" }
      : undefined,
  );

  const history = useEstimatorHistory();

  const handleSubmit = useCallback(
    async (inputs: EstimatorInputs) => {
      if (__devForceState) return;
      if (history.isAtCap) {
        setIsCapModalOpen(true);
        return;
      }
      setSelectedPlatform(null);
      setState({ status: "evaluating", inputs });
      const evalStartedAt = Date.now();
      const MIN_TERMINAL_MS = 2400;
      try {
        const result = await estimatorApi.evaluate(inputs);
        const elapsed = Date.now() - evalStartedAt;
        if (elapsed < MIN_TERMINAL_MS) {
          await new Promise((resolve) =>
            setTimeout(resolve, MIN_TERMINAL_MS - elapsed),
          );
        }
        setState({ status: "success", result });
        if (result.flow !== "sell") {
          history.add(inputs, result as EstimatorResult);
        }
      } catch (err) {
        const code = err instanceof ApiException ? err.status : undefined;
        const message =
          err instanceof Error ? err.message : "Erreur d'évaluation";
        setState({ status: "error", message, code, lastInputs: inputs });
      }
    },
    [__devForceState, history],
  );

  const handleModeChange = useCallback(() => {
    if (__devForceState) return;
    setState({ status: "idle" });
    setSelectedPlatform(null);
  }, [__devForceState]);

  const handleRetry = useCallback(() => {
    if (state.status === "error" && state.lastInputs) {
      void handleSubmit(state.lastInputs);
    } else {
      setState({ status: "idle" });
    }
  }, [state, handleSubmit]);

  const handleLoadFromHistory = useCallback((inputs: EstimatorInputs) => {
    setPrefilledInputs(inputs);
    setState({ status: "idle" });
  }, []);

  const handleReevaluateFromHistory = useCallback(
    (inputs: EstimatorInputs) => {
      setPrefilledInputs(inputs);
      void handleSubmit(inputs);
    },
    [handleSubmit],
  );

  const formDisabled = state.status === "evaluating";
  const initialInputs =
    prefilledInputs ??
    (state.status === "evaluating"
      ? state.inputs
      : state.status === "error"
        ? state.lastInputs
        : state.status === "success"
          ? state.result.inputs
          : undefined);

  const effectivePlatform: Platform | null = useMemo(() => {
    if (state.status !== "success") return null;
    if (state.result.flow === "sell") return null;
    if (selectedPlatform) return selectedPlatform;
    const platforms = state.result.resale_where?.platforms ?? [];
    const topPick = platforms.find((p) => p.is_top_pick);
    return topPick?.platform ?? platforms[0]?.platform ?? null;
  }, [state, selectedPlatform]);

  const feesPctByPlatform = useMemo<Partial<Record<Platform, number>>>(() => {
    if (state.status !== "success") return {};
    if (state.result.flow === "sell") return {};
    const out: Partial<Record<Platform, number>> = {};
    for (const p of state.result.resale_where?.platforms ?? []) {
      out[p.platform] = p.fees_pct;
    }
    return out;
  }, [state]);

  const isSellSuccess =
    state.status === "success" && state.result.flow === "sell";
  const isBuySuccess =
    state.status === "success" && state.result.flow !== "sell";
  const buyResult =
    isBuySuccess ? (state.result as EstimatorResult) : null;
  const sellResult =
    isSellSuccess ? (state.result as SellResult) : null;

  return (
    <>
    <div className="flex flex-col gap-10">
      <div className="flex justify-end gap-3">
        {state.status === "success" && (
          <button
            type="button"
            onClick={() => downloadEstimationCsv(state.result)}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 font-mono text-[10.5px] tracking-wider text-zinc-400 hover:text-zinc-200 hover:border-white/20 ease-expo transition-colors"
          >
            EXPORT CSV
          </button>
        )}
        <EstimatorHistoryButton
          count={history.count}
          onClick={() => setIsDrawerOpen(true)}
        />
      </div>
      <FadeInSection delay={0}>
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-600">
            § 01
          </div>
          <div className="h-px w-10 bg-white/10" />
          <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
            ÉVALUATION
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <EstimatorForm
            initial={initialInputs}
            disabled={formDisabled}
            onSubmit={handleSubmit}
            onModeChange={handleModeChange}
            feesPctByPlatform={feesPctByPlatform}
          />

          {state.status === "idle" && <EstimatorIdle />}
          {state.status === "evaluating" && (
            <EstimatorTerminal inputs={state.inputs} />
          )}
          {buyResult && <EstimatorVerdict result={buyResult} />}
          {sellResult && <EstimatorSellRecommendation result={sellResult} />}
          {state.status === "error" && (
            <EstimatorError message={state.message} code={state.code} onRetry={handleRetry} />
          )}
        </div>
      </section>
      </FadeInSection>

      {buyResult && buyResult.warnings && buyResult.warnings.length > 0 && (
          <FadeInSection delay={60}>
            <EstimatorWarnings warnings={buyResult.warnings} />
          </FadeInSection>
        )}

      {buyResult && (
        <FadeInSection delay={90}>
          <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
            <div className="font-mono text-[9.5px] tracking-[0.2em] text-zinc-500 mt-0.5 shrink-0">RAPPEL</div>
            <p className="text-[12.5px] text-zinc-400 leading-relaxed">
              Paie toujours via le paiement protégé de la plateforme. Tout virement, PayPal entre particuliers ou acompte hors plateforme est le scénario d'arnaque classique — refuse.
            </p>
          </div>
        </FadeInSection>
      )}

      {buyResult && buyResult.has_market_detail === false && (
        <FadeInSection delay={120}>
          <div className="mk-card p-6 flex flex-col gap-2">
            <div className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-500">
              DONNÉES INSUFFISANTES
            </div>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              Données insuffisantes pour ce modèle — le verdict et la médiane
              restent affichés, mais le détail marché demande plus de ventes
              observées.
            </p>
          </div>
        </FadeInSection>
      )}

      {buyResult && buyResult.has_market_detail !== false && (
        <FadeInSection delay={120}>
          <EstimatorNegotiation result={buyResult} />
        </FadeInSection>
      )}

      {buyResult && buyResult.resale_where && (
        <FadeInSection delay={180}>
          <EstimatorResaleWhere result={buyResult} />
        </FadeInSection>
      )}

      {buyResult && buyResult.resale_when && effectivePlatform && (
          <FadeInSection delay={240}>
            <EstimatorResaleWhen
              result={buyResult}
              selectedPlatform={effectivePlatform}
            />
          </FadeInSection>
        )}

      {buyResult && buyResult.has_market_detail !== false && (
        <FadeInSection delay={300}>
          <EstimatorPositioning result={buyResult} />
        </FadeInSection>
      )}

      {buyResult && buyResult.has_market_detail !== false && (
        <FadeInSection delay={360}>
          <EstimatorScoreBreakdown result={buyResult} />
        </FadeInSection>
      )}

      {sellResult && (
        <FadeInSection delay={120}>
          <EstimatorSellStrategies result={sellResult} />
        </FadeInSection>
      )}

      {sellResult && (
        <FadeInSection delay={180}>
          <EstimatorSellWhere result={sellResult} />
        </FadeInSection>
      )}

      {sellResult && sellResult.projection && (
        <FadeInSection delay={240}>
          <EstimatorSellProjection result={sellResult} />
        </FadeInSection>
      )}

      {sellResult && sellResult.decay && sellResult.decay.length > 0 && (
        <FadeInSection delay={300}>
          <EstimatorSellDecay result={sellResult} />
        </FadeInSection>
      )}

      {sellResult && sellResult.presentation && (
        <FadeInSection delay={360}>
          <EstimatorSellPresentation result={sellResult} />
        </FadeInSection>
      )}
    </div>

    <EstimatorHistoryDrawer
      isOpen={isDrawerOpen}
      onClose={() => setIsDrawerOpen(false)}
      entries={history.entries}
      cap={history.cap}
      onLoad={handleLoadFromHistory}
      onReevaluate={handleReevaluateFromHistory}
      onDelete={history.remove}
      onClearAll={history.clear}
    />

    <EstimatorCapBlockModal
      isOpen={isCapModalOpen}
      cap={history.cap}
      onClose={() => setIsCapModalOpen(false)}
      onOpenHistory={() => setIsDrawerOpen(true)}
    />
    </>
  );
}