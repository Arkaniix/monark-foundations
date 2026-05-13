import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import Estimator from "../pages/Estimator";

type EstimatorSearch = {
  model?: string;
};

export const Route = createFileRoute("/estimator")({
  validateSearch: (search: Record<string, unknown>): EstimatorSearch => ({
    model: typeof search.model === "string" ? search.model : undefined,
  }),
  component: EstimatorRouteComponent,
});

function EstimatorRouteComponent() {
  const { model } = Route.useSearch();
  return (
    <RequireAuth>
      <AppShell pageLabel="ESTIMATEUR" activePath="/estimator">
        <Estimator initialModelFromQuery={model} />
      </AppShell>
    </RequireAuth>
  );
}