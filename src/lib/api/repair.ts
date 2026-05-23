/**
 * Vraie implémentation Repair Guide API (mode réel).
 *
 * Signatures identiques au placeholder (src/lib/api/repair.ts d'origine) et au
 * mock (src/lib/mocks/repair.ts). Mapping quasi 1:1 — le backend a été construit
 * sur le même contrat (datasets.ts). Points d'attention :
 *   - symptoms : PUBLIC. guide / history / deep-diagnostic : JWT (apiFetch ajoute
 *     le token automatiquement). En mode réel, l'utilisateur doit être connecté
 *     pour voir un guide.
 *   - getModels n'a pas d'endpoint dédié → réutilise GET /v1/models (public).
 *     Les catégories Repair sont en lowercase (gpu…) alors que /v1/models attend
 *     UPPERCASE (GPU…) et les renvoie en UPPERCASE → conversion dans les deux sens.
 *   - Les champs front enrichis (detailed_instructions, what_to_observe, outcomes,
 *     safety_warnings, requires_pro) restent absents tant que le backend n'est pas
 *     re-seedé : ils sont optionnels côté types, donc le passthrough est sûr.
 */

import { apiFetch } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  DeepDiagnosticRequest,
  DeepDiagnosticResponse,
  RepairCategorySlug,
  RepairHardwareModel,
  RepairHistoryPage,
  RepairHistoryRead,
  RepairOutcomeUpdate,
  StaticGuideRead,
  SymptomRead,
} from "../../components/repair/datasets";

// ── Mapping catégories Repair (lowercase) ⇄ /v1/models (UPPERCASE) ──────────

function repairSlugToApiCategory(slug: string): string {
  return slug === "motherboard" ? "MOTHERBOARD" : slug.toUpperCase();
}

function apiCategoryToRepairSlug(cat: string): RepairCategorySlug {
  const up = cat.toUpperCase();
  if (up === "MOTHERBOARD") return "motherboard";
  return up.toLowerCase() as RepairCategorySlug;
}

/** Item brut /v1/models utile pour le dropdown Repair. */
interface ApiModelListItem {
  id: number;
  name: string;
  manufacturer: string | null;
  category: string;
}

// ── Endpoints ───────────────────────────────────────────────────────────────

export async function getSymptoms(category?: string): Promise<SymptomRead[]> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  return apiFetch<SymptomRead[]>(`${ENDPOINTS.REPAIR_SYMPTOMS}${qs}`, {
    method: "GET",
  });
}

export async function getSymptomBySlug(slug: string): Promise<SymptomRead> {
  return apiFetch<SymptomRead>(ENDPOINTS.REPAIR_SYMPTOM(slug), { method: "GET" });
}

export async function getGuide(symptomSlug: string): Promise<StaticGuideRead> {
  // JWT requis. Réponse { symptom, guide } — passthrough direct.
  return apiFetch<StaticGuideRead>(ENDPOINTS.REPAIR_GUIDE(symptomSlug), {
    method: "GET",
  });
}

export async function getModels(category?: string): Promise<RepairHardwareModel[]> {
  const apiCat = category ? repairSlugToApiCategory(category) : undefined;
  const out: RepairHardwareModel[] = [];
  let offset = 0;
  const limit = 100; // plafond API
  // Pagination interne : certaines catégories (ex. MOTHERBOARD ~203) dépassent 100.
  for (let guard = 0; guard < 10; guard++) {
    const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (apiCat) qs.set("category", apiCat);
    const page = await apiFetch<{ items: ApiModelListItem[]; total: number }>(
      `${ENDPOINTS.MODELS}?${qs.toString()}`,
      { method: "GET" },
    );
    for (const it of page.items) {
      out.push({
        id: it.id,
        name: it.name,
        category: apiCategoryToRepairSlug(it.category),
        // Pas de marque dédiée côté API → on dérive du manufacturer, sinon du 1er mot.
        brand: it.manufacturer ?? it.name.split(" ")[0] ?? "",
      });
    }
    if (page.items.length < limit || out.length >= (page.total ?? out.length)) break;
    offset += limit;
  }
  return out;
}

export async function postDeepDiagnostic(
  req: DeepDiagnosticRequest,
): Promise<DeepDiagnosticResponse> {
  return apiFetch<DeepDiagnosticResponse>(ENDPOINTS.REPAIR_DEEP, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function getHistory(
  limit = 20,
  offset = 0,
): Promise<RepairHistoryPage> {
  const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiFetch<RepairHistoryPage>(`${ENDPOINTS.REPAIR_HISTORY}?${qs.toString()}`, {
    method: "GET",
  });
}

export async function getHistoryDetail(historyId: number): Promise<RepairHistoryRead> {
  return apiFetch<RepairHistoryRead>(ENDPOINTS.REPAIR_HISTORY_DETAIL(historyId), {
    method: "GET",
  });
}

export async function updateOutcome(
  historyId: number,
  update: RepairOutcomeUpdate,
): Promise<RepairHistoryRead> {
  return apiFetch<RepairHistoryRead>(ENDPOINTS.REPAIR_HISTORY_OUTCOME(historyId), {
    method: "POST",
    body: JSON.stringify(update),
  });
}
