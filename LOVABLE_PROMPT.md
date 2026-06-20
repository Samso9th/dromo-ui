# Sumerer — Lovable Build Pack

A resume-tailoring tool. Upload one master resume → AI parses it to structured JSON → paste any job
description → AI generates a tailored resume, cover letter, an interview-prep brief, and a per-session
Q&A chatbot for answering job-application questions.

This file is a **build pack**, not a single prompt. Lovable's own guidance is to seed a Knowledge Base
once, then build **incrementally**, one feature per prompt. Follow the order below.

---

## How to use this pack

1. Create a new Lovable project.
2. Open **Project Settings → Knowledge Base** and paste **PART A** in full. This is persistent context
   the AI sees on every prompt — it prevents scope drift and hallucinated features.
3. In **Chat mode**, paste: *"Before writing any code, review the Knowledge Base and confirm in your own
   words the app's purpose, the design system, and that the UI is frontend-only talking to an external
   API via a typed client with mock data."* Verify it understood.
4. Switch to **Default mode** and run **Prompt 1** (Foundation + Auth).
5. Run **Prompts 2, 3, 4 one at a time**, reviewing the result after each. Four build prompts total —
   sized for the Lovable free tier. Don't paste them all at once.

> **Free-tier note:** each prompt below batches several features, so it's a big ask. If a response gets
> cut off mid-build, reply **"continue"** to finish it (that uses another message). Review and fix issues
> with small scoped follow-ups (see the end of this file) rather than re-running a whole prompt.

> **Critical architecture rule (repeat it if the AI drifts):** This is a **frontend-only** app. Do **NOT**
> use Supabase, Lovable Cloud, or any built-in backend. All data comes from an **external REST API** the
> user is building separately. Every network call goes through **one typed API client module** with
> **mock data** behind a flag and an **env-configurable base URL**.

---

# PART A — Knowledge Base (paste into Project Settings → Knowledge Base)

```
PROJECT: Sumerer

OVERVIEW & GOAL
Sumerer is a job-application tool that removes the need to hand-edit a resume for every job. The user
uploads ONE master resume; AI parses it into structured JSON (the "master resume"). For any job, the user
pastes the job description and Sumerer generates a tailored resume, a matching cover letter, an
interview-prep document, and a per-session Q&A assistant. Replacement for the discontinued hyrd.dev.

ARCHITECTURE (NON-NEGOTIABLE)
- This is a FRONTEND-ONLY application. NO Supabase, NO Lovable Cloud, NO built-in database or auth.
- A separate external REST API (built by the user) provides all data, auth, parsing, and AI generation.
- ALL network access goes through a single typed client at src/lib/api/client.ts.
- The client reads base URL from import.meta.env.VITE_API_BASE_URL (fallback "http://localhost:8080").
- A flag VITE_USE_MOCKS ("true"/"false", default "true") switches every call between mock fixtures and
  real fetch. Mocks live in src/lib/api/mocks/. The app must be fully clickable end-to-end on mocks alone.
- Auth token (JWT) is stored in memory + localStorage; client attaches Authorization: Bearer <token>.
- On 401, clear token and redirect to /login.

TECH STACK
- Vite + React + TypeScript. Tailwind CSS. shadcn/ui components. react-router-dom.
- Data fetching/caching: @tanstack/react-query. Forms: react-hook-form + zod.
- Animation: GSAP (subtle). Markdown rendering: react-markdown. Toggles/toasts via shadcn.

DESIGN LANGUAGE
- Strictly monochrome: black, white, and grays only. No accent colors. Convey state with weight,
  contrast, borders, and subtle motion — not hue.
- Dark mode is the DEFAULT; light mode available via toggle. Both fully designed.
- Minimal, editorial, lots of whitespace, crisp typography. Think Linear/Vercel restraint in grayscale.
- Subtle GSAP micro-interactions (page/section fade+rise on mount, stagger on lists, hover lifts) and a
  light "3D vibe" (soft layered shadows, slight depth on cards/modals). Tasteful, never flashy.
- Fully mobile-responsive, mobile-first. WCAG AA contrast, keyboard navigation, ARIA labels.
- Functionality is the priority; animation is polish, never a blocker.

CORE USER FLOW
1. Auth: sign up / log in (email+password JWT, passwordless magic link, Google/GitHub/LinkedIn OAuth).
2. Onboarding: upload master resume (PDF/DOCX) -> API parses to JSON -> user reviews/edits in an editor.
3. Dashboard: lists the master resume and all past generation sessions.
4. New session: paste a job description (+ optional company/role/job URL) -> AI generates a tailored
   resume. The tailoring MUST fit the job exactly: add required skills that are missing, drop irrelevant
   ones, and keep only the experience/bullets relevant to the role. No bloat.
5. Within a session, four tools: Tailored Resume (preview + download PDF), Cover Letter (generate +
   download), Q&A Assistant (chatbot that answers application questions using this session's resume +
   cover letter + job description), and Interview Prep (generate a downloadable brief).

MASTER RESUME JSON SHAPE (the structured resume; sections are arrays where noted)
{
  header: { name, location, email, phone, github, linkedin, website? },
  summary: string,
  skills: string[],
  workExperience: [{ company, companyUrl?, role, period:{start,end|"Present"},
                     locationType:"remote"|"hybrid"|"onsite", location?, bullets: string[] (<=10) }],
  projects: [{ name, url?, period:{start,end}, role?, location?, bullets: string[] (<=10) }],
  extracurriculars: [{ name, period:{start,end|"Present"}, role?, where (e.g. "GitHub","Hashnode"),
                       bullets: string[] }],
  education: [{ institution, course, period:{start,end}, gpa? }],
  certifications: [{ name, details, awardedDate? }],
  extraSections?: [{ title, items: [...] }]   // future-proofing for arbitrary sections
}

RESUME VISUAL FORMAT (preview + PDF must match this single-column template exactly)
- Centered full name (large serif bold). Below it, centered location, then a centered contact line:
  email | phone | github | linkedin  (links underlined).
- Section headings in SMALL-CAPS/UPPERCASE with a full-width hairline rule beneath
  (SUMMARY, SKILLS, WORK EXPERIENCE, PROJECTS, EXTRACURRICULARS, EDUCATION, CERTIFICATIONS).
- Each experience/project entry: line 1 = "Org Name  url" on the LEFT, date range bold on the RIGHT;
  line 2 = role on the LEFT (italic), location on the RIGHT (italic). Then bullet points.
- Education entry: institution (bold) left, dates right; course left, GPA right (italic).
- Certifications: name (bold) then a paragraph of detail.
- Compact, print-friendly, ATS-friendly, black text on white for the document itself (the document
  preview is always the printed look; the app chrome around it follows dark/light mode).

DOWNLOADS
- Tailored resume: PDF.
- Cover letter: PDF (and TXT).
- Interview prep brief: user picks format MD / DOCX / PDF / TXT, interview TYPE
  (recruiter screen / behavioral / technical / system-design / mixed) and TONE
  (professional / conversational / creative). The brief is meant to be fed to an AI mock-interviewer as
  context, so it must be self-contained: role + company summary, the tailored resume highlights, likely
  questions by category, strong model answers (STAR for behavioral), talking points, and red flags to
  address. Maximize usefulness.

OUT OF SCOPE (do not build)
- No real backend, no Supabase, no payment/billing yet, no team/multi-user collaboration, no email
  sending from the frontend (the external API owns OAuth, magic links via Resend, parsing, and all AI).
```

---

# PART B — Build prompts (4 total, free-tier sized)

Run these in **Default mode**, one at a time, in order. Each batches several features. If a build is cut
off, reply **"continue"**.

---

## Prompt 1 — Foundation + Auth (design system, shell, API client, mocks, login/signup)

```
Scaffold the foundation for Sumerer per the Knowledge Base, plus the auth screens. Frontend-only — no
Supabase, no backend, no database.

1. DESIGN SYSTEM
   - Tailwind theme: a strictly grayscale palette (CSS variables for background, foreground, muted,
     border, card) wired for dark mode (DEFAULT) and light mode. No accent hues anywhere.
   - Typography: a serif display face for the resume/name, a clean sans for app UI.
   - Install and configure shadcn/ui. ThemeProvider with a dark/light toggle (default dark), persisted
     to localStorage.
   - Add GSAP: a useReveal() hook (fade + 8px rise on mount) and a useStagger() helper for lists. Soft
     layered shadows on cards/modals for a subtle depth/3D feel. Keep all motion subtle.

2. API CLIENT LAYER (the spine of the app — get this right)
   - src/lib/api/client.ts: a typed fetch wrapper. Base URL from import.meta.env.VITE_API_BASE_URL
     (fallback "http://localhost:8080"). Attaches Authorization: Bearer <token> from an auth store.
     On 401, clears token and redirects to /login. JSON in/out, typed errors.
   - VITE_USE_MOCKS (default "true"): when true, every endpoint resolves from src/lib/api/mocks/
     fixtures with a small artificial delay instead of real fetch.
   - src/lib/api/types.ts: types for User, MasterResume (exact JSON shape from the Knowledge Base),
     GenerationSession, TailoredResume, CoverLetter, ChatMessage, InterviewBrief.
   - Typed, mockable functions: auth (login, signup, magicLink, oauthStart, me, logout),
     resume (uploadMaster, getMaster, updateMaster), sessions (list, create, get, delete),
     generation (tailorResume, generateCoverLetter, askQuestion, generateInterviewBrief),
     files (downloadDoc).
   - Seed realistic mock fixtures including a FULLY populated master resume so every screen is demoable
     on mocks alone. Set up @tanstack/react-query with a QueryClientProvider.

3. APP SHELL & ROUTING (react-router-dom)
   - Routes: /login, /signup, /onboarding, /dashboard, /resume, /session/:id, /settings, NotFound.
   - ProtectedRoute wrapper -> redirects to /login when no token.
   - Slim top bar (wordmark "Sumerer", theme toggle, account menu); on authed pages a minimal left
     sidebar (Dashboard, Master Resume, Settings) that collapses to a hamburger/bottom nav on mobile.
   - Stub /onboarding, /dashboard, /resume, /session/:id, /settings with a title placeholder for now.

4. AUTH SCREENS (/login and /signup) — build these fully now
   - Centered minimal card, quiet grayscale background, subtle GSAP reveal.
   - Email + password form (react-hook-form + zod, loading + error states).
   - "Send magic link" passwordless option -> auth.magicLink -> "check your email" confirmation state.
   - Three OAuth buttons: Continue with Google / GitHub / LinkedIn -> auth.oauthStart(provider)
     (mock sets a token and routes on). Monochrome icons.
   - /signup mirrors /login with name + email + password; links between them.
   - On success: route to /onboarding if no master resume yet, else /dashboard.

Build clean, accessible (ARIA, keyboard nav, visible focus), mobile-first. Everything clickable on mocks.
```

---

## Prompt 2 — Onboarding, Master Resume editor (+ reusable ResumeDocument), Dashboard

```
Build three connected screens. Mocked api only — no backend.

A) /onboarding — upload & parse the master resume
   - Drag-and-drop zone (also click-to-browse) accepting PDF and DOCX, with type/size validation and
     upload progress. On drop call resume.uploadMaster(file); show a multi-stage "Parsing your resume…"
     animation (uploading -> parsing -> structuring); mock returns the populated master resume.
   - On success route to /resume with a toast "Resume parsed — review and edit". Allow re-upload to
     replace; handle parse failure with a retry.

B) /resume — master resume editor (the editable source of truth)
   Read via resume.getMaster, save via resume.updateMaster (optimistic). Two-pane on desktop, stacked
   on mobile:
   - LEFT: accordion editor, one section each: Header, Summary, Skills, Work Experience, Projects,
     Extracurriculars, Education, Certifications.
     • Skills = tag/chip input. • Work/Projects/Extracurriculars = repeatable cards with add/remove/
       reorder (drag handle); each work entry: company, companyUrl, role, start, end (or "Present"
       toggle), locationType (remote/hybrid/onsite), location, bullet editor capped at 10.
     • Education: institution, course, start, end, optional GPA. Certifications: name, details,
       awardedDate. Validate with zod; inline errors.
   - RIGHT: a live preview rendered by a REUSABLE <ResumeDocument data={...} /> component in the EXACT
     resume visual format from the Knowledge Base (centered serif name; contact line
     "email | phone | github | linkedin"; UPPERCASE section headers with full-width hairline rules;
     org-left + bold-dates-right; italic role-left + location-right; bullets). The document is ALWAYS
     black-on-white regardless of app theme. This component will be reused for tailored resumes + PDF.
   - Sticky Save bar with unsaved-changes state.

C) /dashboard — authed home (sessions.list + resume.getMaster)
   - Greeting + prominent "Tailor a new resume" button (-> new-session flow in Prompt 3).
   - A "Master Resume" summary card (name, # roles, # skills, last updated) with Edit -> /resume; if no
     master resume, show an upload CTA -> /onboarding instead.
   - A "Generation sessions" grid: each card shows target role + company, a JD snippet, created date,
     artifact badges (resume / cover letter / interview brief); click -> /session/:id; delete with
     confirm. Empty state. GSAP stagger-in. Mobile-first.
```

---

## Prompt 3 — New session + Session workspace (Tailored Resume + Cover Letter)

```
Build the generation flow and the session workspace. Mocked generation only.

A) NEW SESSION — create a tailored resume from a job description
   - A modal (or /session/new): a large textarea for the full job description + optional company, role
     title, job URL.
   - "Generate tailored resume" -> sessions.create({ jobDescription, ... }) then
     generation.tailorResume(sessionId). Multi-step generating state ("Analyzing job…", "Matching your
     experience…", "Tailoring…").
   - Tailoring intent (reflect in UI copy + mock data): the result fits the job EXACTLY — missing
     required skills are ADDED, irrelevant skills/experience are DROPPED, bullets rewritten to match.
     No bloat. On success route to /session/:id, Tailored Resume tab active.

B) /session/:id — tabbed workspace
   Load via sessions.get. Tabs: "Tailored Resume" | "Cover Letter" | "Q&A Assistant" | "Interview Prep"
   (build the first two now; stub the last two with "coming next"). A context strip shows target role,
   company, and a collapsible view of the pasted job description, visible across tabs.

   TAB 1 — Tailored Resume:
   - Render with the same <ResumeDocument /> component (exact format, black-on-white).
   - A "diff vs master" toggle that highlights changes (added skills, dropped items, reworded bullets)
     using weight/underline/strikethrough in GRAYSCALE — no color.
   - Actions: Download PDF (print-faithful export of the ResumeDocument), Regenerate, Edit (inline).
     Keep it ATS-friendly, single-column.

   TAB 2 — Cover Letter (generation.generateCoverLetter):
   - If none yet: "Generate cover letter" CTA with a tone selector (professional / conversational /
     enthusiastic) and a generating state.
   - Once generated: editable document view matching the resume typography; it must reference the
     tailored resume + the job. Actions: Regenerate, Copy, Download PDF, Download TXT.
```

---

## Prompt 4 — Q&A Assistant, Interview Prep, Settings + final polish

```
Finish the app. Mocked api only — do not change the API client architecture or add any backend.

A) /session/:id TAB 3 — Q&A Assistant (generation.askQuestion(sessionId, question))
   A chatbot answering job-application questions using THIS session's tailored resume + cover letter +
   job description as grounding. Chat UI: message list (user right, assistant left), input, send on
   Enter, typing indicator, auto-scroll, thread persisted per session (localStorage). Helper line:
   "Paste an application question and I'll answer it as you, using your tailored resume and this job."
   2–3 example-question chips. Copy-to-clipboard per assistant message. Empty state. Mobile-friendly.

B) /session/:id TAB 4 — Interview Prep (generation.generateInterviewBrief(sessionId,{type,tone,format}))
   A self-contained brief meant to be fed to an AI mock-interviewer as context. Config panel:
   - TYPE: recruiter screen / behavioral / technical / system-design / mixed.
   - TONE: professional / conversational / creative.
   - FORMAT: MD / DOCX / PDF / TXT.
   "Generate brief" renders the result via react-markdown in a preview pane. The brief must be
   self-contained and maximally useful: company + role summary, candidate (tailored-resume) highlights,
   likely questions grouped by category, strong model answers (STAR for behavioral), key talking points,
   and gaps/red-flags to pre-empt. "Download" exports in the chosen format (MD/TXT client-side; PDF
   print-faithful; DOCX via a client docx generator). Keep prior briefs listed per session.

C) /settings
   Profile (name; email read-only), Connected accounts (Google/GitHub/LinkedIn connect/disconnect
   toggles), Appearance (dark/light toggle), Danger zone (delete account confirm), and a read-only
   "API connection" panel showing VITE_API_BASE_URL and mock/live mode.

D) FINAL POLISH
   Verify full mobile responsiveness at iPhone-12 width and desktop; keyboard nav + focus states
   everywhere; all GSAP reveals subtle and non-blocking; the whole app clickable end-to-end on mock data
   with no failed calls. Confirm everything stays strictly grayscale.
```

---

## After the UI is built — switching to your real API

Your `/api` only needs to implement the endpoints the client calls (see `src/lib/api/` after Prompt 1).
To go live, set in Lovable's env:

```
VITE_USE_MOCKS=false
VITE_API_BASE_URL=https://your-api-host
```

Keep the mock fixtures — they double as your API contract and let the UI run offline.

---

## Handy follow-up / fix prompts

- Scope-lock a change: *"Only modify the Cover Letter tab component. Do not touch the api client, routing,
  or other tabs."*
- Tighten the resume format: *"In <ResumeDocument />, match this reference layout exactly: centered serif
  name, contact line `email | phone | github | linkedin`, uppercase section headers with a hairline rule,
  org-left + bold-dates-right, italic role-left + location-right, then bullets. Black on white only."*
- Keep it monochrome: *"Audit the app for any non-grayscale colors and remove them; convey state with
  weight, borders, and contrast instead. Don't change layout or logic."*
```
