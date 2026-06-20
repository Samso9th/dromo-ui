import { forwardRef } from "react";
import type { MasterResume, TailoredResume } from "@/lib/api/types";
import { getTemplate, type SectionKey, type TemplateConfig } from "@/lib/templates";
import { cn } from "@/lib/utils";

interface Props {
  data: MasterResume | TailoredResume;
  /** When true, highlight diff vs master in grayscale (added=bold underline, removed=strikethrough) */
  diff?: boolean;
  /** Template id (see src/lib/templates.ts). Defaults to "classic". */
  template?: string;
  className?: string;
}

/**
 * Config-driven, print-faithful, always black-on-white resume. The chosen template config
 * (font, columns, heading style, density, name treatment) drives the layout.
 */
export const ResumeDocument = forwardRef<HTMLDivElement, Props>(function ResumeDocument(
  { data, diff = false, template = "classic", className },
  ref,
) {
  const cfg = getTemplate(template);
  const fontFamily =
    cfg.font === "serif"
      ? 'Georgia, "Times New Roman", "Source Serif 4", serif'
      : 'Helvetica, Arial, "Inter", sans-serif';

  const base = cfg.density === "compact" ? 12 : cfg.density === "airy" ? 13.5 : 13;
  const lh = cfg.density === "compact" ? 1.32 : cfg.density === "airy" ? 1.6 : 1.45;
  const pad = cfg.density === "compact" ? "40px 48px" : cfg.density === "airy" ? "60px 64px" : "48px 56px";

  return (
    <div
      ref={ref}
      className={cn("resume-document", className)}
      style={{ background: "#fff", color: "#111", fontFamily, padding: pad, lineHeight: lh, fontSize: base }}
    >
      <Header data={data} cfg={cfg} />
      {cfg.columns === 2 && cfg.sidebar ? (
        <TwoColumn data={data} cfg={cfg} diff={diff} />
      ) : (
        <SingleColumn data={data} cfg={cfg} diff={diff} />
      )}
    </div>
  );
});

/* ───────────────────────── header ───────────────────────── */

function Header({ data, cfg }: { data: ResumeData; cfg: TemplateConfig }) {
  const h = data.header;
  const contact = [h.email, h.phone, h.github, h.linkedin, h.website].filter(Boolean);
  const align = cfg.nameAlign;
  return (
    <header style={{ textAlign: align, marginBottom: cfg.density === "airy" ? 24 : 16 }}>
      <h1
        style={{
          fontSize: cfg.nameSize,
          fontWeight: 700,
          letterSpacing: cfg.nameUppercase ? "0.08em" : "-0.01em",
          textTransform: cfg.nameUppercase ? "uppercase" : "none",
          margin: 0,
        }}
      >
        {h.name}
      </h1>
      {h.location && <div style={{ marginTop: 4, fontSize: 12 }}>{h.location}</div>}
      <div style={{ marginTop: 4, fontSize: 12 }}>
        {contact.map((v, i) => (
          <span key={i}>
            <span style={{ textDecoration: "underline" }}>{v}</span>
            {i < contact.length - 1 && <span style={{ margin: "0 6px" }}>|</span>}
          </span>
        ))}
      </div>
    </header>
  );
}

/* ───────────────────────── layouts ───────────────────────── */

function SingleColumn({ data, cfg, diff }: LayoutProps) {
  return (
    <>
      {ORDER.map((key) => (
        <SectionByKey key={key} sectionKey={key} data={data} cfg={cfg} diff={diff} />
      ))}
    </>
  );
}

function TwoColumn({ data, cfg, diff }: LayoutProps) {
  const sidebar = cfg.sidebar ?? [];
  const main = ORDER.filter((k) => !sidebar.includes(k));
  return (
    <div style={{ display: "flex", gap: 28 }}>
      <aside style={{ width: "33%", flexShrink: 0 }}>
        {sidebar.map((key) => (
          <SectionByKey key={key} sectionKey={key} data={data} cfg={cfg} diff={diff} />
        ))}
      </aside>
      <div style={{ flex: 1, minWidth: 0 }}>
        {main.map((key) => (
          <SectionByKey key={key} sectionKey={key} data={data} cfg={cfg} diff={diff} />
        ))}
      </div>
    </div>
  );
}

const ORDER: SectionKey[] = [
  "summary",
  "skills",
  "work",
  "projects",
  "extracurriculars",
  "education",
  "certifications",
];

/* ───────────────────────── sections ───────────────────────── */

function SectionByKey({
  sectionKey,
  data,
  cfg,
  diff,
}: {
  sectionKey: SectionKey;
  data: ResumeData;
  cfg: TemplateConfig;
  diff: boolean;
}) {
  switch (sectionKey) {
    case "summary":
      return data.summary ? (
        <Section title="Summary" cfg={cfg}>
          <p style={{ margin: 0 }}>{data.summary}</p>
        </Section>
      ) : null;
    case "skills":
      return data.skills?.length ? (
        <Section title="Skills" cfg={cfg}>
          <Skills data={data} diff={diff} stacked={cfg.columns === 2} />
        </Section>
      ) : null;
    case "work":
      return data.workExperience?.length ? (
        <Section title="Work Experience" cfg={cfg}>
          {data.workExperience.map((w, i) => (
            <Entry
              key={i}
              left={w.company}
              leftSub={w.companyUrl}
              right={`${w.period.start} – ${w.period.end}`}
              role={w.role}
              location={w.location ?? w.locationType}
              bullets={w.bullets}
            />
          ))}
        </Section>
      ) : null;
    case "projects":
      return data.projects?.length ? (
        <Section title="Projects" cfg={cfg}>
          {data.projects.map((p, i) => (
            <Entry
              key={i}
              left={p.name}
              leftSub={p.url}
              right={`${p.period.start} – ${p.period.end}`}
              role={p.role}
              location={p.location}
              bullets={p.bullets}
            />
          ))}
        </Section>
      ) : null;
    case "extracurriculars":
      return data.extracurriculars?.length ? (
        <Section title="Extracurriculars" cfg={cfg}>
          {data.extracurriculars.map((e, i) => (
            <Entry
              key={i}
              left={e.name}
              right={`${e.period.start} – ${e.period.end}`}
              role={e.role}
              location={e.where}
              bullets={e.bullets}
            />
          ))}
        </Section>
      ) : null;
    case "education":
      return data.education?.length ? (
        <Section title="Education" cfg={cfg}>
          {data.education.map((ed, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <Row left={<strong>{ed.institution}</strong>} right={<strong>{`${ed.period.start} – ${ed.period.end}`}</strong>} />
              <Row left={<em>{ed.course}</em>} right={ed.gpa ? <em>GPA {ed.gpa}</em> : null} />
            </div>
          ))}
        </Section>
      ) : null;
    case "certifications":
      return data.certifications?.length ? (
        <Section title="Certifications" cfg={cfg}>
          {data.certifications.map((c, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <Row left={<strong>{c.name}</strong>} right={c.awardedDate ? <strong>{c.awardedDate}</strong> : null} />
              <p style={{ margin: "2px 0 0 0" }}>{c.details}</p>
            </div>
          ))}
        </Section>
      ) : null;
    default:
      return null;
  }
}

function Section({ title, cfg, children }: { title: string; cfg: TemplateConfig; children: React.ReactNode }) {
  const gap = cfg.density === "compact" ? 12 : cfg.density === "airy" ? 24 : 18;
  const headingStyle: React.CSSProperties =
    cfg.heading === "plain-bold"
      ? { fontSize: 13, fontWeight: 700, margin: 0 }
      : cfg.heading === "caps-plain"
        ? { fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }
        : {
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            margin: 0,
            paddingBottom: 4,
            borderBottom: "1px solid #111",
          };
  return (
    <section style={{ marginTop: gap }}>
      <h2 style={headingStyle}>{title}</h2>
      <div style={{ marginTop: 8 }}>{children}</div>
    </section>
  );
}

function Skills({ data, diff, stacked }: { data: ResumeData; diff: boolean; stacked: boolean }) {
  const t = data as Partial<TailoredResume>;
  const added = new Set((t.matchedSkills ?? []).map((s) => s.toLowerCase()));
  const removed = t.removedSkills ?? [];
  const sep = stacked ? <br /> : " · ";
  return (
    <p style={{ margin: 0 }}>
      {data.skills.map((s, i) => {
        const isAdded = diff && added.has(s.toLowerCase());
        return (
          <span key={s}>
            <span style={isAdded ? { fontWeight: 700, textDecoration: "underline" } : undefined}>{s}</span>
            {i < data.skills.length - 1 && sep}
          </span>
        );
      })}
      {diff &&
        removed.map((s) => (
          <span key={s}>
            {sep}
            <span style={{ textDecoration: "line-through", opacity: 0.55 }}>{s}</span>
          </span>
        ))}
    </p>
  );
}

function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span>{left}</span>
      <span style={{ textAlign: "right" }}>{right}</span>
    </div>
  );
}

function Entry({
  left,
  leftSub,
  right,
  role,
  location,
  bullets,
}: {
  left: string;
  leftSub?: string;
  right: string;
  role?: string;
  location?: string;
  bullets: string[];
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <Row
        left={
          <span>
            <strong>{left}</strong>
            {leftSub && <span style={{ marginLeft: 8, textDecoration: "underline", fontSize: 12 }}>{leftSub}</span>}
          </span>
        }
        right={<strong>{right}</strong>}
      />
      {(role || location) && (
        <Row left={role ? <em>{role}</em> : null} right={location ? <em>{location}</em> : null} />
      )}
      {bullets.length > 0 && (
        <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
          {bullets.map((b, i) => (
            <li key={i} style={{ marginBottom: 2 }}>
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type ResumeData = MasterResume | TailoredResume;
interface LayoutProps {
  data: ResumeData;
  cfg: TemplateConfig;
  diff: boolean;
}
