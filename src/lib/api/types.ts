export type Plan = "free" | "pro" | "premium";

export interface User {
  id: string;
  name: string;
  email: string;
  hasMasterResume: boolean;
  plan: Plan;
  credits: number;
}

/** Internal model tier — used ONLY for plan-gating + grouping, never shown as a model name. */
export type ModelTier = "economy" | "standard" | "premium";

export interface AiModel {
  id: string; // OpenRouter id, e.g. "anthropic/claude-sonnet-4.5"
  name: string; // real display name shown to users, e.g. "Claude Sonnet 4.5"
  note: string; // short descriptor
  tier: ModelTier;
  pricing: { in: number; out: number }; // USD per 1M tokens (input/output)
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type LocationType = "remote" | "hybrid" | "onsite";

export interface Period {
  start: string; // e.g. "Jan 2022"
  end: string; // or "Present"
}

export interface ResumeHeader {
  name: string;
  location: string;
  email: string;
  phone: string;
  github?: string;
  linkedin?: string;
  website?: string;
}

export interface WorkExperience {
  company: string;
  companyUrl?: string;
  role: string;
  period: Period;
  locationType: LocationType;
  location?: string;
  bullets: string[];
}

export interface ProjectEntry {
  name: string;
  url?: string;
  period: Period;
  role?: string;
  location?: string;
  bullets: string[];
}

export interface ExtracurricularEntry {
  name: string;
  period: Period;
  role?: string;
  where: string;
  bullets: string[];
}

export interface EducationEntry {
  institution: string;
  course: string;
  period: Period;
  gpa?: string;
}

export interface CertificationEntry {
  name: string;
  details: string;
  awardedDate?: string;
}

export interface ExtraSection {
  title: string;
  items: Array<Record<string, unknown>>;
}

export interface MasterResume {
  header: ResumeHeader;
  summary: string;
  skills: string[];
  workExperience: WorkExperience[];
  projects: ProjectEntry[];
  extracurriculars: ExtracurricularEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  extraSections?: ExtraSection[];
}

export interface TailoredResume extends MasterResume {
  matchedSkills: string[];
  removedSkills: string[];
}

export interface CoverLetter {
  greeting: string;
  body: string;
  closing: string;
  signature: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export type InterviewType =
  | "recruiter-screen"
  | "behavioral"
  | "technical"
  | "system-design"
  | "mixed";

export type InterviewTone = "professional" | "conversational" | "creative";

export type DocFormat = "md" | "docx" | "pdf" | "txt";

export interface InterviewBrief {
  content: string; // markdown
  format: DocFormat;
  type: InterviewType;
  tone: InterviewTone;
}

export interface GenerationSession {
  id: string;
  company: string;
  role: string;
  jobUrl?: string;
  jobDescription: string;
  modelId: string; // selected AI model for this session (switchable mid-session)
  templateId: string; // selected resume template (see src/lib/templates.ts)
  /** Regeneration counts per artifact (initial generation doesn't count). Plan-capped. */
  retries: { tailor: number; cover: number; brief: number };
  createdAt: string;
  tailoredResume?: TailoredResume;
  coverLetter?: CoverLetter;
  chat: ChatMessage[];
  interviewBrief?: InterviewBrief;
}

export type OAuthProvider = "google" | "github" | "linkedin";

export interface CreditTransaction {
  id: string;
  kind: "grant" | "spend" | "topup" | "refund";
  /** signed credit delta (+grant/topup/refund, −spend) */
  amount: number;
  description: string;
  createdAt: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
