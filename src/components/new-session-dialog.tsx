import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ModelPicker } from "@/components/model-picker";
import { sessions, generation, models as modelsApi } from "@/lib/api";
import { creditsStore } from "@/lib/credits-store";
import { useAuth } from "@/lib/auth-store";
import type { AiModel } from "@/lib/api/types";

const STEPS = [
  "Analyzing job…",
  "Matching your experience…",
  "Tailoring resume…",
];

export function NewSessionDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const plan = user?.plan ?? "free";
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [allModels, setAllModels] = useState<AiModel[]>([]);
  const [modelId, setModelId] = useState("");

  useEffect(() => {
    if (!open) return;
    void modelsApi.list().then((m) => {
      setAllModels(m);
      setModelId((cur) => cur || m[0]?.id || "");
    });
  }, [open]);

  async function go() {
    if (!jd.trim()) {
      toast.error("Paste the job description first.");
      return;
    }
    setBusy(true);
    setStep(0);
    const tick = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      700,
    );
    try {
      const s = await sessions.create({
        company: company || "Untitled",
        role: role || "Untitled role",
        jobUrl: jobUrl || undefined,
        jobDescription: jd,
        modelId: modelId || undefined,
      });
      await generation.tailorResume(s.id);
      void creditsStore.refresh();
      clearInterval(tick);
      onOpenChange(false);
      navigate({ to: "/session/$id", params: { id: s.id } });
    } catch {
      clearInterval(tick);
      toast.error("Generation failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Tailor a new resume
          </DialogTitle>
          <DialogDescription>
            We'll add the skills this job requires, drop what's irrelevant, and
            rewrite bullets to match. No bloat.
          </DialogDescription>
        </DialogHeader>

        {busy ? (
          <div
            className="flex flex-col items-center gap-3 py-10 text-sm"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>{STEPS[step]}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Linear"
                />
              </div>
              <div>
                <Label htmlFor="role">Role title</Label>
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Senior Product Engineer"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="url">Job URL (optional)</Label>
              <Input
                id="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div>
              <Label htmlFor="jd">Job description</Label>
              <Textarea
                id="jd"
                rows={10}
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the full job description here…"
              />
            </div>
            {allModels.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                <div>
                  <Label className="text-sm">AI model</Label>
                  <p className="text-xs text-muted-foreground">
                    You can switch models any time inside the session.
                  </p>
                </div>
                <ModelPicker
                  models={allModels}
                  value={modelId}
                  plan={plan}
                  onChange={setModelId}
                />
              </div>
            )}
          </div>
        )}

        {!busy && (
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={go}>Generate tailored resume</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
