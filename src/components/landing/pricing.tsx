import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

// NOTE: Plan names/prices are placeholders — confirm against the live credit
// model (hybrid subscription + usage credits) before launch.
const PLANS = [
  {
    name: "Free",
    price: "$0",
    cadence: "to start",
    blurb: "Try Dromo with free credits — no card required.",
    features: [
      "Master resume parsing",
      "A few tailored resumes to start",
      "Cover letter generation",
      "PDF & DOCX export",
    ],
    cta: "Start free",
    to: "/signup",
    featured: false,
  },
  {
    name: "Pro",
    price: "$12",
    cadence: "/ month",
    blurb: "For active job seekers applying every week.",
    features: [
      "Generous monthly credits",
      "Unlimited master resume edits",
      "Cover letters + interview prep",
      "Priority generation",
      "Top up with credits anytime",
    ],
    cta: "Go Pro",
    to: "/signup",
    featured: true,
  },
  {
    name: "Credits",
    price: "Pay as you go",
    cadence: "",
    blurb: "Buy credits only when you need them.",
    features: [
      "No subscription",
      "Credits never tied to a month",
      "Same tailoring quality",
      "Great for occasional applications",
    ],
    cta: "Buy credits",
    to: "/signup",
    featured: false,
  },
];

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
          blurb="Start free. Upgrade when you're applying often. Only pay for what you use."
        />

        <Reveal stagger={0.08} className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`lift-card flex flex-col rounded-xl border p-7 ${
                p.featured
                  ? "border-foreground bg-card shadow-[var(--shadow-lift)]"
                  : "border-border bg-background"
              }`}
            >
              {p.featured && (
                <span className="mb-4 inline-flex w-fit rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-serif text-3xl font-semibold">
                  {p.price}
                </span>
                {p.cadence && (
                  <span className="text-sm text-muted-foreground">
                    {p.cadence}
                  </span>
                )}
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
                variant={p.featured ? "default" : "outline"}
              >
                <Link to={p.to}>{p.cta}</Link>
              </Button>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
