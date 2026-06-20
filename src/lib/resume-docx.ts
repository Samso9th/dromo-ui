import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "docx";
import type { MasterResume, TailoredResume } from "@/lib/api/types";

/**
 * Build a clean, editable .docx that mirrors the on-screen resume layout:
 * centered name + contact line, uppercase section headings with a rule,
 * org-left / dates-right (via a right tab stop), italic role/location, bullets.
 * Mirrors <ResumeDocument /> — the real API can later own canonical exports.
 */

const FONT = "Georgia";
const BODY = 20; // half-points → 10pt
const SMALL = 18;

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "111111", space: 2 },
    },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: BODY, characterSpacing: 24 }),
    ],
  });
}

function leftRight(left: TextRun[], right: TextRun[]): Paragraph {
  return new Paragraph({
    spacing: { before: 80, after: 0 },
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [...left, new TextRun({ text: "\t" }), ...right],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 20 },
    children: [new TextRun({ text, size: BODY })],
  });
}

function para(text: string): Paragraph {
  return new Paragraph({ children: [new TextRun({ text, size: BODY })] });
}

export function buildResumeDocument(data: MasterResume | TailoredResume): Document {
  const h = data.header;
  const contact = [h.email, h.phone, h.github, h.linkedin, h.website].filter(Boolean).join("   |   ");
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: h.name, bold: true, size: 40 })],
    }),
  ];
  if (h.location) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h.location, size: SMALL })],
      }),
    );
  }
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: contact, size: SMALL })],
    }),
  );

  if (data.summary) {
    children.push(sectionHeading("Summary"), para(data.summary));
  }

  if (data.skills?.length) {
    children.push(sectionHeading("Skills"), para(data.skills.join("  ·  ")));
  }

  if (data.workExperience?.length) {
    children.push(sectionHeading("Work Experience"));
    for (const w of data.workExperience) {
      children.push(
        leftRight(
          [
            new TextRun({ text: w.company, bold: true, size: BODY }),
            ...(w.companyUrl ? [new TextRun({ text: "   " + w.companyUrl, size: SMALL })] : []),
          ],
          [new TextRun({ text: `${w.period.start} – ${w.period.end}`, bold: true, size: BODY })],
        ),
        leftRight(
          [new TextRun({ text: w.role, italics: true, size: BODY })],
          [new TextRun({ text: w.location ?? w.locationType, italics: true, size: BODY })],
        ),
      );
      w.bullets.forEach((b) => children.push(bullet(b)));
    }
  }

  if (data.projects?.length) {
    children.push(sectionHeading("Projects"));
    for (const p of data.projects) {
      children.push(
        leftRight(
          [
            new TextRun({ text: p.name, bold: true, size: BODY }),
            ...(p.url ? [new TextRun({ text: "   " + p.url, size: SMALL })] : []),
          ],
          [new TextRun({ text: `${p.period.start} – ${p.period.end}`, bold: true, size: BODY })],
        ),
      );
      if (p.role || p.location) {
        children.push(
          leftRight(
            [new TextRun({ text: p.role ?? "", italics: true, size: BODY })],
            [new TextRun({ text: p.location ?? "", italics: true, size: BODY })],
          ),
        );
      }
      p.bullets.forEach((b) => children.push(bullet(b)));
    }
  }

  if (data.extracurriculars?.length) {
    children.push(sectionHeading("Extracurriculars"));
    for (const e of data.extracurriculars) {
      children.push(
        leftRight(
          [new TextRun({ text: e.name, bold: true, size: BODY })],
          [new TextRun({ text: `${e.period.start} – ${e.period.end}`, bold: true, size: BODY })],
        ),
        leftRight(
          [new TextRun({ text: e.role ?? "", italics: true, size: BODY })],
          [new TextRun({ text: e.where, italics: true, size: BODY })],
        ),
      );
      e.bullets.forEach((b) => children.push(bullet(b)));
    }
  }

  if (data.education?.length) {
    children.push(sectionHeading("Education"));
    for (const ed of data.education) {
      children.push(
        leftRight(
          [new TextRun({ text: ed.institution, bold: true, size: BODY })],
          [new TextRun({ text: `${ed.period.start} – ${ed.period.end}`, bold: true, size: BODY })],
        ),
        leftRight(
          [new TextRun({ text: ed.course, italics: true, size: BODY })],
          [new TextRun({ text: ed.gpa ? `GPA ${ed.gpa}` : "", italics: true, size: BODY })],
        ),
      );
    }
  }

  if (data.certifications?.length) {
    children.push(sectionHeading("Certifications"));
    for (const c of data.certifications) {
      children.push(
        leftRight(
          [new TextRun({ text: c.name, bold: true, size: BODY })],
          [new TextRun({ text: c.awardedDate ?? "", bold: true, size: BODY })],
        ),
        para(c.details),
      );
    }
  }

  return new Document({
    styles: { default: { document: { run: { font: FONT, size: BODY } } } },
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children,
      },
    ],
  });
}

export async function downloadResumeDocx(
  data: MasterResume | TailoredResume,
  filename: string,
): Promise<void> {
  const blob = await Packer.toBlob(buildResumeDocument(data));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".docx") ? filename : `${filename}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
