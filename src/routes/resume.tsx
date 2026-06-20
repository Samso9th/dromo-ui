import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, Save, Trash2, X } from "lucide-react";

import { ProtectedRoute } from "@/components/protected-route";
import { ResumeDocument } from "@/components/resume-document";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReveal } from "@/hooks/use-reveal";
import { resume } from "@/lib/api";
import type { MasterResume } from "@/lib/api/types";

export const Route = createFileRoute("/resume")({
  component: () => (
    <ProtectedRoute>
      <ResumePage />
    </ProtectedRoute>
  ),
});

function ResumePage() {
  const ref = useReveal<HTMLDivElement>();
  const [data, setData] = useState<MasterResume | null>(null);
  const [original, setOriginal] = useState<MasterResume | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    resume.getMaster().then((r) => {
      setData(r);
      setOriginal(r);
    });
  }, []);

  const dirty = useMemo(
    () => JSON.stringify(data) !== JSON.stringify(original),
    [data, original],
  );

  async function save() {
    if (!data) return;
    setSaving(true);
    const prev = original;
    setOriginal(data); // optimistic
    try {
      const saved = await resume.updateMaster(data);
      setOriginal(saved);
      setData(saved);
      toast.success("Saved");
    } catch {
      setOriginal(prev);
      toast.error("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-12 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div ref={ref} className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">
            Master resume
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The single source of truth that every tailored version is built from.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <Editor data={data} onChange={setData} />
        </div>
        <div className="lg:sticky lg:top-20 lg:h-[calc(100dvh-7rem)]">
          <div className="h-full overflow-auto rounded-xl border border-border bg-muted/30 p-4 shadow-[var(--shadow-soft)]">
            <ResumeDocument data={data} />
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      {dirty && (
        <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-[var(--shadow-deep)]">
          <span className="text-xs text-muted-foreground">Unsaved changes</span>
          <Button size="sm" variant="ghost" onClick={() => setData(original)}>
            Discard
          </Button>
          <Button size="sm" onClick={save} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────── editor ──────────────────────────── */

function Editor({
  data,
  onChange,
}: {
  data: MasterResume;
  onChange: (d: MasterResume) => void;
}) {
  const upd = <K extends keyof MasterResume>(k: K, v: MasterResume[K]) =>
    onChange({ ...data, [k]: v });

  return (
    <Accordion type="multiple" defaultValue={["header", "summary", "skills", "work"]}>
      <Section value="header" label="Header">
        <Grid>
          <Field label="Name" value={data.header.name} onChange={(v) => upd("header", { ...data.header, name: v })} />
          <Field label="Location" value={data.header.location} onChange={(v) => upd("header", { ...data.header, location: v })} />
          <Field label="Email" value={data.header.email} onChange={(v) => upd("header", { ...data.header, email: v })} />
          <Field label="Phone" value={data.header.phone} onChange={(v) => upd("header", { ...data.header, phone: v })} />
          <Field label="GitHub" value={data.header.github ?? ""} onChange={(v) => upd("header", { ...data.header, github: v })} />
          <Field label="LinkedIn" value={data.header.linkedin ?? ""} onChange={(v) => upd("header", { ...data.header, linkedin: v })} />
          <Field label="Website" value={data.header.website ?? ""} onChange={(v) => upd("header", { ...data.header, website: v })} />
        </Grid>
      </Section>

      <Section value="summary" label="Summary">
        <Textarea
          rows={4}
          value={data.summary}
          onChange={(e) => upd("summary", e.target.value)}
        />
      </Section>

      <Section value="skills" label="Skills">
        <SkillsEditor value={data.skills} onChange={(v) => upd("skills", v)} />
      </Section>

      <Section value="work" label="Work Experience">
        <ListEditor
          items={data.workExperience}
          onChange={(v) => upd("workExperience", v)}
          newItem={() => ({
            company: "",
            role: "",
            period: { start: "", end: "Present" },
            locationType: "remote" as const,
            location: "",
            bullets: [],
          })}
          render={(item, set) => (
            <>
              <Grid>
                <Field label="Company" value={item.company} onChange={(v) => set({ ...item, company: v })} />
                <Field label="Company URL" value={item.companyUrl ?? ""} onChange={(v) => set({ ...item, companyUrl: v })} />
                <Field label="Role" value={item.role} onChange={(v) => set({ ...item, role: v })} />
                <div>
                  <Label className="text-xs">Location type</Label>
                  <Select value={item.locationType} onValueChange={(v) => set({ ...item, locationType: v as typeof item.locationType })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">Onsite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Field label="Location" value={item.location ?? ""} onChange={(v) => set({ ...item, location: v })} />
                <PeriodEditor value={item.period} onChange={(p) => set({ ...item, period: p })} />
              </Grid>
              <BulletsEditor value={item.bullets} onChange={(b) => set({ ...item, bullets: b })} />
            </>
          )}
          titleOf={(i) => i.company || "New role"}
        />
      </Section>

      <Section value="projects" label="Projects">
        <ListEditor
          items={data.projects}
          onChange={(v) => upd("projects", v)}
          newItem={() => ({ name: "", period: { start: "", end: "" }, bullets: [] })}
          render={(item, set) => (
            <>
              <Grid>
                <Field label="Name" value={item.name} onChange={(v) => set({ ...item, name: v })} />
                <Field label="URL" value={item.url ?? ""} onChange={(v) => set({ ...item, url: v })} />
                <Field label="Role" value={item.role ?? ""} onChange={(v) => set({ ...item, role: v })} />
                <Field label="Location" value={item.location ?? ""} onChange={(v) => set({ ...item, location: v })} />
                <PeriodEditor value={item.period} onChange={(p) => set({ ...item, period: p })} />
              </Grid>
              <BulletsEditor value={item.bullets} onChange={(b) => set({ ...item, bullets: b })} />
            </>
          )}
          titleOf={(i) => i.name || "New project"}
        />
      </Section>

      <Section value="extras" label="Extracurriculars">
        <ListEditor
          items={data.extracurriculars}
          onChange={(v) => upd("extracurriculars", v)}
          newItem={() => ({ name: "", where: "", period: { start: "", end: "Present" }, bullets: [] })}
          render={(item, set) => (
            <>
              <Grid>
                <Field label="Name" value={item.name} onChange={(v) => set({ ...item, name: v })} />
                <Field label="Where" value={item.where} onChange={(v) => set({ ...item, where: v })} />
                <Field label="Role" value={item.role ?? ""} onChange={(v) => set({ ...item, role: v })} />
                <PeriodEditor value={item.period} onChange={(p) => set({ ...item, period: p })} />
              </Grid>
              <BulletsEditor value={item.bullets} onChange={(b) => set({ ...item, bullets: b })} />
            </>
          )}
          titleOf={(i) => i.name || "New entry"}
        />
      </Section>

      <Section value="edu" label="Education">
        <ListEditor
          items={data.education}
          onChange={(v) => upd("education", v)}
          newItem={(): MasterResume["education"][number] => ({ institution: "", course: "", period: { start: "", end: "" } })}
          render={(item, set) => (
            <Grid>
              <Field label="Institution" value={item.institution} onChange={(v) => set({ ...item, institution: v })} />
              <Field label="Course" value={item.course} onChange={(v) => set({ ...item, course: v })} />
              <PeriodEditor value={item.period} onChange={(p) => set({ ...item, period: p })} />
              <Field label="GPA" value={item.gpa ?? ""} onChange={(v) => set({ ...item, gpa: v })} />
            </Grid>
          )}
          titleOf={(i) => i.institution || "New education"}
        />
      </Section>

      <Section value="cert" label="Certifications">
        <ListEditor
          items={data.certifications}
          onChange={(v) => upd("certifications", v)}
          newItem={(): MasterResume["certifications"][number] => ({ name: "", details: "" })}
          render={(item, set) => (
            <div className="space-y-3">
              <Field label="Name" value={item.name} onChange={(v) => set({ ...item, name: v })} />
              <Field label="Awarded date" value={item.awardedDate ?? ""} onChange={(v) => set({ ...item, awardedDate: v })} />
              <div>
                <Label className="text-xs">Details</Label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={item.details}
                  onChange={(e) => set({ ...item, details: e.target.value })}
                />
              </div>
            </div>
          )}
          titleOf={(i) => i.name || "New certification"}
        />
      </Section>
    </Accordion>
  );
}

/* primitives */
function Section({ value, label, children }: { value: string; label: string; children: React.ReactNode }) {
  return (
    <AccordionItem value={value} className="rounded-lg border border-border bg-card px-4 mb-2">
      <AccordionTrigger className="font-medium">{label}</AccordionTrigger>
      <AccordionContent className="pt-2 pb-4">{children}</AccordionContent>
    </AccordionItem>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input className="mt-1" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function PeriodEditor({
  value,
  onChange,
}: {
  value: { start: string; end: string };
  onChange: (v: { start: string; end: string }) => void;
}) {
  const isPresent = value.end === "Present";
  return (
    <>
      <Field label="Start" value={value.start} onChange={(v) => onChange({ ...value, start: v })} />
      <div>
        <Label className="text-xs">End</Label>
        <div className="mt-1 flex items-center gap-2">
          <Input
            value={isPresent ? "" : value.end}
            disabled={isPresent}
            placeholder={isPresent ? "Present" : "e.g. Jan 2024"}
            onChange={(e) => onChange({ ...value, end: e.target.value })}
          />
          <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            <Switch
              checked={isPresent}
              onCheckedChange={(v) => onChange({ ...value, end: v ? "Present" : "" })}
            />
            Present
          </label>
        </div>
      </div>
    </>
  );
}

function SkillsEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");
  function add() {
    const v = input.trim();
    if (!v || value.includes(v)) return;
    onChange([...value, v]);
    setInput("");
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-xs"
          >
            {s}
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x !== s))}
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Remove ${s}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add a skill and press Enter"
        />
        <Button type="button" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
    </div>
  );
}

function BulletsEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const atMax = value.length >= 10;
  return (
    <div className="mt-3 space-y-2">
      <Label className="text-xs">Bullets ({value.length}/10)</Label>
      {value.map((b, i) => (
        <div key={i} className="flex items-start gap-2">
          <Textarea
            rows={2}
            value={b}
            onChange={(e) => {
              const next = [...value];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            aria-label="Remove bullet"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={atMax}
        onClick={() => onChange([...value, ""])}
      >
        <Plus className="h-4 w-4" /> Add bullet
      </Button>
    </div>
  );
}

function ListEditor<T>({
  items,
  onChange,
  newItem,
  render,
  titleOf,
}: {
  items: T[];
  onChange: (v: T[]) => void;
  newItem: () => T;
  render: (item: T, set: (next: T) => void) => React.ReactNode;
  titleOf: (item: T) => string;
}) {
  function setAt(i: number, next: T) {
    const arr = [...items];
    arr[i] = next;
    onChange(arr);
  }
  function remove(i: number) {
    onChange(items.filter((_, j) => j !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const arr = [...items];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr);
  }
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-md border border-border p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium">{titleOf(item)}</p>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => remove(i)} aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {render(item, (next) => setAt(i, next))}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, newItem()])}>
        <Plus className="h-4 w-4" /> Add
      </Button>
    </div>
  );
}
