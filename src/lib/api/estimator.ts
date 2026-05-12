/**
 * Vraie implémentation Estimator API. Placeholder — wire backend en E1+.
 */

import { ApiException } from "./client";
import type {
  EstimatorInputs,
  EstimatorResult,
} from "../../components/estimator/datasets";

export async function evaluate(
  _inputs: EstimatorInputs,
): Promise<EstimatorResult> {
  throw new ApiException(
    501,
    "Estimator evaluate endpoint not yet wired to backend. Use VITE_USE_MOCK_API=true.",
    "NOT_IMPLEMENTED",
  );
}