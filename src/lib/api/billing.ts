import { apiFetch } from "./client";
import { ENDPOINTS } from "./endpoints";

/** Pack de crédits (subscription_plans, plan_type === "credits_pack"). */
export type CreditPack = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  credits_per_cycle: number;
  is_active: boolean;
  plan_type: string;
  price_cents: number;
  original_price_cents?: number | null;
  currency: string;
};

export type CreditTopupResponse = {
  status: "completed" | "pending";
  new_balance?: number | null;
  checkout_url?: string | null;
};

/** Packs de crédits actifs (filtrés depuis GET /v1/billing/plans). */
export async function fetchCreditPacks(): Promise<CreditPack[]> {
  const plans = await apiFetch<CreditPack[]>(ENDPOINTS.BILLING_PLANS, { method: "GET" });
  return plans.filter((p) => p.plan_type === "credits_pack" && p.is_active);
}

/** Abonnement (subscription_plans, plan_type === "subscription"). */
export type Subscription = {
  id: number;
  code: string;
  name: string;
  credits_per_cycle: number;
  price_cents: number;
  currency: string;
  is_active: boolean;
  plan_type: string;
};

/** Abonnements actifs (filtrés depuis GET /v1/billing/plans). */
export async function fetchSubscriptions(): Promise<Subscription[]> {
  const plans = await apiFetch<Subscription[]>(ENDPOINTS.BILLING_PLANS, { method: "GET" });
  return plans.filter((p) => p.plan_type === "subscription" && p.is_active);
}

/** Recharge. Mode gratuit → status "completed" + new_balance. Stripe → checkout_url. */
export async function createTopup(planId: number): Promise<CreditTopupResponse> {
  return apiFetch<CreditTopupResponse>(ENDPOINTS.BILLING_TOPUP, {
    method: "POST",
    body: JSON.stringify({ plan_id: planId }),
  });
}