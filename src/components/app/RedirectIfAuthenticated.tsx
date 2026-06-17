import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../context/AuthContext";

type RedirectIfAuthenticatedProps = {
  children: ReactNode;
};

/**
 * Guard inverse : redirige les utilisateurs authentifiés hors des routes
 * publiques (landing, auth) vers /dashboard.
 *
 * Comportement selon AuthContext.status :
 *   - "idle" | "loading"  → render children (pas de splash, SEO/visiteurs)
 *   - "unauthenticated"   → render children
 *   - "authenticated"   → useEffect navigate vers /dashboard, return null pendant la nav
 */
export function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
  const { status } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "authenticated") {
      void navigate({ to: "/dashboard" });
    }
  }, [status, navigate]);

  if (status === "authenticated") return null;
  return <>{children}</>;
}
