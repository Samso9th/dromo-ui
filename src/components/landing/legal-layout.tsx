import type { ReactNode } from "react";
import { MarketingNav } from "./marketing-nav";
import { MarketingFooter } from "./marketing-footer";

export type LegalSection = {
  heading: string;
  /** Paragraphs and/or bullet lists. */
  body: (string | { list: string[] })[];
};

export function LegalLayout({
  title,
  updated,
  intro,
  sections,
  children,
}: {
  title: string;
  updated: string;
  intro?: string;
  sections?: LegalSection[];
  children?: ReactNode;
}) {
  return (
    <div className="grain relative min-h-dvh bg-background text-foreground">
      <MarketingNav />

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
        <p className="kicker">Legal</p>
        <h1 className="display-xl mt-3">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {updated}
        </p>

        {intro && (
          <p className="mt-8 text-pretty leading-relaxed text-muted-foreground">
            {intro}
          </p>
        )}

        {sections && (
          <div className="mt-10 space-y-10">
            {sections.map((s, i) => (
              <section key={i}>
                <h2 className="text-xl font-semibold">{s.heading}</h2>
                <div className="mt-3 space-y-4">
                  {s.body.map((b, j) =>
                    typeof b === "string" ? (
                      <p
                        key={j}
                        className="text-pretty leading-relaxed text-muted-foreground"
                      >
                        {b}
                      </p>
                    ) : (
                      <ul
                        key={j}
                        className="list-disc space-y-2 pl-5 text-muted-foreground"
                      >
                        {b.list.map((li, k) => (
                          <li key={k} className="leading-relaxed">
                            {li}
                          </li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>
        )}

        {children}
      </main>

      <MarketingFooter />
    </div>
  );
}
