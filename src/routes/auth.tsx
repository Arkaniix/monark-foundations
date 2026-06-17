import { createFileRoute } from "@tanstack/react-router";
import { RedirectIfAuthenticated } from "@/components/app/RedirectIfAuthenticated";
import Auth from "../pages/Auth";

function AuthRoute() {
  return (
    <RedirectIfAuthenticated>
      <Auth />
    </RedirectIfAuthenticated>
  );
}

export const Route = createFileRoute("/auth")({
  component: AuthRoute,
});