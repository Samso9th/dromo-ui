import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/protected-route";
import { ResumeDocument } from "@/components/resume-document";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generation, models as modelsApi, sessions } from "@/lib/api";
import { downloadResumeDocx } from "@/lib/resume-docx";
import { creditsStore } from "@/lib/credits-store";
import { QA_LIMIT, RETRY_LIMIT } from "@/lib/credits";
import { ModelPicker } from "@/components/model-picker";
import { TemplatePicker } from "@/components/template-picker";
import { useAuth } from "@/lib/auth-store";
import type {
  AiModel,
  ChatMessage,
  CoverLetter,
  DocFormat,
  GenerationSession,
  InterviewBrief,
  InterviewTone,
  InterviewType,
} from "@/lib/api/types";

export const Route = createFileRoute("/session/$id")({
  component: SessionPage,
});

function SessionPage() {
  const { id } = Route.useParams();
  return (
    <ProtectedRoute>
      <Workspace id={id} />
    </ProtectedRoute>
  );
}

function Workspace({ id }: { id: string }) {
  const [s, setS] = useState<GenerationSession | null>(null);
  const [allModels, setAllModels] = useState<AiModel[]>([]);
  const [jdOpen, setJdOpen] = useState(false);
  const { user } = useAuth();
  const plan = user?.plan ?? "free";

  async function reload() {
    setS(await sessions.get(id));
  }
  useEffect(() => {
    void reload();
    void modelsApi.list().then(setAllModels);
  }, [id]);

  async function switchModel(modelId: string) {
    if (!s) return;
    setS({ ...s, modelId }); // optimistic
    await sessions.setModel(s.id, modelId);
  }

  if (!s) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12 text-sm text-muted-foreground">Loading…</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <Link
        to="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to dashboard
      </Link>

      {/* Context strip */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.company}</p>
            <h1 className="mt-0.5 font-serif text-2xl font-semibold tracking-tight">{s.role}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {allModels.length > 0 && (
              <ModelPicker
                models={allModels}
                value={s.modelId}
                plan={plan}
                onChange={switchModel}
              />
            )}
            <Button variant="ghost" size="sm" onClick={() => setJdOpen((v) => !v)} className="gap-1">
              Job description {jdOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        {jdOpen && (
          <p className="mt-3 whitespace-pre-wrap border-t border-border pt-3 text-sm text-muted-foreground">
            {s.jobDescription}
          </p>
        )}
      </div>

      <Tabs defaultValue="resume">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="resume">Tailored Resume</TabsTrigger>
          <TabsTrigger value="cover">Cover Letter</TabsTrigger>
          <TabsTrigger value="qa">Q&A Assistant</TabsTrigger>
          <TabsTrigger value="prep">Interview Prep</TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="mt-6">
          <ResumeTab session={s} onChange={reload} />
        </TabsContent>
        <TabsContent value="cover" className="mt-6">
          <CoverTab session={s} onChange={reload} />
        </TabsContent>
        <TabsContent value="qa" className="mt-6">
          <QATab session={s} />
        </TabsContent>
        <TabsContent value="prep" className="mt-6">
          <PrepTab session={s} onChange={reload} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ───────── Resume tab ───────── */

function ResumeTab({ session, onChange }: { session: GenerationSession; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const [diff, setDiff] = useState(false);
  const [templateId, setTemplateId] = useState(session.templateId);
  const docRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const plan = user?.plan ?? "free";

  useEffect(() => {
    setTemplateId(session.templateId);
  }, [session.templateId]);

  function changeTemplate(id: string) {
    setTemplateId(id); // instant preview
    void sessions.setTemplate(session.id, id);
  }

  const retriesLeft = RETRY_LIMIT[plan] - session.retries.tailor;
  const atRetryLimit = !!session.tailoredResume && retriesLeft <= 0;

  async function regen() {
    setBusy(true);
    try {
      await generation.tailorResume(session.id);
      await onChange();
      void creditsStore.refresh();
      toast.success("Resume regenerated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't regenerate.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!session.tailoredResume && !busy) void regen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session.tailoredResume) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-12 text-sm">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p>Tailoring your resume…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <TemplatePicker value={templateId} plan={plan} onChange={changeTemplate} />
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={diff} onCheckedChange={setDiff} id="diff" />
            <Label htmlFor="diff" className="cursor-pointer">Show diff vs master</Label>
          </label>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={regen}
            disabled={busy || atRetryLimit}
            title={atRetryLimit ? "Regeneration limit reached for your plan" : undefined}
            className="gap-2"
          >
            <RefreshCw className={busy ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Regenerate{!atRetryLimit && RETRY_LIMIT[plan] > 0 ? ` (${retriesLeft})` : ""}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (!session.tailoredResume) return;
              const name = session.tailoredResume.header.name.replace(/\s+/g, "_");
              try {
                await downloadResumeDocx(session.tailoredResume, `${name}_Resume.docx`);
                toast.success("DOCX downloaded");
              } catch {
                toast.error("Couldn't build the DOCX.");
              }
            }}
            className="gap-2"
          >
            <Download className="h-4 w-4" /> DOCX
          </Button>
          <Button size="sm" onClick={() => printElement(docRef.current)} className="gap-2">
            <Download className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-muted/30 p-4 shadow-[var(--shadow-soft)]">
        <ResumeDocument ref={docRef} data={session.tailoredResume} diff={diff} template={templateId} />
      </div>
    </div>
  );
}

/* ───────── Cover letter tab ───────── */

const TONES = ["professional", "conversational", "enthusiastic"] as const;
type Tone = (typeof TONES)[number];

function CoverTab({ session, onChange }: { session: GenerationSession; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const [tone, setTone] = useState<Tone>("professional");
  const [draft, setDraft] = useState<CoverLetter | null>(session.coverLetter ?? null);
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const plan = user?.plan ?? "free";
  const retriesLeft = RETRY_LIMIT[plan] - session.retries.cover;
  const atRetryLimit = !!session.coverLetter && retriesLeft <= 0;

  useEffect(() => {
    setDraft(session.coverLetter ?? null);
  }, [session.coverLetter]);

  async function gen() {
    setBusy(true);
    try {
      const cl = await generation.generateCoverLetter(session.id);
      setDraft(cl);
      await onChange();
      void creditsStore.refresh();
      toast.success("Cover letter ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate.");
    } finally {
      setBusy(false);
    }
  }

  if (!draft) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center shadow-[var(--shadow-soft)]">
        <h3 className="font-serif text-xl font-semibold">Generate a cover letter</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll reference your tailored resume and the job description.
        </p>
        <div className="mx-auto mt-5 flex max-w-xs flex-col gap-3">
          <div className="text-left">
            <Label className="text-xs">Tone</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={gen} disabled={busy} className="gap-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy ? "Writing…" : "Generate cover letter"}
          </Button>
        </div>
      </div>
    );
  }

  const text = `${draft.greeting}\n\n${draft.body}\n\n${draft.closing}\n\n${draft.signature}`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={gen}
          disabled={busy || atRetryLimit}
          title={atRetryLimit ? "Regeneration limit reached for your plan" : undefined}
          className="gap-2"
        >
          <RefreshCw className={busy ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Regenerate
          {!atRetryLimit && RETRY_LIMIT[plan] > 0 ? ` (${retriesLeft})` : ""}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void navigator.clipboard.writeText(text);
            toast.success("Copied");
          }}
          className="gap-2"
        >
          <Copy className="h-4 w-4" /> Copy
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadText(text, "cover-letter.txt")}
          className="gap-2"
        >
          <Download className="h-4 w-4" /> TXT
        </Button>
        <Button size="sm" onClick={() => printElement(ref.current)} className="gap-2">
          <Download className="h-4 w-4" /> PDF
        </Button>
      </div>
      <div className="rounded-xl border border-border bg-muted/30 p-4 shadow-[var(--shadow-soft)]">
        <div
          ref={ref}
          className="resume-document"
          style={{
            background: "#fff",
            color: "#111",
            fontFamily: 'Georgia, "Times New Roman", "Source Serif 4", serif',
            padding: "56px 64px",
            lineHeight: 1.55,
            fontSize: 14,
          }}
        >
          <p style={{ margin: 0 }}>{draft.greeting}</p>
          <Textarea
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            rows={Math.max(10, draft.body.split("\n").length + 2)}
            style={{
              marginTop: 16,
              border: "none",
              background: "transparent",
              padding: 0,
              boxShadow: "none",
              color: "#111",
              fontFamily: "inherit",
              fontSize: 14,
              lineHeight: 1.55,
              resize: "vertical",
            }}
          />
          <p style={{ marginTop: 16, marginBottom: 4 }}>{draft.closing}</p>
          <p style={{ margin: 0 }}>{draft.signature}</p>
        </div>
      </div>
    </div>
  );
}

/* ───────── Q&A Assistant tab ───────── */

const QA_EXAMPLES = [
  "Why do you want to work here?",
  "Describe a challenging project you led.",
  "What are your salary expectations?",
];

function QATab({ session }: { session: GenerationSession }) {
  const [messages, setMessages] = useState<ChatMessage[]>(session.chat);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const plan = user?.plan ?? "free";
  const limit = QA_LIMIT[plan];
  const used = messages.filter((m) => m.role === "user").length;
  const atLimit = used >= limit;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(raw: string) {
    const question = raw.trim();
    if (!question || busy) return;
    if (atLimit) {
      toast.error(`You've used all ${limit} questions for this session.`);
      return;
    }
    setInput("");
    const tmpId = "tmp-" + question.slice(0, 12) + messages.length;
    const optimistic: ChatMessage = {
      id: tmpId,
      role: "user",
      content: question,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    setBusy(true);
    try {
      const answer = await generation.askQuestion(session.id, question);
      setMessages((m) => [...m.filter((x) => x.id !== tmpId), { ...optimistic, id: "u-" + answer.id }, answer]);
      void creditsStore.refresh();
    } catch {
      toast.error("Couldn't answer. Try again.");
      setMessages((m) => m.filter((x) => x.id !== tmpId));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h3 className="font-serif text-xl font-semibold">Q&amp;A Assistant</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Paste an application question and I&apos;ll answer it as you, using your tailored resume
              and this job.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {QA_EXAMPLES.map((q) => (
                <button
                  key={q}
                  onClick={() => void send(q)}
                  disabled={atLimit}
                  className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{used} / {limit} questions used this session</p>
          </div>
        ) : (
          messages.map((m) => <ChatBubble key={m.id} message={m} />)
        )}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
          </div>
        )}
      </div>

      {atLimit ? (
        <div className="border-t border-border p-3 text-center text-sm text-muted-foreground">
          You&apos;ve used all {limit} Q&amp;A questions for this session.{" "}
          <Link to="/billing" className="text-foreground underline-offset-4 hover:underline">
            Upgrade for more
          </Link>
          .
        </div>
      ) : (
        <form
          className="flex items-end gap-2 border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder={`Paste a job-application question… (${limit - used} left)`}
            rows={1}
            aria-label="Your question"
            className="max-h-40 min-h-10 flex-1 resize-none"
          />
          <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
            : "group max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-muted/40 px-4 py-2.5 text-sm"
        }
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {!isUser && (
          <button
            onClick={() => {
              void navigator.clipboard.writeText(message.content);
              toast.success("Copied");
            }}
            className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
          >
            <Copy className="h-3 w-3" /> Copy
          </button>
        )}
      </div>
    </div>
  );
}

/* ───────── Interview Prep tab ───────── */

const PREP_TYPES: { value: InterviewType; label: string }[] = [
  { value: "recruiter-screen", label: "Recruiter screen" },
  { value: "behavioral", label: "Behavioral" },
  { value: "technical", label: "Technical" },
  { value: "system-design", label: "System design" },
  { value: "mixed", label: "Mixed" },
];
const PREP_TONES: InterviewTone[] = ["professional", "conversational", "creative"];
const PREP_FORMATS: DocFormat[] = ["md", "docx", "pdf", "txt"];

function PrepTab({ session, onChange }: { session: GenerationSession; onChange: () => void }) {
  const [type, setType] = useState<InterviewType>(session.interviewBrief?.type ?? "mixed");
  const [tone, setTone] = useState<InterviewTone>(session.interviewBrief?.tone ?? "professional");
  const [format, setFormat] = useState<DocFormat>(session.interviewBrief?.format ?? "md");
  const [brief, setBrief] = useState<InterviewBrief | null>(session.interviewBrief ?? null);
  const [busy, setBusy] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const plan = user?.plan ?? "free";
  const retriesLeft = RETRY_LIMIT[plan] - session.retries.brief;
  const atRetryLimit = !!session.interviewBrief && retriesLeft <= 0;

  async function gen() {
    setBusy(true);
    try {
      const b = await generation.generateInterviewBrief(session.id, { type, tone, format });
      setBrief(b);
      onChange();
      void creditsStore.refresh();
      toast.success("Brief generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate the brief.");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!brief) return;
    const base = `interview-brief-${session.company}`.replace(/\s+/g, "-").toLowerCase();
    if (format === "md") downloadBlob(brief.content, `${base}.md`, "text/markdown");
    else if (format === "txt") downloadBlob(stripMarkdown(brief.content), `${base}.txt`, "text/plain");
    else if (format === "pdf") printElement(docRef.current);
    else if (format === "docx") {
      const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Interview Brief</title></head><body style="font-family:Calibri,Arial,sans-serif">${docRef.current?.innerHTML ?? ""}</body></html>`;
      downloadBlob(html, `${base}.doc`, "application/msword");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Config panel */}
      <div className="h-fit space-y-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <div>
          <Label className="text-xs">Interview type</Label>
          <Select value={type} onValueChange={(v) => setType(v as InterviewType)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PREP_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Tone</Label>
          <Select value={tone} onValueChange={(v) => setTone(v as InterviewTone)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PREP_TONES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Download format</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as DocFormat)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PREP_FORMATS.map((f) => (
                <SelectItem key={f} value={f} className="uppercase">{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={gen}
          disabled={busy || atRetryLimit}
          title={atRetryLimit ? "Regeneration limit reached for your plan" : undefined}
          className="w-full gap-2"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {brief ? `Regenerate${!atRetryLimit && RETRY_LIMIT[plan] > 0 ? ` (${retriesLeft})` : ""}` : "Generate brief"}
        </Button>
        {atRetryLimit && (
          <p className="text-xs text-muted-foreground">
            Regeneration limit reached.{" "}
            <Link to="/billing" className="text-foreground underline-offset-4 hover:underline">
              Upgrade
            </Link>{" "}
            for more.
          </p>
        )}
        {brief && (
          <Button variant="outline" onClick={download} className="w-full gap-2">
            <Download className="h-4 w-4" /> Download {format.toUpperCase()}
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          The brief is self-contained — feed it to an AI mock-interviewer as context.
        </p>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 shadow-[var(--shadow-soft)]">
        {brief ? (
          <div
            ref={docRef}
            className="md-prose"
            style={{ background: "#fff", color: "#111", padding: "40px 48px", borderRadius: 8 }}
          >
            <ReactMarkdown>{brief.content}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex h-full min-h-64 flex-col items-center justify-center p-10 text-center">
            <h3 className="font-serif text-xl font-semibold text-foreground">No brief yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Pick an interview type and tone, then generate a prep document tailored to this job.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* helpers */
function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^---$/gm, "");
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function printElement(el: HTMLElement | null) {
  if (!el) return;
  document.body.classList.add("print-target-active");
  el.classList.add("print-target");
  const cleanup = () => {
    el.classList.remove("print-target");
    document.body.classList.remove("print-target-active");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
}

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
