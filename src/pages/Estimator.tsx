import { useCallback, useState } from "react";
import { estimatorApi } from "@/lib/api";
import { EstimatorForm } from "@/components/estimator/EstimatorForm";
import { EstimatorVerdict } from "@/components/estimator/EstimatorVerdict";
import { EstimatorIdle } from "@/components/estimator/EstimatorIdle";
import { EstimatorError } from "@/components/estimator/EstimatorError";
import { EstimatorPositioning } from "@/components/estimator/EstimatorPositioning";
import { EstimatorScoreBreakdown } from "@/components/estimator/EstimatorScoreBreakdown";
import { EstimatorNegotiation } from "@/components/estimator/EstimatorNegotiation";
import type {
  EstimatorInputs,
  EstimatorResult,
} from "@/components/estimator/datasets";

export type EstimatorState =
  | { status: "idle" }
  | { status: "evaluating"; inputs: EstimatorInputs }
  | { status: "success"; result: EstimatorResult }
  | { status: "error"; message: string; lastInputs?: EstimatorInputs };

type EstimatorPageProps = {
  __devForceState?: EstimatorState;
};

export default function Estimator({
  __devForceState,
}: EstimatorPageProps = {}) {
  const [state, setState] = useState<EstimatorState>(
    __devForceState ?? { status: "idle" },
  );

  const handleSubmit = useCallback(
    async (inputs: EstimatorInputs) => {
      if (__devForceState) return;
      setState({ status: "evaluating", inputs });
      try {
        const result = await estimatorApi.evaluate(inputs);
        setState({ status: "success", result });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erreur d'évaluation";
        setState({ status: "error", message, lastInputs: inputs });
      }
    },
    [__devForceState],
  );

  const handleRetry = useCallback(() => {
    if (state.status === "error" && state.lastInputs) {
      void handleSubmit(state.lastInputs);
    } else {
      setState({ status: "idle" });
    }
  }, [state, handleSubmit]);

  const formDisabled = state.status === "evaluating";
  const initialInputs =
    state.status === "evaluating"
      ? state.inputs
      : state.status === "error"
        ? state.lastInputs
        : state.status === "success"
          ? state.result.inputs
          : undefined;

  return (
    <div className="flex flex-col gap-10">
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
          />

          {state.status === "idle" && <EstimatorIdle />}
          {state.status === "evaluating" && <EstimatorIdle pending />}
          {state.status === "success" && (
            <EstimatorVerdict result={state.result} />
          )}
          {state.status === "error" && (
            <EstimatorError message={state.message} onRetry={handleRetry} />
          )}
        </div>
      </section>

      {state.status === "success" && (
        <EstimatorPositioning result={state.result} />
      )}

      {state.status === "success" && (
        <EstimatorScoreBreakdown result={state.result} />
      )}

      {state.status === "success" && (
        <EstimatorNegotiation result={state.result} />
      )}
    </div>
  );
}