import { createFileRoute } from "@tanstack/react-router";
import {
  LegalLayout,
  type LegalSection,
} from "@/components/landing/legal-layout";

export const Route = createFileRoute("/cookies")({
  component: CookiesPage,
});

const SECTIONS: LegalSection[] = [
  {
    heading: "1. What cookies are",
    body: [
      "Cookies are small text files stored on your device when you visit a website. We also use similar technologies such as local storage. Together they let Dromo remember you and function reliably.",
    ],
  },
  {
    heading: "2. How we use cookies",
    body: [
      "We keep our use of cookies minimal and focused on running the service:",
      {
        list: [
          "Essential — secure, httpOnly cookies that keep you signed in and protect your session. The service cannot work without these.",
          "Preferences — remembering choices such as light or dark theme.",
          "Analytics — if enabled, privacy-respecting measurement that helps us understand and improve how Dromo is used.",
        ],
      },
    ],
  },
  {
    heading: "3. Managing cookies",
    body: [
      "You can control or delete cookies through your browser settings. Note that blocking essential cookies will prevent you from signing in and using core features of Dromo.",
    ],
  },
  {
    heading: "4. Changes",
    body: [
      "We may update this Cookie Policy as our practices evolve. We will update the date above when we do.",
    ],
  },
  {
    heading: "5. Contact us",
    body: ["Questions about cookies? Contact us at privacy@dromo.tech."],
  },
];

function CookiesPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      updated="June 25, 2026"
      intro="This Cookie Policy explains how Dromo uses cookies and similar technologies, and the choices you have."
      sections={SECTIONS}
    />
  );
}
