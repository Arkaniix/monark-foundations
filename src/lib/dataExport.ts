import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type ExportPayload = {
  schema_version: "1.0";
  exported_at: string;
  app_name: "Monark Foundations";
  keys_count: number;
  data: Record<string, unknown>;
};

export type ImportPreview = {
  schema_version: string;
  exported_at: string;
  keys_count: number;
  stock_items: number;
  builds: number;
  accounting_entries: number;
  catalog_favorites: number;
  estimator_history: number;
  preferences_keys: number;
  total_size_bytes: number;
};

const EXPORTABLE_PREFIX = "monark.";
const EXCLUDED_KEYS = new Set(["monark_access_token", "monark_refresh_token"]);
const CURRENT_SCHEMA_VERSION = "1.0" as const;

export function listExportableKeys(): string[] {
  if (typeof window === "undefined") return [];
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (!k) continue;
    if (!k.startsWith(EXPORTABLE_PREFIX)) continue;
    if (EXCLUDED_KEYS.has(k)) continue;
    keys.push(k);
  }
  return keys.sort();
}

export function buildExportPayload(): ExportPayload {
  const data: Record<string, unknown> = {};
  for (const key of listExportableKeys()) {
    const raw = window.localStorage.getItem(key);
    if (raw === null) continue;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      data[key] = raw;
    }
  }
  return {
    schema_version: CURRENT_SCHEMA_VERSION,
    exported_at: new Date().toISOString(),
    app_name: "Monark Foundations",
    keys_count: Object.keys(data).length,
    data,
  };
}

export function buildImportPreview(p: ExportPayload): ImportPreview {
  const count = (key: string): number => {
    const v = p.data[key];
    return Array.isArray(v) ? v.length : 0;
  };
  const knownDataKeys = new Set([
    "monark.stock.items.v1",
    "monark.builds.v1",
    "monark.accounting.entries.v1",
    "monark.catalog.favorites.v2",
    "monark.estimator.history.v1",
  ]);
  const preferencesKeys = Object.keys(p.data).filter((k) => !knownDataKeys.has(k)).length;
  return {
    schema_version: p.schema_version,
    exported_at: p.exported_at,
    keys_count: p.keys_count ?? Object.keys(p.data).length,
    stock_items: count("monark.stock.items.v1"),
    builds: count("monark.builds.v1"),
    accounting_entries: count("monark.accounting.entries.v1"),
    catalog_favorites: count("monark.catalog.favorites.v2"),
    estimator_history: count("monark.estimator.history.v1"),
    preferences_keys: preferencesKeys,
    total_size_bytes: new Blob([JSON.stringify(p)]).size,
  };
}

export function validateImportPayload(u: unknown): ExportPayload {
  if (!u || typeof u !== "object") {
    throw new Error("Le fichier n'est pas un objet JSON valide.");
  }
  const obj = u as Record<string, unknown>;
  if (obj.app_name !== "Monark Foundations") {
    throw new Error("Ce fichier ne provient pas d'un export Monark Foundations.");
  }
  if (obj.schema_version !== CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Version de schéma incompatible : ${String(obj.schema_version)} (attendu : ${CURRENT_SCHEMA_VERSION}).`
    );
  }
  if (!obj.data || typeof obj.data !== "object") {
    throw new Error("Le fichier ne contient pas de données exploitables.");
  }
  if (typeof obj.exported_at !== "string") {
    throw new Error("Date d'export manquante ou invalide.");
  }
  return obj as ExportPayload;
}

export function applyImportPayload(p: ExportPayload): void {
  const currentKeys = listExportableKeys();
  for (const key of currentKeys) {
    if (!(key in p.data)) {
      window.localStorage.removeItem(key);
    }
  }
  for (const [key, value] of Object.entries(p.data)) {
    if (EXCLUDED_KEYS.has(key)) continue;
    if (!key.startsWith(EXPORTABLE_PREFIX)) continue;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // skip
    }
  }
}

export function resetAllSettings(): void {
  const keys = listExportableKeys();
  for (const key of keys) {
    window.localStorage.removeItem(key);
  }
}

function formatFilenameDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `_${pad(d.getHours())}${pad(d.getMinutes())}`
  );
}

export function downloadPayloadAsFile(p: ExportPayload): void {
  const json = JSON.stringify(p, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const filename = `monark-export-${formatFilenameDate(new Date())}.json`;
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export RÉEL des données serveur — GET /v1/users/me/export (JWT).
 * Récupère le JSON agrégé côté compte (profil, réglages, stock, builds,
 * comptabilité, watchlist, estimations, alertes, historique de réparation)
 * et déclenche le téléchargement. Remplace l'ancien export localStorage.
 */
export async function fetchAndDownloadServerExport(): Promise<void> {
  const data = await apiFetch<unknown>(ENDPOINTS.USER_EXPORT);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const filename = `monark-export-${formatFilenameDate(new Date())}.json`;
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function readPayloadFromFile(file: File): Promise<ExportPayload> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Le fichier sélectionné n'est pas un JSON valide.");
  }
  return validateImportPayload(parsed);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(2)} Mo`;
}

export function formatExportedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} à ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
