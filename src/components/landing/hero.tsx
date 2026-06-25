import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-store";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

export function Hero() {
  const { isAuthenticated } = useAuth();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el.querySelectorAll("[data-line],[data-fade]"), {
        autoAlpha: 1,
        yPercent: 0,
        y: 0,
      });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.set("[data-fade]", { autoAlpha: 0, y: 24 })
        .fromTo(
          "[data-line]",
          { yPercent: 115 },
          { yPercent: 0, duration: 1.2, stagger: 0.1 },
          0.15,
        )
        .to(
          "[data-fade]",
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 },
          0.55,
        );

      // Gentle parallax drift on the mock as you scroll past the hero.
      gsap.to("[data-hero-art]", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden">
      <div className="aura absolute inset-0 -z-10" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-60" />

      <div className="mx-auto max-w-5xl px-5 pb-20 pt-36 text-center sm:px-8 sm:pt-44">
        <div
          data-fade
          className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI resume tailoring, tuned to each job
        </div>

        <h1 className="display-hero">
          <span className="line-mask">
            <span data-line className="block">
              Tailored resumes,
            </span>
          </span>
          <span className="line-mask">
            <span data-line className="block text-muted-foreground">
              instantly.
            </span>
          </span>
        </h1>

        <p
          data-fade
          className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
        >
          Upload one master resume. Dromo generates a perfectly tailored resume,
          cover letter, and interview prep for any job posting — in seconds, not
          hours.
        </p>

        <div
          data-fade
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button asChild size="lg" className="group w-full sm:w-auto">
            <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
              {isAuthenticated ? "Go to dashboard" : "Start free"}
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <a href="#how">See how it works</a>
          </Button>
        </div>

        <p data-fade className="mt-4 text-xs text-muted-foreground">
          No credit card required · Free credits to start
        </p>

        {/* Product mock */}
        <div data-fade className="mt-16">
          <div
            data-hero-art
            className="relative mx-auto max-w-4xl rounded-xl border border-border bg-card p-2 shadow-[var(--shadow-deep)]"
          >
            <div className="flex items-center gap-1.5 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="grid gap-3 rounded-lg bg-background p-4 sm:grid-cols-[1fr_1.3fr] sm:p-6">
              {/* Left: job input */}
              <div className="rounded-lg border border-border p-4 text-left">
                <p className="kicker mb-3">Job posting</p>
                <div className="space-y-2">
                  <div className="h-2.5 w-3/4 rounded bg-muted" />
                  <div className="h-2.5 w-full rounded bg-muted" />
                  <div className="h-2.5 w-5/6 rounded bg-muted" />
                  <div className="h-2.5 w-2/3 rounded bg-muted" />
                  <div className="mt-4 h-2.5 w-1/2 rounded bg-muted" />
                  <div className="h-2.5 w-11/12 rounded bg-muted" />
                </div>
              </div>
              {/* Right: tailored resume */}
              <div className="rounded-lg border border-border bg-card p-4 text-left">
                <div className="mb-3 flex items-center justify-between">
                  <p className="kicker">Tailored resume</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
                    <FileText className="h-3 w-3" /> 98% match
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-2.5 w-1/2 rounded bg-foreground/80" />
                  <div className="h-2.5 w-full rounded bg-muted" />
                  <div className="h-2.5 w-full rounded bg-muted" />
                  <div className="h-2.5 w-4/5 rounded bg-muted" />
                  <div className="mt-4 h-2.5 w-2/5 rounded bg-foreground/80" />
                  <div className="h-2.5 w-full rounded bg-muted" />
                  <div className="h-2.5 w-3/4 rounded bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
