import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PLANS, CREDIT_PACKS } from "@/lib/billing";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

// Pricing is driven by the same constants the app + API use (see ui/src/lib/billing.ts
// and api/src/constants/plans.ts) so the landing page can never drift from real prices.

const fmtPrice = (n: number) =>
  n === 0 ? "$0" : `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

export function Pricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 border-t border-border py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          kicker="Pricing"
          title="Simple pricing that scales with your search"
          blurb="Start free. Upgrade when you're applying often. Credits roll into every plan, and you can top up anytime."
        />

        <Reveal stagger={0.08} className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => {
            const featured = p.id === "pro";
            return (
              <div
                key={p.id}
                className={`lift-card flex flex-col rounded-xl border p-7 ${
                  featured
                    ? "border-foreground bg-card shadow-[var(--shadow-lift)]"
                    : "border-border bg-background"
                }`}
              >
                {featured && (
                  <span className="mb-4 inline-flex w-fit rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-serif text-3xl font-semibold">
                    {fmtPrice(p.priceMonthly)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {p.priceMonthly === 0 ? "forever" : "/ month"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className="mt-7 w-full"
                  variant={featured ? "default" : "outline"}
                >
                  <Link to="/signup">
                    {p.id === "free" ? "Start free" : `Choose ${p.name}`}
                  </Link>
                </Button>
              </div>
            );
          })}
        </Reveal>

        {/* Pay-as-you-go credit packs */}
        <Reveal className="mt-10 rounded-xl border border-border bg-background p-6 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold">Prefer pay-as-you-go?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Buy credit packs without a subscription — they never expire.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CREDIT_PACKS.map((pack) => (
                <div
                  key={pack.credits}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-center"
                >
                  <div className="text-sm font-semibold">
                    {pack.credits.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    credits · ${pack.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
