import { createFileRoute } from "@tanstack/react-router";
import {
  LegalLayout,
  type LegalSection,
} from "@/components/landing/legal-layout";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

const SECTIONS: LegalSection[] = [
  {
    heading: "1. Acceptance of terms",
    body: [
      "By creating an account or using Dromo, you agree to these Terms of Service. If you do not agree, do not use the service.",
    ],
  },
  {
    heading: "2. The service",
    body: [
      "Dromo is an AI-assisted tool that generates tailored resumes, cover letters, and interview preparation from a master resume you provide. Output is generated automatically and may require your review and editing before use.",
    ],
  },
  {
    heading: "3. Your account",
    body: [
      "You are responsible for the activity under your account and for keeping your credentials secure. You must provide accurate information and be at least 16 years old to use Dromo.",
    ],
  },
  {
    heading: "4. Your content",
    body: [
      "You retain ownership of the resume content and other materials you upload. You grant us a limited license to process that content solely to provide the service to you — for example, to parse your resume and generate tailored documents.",
      "You are responsible for the accuracy of your content and for ensuring you have the right to use it. Do not upload content that is unlawful or infringes others' rights.",
    ],
  },
  {
    heading: "5. Acceptable use",
    body: [
      "You agree not to misuse Dromo. In particular, you will not:",
      {
        list: [
          "Misrepresent your qualifications or use Dromo to create deliberately false or fraudulent documents.",
          "Attempt to disrupt, reverse-engineer, or gain unauthorized access to the service.",
          "Use the service to violate any law or the rights of others.",
          "Resell or redistribute the service without our permission.",
        ],
      },
    ],
  },
  {
    heading: "6. Credits, plans, and payments",
    body: [
      "Some features require credits or a paid subscription. Prices and credit allowances are shown at purchase. Subscriptions renew until cancelled, and credits are consumed as you generate documents. Except where required by law, payments are non-refundable.",
    ],
  },
  {
    heading: "7. AI-generated output",
    body: [
      "AI output may contain errors or omissions and is provided for your assistance. You are responsible for reviewing and verifying any document before submitting it to an employer. Dromo does not guarantee interviews, offers, or any specific outcome.",
    ],
  },
  {
    heading: "8. Intellectual property",
    body: [
      "Dromo and its software, design, and trademarks are owned by us and protected by law. These Terms do not grant you any rights in our brand or technology beyond using the service as intended.",
    ],
  },
  {
    heading: "9. Termination",
    body: [
      "You may stop using Dromo and delete your account at any time. We may suspend or terminate your access if you violate these Terms or to protect the service and its users.",
    ],
  },
  {
    heading: "10. Disclaimers and limitation of liability",
    body: [
      'The service is provided "as is" without warranties of any kind. To the maximum extent permitted by law, Dromo is not liable for indirect, incidental, or consequential damages, and our total liability is limited to the amount you paid us in the twelve months before the claim.',
    ],
  },
  {
    heading: "11. Changes to these terms",
    body: [
      "We may update these Terms from time to time. If we make material changes, we will update the date above and, where appropriate, notify you. Continued use after changes means you accept the updated Terms.",
    ],
  },
  {
    heading: "12. Contact us",
    body: ["Questions about these Terms? Contact us at support@dromo.tech."],
  },
];

function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated="June 25, 2026"
      intro="These Terms govern your use of Dromo. Please read them carefully — they explain your rights and responsibilities when using the service."
      sections={SECTIONS}
    />
  );
}
