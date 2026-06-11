import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import Estimator from "../pages/Estimator";

type EstimatorSearch = {
  model?: string;
  price?: number;
  condition?: string;
  platform?: string;
  source?: string;
};

export const Route = createFileRoute("/estimator")({
  validateSearch: (search: Record<string, unknown>): EstimatorSearch => {
    const rawPrice =
      typeof search.price === "number"
        ? search.price
        : typeof search.price === "string"
          ? Number(search.price)
          : undefined;
    return {
      model: typeof search.model === "string" ? search.model : undefined,
      price:
        typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice > 0
          ? rawPrice
          : undefined,
      condition: typeof search.condition === "string" ? search.condition : undefined,
      platform: typeof search.platform === "string" ? search.platform : undefined,
      source: typeof search.source === "string" ? search.source : undefined,
    };
  },
  component: EstimatorRouteComponent,
});

function EstimatorRouteComponent() {
  const { model, price, condition, platform } = Route.useSearch();
  return (
    <RequireAuth>
      <AppShell pageLabel="ESTIMATEUR" activePath="/estimator">
        <Estimator
          initialModelFromQuery={model}
          initialPriceFromQuery={price}
          initialConditionFromQuery={condition}
          initialPlatformFromQuery={platform?.toLowerCase()}
        />
      </AppShell>
    </RequireAuth>
  );
}