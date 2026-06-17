export const ENDPOINTS = {
  // ── Auth (existant) ──────────────────────────────────────────────────────
  LOGIN: "/v1/auth/login",
  REGISTER: "/v1/auth/register",
  REFRESH: "/v1/auth/refresh",
  LOGOUT: "/v1/auth/logout",
  FORGOT_PASSWORD: "/v1/auth/forgot_password",
  RESET_PASSWORD: "/v1/auth/reset_password",
  VERIFY_EMAIL: "/v1/auth/verify_email",
  // ⚠️ Route corrigée : l'utilisateur courant est sur /v1/users/me (et NON /v1/auth/me,
  // qui renvoie 404 en prod). C'était la cause des échecs de login/bootstrap.
  ME: "/v1/users/me",
  USER_SETTINGS: "/v1/users/me/settings",
  DELETE_ME: "/v1/users/me",
  RESTORE_ME: "/v1/users/me/restore",

  // ── Catalog / Hardware (public, sans JWT) ────────────────────────────────
  MODELS: "/v1/models",
  MODELS_AUTOCOMPLETE: "/v1/models/autocomplete",
  CATEGORIES: "/v1/categories",
  CATALOG_SUMMARY: "/v1/catalog/summary",
  MODEL_DETAIL: (id: string | number) => `/v1/models/${id}`,
  MODEL_SPECS: (id: string | number) => `/v1/models/${id}/specs`,
  MODEL_MARKET_STATE: (id: string | number) => `/v1/models/${id}/market_state`,
  MARKET_SUMMARY: (id: string | number) => `/v1/market/models/${id}/summary`,
  MARKET_HISTORY: (id: string | number) => `/v1/market/models/${id}/history`,
  MARKET_LISTINGS_COUNT: (id: string | number) => `/v1/market/models/${id}/listings-count`,

  // ── Dashboard (JWT) ──────────────────────────────────────────────────────
  DASHBOARD_OVERVIEW: "/v1/dashboard/overview",

  // ── Estimator (JWT) ──────────────────────────────────────────────────────
  ESTIMATOR_EVALUATE: "/v1/estimator/evaluate",
  ESTIMATOR_HISTORY: "/v1/estimator/history",
  ESTIMATOR_STATS: "/v1/estimator/stats",
  ESTIMATOR_RUN: (id: string | number) => `/v1/estimator/${id}`,

  // ── Inventory (JWT) ──────────────────────────────────────────────────────
  INVENTORY: "/v1/inventory",
  INVENTORY_ITEM: (id: string) => `/v1/inventory/${id}`,
  INVENTORY_LIST: (id: string) => `/v1/inventory/${id}/list`,
  INVENTORY_UNLIST: (id: string) => `/v1/inventory/${id}/unlist`,
  INVENTORY_SELL: (id: string) => `/v1/inventory/${id}/sell`,
  INVENTORY_CANCEL_SALE: (id: string) => `/v1/inventory/${id}/cancel-sale`,

  // ── Transactions (compta — JWT) ──────────────────────────────────────────
  TRANSACTIONS: "/v1/inventory/transactions",
  TRANSACTION_ITEM: (id: string) => `/v1/inventory/transactions/${id}`,

  // ── Builds (JWT) ─────────────────────────────────────────────────────────
  BUILDS: "/v1/builds",
  BUILD_ITEM: (id: string) => `/v1/builds/${id}`,
  BUILD_COMPONENTS: (id: string) => `/v1/builds/${id}/components`,
  BUILD_COMPONENT_ITEM: (id: string, cid: string) => `/v1/builds/${id}/components/${cid}`,
  BUILD_TEST: (id: string) => `/v1/builds/${id}/test`,
  BUILD_UNTEST: (id: string) => `/v1/builds/${id}/untest`,
  BUILD_LIST: (id: string) => `/v1/builds/${id}/list`,
  BUILD_UNLIST: (id: string) => `/v1/builds/${id}/unlist`,
  BUILD_SELL: (id: string) => `/v1/builds/${id}/sell`,
  BUILD_CANCEL_SALE: (id: string) => `/v1/builds/${id}/cancel-sale`,
  BUILD_FAIL: (id: string) => `/v1/builds/${id}/fail`,
  BUILD_RESUME: (id: string) => `/v1/builds/${id}/resume`,
  BUILD_RESELL: (id: string) => `/v1/builds/${id}/resell`,
  BUILD_DUPLICATE: (id: string) => `/v1/builds/${id}/duplicate`,

  // ── Repair (symptoms public ; guide/history/deep sous JWT) ───────────────
  REPAIR_SYMPTOMS: "/v1/repair/symptoms",
  REPAIR_SYMPTOM: (slug: string) => `/v1/repair/symptoms/${slug}`,
  REPAIR_GUIDE: (slug: string) => `/v1/repair/guide/${slug}`,
  REPAIR_DEEP: "/v1/repair/deep-diagnostic",
  REPAIR_HISTORY: "/v1/repair/history",
  REPAIR_HISTORY_DETAIL: (id: number) => `/v1/repair/history/${id}`,
  REPAIR_HISTORY_OUTCOME: (id: number) => `/v1/repair/history/${id}/outcome`,

  // ── Watchlist (JWT) ──────────────────────────────────────────────────────
  WATCHLIST: "/v1/watchlist",
  WATCHLIST_ITEM: (id: string) => `/v1/watchlist/${id}`,

  // ── Billing / Crédits (JWT) ──────────────────────────────────────────────
  BILLING_PLANS: "/v1/billing/plans",
  BILLING_TOPUP: "/v1/billing/topup",
} as const;
