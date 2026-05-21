/**
 * Types et constantes du module Repair Guide.
 *
 * Alignés sur le contrat de l'API monark-api (/v1/repair/*).
 * Convention snake_case côté champs API ; les helpers et constantes UI-only
 * (labels, couleurs, icônes) sont définis ici côté front.
 *
 * AJOUT FRONT vs API actuelle : le champ `outcomes` sur chaque diagnostic_step.
 * Il porte le LIEN CAUSAL (résultat observé → cause pointée → procédure).
 * L'API ne le renvoie pas encore ; le mock le fournit. Lors du câblage backend,
 * un re-seed des guides peuplera ce champ (schéma additif, non destructif).
 */

/* ============================================================
   CATÉGORIES — 6 (pas de "Ventilation", cf. CHECK constraint DB)
   slug lowercase côté API repair (≠ UPPERCASE du catalogue hardware)
   ============================================================ */

export type RepairCategorySlug =
  | "gpu"
  | "cpu"
  | "ram"
  | "ssd"
  | "motherboard"
  | "psu";

export type RepairCategoryDef = {
  slug: RepairCategorySlug;
  label: string; // libellé affiché (front)
  icon: string; // slug lucide-react
  colorHex: string;
  bgRgba: string;
};

export const REPAIR_CATEGORIES: RepairCategoryDef[] = [
  { slug: "gpu", label: "GPU / Carte graphique", icon: "device-desktop", colorHex: "#3B82F6", bgRgba: "rgba(59,130,246,0.10)" },
  { slug: "cpu", label: "CPU / Processeur", icon: "cpu", colorHex: "#F59E0B", bgRgba: "rgba(245,158,11,0.10)" },
  { slug: "ram", label: "RAM / Mémoire", icon: "server-2", colorHex: "#09B1BA", bgRgba: "rgba(9,177,186,0.10)" },
  { slug: "ssd", label: "SSD / Stockage", icon: "database", colorHex: "#10B981", bgRgba: "rgba(16,185,129,0.10)" },
  { slug: "motherboard", label: "Carte mère", icon: "circuit-changeover", colorHex: "#A855F7", bgRgba: "rgba(168,85,247,0.10)" },
  { slug: "psu", label: "PSU / Alimentation", icon: "plug-connected", colorHex: "#EF4444", bgRgba: "rgba(239,68,68,0.10)" },
];

/* ============================================================
   SYMPTÔMES — GET /v1/repair/symptoms
   ============================================================ */

export type SymptomRead = {
  id: number;
  slug: string;
  category: RepairCategorySlug;
  title: string;
  description: string | null;
  icon: string | null; // slug lucide-react
  sort_order: number;
};

/* ============================================================
   GUIDE STATIQUE — GET /v1/repair/guide/{symptom_slug}
   ============================================================ */

export type RepairSeverity = "low" | "medium" | "high" | "critical";
export type RepairDifficulty = "beginner" | "intermediate" | "advanced" | "expert";

/**
 * LIEN CAUSAL — ajout front clé.
 * Chaque étape de diagnostic explicite ce que son résultat révèle et vers
 * quelle cause / procédure il oriente. Résout le problème des silos
 * (diagnostic d'un côté, causes/réparations de l'autre, sans connexion).
 */
export type DiagnosticOutcome = {
  /** Condition observée par l'utilisateur, ex: "VRAM > 95°C et artefacts persistent" */
  condition: string;
  /** Sévérité de cette piste, pour colorer l'indicateur */
  severity: RepairSeverity;
  /**
   * Cible LOCALE : cause/procédure du guide actuel.
   * DOIT matcher un common_causes[].cause (et repair_procedures[].cause_ref)
   * pour le scroll + surbrillance vers la procédure correspondante.
   * Exclusif avec points_to_symptom.
   */
  points_to_cause?: string;
  /**
   * Cible EXTERNE : redirige vers un AUTRE diagnostic.
   * Slug d'un autre symptôme (ex: "gpu_high_temps"). Quand ce que l'utilisateur
   * observe révèle que le vrai problème relève d'un autre symptôme, on le renvoie
   * vers le guide dédié. Le lien navigue vers /repair/{slug}.
   * Exclusif avec points_to_cause.
   */
  points_to_symptom?: string;
  /** Titre lisible du symptôme cible (affichage direct, requis si points_to_symptom). */
  points_to_symptom_title?: string;
};

export type DiagnosticStep = {
  order: number;
  title: string;
  description: string;
  tools_needed: string[];
  /** AJOUT FRONT : lien causal. Optionnel pour rétrocompat avec guides non enrichis. */
  outcomes?: DiagnosticOutcome[];
};

export type CommonCause = {
  cause: string;
  probability_pct: number;
  repair_difficulty: RepairDifficulty;
};

export type RepairMaterial = {
  name: string;
  est_price_eur: number;
};

export type RepairProcedure = {
  /** Matche un common_causes[].cause (clé du lien causal) */
  cause_ref: string;
  steps: string[];
  materials: RepairMaterial[];
  estimated_cost_eur: number;
  estimated_time_min: number;
};

export type GuideContent = {
  id: number;
  severity: RepairSeverity;
  difficulty: RepairDifficulty;
  success_rate_pct: number | null;
  diagnostic_steps: DiagnosticStep[];
  common_causes: CommonCause[];
  repair_procedures: RepairProcedure[];
  pro_tips: string[];
};

export type StaticGuideRead = {
  symptom: SymptomRead;
  guide: GuideContent | null;
};

/* ============================================================
   DEEP DIAGNOSTIC IA — POST /v1/repair/deep-diagnostic
   ============================================================ */

export type DeepConfidence = "high" | "medium" | "low";

export type DeepDiagnosticStep = {
  order: number;
  title: string;
  description: string;
  expected_result: string;
};

export type DeepRepairMaterial = {
  name: string;
  spec: string;
  est_price_eur: number;
};

export type DeepRepairScenario = {
  scenario: string;
  probability_pct: number;
  steps: string[];
  materials: DeepRepairMaterial[];
  difficulty: RepairDifficulty;
  estimated_time_min: number;
  estimated_cost_eur: number;
};

export type DeepRoiEstimate = {
  total_repair_cost_eur: number;
  estimated_value_repaired_eur: number;
  roi_pct: number;
  recommendation: string;
};

export type DeepAnalysis = {
  model_specific_notes: string;
  known_issues: string[];
  personalized_diagnostic: DeepDiagnosticStep[];
  personalized_repair: DeepRepairScenario[];
  roi_estimate: DeepRoiEstimate;
  warnings: string[];
  confidence: DeepConfidence;
};

export type DeepDiagnosticRequest = {
  symptom_id: number;
  model_id?: number | null;
  custom_name?: string | null;
  context?: string | null;
};

export type DeepDiagnosticResponse = {
  deep_analysis: DeepAnalysis;
  credits_spent: number; // 0 si cache hit ou admin, sinon 5
  cached: boolean;
  symptom: SymptomRead;
  model_name: string | null;
};

/* ============================================================
   HISTORIQUE — GET /v1/repair/history
   ============================================================ */

export type RepairOutcome = "repaired" | "not_repaired" | "gave_up" | "pending";

export type RepairHistoryRead = {
  id: number;
  user_id: number;
  symptom_id: number;
  symptom_title: string | null;
  symptom_category: RepairCategorySlug | null;
  model_id: number | null;
  model_name: string | null;
  custom_name: string | null;
  used_deep: boolean;
  credits_spent: number;
  outcome: RepairOutcome | null;
  outcome_notes: string | null;
  created_at: string; // ISO 8601
};

export type RepairHistoryPage = {
  items: RepairHistoryRead[];
  total: number;
  limit: number;
  offset: number;
};

export type RepairOutcomeUpdate = {
  outcome: RepairOutcome;
  outcome_notes?: string | null;
};

/* ============================================================
   MODÈLES HARDWARE (cascade marque → modèle pour deep diagnostic)
   Réutilise la structure du catalogue estimator. On dérive la marque
   du préfixe du nom (front-only, pas d'endpoint dédié côté API).
   ============================================================ */

export type RepairHardwareModel = {
  id: number;
  name: string;
  category: RepairCategorySlug;
  brand: string;
};

/* ============================================================
   LABELS UI — mapping enums API → français affiché
   ============================================================ */

export const SEVERITY_LABELS: Record<RepairSeverity, string> = {
  low: "Faible",
  medium: "Modérée",
  high: "Élevée",
  critical: "Critique",
};

export const SEVERITY_COLORS: Record<RepairSeverity, string> = {
  low: "#10B981",
  medium: "#09B1BA",
  high: "#F59E0B",
  critical: "#EF4444",
};

export const DIFFICULTY_LABELS: Record<RepairDifficulty, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
  expert: "Expert",
};

export const DIFFICULTY_COLORS: Record<RepairDifficulty, string> = {
  beginner: "#10B981",
  intermediate: "#F59E0B",
  advanced: "#F97316",
  expert: "#EF4444",
};

export const CONFIDENCE_LABELS: Record<DeepConfidence, string> = {
  high: "Confiance élevée",
  medium: "Confiance modérée",
  low: "Confiance faible",
};

export const CONFIDENCE_COLORS: Record<DeepConfidence, string> = {
  high: "#10B981",
  medium: "#F59E0B",
  low: "#EF4444",
};

export const OUTCOME_LABELS: Record<RepairOutcome, string> = {
  repaired: "Réparé",
  not_repaired: "Non réparé",
  gave_up: "Abandonné",
  pending: "En attente",
};

export const OUTCOME_COLORS: Record<RepairOutcome, string> = {
  repaired: "#10B981",
  not_repaired: "#EF4444",
  gave_up: "#71717A",
  pending: "#F59E0B",
};

export const DEEP_DIAGNOSTIC_COST = 5;
