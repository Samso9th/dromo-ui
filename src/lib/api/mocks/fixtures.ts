import type {
  AiModel,
  GenerationSession,
  MasterResume,
  User,
} from "../types";

export const mockUser: User = {
  id: "user_1",
  name: "Alex Morgan",
  email: "alex@example.com",
  hasMasterResume: true,
  plan: "pro",
  credits: 1500,
};

/** Curated model list with real names. Tier is internal (gating only). Prices = USD per 1M tokens
 *  (live OpenRouter values, 2026-06-19). The real API fetches these from /models. */
export const mockModels: AiModel[] = [
  { id: "qwen/qwen3-235b-a22b-2507", name: "Qwen3 235B", note: "Fast & economical", tier: "economy", pricing: { in: 0.09, out: 0.1 } },
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3", note: "Great all-round value", tier: "economy", pricing: { in: 0.2, out: 0.8 } },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", note: "Open & cheap", tier: "economy", pricing: { in: 0.1, out: 0.32 } },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", note: "Quick and capable", tier: "economy", pricing: { in: 0.3, out: 2.5 } },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", note: "Strong reasoning", tier: "standard", pricing: { in: 1.25, out: 10 } },
  { id: "openai/gpt-4o", name: "GPT-4o", note: "Well-rounded", tier: "standard", pricing: { in: 2.5, out: 10 } },
  { id: "openai/gpt-4.1", name: "GPT-4.1", note: "Precise & reliable", tier: "standard", pricing: { in: 2, out: 8 } },
  { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5", note: "Excellent writing", tier: "standard", pricing: { in: 3, out: 15 } },
  { id: "anthropic/claude-opus-4.5", name: "Claude Opus 4.5", note: "Top quality", tier: "premium", pricing: { in: 5, out: 25 } },
  { id: "anthropic/claude-opus-4.8-fast", name: "Claude Opus 4.8 Fast", note: "Best & fastest", tier: "premium", pricing: { in: 10, out: 50 } },
];

export const DEFAULT_MODEL_ID = mockModels[0].id;

export const mockMasterResume: MasterResume = {
  header: {
    name: "Alex Morgan",
    location: "Brooklyn, NY",
    email: "alex@example.com",
    phone: "+1 (555) 014-2210",
    github: "github.com/alexmorgan",
    linkedin: "linkedin.com/in/alexmorgan",
    website: "alexmorgan.dev",
  },
  summary:
    "Full-stack engineer with 6+ years building product-grade web applications across fintech and developer tools. Strong TypeScript, distributed systems, and design-conscious frontend work.",
  skills: [
    "TypeScript",
    "React",
    "Node.js",
    "Next.js",
    "PostgreSQL",
    "Redis",
    "AWS",
    "Docker",
    "Kubernetes",
    "GraphQL",
    "tRPC",
    "Python",
    "Go",
    "CI/CD",
    "System Design",
  ],
  workExperience: [
    {
      company: "Northwind Labs",
      companyUrl: "northwind.io",
      role: "Senior Software Engineer",
      period: { start: "Mar 2022", end: "Present" },
      locationType: "remote",
      location: "Remote",
      bullets: [
        "Led migration of a monolithic Rails app to a Next.js + tRPC architecture serving 1.2M MAU, cutting P95 latency by 41%.",
        "Designed an event-sourced ledger in PostgreSQL handling $80M/month in transaction volume with zero reconciliation drift.",
        "Mentored a team of 5 engineers; introduced trunk-based development and shipped a release-train that doubled deploy frequency.",
      ],
    },
    {
      company: "Helio Pay",
      companyUrl: "heliopay.com",
      role: "Software Engineer",
      period: { start: "Jun 2019", end: "Feb 2022" },
      locationType: "hybrid",
      location: "New York, NY",
      bullets: [
        "Built the merchant onboarding pipeline (KYC, risk scoring, document parsing) used by 14k+ businesses.",
        "Owned the public REST API and TypeScript SDK; raised SDK adoption from 18% to 73% of integrations.",
        "Drove a Kubernetes migration that reduced infra spend 28% while improving uptime to 99.97%.",
      ],
    },
  ],
  projects: [
    {
      name: "prism-cli",
      url: "github.com/alexmorgan/prism-cli",
      period: { start: "2023", end: "Present" },
      role: "Creator & maintainer",
      bullets: [
        "Open-source CLI for instrumenting Node.js apps with OpenTelemetry; 3.4k GitHub stars.",
        "Plugin architecture supports custom exporters; used in production by three Y Combinator startups.",
      ],
    },
  ],
  extracurriculars: [
    {
      name: "Distributed Systems, Plainly",
      period: { start: "2021", end: "Present" },
      role: "Author",
      where: "Hashnode",
      bullets: [
        "Technical blog with 18 essays on consistency, queues, and observability — 240k cumulative reads.",
      ],
    },
  ],
  education: [
    {
      institution: "Carnegie Mellon University",
      course: "B.S. Computer Science",
      period: { start: "2015", end: "2019" },
      gpa: "3.81",
    },
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect — Associate",
      details:
        "Validated competence in designing distributed systems on AWS, including security, cost optimization, and high availability patterns.",
      awardedDate: "May 2023",
    },
  ],
};

export const mockSessions: GenerationSession[] = [
  {
    id: "sess_demo_1",
    company: "Linear",
    role: "Senior Product Engineer",
    jobUrl: "https://linear.app/careers",
    jobDescription:
      "We're looking for a senior product engineer to build delightful, fast UI for our issue tracker. Strong TypeScript and React. Bonus: design sensibility.",
    modelId: "anthropic/claude-sonnet-4.5",
    templateId: "classic",
    retries: { tailor: 0, cover: 0, brief: 0 },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    chat: [],
  },
  {
    id: "sess_demo_2",
    company: "Stripe",
    role: "Software Engineer, Payments",
    jobDescription:
      "Build the next generation of Stripe's payments ledger. Distributed systems experience required. Go or TypeScript.",
    modelId: "qwen/qwen3-235b-a22b-2507",
    templateId: "two-column",
    retries: { tailor: 0, cover: 0, brief: 0 },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    chat: [],
  },
];
