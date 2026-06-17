import { createFileRoute } from "@tanstack/react-router";
import { RedirectIfAuthenticated } from "@/components/app/RedirectIfAuthenticated";
import Landing from "../pages/Landing";

function LandingRoute() {
  return (
    <RedirectIfAuthenticated>
      <Landing />
    </RedirectIfAuthenticated>
  );
}

export const Route = createFileRoute("/")({
  component: LandingRoute,
});
