import { Reveal } from "./reveal";

export function SectionHeading({
  kicker,
  title,
  blurb,
  align = "center",
}: {
  kicker: string;
  title: string;
  blurb?: string;
  align?: "center" | "left";
}) {
  const alignCls =
    align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <Reveal
      stagger={0.1}
      className={`flex max-w-2xl flex-col gap-4 ${
        align === "center" ? "mx-auto" : ""
      } ${alignCls}`}
    >
      <span className="kicker">{kicker}</span>
      <h2 className="display-xl text-balance">{title}</h2>
      {blurb && (
        <p className="text-pretty text-base text-muted-foreground sm:text-lg">
          {blurb}
        </p>
      )}
    </Reveal>
  );
}
