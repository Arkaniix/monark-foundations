import { createFileRoute } from "@tanstack/react-router";
import { RedirectIfAuthenticated } from "@/components/app/RedirectIfAuthenticated";
import Auth from "../pages/Auth";

function AuthRoute() {
  const { plan } = Route.useSearch();
  return (
    <RedirectIfAuthenticated>
      <Auth initialPlan={plan} />
    </RedirectIfAuthenticated>
  );
}

const KNOWN_PLANS = ["free", "standard", "pro"] as const;
type KnownPlan = (typeof KNOWN_PLANS)[number];

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { plan?: KnownPlan } => {
    const raw = search.plan;
    if (typeof raw === "string" && (KNOWN_PLANS as readonly string[]).includes(raw)) {
      return { plan: raw as KnownPlan };
    }
    return {};
  },
  component: AuthRoute,
});