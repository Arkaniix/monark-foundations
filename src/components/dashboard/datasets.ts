/**
 * Types et contracts pour le domaine Dashboard.
 *
 * Tient lieu de "API contract" — la structure de DashboardOverview doit être
 * honorée à la fois par la vraie implémentation (src/lib/api/dashboard.ts)
 * et par le mock (src/lib/mocks/dashboard.ts). TypeScript garantit l'alignement.
 */

// ============================================================================
// §01 — Vue d'ensemble (stat tiles)
// ============================================================================

export type StatId =
  | "estimations_month"
  | "average_margin"
  | "watchlist_count"
  | "credits_remaining";

export type StatTileData = {
  id: StatId;
  label: string;
  value: number;
  delta_pct: number | null;
  sparkline: number[];
  format_hint: "integer" | "euro" | "ratio";
  accent_color: string;
};

// ============================================================================
// §02 — Dernières estimations (table compacte)
// ============================================================================

/**
 * Catégorie de hardware. Aligné avec hardware_categories backend Monark.
 */
export type HardwareCategory =
  | "GPU"
  | "CPU"
  | "RAM"
  | "SSD"
  | "MOBO"
  | "PSU";

/**
 * Verdict de l'Estimator V3.
 * Sémantique :
 *   - FONCER : deal exceptionnel, acheter sans hésiter
 *   - NÉGOCIER : prix acceptable mais marge à grappiller, tenter une offre
 *   - TENTER : marge tendue, lowball au culot
 *   - PASSER : pas rentable au prix demandé
 */
export type Verdict = "FONCER" | "NÉGOCIER" | "TENTER" | "PASSER";

export const VERDICT_COLORS: Record<Verdict, string> = {
  FONCER: "#10B981",
  "NÉGOCIER": "#F59E0B",
  TENTER: "#8B5CF6",
  PASSER: "#EF4444",
};

/**
 * Une estimation passée du user, telle qu'affichée dans la table §02.
 *
 * Note légale (sui generis L.341-1 CPI) : `model_name` reste générique
 * (ex. "RTX 4070 SUPER") et n'identifie pas une annonce individuelle.
 * Aucun lien URL, aucun pseudo vendeur, aucun titre brut d'annonce —
 * uniquement les méta-stats agrégées par modèle.
 */
export type RecentEstimation = {
  id: string;
  model_name: string;
  category: HardwareCategory;
  verdict: Verdict;
  listing_price_eur: number;
  net_margin_eur: number; // peut être négatif si verdict PASSER
  created_at: string; // ISO 8601 UTC
};

// ============================================================================
// §03 — Watchlist preview (4 cards horizontales)
// ============================================================================

/**
 * Un modèle suivi par le user dans sa watchlist.
 *
 * Données issues de `component_market_stats` backend :
 *   - average_price_7d : médiane pondérée demi-vie 14j sur les 7 derniers jours
 *   - delta_pct_vs_14d : variation vs moyenne 14j (peut être négative)
 *   - sparkline : 7 points (prix moyen quotidien des 7 derniers jours)
 *
 * Le bouton "Voir le détail" pointe vers /watchlist/<id> (route à créer
 * dans un chantier ultérieur — pour l'instant no-op).
 */
export type WatchlistItem = {
  id: string;
  model_name: string;
  category: HardwareCategory;
  average_price_7d: number;
  delta_pct_vs_14d: number;
  sparkline: number[]; // 7 points
};

// ============================================================================
// Wrapper DashboardOverview
// ============================================================================

export type DashboardOverview = {
  stats: StatTileData[];
  recent_estimations: RecentEstimation[];
  watchlist_preview: WatchlistItem[];
  generated_at: string; // ISO 8601 UTC
};
