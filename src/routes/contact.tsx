import { createFileRoute } from "@tanstack/react-router";
import { Mail, LifeBuoy, ShieldCheck } from "lucide-react";
import { LegalLayout } from "@/components/landing/legal-layout";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

const CHANNELS = [
  {
    icon: LifeBuoy,
    title: "Support",
    body: "Questions, billing, or something not working? We're happy to help.",
    email: "support@dromo.tech",
  },
  {
    icon: ShieldCheck,
    title: "Privacy & data",
    body: "Data requests, account deletion, or privacy questions.",
    email: "privacy@dromo.tech",
  },
  {
    icon: Mail,
    title: "General",
    body: "Partnerships, press, or anything else.",
    email: "hello@dromo.tech",
  },
];

function ContactPage() {
  return (
    <LegalLayout
      title="Contact us"
      updated="June 25, 2026"
      intro="We'd love to hear from you. Reach the right team using the addresses below — we typically reply within one to two business days."
    >
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {CHANNELS.map((c) => (
          <a
            key={c.email}
            href={`mailto:${c.email}`}
            className="lift-card rounded-xl border border-border bg-card p-6"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border">
              <c.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-base font-semibold">{c.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
            <p className="mt-4 text-sm font-medium underline underline-offset-4">
              {c.email}
            </p>
          </a>
        ))}
      </div>
    </LegalLayout>
  );
}
