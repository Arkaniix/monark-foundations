import { createFileRoute } from "@tanstack/react-router";

/**
 * ⚠️ ROUTE JETABLE — À SUPPRIMER APRÈS VALIDATION.
 *
 * Provoque volontairement un crash de rendu pour vérifier que l'error boundary
 * (DefaultErrorComponent dans router.tsx) reporte bien vers POST /v1/client-errors
 * → #client-errors. Visiter https://monark-market.fr/crashtest une fois, vérifier
 * le message dans Discord, puis SUPPRIMER ce fichier et republier.
 */
function CrashTest(): never {
  throw new Error("CRASHTEST — validation reporting client (route jetable à supprimer)");
}

export const Route = createFileRoute("/crashtest")({
  component: CrashTest,
});
