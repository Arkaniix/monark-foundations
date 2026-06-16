import { createFileRoute } from "@tanstack/react-router";
import ResetPassword from "../pages/ResetPassword";

export const Route = createFileRoute("/auth_/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: ResetPassword,
});