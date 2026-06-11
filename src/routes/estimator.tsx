import { createFileRoute } from "@tanstack/react-router";
import RequireAuth from "../components/app/RequireAuth";
import AppShell from "../components/app/AppShell";
import Estimator from "../pages/Estimator";

type EstimatorSearch = {
  model?: string;
  component?: number;
  price?: number;
  condition?: string;
  platform?: string;
  source?: string;
  date?: string;
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
      component: (() => {
        const raw =
          typeof search.component === "number"
            ? search.component
            : typeof search.component === "string"
              ? Number(search.component)
              : undefined;
        return typeof raw === "number" && Number.isInteger(raw) && raw > 0
          ? raw
          : undefined;
      })(),
      date: (() => {
        if (typeof search.date !== "string") return undefined;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(search.date)) return undefined;
        const t = Date.parse(search.date);
        return Number.isFinite(t) && t <= Date.now() + 86_400_000
          ? search.date
          : undefined;
      })(),
    };
  },
  component: EstimatorRouteComponent,
});

function EstimatorRouteComponent() {
  const { model, price, condition, platform, component, date } = Route.useSearch();
  return (
    <RequireAuth>
      <AppShell pageLabel="ESTIMATEUR" activePath="/estimator">
        <Estimator
          initialModelFromQuery={model}
          initialPriceFromQuery={price}
          initialConditionFromQuery={condition}
          initialPlatformFromQuery={platform?.toLowerCase()}
          initialComponentFromQuery={component}
          initialDateFromQuery={date}
        />
      </AppShell>
    </RequireAuth>
  );
}