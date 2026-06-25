import { createFileRoute } from "@tanstack/react-router";
import {
  LegalLayout,
  type LegalSection,
} from "@/components/landing/legal-layout";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

const SECTIONS: LegalSection[] = [
  {
    heading: "1. Information we collect",
    body: [
      "We collect the information you provide and the information needed to operate the service:",
      {
        list: [
          "Account details — your name, email address, and authentication identifiers (including data from Google, GitHub, or LinkedIn if you sign in with them).",
          "Resume content — the master resume you upload and the job descriptions, cover letters, and tailored documents generated from it.",
          "Usage data — how you interact with Dromo, such as features used and credits consumed, to operate and improve the service.",
          "Technical data — IP address, device, and browser information collected automatically for security and reliability.",
        ],
      },
    ],
  },
  {
    heading: "2. How we use your information",
    body: [
      "We use your information to provide and improve Dromo, including to:",
      {
        list: [
          "Parse your resume and generate tailored resumes, cover letters, and interview preparation.",
          "Authenticate you and keep your account secure.",
          "Process payments and manage your credits and subscription.",
          "Send essential service communications (for example, magic-link sign-in and account notices).",
          "Detect, prevent, and address fraud, abuse, and technical issues.",
        ],
      },
    ],
  },
  {
    heading: "3. AI processing",
    body: [
      "To generate tailored documents, your resume content and the job descriptions you provide are processed by AI models, which may be operated by third-party providers acting on our behalf. We send only what is needed to perform the task you requested. We do not sell your personal information.",
    ],
  },
  {
    heading: "4. How we share information",
    body: [
      "We share information only with service providers who help us operate Dromo — such as cloud hosting, AI model providers, email delivery, and payment processing — and only as needed to provide the service. We may also disclose information where required by law or to protect our rights and users.",
    ],
  },
  {
    heading: "5. Data retention",
    body: [
      "We retain your information for as long as your account is active or as needed to provide the service. You can delete your resume content and your account at any time; when you delete your account, we remove your personal data except where we are required to retain it (for example, for legal or accounting obligations).",
    ],
  },
  {
    heading: "6. Your rights",
    body: [
      "Depending on where you live, you may have the right to access, correct, export, or delete your personal data, and to object to or restrict certain processing. You can exercise many of these directly in your account, or by contacting us.",
      "To delete your account and associated data, visit the account deletion page or your settings.",
    ],
  },
  {
    heading: "7. Security",
    body: [
      "We use technical and organizational measures to protect your data, including encryption in transit and restricted access. No method of transmission or storage is completely secure, but we work to protect your information and continually improve our safeguards.",
    ],
  },
  {
    heading: "8. Children's privacy",
    body: [
      "Dromo is not directed to children under 16, and we do not knowingly collect personal information from them.",
    ],
  },
  {
    heading: "9. Changes to this policy",
    body: [
      "We may update this policy from time to time. When we make material changes, we will update the date above and, where appropriate, notify you.",
    ],
  },
  {
    heading: "10. Contact us",
    body: [
      "If you have questions about this policy or your data, contact us at privacy@dromo.tech.",
    ],
  },
];

function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="June 25, 2026"
      intro="This Privacy Policy explains what information Dromo collects, how we use it, and the choices you have. Dromo helps you turn one master resume into tailored resumes, cover letters, and interview prep — and your resume data stays yours."
      sections={SECTIONS}
    />
  );
}
