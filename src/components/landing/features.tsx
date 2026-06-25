import {
  Target,
  FileText,
  MessageSquareText,
  Layers,
  Gauge,
  ShieldCheck,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const FEATURES = [
  {
    icon: Target,
    title: "Job-matched tailoring",
    body: "Paste any job description. Dromo rewrites your resume to mirror the role's keywords, priorities, and tone — without inventing experience.",
  },
  {
    icon: FileText,
    title: "Cover letters that fit",
    body: "Generate a focused, on-brand cover letter for each application, drawn straight from your master resume and the posting.",
  },
  {
    icon: MessageSquareText,
    title: "Interview prep",
    body: "Get likely questions, talking points, and a tailored brief so you walk in ready for that specific company and role.",
  },
  {
    icon: Layers,
    title: "One master resume",
    body: "Maintain a single source of truth. Every tailored version is generated from it, so updates flow everywhere instantly.",
  },
  {
    icon: Gauge,
    title: "Seconds, not hours",
    body: "Stop hand-editing for every application. Produce a polished, ATS-friendly resume in the time it takes to read the posting.",
  },
  {
    icon: ShieldCheck,
    title: "Yours, private",
    body: "Your resume data is yours. Export anytime, and delete your account and data whenever you choose.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          kicker="Features"
          title="Everything you need to apply smarter"
          blurb="Dromo turns one resume into a tailored application kit for every job — resume, cover letter, and interview prep."
        />

        <Reveal
          stagger={0.08}
          className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-background p-7 transition-colors hover:bg-card"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
