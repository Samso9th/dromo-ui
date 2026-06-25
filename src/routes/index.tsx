import { createFileRoute } from "@tanstack/react-router";
import { SmoothScroll } from "@/lib/smooth-scroll";
import { MarketingNav } from "@/components/landing/marketing-nav";
import { MarketingFooter } from "@/components/landing/marketing-footer";
import { Hero } from "@/components/landing/hero";
import { TrustMarquee } from "@/components/landing/trust-marquee";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { Cta } from "@/components/landing/cta";

// The marketing landing page is the public front door. Visitors choose when to
// sign in; authenticated visitors get a "Dashboard" CTA in the nav/hero rather
// than an automatic redirect.
export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="grain relative min-h-dvh bg-background text-foreground">
      {/* No-JS fallback: ensure reveal-hidden content is always visible. */}
      <noscript>
        <style>{`[data-reveal],[data-reveal-stagger] > *{opacity:1 !important}`}</style>
      </noscript>

      <SmoothScroll />
      <MarketingNav />

      <main>
        <Hero />
        <TrustMarquee />
        <Features />
        <HowItWorks />
        <Pricing />
        <Faq />
        <Cta />
      </main>

      <MarketingFooter />
    </div>
  );
}
