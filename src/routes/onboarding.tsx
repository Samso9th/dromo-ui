import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/protected-route";
import { ParsingStages } from "@/components/parsing-stages";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/use-reveal";
import { resume } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  component: () => (
    <ProtectedRoute>
      <OnboardingPage />
    </ProtectedRoute>
  ),
});

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = [".pdf", ".docx"];

type Status = "idle" | "uploading" | "error";

function OnboardingPage() {
  const ref = useReveal<HTMLDivElement>();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [done, setDone] = useState(false);

  function validate(f: File): string | null {
    const ext = "." + (f.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED.includes(ext)) return "Only PDF or DOCX files are supported.";
    if (f.size > MAX_BYTES) return "File is larger than 10 MB.";
    return null;
  }

  async function handleFile(f: File) {
    const err = validate(f);
    if (err) {
      setError(err);
      setStatus("error");
      return;
    }
    setError(null);
    setFile(f);
    setStatus("uploading");
    setDone(false);
    try {
      await resume.uploadMaster(f);
      setDone(true);
      toast.success("Resume parsed — review and edit");
      setTimeout(() => navigate({ to: "/resume" }), 600);
    } catch {
      setError("We couldn't parse that file. Try a different export.");
      setStatus("error");
    }
  }

  return (
    <div ref={ref} className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">
        Upload your master resume
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        One file. We parse it into a structured profile you can edit anytime.
      </p>

      <div className="mt-10">
        {status === "uploading" ? (
          <div className="rounded-xl border border-border bg-card p-10 shadow-[var(--shadow-soft)]">
            <p className="mb-6 text-center text-sm text-muted-foreground">
              {file?.name}
            </p>
            <ParsingStages done={done} />
          </div>
        ) : (
          <label
            htmlFor="resume-file"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) void handleFile(f);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card px-8 py-16 text-center transition-colors hover:border-foreground/40",
              dragOver && "border-foreground/60 bg-accent/40",
            )}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border">
              <Upload className="h-5 w-5" aria-hidden />
            </div>
            <p className="text-sm font-medium">Drop your resume here</p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse — PDF or DOCX, up to 10 MB
            </p>
            <input
              ref={inputRef}
              id="resume-file"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
          </label>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-3 rounded-md border border-border bg-card p-4 text-sm"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p>{error}</p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setError(null);
                    setStatus("idle");
                    inputRef.current?.click();
                  }}
                >
                  Try another file
                </Button>
              </div>
            </div>
          </div>
        )}

        {file && status === "idle" && !error && (
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" /> {file.name}
          </p>
        )}
      </div>
    </div>
  );
}
