import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Does Dromo invent experience I don't have?",
    a: "No. Dromo only reorganizes, rephrases, and emphasizes what's already in your master resume to match the job. It never fabricates roles, dates, or skills.",
  },
  {
    q: "Are the resumes ATS-friendly?",
    a: "Yes. Output uses clean, parseable formatting and mirrors the keywords from the job description so applicant tracking systems can read it correctly.",
  },
  {
    q: "What file formats can I upload and export?",
    a: "Upload a PDF or DOCX of your existing resume. Export your tailored resumes and cover letters as PDF or DOCX, ready to send.",
  },
  {
    q: "How does pricing work?",
    a: "Start free with no card. Pro gives you a generous monthly allowance, and you can top up with usage credits anytime — or buy credits without a subscription.",
  },
  {
    q: "Can I delete my data?",
    a: "Anytime. You can export your data and permanently delete your account and everything tied to it from the account deletion page.",
  },
  {
    q: "Which sign-in options do you support?",
    a: "Email and password, magic link, or one-tap social sign-in with Google, GitHub, or LinkedIn.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      className="scroll-mt-20 border-t border-border py-24 sm:py-32"
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading kicker="FAQ" title="Questions, answered" />

        <Reveal className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
