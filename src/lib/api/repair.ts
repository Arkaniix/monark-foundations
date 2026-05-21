/**
 * Vraie implémentation Repair Guide API.
 *
 * Placeholder — le frontend tourne actuellement en mode mock
 * (VITE_USE_MOCK_API=true). Ces fonctions throw 501 tant que le câblage vers
 * monark-api (/v1/repair/*) n'est pas fait.
 *
 * Signatures alignées sur src/lib/mocks/repair.ts. Quand l'API sera branchée,
 * remplacer chaque corps par un fetch vers l'endpoint correspondant :
 *   getSymptoms        → GET  /v1/repair/symptoms[?category=]
 *   getSymptomBySlug   → GET  /v1/repair/symptoms/{slug}
 *   getGuide           → GET  /v1/repair/guide/{symptom_slug}   (auth)
 *   getModels          → (catalogue hardware, endpoint à confirmer)
 *   postDeepDiagnostic → POST /v1/repair/deep-diagnostic        (auth, 5 crédits)
 *   getHistory         → GET  /v1/repair/history                (auth, paginé)
 *   getHistoryDetail   → GET  /v1/repair/history/{id}           (auth)
 *   updateOutcome      → POST /v1/repair/history/{id}/outcome   (auth)
 */

import { ApiException } from "./client";
import type {
  DeepDiagnosticRequest,
  DeepDiagnosticResponse,
  RepairHardwareModel,
  RepairHistoryPage,
  RepairHistoryRead,
  RepairOutcomeUpdate,
  StaticGuideRead,
  SymptomRead,
} from "../../components/repair/datasets";

const NOT_WIRED = (endpoint: string): never => {
  throw new ApiException(
    501,
    `Repair endpoint "${endpoint}" not yet wired to backend. Use VITE_USE_MOCK_API=true.`,
    "NOT_IMPLEMENTED",
  );
};

export async function getSymptoms(_category?: string): Promise<SymptomRead[]> {
  return NOT_WIRED("GET /v1/repair/symptoms");
}

export async function getSymptomBySlug(_slug: string): Promise<SymptomRead> {
  return NOT_WIRED("GET /v1/repair/symptoms/{slug}");
}

export async function getGuide(_symptomSlug: string): Promise<StaticGuideRead> {
  return NOT_WIRED("GET /v1/repair/guide/{symptom_slug}");
}

export async function getModels(_category?: string): Promise<RepairHardwareModel[]> {
  return NOT_WIRED("GET hardware models");
}

export async function postDeepDiagnostic(
  _req: DeepDiagnosticRequest,
): Promise<DeepDiagnosticResponse> {
  return NOT_WIRED("POST /v1/repair/deep-diagnostic");
}

export async function getHistory(
  _limit?: number,
  _offset?: number,
): Promise<RepairHistoryPage> {
  return NOT_WIRED("GET /v1/repair/history");
}

export async function getHistoryDetail(
  _historyId: number,
): Promise<RepairHistoryRead> {
  return NOT_WIRED("GET /v1/repair/history/{id}");
}

export async function updateOutcome(
  _historyId: number,
  _update: RepairOutcomeUpdate,
): Promise<RepairHistoryRead> {
  return NOT_WIRED("POST /v1/repair/history/{id}/outcome");
}
