import { type ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";

export function PageStub({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      )}
      <div className="mt-8">
        {children ?? (
          <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground shadow-[var(--shadow-soft)]">
            This screen is coming together. The scaffold is in place.
          </div>
        )}
      </div>
    </div>
  );
}
