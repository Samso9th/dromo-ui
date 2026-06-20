import type { Plan } from "@/lib/api/types";

/**
 * Resume templates are config-driven: one renderer (resume-document.tsx) adapts to these knobs,
 * so adding a template = adding a config here. Documents stay in professional fonts (never the
 * app's DynaPuff display font). Free plan gets the 3 `minPlan: "free"` templates.
 */

export type SectionKey =
  | "skills"
  | "education"
  | "certifications"
  | "summary"
  | "work"
  | "projects"
  | "extracurriculars";

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  minPlan: Plan;
  font: "serif" | "sans";
  nameAlign: "center" | "left";
  nameSize: number;
  nameUppercase?: boolean;
  heading: "caps-rule" | "plain-bold" | "caps-plain";
  density: "normal" | "compact" | "airy";
  columns: 1 | 2;
  /** For 2-column templates: which sections live in the left rail. */
  sidebar?: SectionKey[];
}

export const RESUME_TEMPLATES: TemplateConfig[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Centered serif, single column. The safe ATS default.",
    minPlan: "free",
    font: "serif",
    nameAlign: "center",
    nameSize: 30,
    heading: "caps-rule",
    density: "normal",
    columns: 1,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Left-aligned, clean sans-serif, minimal rules.",
    minPlan: "free",
    font: "sans",
    nameAlign: "left",
    nameSize: 27,
    heading: "plain-bold",
    density: "normal",
    columns: 1,
  },
  {
    id: "compact",
    name: "Compact",
    description: "Dense single column — fit more on one page.",
    minPlan: "free",
    font: "serif",
    nameAlign: "center",
    nameSize: 24,
    heading: "caps-rule",
    density: "compact",
    columns: 1,
  },
  {
    id: "two-column",
    name: "Two-Column",
    description:
      "Sidebar for skills, education & certs; main column for experience.",
    minPlan: "pro",
    font: "sans",
    nameAlign: "left",
    nameSize: 26,
    heading: "caps-plain",
    density: "normal",
    columns: 2,
    sidebar: ["skills", "education", "certifications"],
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Spacious serif with a bold uppercase nameplate.",
    minPlan: "premium",
    font: "serif",
    nameAlign: "center",
    nameSize: 34,
    nameUppercase: true,
    heading: "caps-rule",
    density: "airy",
    columns: 1,
  },
];

export const DEFAULT_TEMPLATE_ID = "classic";

const PLAN_RANK: Record<Plan, number> = { free: 0, pro: 1, premium: 2 };

export function templateUnlocked(tpl: TemplateConfig, plan: Plan): boolean {
  return PLAN_RANK[tpl.minPlan] <= PLAN_RANK[plan];
}

export function getTemplate(id: string): TemplateConfig {
  return RESUME_TEMPLATES.find((t) => t.id === id) ?? RESUME_TEMPLATES[0];
}
