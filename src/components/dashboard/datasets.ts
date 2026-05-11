/**
 * Types et contracts pour le domaine Dashboard.
 *
 * Tient lieu de "API contract" — la structure de DashboardOverview doit être
 * honorée à la fois par la vraie implémentation (src/lib/api/dashboard.ts)
 * et par le mock (src/lib/mocks/dashboard.ts). TypeScript garantit l'alignement.
 *
 * Évolutivité : pour ajouter une nouvelle stat tile, étendre StatId,
 * StatTileData, et le tableau retourné par getDashboardOverview.
 */

/**
 * Identifiants des tuiles statistiques. Stables, utilisés comme clés React.
 */
export type StatId =
  | "estimations_month"
  | "average_margin"
  | "watchlist_count"
  | "credits_remaining";

/**
 * Données d'une tuile statistique. La sparkline est sur 30 jours (~30 points).
 *
 * - `value` : valeur principale, format affichage déterminé par `formatHint`
 * - `delta_pct` : variation en pourcentage vs période précédente (peut être négative)
 * - `sparkline` : tableau de N points (typiquement 30) couvrant les 30 derniers jours
 * - `accent_color` : couleur de la sparkline + arrow delta. Cohérente avec la
 *    sémantique de la stat (vert si plus = mieux, ambre/rouge pour crédits bas, etc.)
 */
export type StatTileData = {
  id: StatId;
  label: string;
  value: number;
  delta_pct: number | null;
  sparkline: number[];
  format_hint: "integer" | "euro" | "ratio";
  accent_color: string;
};

/**
 * Structure complète retournée par getDashboardOverview().
 * Wrap les 4 stats dans un objet pour permettre des évolutions futures
 * (ajouter recent_estimations, watchlist_preview, etc. au même endroit).
 */
export type DashboardOverview = {
  stats: StatTileData[];
  generated_at: string; // ISO 8601 UTC
};
