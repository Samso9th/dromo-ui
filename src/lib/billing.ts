import type { Plan } from "@/lib/api/types";

/** Plans & packs — mirrors docs/monetization.md. Frontend constants; the API owns enforcement. */

export interface PlanInfo {
  id: Plan;
  name: string;
  priceMonthly: number; // USD
  credits: number;
  blurb: string;
  features: string[];
}

export const PLANS: PlanInfo[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    credits: 100,
    blurb: "Try it out — economy models only.",
    features: [
      "100 credits / month",
      "Economy models (Qwen, DeepSeek, Llama, Gemini Flash)",
      "3 resume templates",
      "Up to 3 active sessions at a time",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 9.99,
    credits: 1500,
    blurb: "For active job seekers.",
    features: [
      "1,500 credits / month",
      "+ Standard models (Gemini Pro, GPT-4o, Claude Sonnet)",
      "All resume templates",
      "Unlimited sessions",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    priceMonthly: 29.99,
    credits: 5000,
    blurb: "Maximum quality & volume.",
    features: [
      "5,000 credits / month",
      "+ Premium models (Claude Opus, Opus Fast, GPT-4.1)",
      "All templates + early access",
      "Priority generation",
    ],
  },
];

export interface CreditPack {
  credits: number;
  price: number; // USD
}

export const CREDIT_PACKS: CreditPack[] = [
  { credits: 100, price: 0.99 },
  { credits: 1000, price: 9.49 },
  { credits: 5000, price: 44.99 },
  { credits: 15000, price: 124.99 },
];
