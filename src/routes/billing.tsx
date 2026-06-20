import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Coins, CreditCard, Sparkles, Wallet } from "lucide-react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/use-reveal";
import { billing } from "@/lib/api";
import { PLANS, CREDIT_PACKS, type PlanInfo } from "@/lib/billing";
import { creditsStore, useCredits } from "@/lib/credits-store";
import { PLAN_LABEL } from "@/lib/credits";
import { cn } from "@/lib/utils";
import type { CreditTransaction, Plan } from "@/lib/api/types";

export const Route = createFileRoute("/billing")({
  component: () => (
    <ProtectedRoute>
      <BillingPage />
    </ProtectedRoute>
  ),
});

const PLAN_RANK: Record<Plan, number> = { free: 0, pro: 1, premium: 2 };

function BillingPage() {
  const ref = useReveal<HTMLDivElement>();
  const { balance, plan, loaded } = useCredits();
  const [txns, setTxns] = useState<CreditTransaction[]>([]);

  useEffect(() => {
    void creditsStore.refresh();
    void billing.getTransactions().then(setTxns);
  }, []);

  async function checkout(
    label: string,
    input: Parameters<typeof billing.startCheckout>[0],
  ) {
    toast.loading(
      `Starting ${input.method === "stripe" ? "card" : "Dubu Pay"} checkout…`,
      { id: "co" },
    );
    await billing.startCheckout(input);
    toast.success(
      `${label} — checkout will open here once payments are wired up.`,
      { id: "co" },
    );
  }

  return (
    <div
      ref={ref}
      className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-12"
    >
      <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
        Billing
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your plan, credits, and payment method.
      </p>

      {/* Balance */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border">
            <Coins className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Credit balance
            </p>
            <p className="font-serif text-2xl font-semibold tabular-nums">
              {loaded ? balance.toLocaleString() : "—"}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                credits
              </span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Current plan
          </p>
          <p className="font-serif text-2xl font-semibold">
            {PLAN_LABEL[plan]}
          </p>
        </div>
      </div>

      {/* Plans */}
      <h2 className="mt-10 font-serif text-xl font-semibold">Plans</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <PlanCard
            key={p.id}
            plan={p}
            current={plan}
            onSelect={() =>
              checkout(`${p.name} plan`, {
                kind: "subscription",
                planId: p.id,
                method: "stripe",
              })
            }
          />
        ))}
      </div>

      {/* Top-ups */}
      <h2 className="mt-10 font-serif text-xl font-semibold">Top up credits</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        One-time credit packs. No expiry. Use them on any plan.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CREDIT_PACKS.map((pack) => (
          <div
            key={pack.credits}
            className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]"
          >
            <div>
              <p className="font-serif text-xl font-semibold tabular-nums">
                {pack.credits.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                credits · ${pack.price.toFixed(2)}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-2"
              onClick={() =>
                checkout(`${pack.credits.toLocaleString()} credits`, {
                  kind: "topup",
                  credits: pack.credits,
                  method: "stripe",
                })
              }
            >
              <Sparkles className="h-3.5 w-3.5" /> Buy
            </Button>
          </div>
        ))}
      </div>

      {/* Payment methods */}
      <h2 className="mt-10 font-serif text-xl font-semibold">Payment method</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          onClick={() =>
            toast.message("Card payments (Stripe) — wired up with the API.")
          }
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-[var(--shadow-soft)] transition-colors hover:bg-accent"
        >
          <CreditCard className="h-5 w-5" />
          <div>
            <p className="text-sm font-medium">Card</p>
            <p className="text-xs text-muted-foreground">
              Visa, Mastercard, Amex — via Stripe
            </p>
          </div>
        </button>
        <button
          onClick={() =>
            toast.message(
              "Dubu Pay (NGN bank transfer) — wired up with the API.",
            )
          }
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-[var(--shadow-soft)] transition-colors hover:bg-accent"
        >
          <Wallet className="h-5 w-5" />
          <div>
            <p className="text-sm font-medium">Dubu Pay</p>
            <p className="text-xs text-muted-foreground">
              NGN bank transfer & onramp
            </p>
          </div>
        </button>
      </div>

      {/* History */}
      <h2 className="mt-10 font-serif text-xl font-semibold">
        Recent activity
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
        {txns.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No transactions yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {txns.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-4 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">{t.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.createdAt).toLocaleDateString()} · {t.kind}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-sm font-medium tabular-nums",
                    t.amount >= 0 ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {t.amount >= 0 ? "+" : ""}
                  {t.amount.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  current,
  onSelect,
}: {
  plan: PlanInfo;
  current: Plan;
  onSelect: () => void;
}) {
  const isCurrent = plan.id === current;
  const isDowngrade = PLAN_RANK[plan.id] < PLAN_RANK[current];
  const highlight = plan.id === "pro";

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border bg-card p-5 shadow-[var(--shadow-soft)]",
        highlight ? "border-foreground" : "border-border",
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl font-semibold">{plan.name}</h3>
        {highlight && (
          <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-background">
            Popular
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>
      <p className="mt-4 font-serif text-3xl font-semibold tabular-nums">
        ${plan.priceMonthly.toFixed(2)}
        <span className="text-sm font-normal text-muted-foreground">/mo</span>
      </p>
      <ul className="mt-4 flex-1 space-y-2 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button
        className="mt-5 w-full"
        variant={isCurrent || highlight ? "default" : "outline"}
        disabled={isCurrent || isDowngrade}
        onClick={onSelect}
      >
        {isCurrent
          ? "Current plan"
          : isDowngrade
            ? "Included"
            : plan.id === "free"
              ? "Downgrade"
              : `Upgrade to ${plan.name}`}
      </Button>
    </div>
  );
}
