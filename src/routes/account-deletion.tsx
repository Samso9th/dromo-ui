import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LegalLayout,
  type LegalSection,
} from "@/components/landing/legal-layout";

export const Route = createFileRoute("/account-deletion")({
  component: AccountDeletionPage,
});

const SECTIONS: LegalSection[] = [
  {
    heading: "What gets deleted",
    body: [
      "When you delete your account, we permanently remove the personal data associated with it, including:",
      {
        list: [
          "Your profile and login details.",
          "Your master resume and all parsed resume content.",
          "Tailored resumes, cover letters, and interview briefs you generated.",
          "Your preferences and session data.",
        ],
      },
    ],
  },
  {
    heading: "What we may retain",
    body: [
      "We may retain a limited amount of information where we are legally required to — for example, transaction and billing records needed for tax and accounting. This data is kept only as long as required and is not used to identify you for any other purpose.",
    ],
  },
  {
    heading: "Timeframe",
    body: [
      "Account deletion takes effect immediately, and associated data is removed from our active systems right away. Residual copies in backups are purged on our regular backup rotation, typically within 30 days.",
    ],
  },
  {
    heading: "Export first (optional)",
    body: [
      "Deletion is permanent and cannot be undone. If you want to keep your tailored documents, export them before deleting your account.",
    ],
  },
];

function AccountDeletionPage() {
  return (
    <LegalLayout
      title="Delete your account"
      updated="June 25, 2026"
      intro="You can permanently delete your Dromo account and the data tied to it at any time. This page explains how, what is removed, and how long it takes."
      sections={SECTIONS}
    >
      <div className="mt-12 rounded-xl border border-border bg-card p-7 shadow-[var(--shadow-soft)]">
        <div className="flex items-start gap-4">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              How to delete your account
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>Sign in to your Dromo account.</li>
              <li>
                Go to <span className="text-foreground">Settings</span> and open
                the account section.
              </li>
              <li>
                Select <span className="text-foreground">Delete account</span>{" "}
                and confirm.
              </li>
            </ol>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="group">
                <Link to="/settings">
                  Go to Settings
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a href="mailto:privacy@dromo.tech?subject=Account%20deletion%20request">
                  <Mail className="mr-1 h-4 w-4" />
                  Request deletion by email
                </a>
              </Button>
            </div>

            <p className="mt-5 text-xs text-muted-foreground">
              Can't sign in? Email{" "}
              <a
                href="mailto:privacy@dromo.tech"
                className="text-foreground underline underline-offset-4"
              >
                privacy@dromo.tech
              </a>{" "}
              from the address on your account and we'll process your request.
            </p>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
}
