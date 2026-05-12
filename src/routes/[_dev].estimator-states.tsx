import { createFileRoute } from "@tanstack/react-router";
import EstimatorStatesPreview from "@/pages/EstimatorStatesPreview";

export const Route = createFileRoute("/_dev/estimator-states")({
  component: EstimatorStatesPreview,
});