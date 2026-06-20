import { apiFetch, USE_MOCKS, mockDelay, BASE_URL } from "./client";
import {
  DEFAULT_MODEL_ID,
  mockMasterResume,
  mockModels,
  mockSessions,
  mockUser,
} from "./mocks/fixtures";
import { creditsFor, RETRY_LIMIT, type ActionType } from "@/lib/credits";
import { DEFAULT_TEMPLATE_ID } from "@/lib/templates";
import { ApiError } from "./types";
import type {
  AiModel,
  ChatMessage,
  CoverLetter,
  CreditTransaction,
  DocFormat,
  GenerationSession,
  InterviewBrief,
  InterviewTone,
  InterviewType,
  MasterResume,
  OAuthProvider,
  Plan,
  TailoredResume,
  User,
} from "./types";

// --- in-memory mock state ---------------------------------------------------
let _master: MasterResume | null = { ...mockMasterResume };
const _sessions = new Map<string, GenerationSession>(
  mockSessions.map((s) => [s.id, { ...s }]),
);
let _user: User = { ...mockUser };

// Mock-only session flag (mirrors the cookie session) so the hydrate/me() flow behaves like real auth.
const SESSION_KEY = "dromo.mockSession";
const mockAuthed = () =>
  typeof window !== "undefined" && window.localStorage.getItem(SESSION_KEY) === "1";
function setMockAuthed(on: boolean) {
  if (typeof window === "undefined") return;
  if (on) window.localStorage.setItem(SESSION_KEY, "1");
  else window.localStorage.removeItem(SESSION_KEY);
}

/** Full URL to start an OAuth flow (real backend redirect). */
export const oauthUrl = (provider: OAuthProvider) => `${BASE_URL}/auth/oauth/${provider}`;

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Mock-only: deduct credits for an action using the session's selected model. */
function chargeMockCredits(session: GenerationSession, action: ActionType): void {
  const model = mockModels.find((m) => m.id === session.modelId) ?? mockModels[0];
  const cost = creditsFor(model, action);
  _user = { ..._user, credits: Math.max(0, _user.credits - cost) };
}

/** Mock-only: enforce + count regenerations. Initial generation (isRetry=false) is always allowed. */
function enforceRetry(
  session: GenerationSession,
  key: "tailor" | "cover" | "brief",
  isRetry: boolean,
): void {
  if (!isRetry) return;
  const limit = RETRY_LIMIT[_user.plan];
  if (session.retries[key] >= limit) {
    throw new Error(
      limit === 0
        ? "Regenerating isn't available on the Free plan. Upgrade to regenerate."
        : `You've reached your ${limit} regeneration limit for this item.`,
    );
  }
  session.retries[key] += 1;
}

// --- auth -------------------------------------------------------------------
export const auth = {
  async login(email: string, _password: string): Promise<User> {
    if (USE_MOCKS) {
      await mockDelay();
      _user = { ..._user, email, hasMasterResume: !!_master };
      setMockAuthed(true);
      return _user;
    }
    return (
      await apiFetch<{ user: User }>("/auth/login", {
        method: "POST",
        body: { email, password: _password },
      })
    ).user;
  },
  async signup(name: string, email: string, _password: string): Promise<User> {
    if (USE_MOCKS) {
      await mockDelay();
      _master = null;
      _user = { id: newId("u"), name, email, hasMasterResume: false, plan: "free", credits: 100 };
      setMockAuthed(true);
      return _user;
    }
    return (
      await apiFetch<{ user: User }>("/auth/signup", {
        method: "POST",
        body: { name, email, password: _password },
      })
    ).user;
  },
  async magicLink(email: string): Promise<{ ok: true }> {
    if (USE_MOCKS) {
      await mockDelay();
      console.info("[mock] magic link sent to", email);
      return { ok: true };
    }
    return apiFetch("/auth/magic-link", { method: "POST", body: { email } });
  },
  /** Mock helper only — real OAuth uses a full-page redirect to oauthUrl(provider). */
  async oauthStart(provider: OAuthProvider): Promise<User> {
    await mockDelay(300);
    _user = { ..._user, hasMasterResume: !!_master };
    setMockAuthed(true);
    return _user;
  },
  async me(): Promise<User> {
    if (USE_MOCKS) {
      await mockDelay(150);
      if (!mockAuthed()) throw new ApiError(401, "Unauthorized");
      return { ..._user, hasMasterResume: !!_master };
    }
    return (await apiFetch<{ user: User }>("/auth/me")).user;
  },
  async logout(): Promise<void> {
    if (USE_MOCKS) {
      await mockDelay(100);
      setMockAuthed(false);
      return;
    }
    await apiFetch("/auth/logout", { method: "POST" });
  },
};

// --- resume -----------------------------------------------------------------
export const resume = {
  async uploadMaster(_file: File): Promise<MasterResume> {
    if (USE_MOCKS) {
      await mockDelay(900);
      _master = { ...mockMasterResume };
      _user = { ..._user, hasMasterResume: true };
      return _master;
    }
    const fd = new FormData();
    fd.append("file", _file);
    const res = await fetch(`${BASE_URL}/resume/master`, {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    if (!res.ok) {
      let msg = "Couldn't parse that file";
      try {
        const data = await res.json();
        msg = data?.error?.message ?? msg;
      } catch {
        /* ignore */
      }
      throw new ApiError(res.status, msg);
    }
    return (await res.json()) as MasterResume;
  },
  async getMaster(): Promise<MasterResume | null> {
    if (USE_MOCKS) {
      await mockDelay(200);
      return _master;
    }
    return apiFetch<MasterResume | null>("/resume/master");
  },
  async updateMaster(next: MasterResume): Promise<MasterResume> {
    if (USE_MOCKS) {
      await mockDelay(300);
      _master = next;
      return _master;
    }
    return apiFetch<MasterResume>("/resume/master", { method: "PUT", body: next });
  },
};

// --- sessions ---------------------------------------------------------------
export const sessions = {
  async list(): Promise<GenerationSession[]> {
    if (USE_MOCKS) {
      await mockDelay(200);
      return Array.from(_sessions.values()).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
    }
    return apiFetch<GenerationSession[]>("/sessions");
  },
  async create(input: {
    company: string;
    role: string;
    jobUrl?: string;
    jobDescription: string;
    modelId?: string;
    templateId?: string;
  }): Promise<GenerationSession> {
    if (USE_MOCKS) {
      await mockDelay(400);
      const s: GenerationSession = {
        id: newId("sess"),
        ...input,
        modelId: input.modelId ?? DEFAULT_MODEL_ID,
        templateId: input.templateId ?? DEFAULT_TEMPLATE_ID,
        retries: { tailor: 0, cover: 0, brief: 0 },
        createdAt: new Date().toISOString(),
        chat: [],
      };
      _sessions.set(s.id, s);
      return s;
    }
    return apiFetch<GenerationSession>("/sessions", { method: "POST", body: input });
  },
  async setModel(id: string, modelId: string): Promise<GenerationSession> {
    if (USE_MOCKS) {
      await mockDelay(120);
      const s = _sessions.get(id);
      if (!s) throw new Error("Session not found");
      s.modelId = modelId;
      return s;
    }
    return apiFetch<GenerationSession>(`/sessions/${id}/model`, {
      method: "PUT",
      body: { modelId },
    });
  },
  async setTemplate(id: string, templateId: string): Promise<GenerationSession> {
    if (USE_MOCKS) {
      await mockDelay(120);
      const s = _sessions.get(id);
      if (!s) throw new Error("Session not found");
      s.templateId = templateId;
      return s;
    }
    return apiFetch<GenerationSession>(`/sessions/${id}/template`, {
      method: "PUT",
      body: { templateId },
    });
  },
  async get(id: string): Promise<GenerationSession> {
    if (USE_MOCKS) {
      await mockDelay(150);
      const s = _sessions.get(id);
      if (!s) throw new Error("Session not found");
      return s;
    }
    return apiFetch<GenerationSession>(`/sessions/${id}`);
  },
  async delete(id: string): Promise<void> {
    if (USE_MOCKS) {
      await mockDelay(150);
      _sessions.delete(id);
      return;
    }
    await apiFetch(`/sessions/${id}`, { method: "DELETE" });
  },
};

// --- generation -------------------------------------------------------------
export const generation = {
  async tailorResume(sessionId: string): Promise<TailoredResume> {
    if (USE_MOCKS) {
      await mockDelay(1200);
      const s = _sessions.get(sessionId);
      if (!s || !_master) throw new Error("Missing context");
      enforceRetry(s, "tailor", !!s.tailoredResume);
      const tailored: TailoredResume = {
        ..._master,
        skills: _master.skills.slice(0, 10),
        matchedSkills: ["TypeScript", "React", "Node.js"],
        removedSkills: ["Python", "Go"],
      };
      s.tailoredResume = tailored;
      chargeMockCredits(s, "tailor");
      return tailored;
    }
    return apiFetch<TailoredResume>(`/sessions/${sessionId}/tailor`, { method: "POST" });
  },
  async generateCoverLetter(sessionId: string, tone?: string): Promise<CoverLetter> {
    if (USE_MOCKS) {
      await mockDelay(900);
      const s = _sessions.get(sessionId);
      if (!s) throw new Error("Missing session");
      enforceRetry(s, "cover", !!s.coverLetter);
      const cl: CoverLetter = {
        greeting: `Dear ${s.company} hiring team,`,
        body: `I'm writing to express strong interest in the ${s.role} role. My background in TypeScript-heavy product engineering aligns directly with what you're building — particularly the focus on speed, craft, and end-to-end ownership.\n\nAt Northwind Labs I led a Next.js + tRPC migration that cut P95 latency 41% across 1.2M MAU. The work was equal parts systems thinking and care for the detail that users actually feel.`,
        closing: "I'd love the chance to talk.",
        signature: _user.name,
      };
      s.coverLetter = cl;
      chargeMockCredits(s, "cover");
      return cl;
    }
    return apiFetch<CoverLetter>(`/sessions/${sessionId}/cover-letter`, {
      method: "POST",
      body: { tone },
    });
  },
  async askQuestion(sessionId: string, question: string): Promise<ChatMessage> {
    if (USE_MOCKS) {
      await mockDelay(700);
      const s = _sessions.get(sessionId);
      if (!s) throw new Error("Missing session");
      const userMsg: ChatMessage = {
        id: newId("msg"),
        role: "user",
        content: question,
        createdAt: new Date().toISOString(),
      };
      const assistantMsg: ChatMessage = {
        id: newId("msg"),
        role: "assistant",
        content: mockAnswer(s, question),
        createdAt: new Date().toISOString(),
      };
      s.chat.push(userMsg, assistantMsg);
      chargeMockCredits(s, "qa");
      return assistantMsg;
    }
    return apiFetch<ChatMessage>(`/sessions/${sessionId}/chat`, {
      method: "POST",
      body: { question },
    });
  },
  async generateInterviewBrief(
    sessionId: string,
    opts: { format: DocFormat; type: InterviewType; tone: InterviewTone },
  ): Promise<InterviewBrief> {
    if (USE_MOCKS) {
      await mockDelay(1100);
      const s = _sessions.get(sessionId);
      if (!s) throw new Error("Missing session");
      enforceRetry(s, "brief", !!s.interviewBrief);
      const brief: InterviewBrief = {
        ...opts,
        content: mockInterviewBrief(s, opts.type, opts.tone),
      };
      s.interviewBrief = brief;
      chargeMockCredits(s, "brief");
      return brief;
    }
    return apiFetch<InterviewBrief>(`/sessions/${sessionId}/interview-brief`, {
      method: "POST",
      body: opts,
    });
  },
};

// --- files ------------------------------------------------------------------
export const files = {
  async downloadDoc(
    kind: "resume" | "cover-letter" | "interview-brief",
    sessionId: string,
    format: DocFormat = "pdf",
  ): Promise<Blob> {
    if (USE_MOCKS) {
      await mockDelay(400);
      return new Blob(
        [`mock ${kind} for ${sessionId} (${format})`],
        { type: format === "pdf" ? "application/pdf" : "text/plain" },
      );
    }
    const res = await fetch(`${BASE_URL}/files/${kind}/${sessionId}?format=${format}`, {
      credentials: "include",
    });
    return await res.blob();
  },
};

// --- models & billing -------------------------------------------------------
export const models = {
  async list(): Promise<AiModel[]> {
    if (USE_MOCKS) {
      await mockDelay(150);
      return mockModels;
    }
    // Real API normalizes OpenRouter /models into our AiModel shape (with tiers + live pricing).
    return apiFetch<AiModel[]>("/models");
  },
};

export const billing = {
  async getBalance(): Promise<{ balance: number; plan: Plan }> {
    if (USE_MOCKS) {
      await mockDelay(120);
      return { balance: _user.credits, plan: _user.plan };
    }
    return apiFetch<{ balance: number; plan: Plan }>("/billing/balance");
  },
  async getTransactions(): Promise<CreditTransaction[]> {
    if (USE_MOCKS) {
      await mockDelay(200);
      const now = Date.now();
      const h = 1000 * 60 * 60;
      return [
        { id: "t1", kind: "grant", amount: 1500, description: "Pro plan — monthly credits", createdAt: new Date(now - 72 * h).toISOString() },
        { id: "t2", kind: "spend", amount: -32, description: "Tailored resume · Claude Sonnet 4.5 · Linear", createdAt: new Date(now - 26 * h).toISOString() },
        { id: "t3", kind: "spend", amount: -8, description: "Cover letter · Claude Sonnet 4.5 · Linear", createdAt: new Date(now - 26 * h).toISOString() },
        { id: "t4", kind: "topup", amount: 1000, description: "Top-up pack — 1,000 credits", createdAt: new Date(now - 20 * h).toISOString() },
        { id: "t5", kind: "spend", amount: -2, description: "Tailored resume · Qwen3 235B · Stripe", createdAt: new Date(now - 4 * h).toISOString() },
      ];
    }
    return apiFetch<CreditTransaction[]>("/billing/transactions");
  },
  /** Stub — real flow creates a Stripe Checkout session or a Dubu Pay checkout link server-side. */
  async startCheckout(input: {
    kind: "subscription" | "topup";
    planId?: Plan;
    credits?: number;
    method: "stripe" | "dubu";
  }): Promise<{ url: string }> {
    if (USE_MOCKS) {
      await mockDelay(300);
      return { url: "#mock-checkout" };
    }
    return apiFetch<{ url: string }>("/billing/checkout", { method: "POST", body: input });
  },
};

// --- mock content builders --------------------------------------------------
// These only run in mock mode; the real API returns equivalent content.

function mockAnswer(s: GenerationSession, question: string): string {
  const name = (_user.name || "the candidate").split(" ")[0];
  const top = _master?.workExperience?.[0];
  const skill = _master?.skills?.[0] ?? "TypeScript";
  return [
    `Here's an answer you can paste, written as ${name} and grounded in your tailored resume for the ${s.role} role at ${s.company}:`,
    "",
    `"${question.replace(/\?+$/, "")}? In my work${top ? ` at ${top.company} as ${top.role}` : ""}, I focused on exactly this. ${
      top?.bullets?.[0] ??
      `I shipped ${skill}-heavy systems end to end, owning the outcome rather than a slice.`
    } That maps directly to what ${s.company} describes in the posting, so I'd bring the same ownership and measurable impact here."`,
    "",
    "Tip: swap in the specific metric the JD cares about most, and keep it to 3–4 sentences for an application box.",
  ].join("\n");
}

function mockInterviewBrief(
  s: GenerationSession,
  type: InterviewType,
  tone: InterviewTone,
): string {
  const r = _master;
  const top = r?.workExperience?.[0];
  const skills = (r?.skills ?? []).slice(0, 8).join(", ");
  const toneNote =
    tone === "creative"
      ? "Delivery: be vivid and story-first — lead with a hook, then the outcome."
      : tone === "conversational"
        ? "Delivery: warm and plain-spoken, like explaining to a smart teammate."
        : "Delivery: crisp, structured, outcome-led. Lead with the result.";

  const sections: Record<InterviewType, string> = {
    "recruiter-screen": `## Likely questions — recruiter screen
1. "Walk me through your background." → 90-second pitch ending on why ${s.company}.
2. "Why are you looking / why us?" → tie to something specific in the posting.
3. "Salary expectations & availability?" → give a range, stay flexible.
4. "Tell me about a recent project." → use ${top?.company ?? "your latest role"}.`,
    behavioral: `## Likely questions — behavioral (answer in STAR)
1. "Tell me about a time you led under pressure."
2. "A conflict with a teammate — how did you resolve it?"
3. "A failure and what you learned."
4. "How do you prioritize when everything is urgent?"`,
    technical: `## Likely questions — technical
1. Core ${(r?.skills ?? ["TypeScript"])[0]} fundamentals and trade-offs.
2. Debug a production incident: how do you isolate root cause?
3. Design a small API for the domain in the JD.
4. Testing strategy and how you ensure correctness.`,
    "system-design": `## Likely questions — system design
1. Design the core system implied by the JD (start with requirements + scale).
2. Data model, storage choice, and consistency trade-offs.
3. Caching, queues, and failure modes.
4. How you'd evolve it at 10x traffic.`,
    mixed: `## Likely questions — mixed panel
1. Background pitch (recruiter-style).
2. One STAR behavioral on leadership/conflict.
3. One technical deep-dive on ${(r?.skills ?? ["your stack"])[0]}.
4. A lightweight design discussion tied to the JD.`,
  };

  return `# Interview Brief — ${s.role} at ${s.company}
_Interview type: **${type}** · Tone: **${tone}**_

> Feed this whole document to an AI mock-interviewer as context. It is self-contained.

## Role & company summary
${s.company} is hiring a ${s.role}. From the job description, they care most about: ${
    s.jobDescription.slice(0, 180) + (s.jobDescription.length > 180 ? "…" : "")
  }

## Candidate highlights (from the tailored resume)
- **Headline:** ${r?.summary ?? "Experienced engineer with a strong delivery record."}
- **Top role:** ${top ? `${top.role} at ${top.company} (${top.period.start}–${top.period.end})` : "See resume."}
- **Signature win:** ${top?.bullets?.[0] ?? "Shipped measurable impact on a core product."}
- **Relevant skills:** ${skills || "TypeScript, React, Node.js"}

${sections[type]}

## Strong model answers
**STAR — leadership under pressure**
- **Situation:** ${top ? `At ${top.company}, a release was at risk.` : "A critical release was at risk."}
- **Task:** Own the outcome and keep the team unblocked.
- **Action:** ${top?.bullets?.[0] ?? "Reorganized the work, cut scope, and shipped on a release train."}
- **Result:** Delivered on time with a measurable improvement; team adopted the approach.

## Talking points to weave in
- Connect every answer back to a concrete metric.
- Name the exact technologies in the JD (${skills || "their stack"}).
- Show ownership: "I" for what you drove, "we" for the team.

## Gaps / red flags to pre-empt
- If the JD lists a skill that's lighter on your resume, acknowledge it and show how fast you ramp.
- Have one thoughtful question ready about the team's biggest current challenge.

---
${toneNote}
`;
}
