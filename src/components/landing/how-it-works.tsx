import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const STEPS = [
  {
    n: "01",
    title: "Upload your master resume",
    body: "Drop in a PDF or DOCX once. Dromo parses it into a structured, editable profile — your single source of truth.",
  },
  {
    n: "02",
    title: "Paste the job posting",
    body: "Add the role and job description. Dromo reads what the employer actually wants and maps it against your experience.",
  },
  {
    n: "03",
    title: "Generate your kit",
    body: "Get a tailored resume, a matching cover letter, and an interview brief — ready to download, refine, or send.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="scroll-mt-20 border-t border-border py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          kicker="How it works"
          title="From one resume to every application"
          blurb="Three steps. No formatting marathons, no copy-pasting between documents."
        />

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08} className="relative">
              <span className="font-serif text-5xl font-semibold text-muted-foreground/30">
                {s.n}
              </span>
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
