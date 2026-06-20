import type { AiModel, ModelTier, Plan } from "@/lib/api/types";

/**
 * Credit math — mirrors docs/monetization.md. The real API owns this server-side;
 * this client copy drives the picker badges + per-action estimates in mock mode.
 *
 * credits = max(floor, ceil( rawUsd * MARKUP / CREDIT_USD ))
 */

export const MARKUP = 5; // 5× over raw OpenRouter cost (~80% gross margin)
export const CREDIT_USD = 0.01; // 1 credit = $0.01 retail

export type ActionType = "tailor" | "cover" | "qa" | "brief";

/** Per-action token estimates + a credit floor (see docs/monetization.md §1). */
export const ACTION_TOKENS: Record<ActionType, { in: number; out: number; floor: number }> = {
  tailor: { in: 6000, out: 3000, floor: 2 },
  cover: { in: 4000, out: 1000, floor: 2 },
  qa: { in: 3000, out: 400, floor: 1 },
  brief: { in: 5000, out: 3000, floor: 2 },
};

export function creditsFor(model: AiModel, action: ActionType): number {
  const t = ACTION_TOKENS[action];
  const rawUsd = (t.in * model.pricing.in + t.out * model.pricing.out) / 1_000_000;
  return Math.max(t.floor, Math.ceil((rawUsd * MARKUP) / CREDIT_USD));
}

const TIER_RANK: Record<ModelTier, number> = { economy: 0, standard: 1, premium: 2 };
const PLAN_MAX: Record<Plan, number> = { free: 0, pro: 1, premium: 2 };

/** Is this model included in the user's plan? */
export function modelUnlocked(model: AiModel, plan: Plan): boolean {
  return TIER_RANK[model.tier] <= PLAN_MAX[plan];
}

/** The minimum plan that unlocks a model — for "Upgrade to Pro/Premium" copy. */
export function requiredPlan(model: AiModel): Plan {
  return model.tier === "economy" ? "free" : model.tier === "standard" ? "pro" : "premium";
}

export const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
  premium: "Premium",
};

/** Max Q&A questions allowed per generation session, by plan (anti-abuse). */
export const QA_LIMIT: Record<Plan, number> = {
  free: 3,
  pro: 10,
  premium: 20,
};

/** Max regenerations (retries) per artifact per session, by plan. Initial generation is free. */
export const RETRY_LIMIT: Record<Plan, number> = {
  free: 0,
  pro: 2,
  premium: 5,
};
