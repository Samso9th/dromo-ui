import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, FilePlus2, Sparkles, Upload, Trash2, MessageSquare, BookOpen } from "lucide-react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/protected-route";
import { NewSessionDialog } from "@/components/new-session-dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useReveal, useStagger } from "@/hooks/use-reveal";
import { useAuth } from "@/lib/auth-store";
import { resume, sessions } from "@/lib/api";
import type { GenerationSession, MasterResume } from "@/lib/api/types";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
});

function DashboardPage() {
  const ref = useReveal<HTMLDivElement>();
  const { user } = useAuth();
  const [master, setMaster] = useState<MasterResume | null>(null);
  const [list, setList] = useState<GenerationSession[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    const [m, s] = await Promise.all([resume.getMaster(), sessions.list()]);
    setMaster(m);
    setList(s);
  }
  useEffect(() => {
    void load();
  }, []);

  return (
    <div ref={ref} className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            {greeting()}, {(user?.name ?? "there").split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tailor a resume to any role in under a minute.
          </p>
        </div>
        <Button size="lg" onClick={() => setOpen(true)} className="gap-2">
          <Sparkles className="h-4 w-4" /> Tailor a new resume
        </Button>
      </div>

      {/* Master resume card */}
      <section className="mt-8">
        {master ? (
          <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Master Resume</p>
                <h2 className="mt-1 font-serif text-xl font-semibold">{master.header.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {master.workExperience.length} role{master.workExperience.length === 1 ? "" : "s"} ·{" "}
                  {master.skills.length} skill{master.skills.length === 1 ? "" : "s"}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/resume">Edit</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center shadow-[var(--shadow-soft)]">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-border">
              <Upload className="h-4 w-4" />
            </div>
            <h2 className="font-serif text-xl font-semibold">Upload your master resume</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              We parse it once. Every tailored version is built from it.
            </p>
            <Button asChild className="mt-4">
              <Link to="/onboarding">Upload</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Sessions */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">Generation sessions</h2>
          <span className="text-xs text-muted-foreground">{list.length} total</span>
        </div>

        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No sessions yet. Tailor a resume to get started.
          </div>
        ) : (
          <SessionGrid items={list} onChanged={load} />
        )}
      </section>

      <NewSessionDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function SessionGrid({ items, onChanged }: { items: GenerationSession[]; onChanged: () => void }) {
  const ref = useStagger<HTMLDivElement>({ stagger: 0.05 });
  const navigate = useNavigate();
  return (
    <div ref={ref} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s) => (
        <article
          key={s.id}
          className="group flex cursor-pointer flex-col rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
          onClick={() => navigate({ to: "/session/$id", params: { id: s.id } })}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs uppercase tracking-wider text-muted-foreground">
                {s.company}
              </p>
              <h3 className="mt-1 truncate font-serif text-lg font-semibold">{s.role}</h3>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Delete session"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this session?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {s.role} at {s.company}. This can't be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      await sessions.delete(s.id);
                      toast.success("Session deleted");
                      onChanged();
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{s.jobDescription}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>{new Date(s.createdAt).toLocaleDateString()}</span>
            <div className="flex items-center gap-2">
              {s.tailoredResume && <Badge icon={FileText}>Resume</Badge>}
              {s.coverLetter && <Badge icon={FilePlus2}>Cover</Badge>}
              {s.interviewBrief && <Badge icon={BookOpen}>Brief</Badge>}
              {s.chat.length > 0 && <Badge icon={MessageSquare}>Q&A</Badge>}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function Badge({ icon: Icon, children }: { icon: typeof FileText; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5">
      <Icon className="h-3 w-3" />
      {children}
    </span>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
