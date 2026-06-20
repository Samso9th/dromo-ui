import { Link } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useReveal } from "@/hooks/use-reveal";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="absolute left-4 top-4">
        <Link to="/login" className="font-serif text-xl tracking-tight">
          Dromo
        </Link>
      </div>

      <div
        ref={ref}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-[var(--shadow-lift)]"
      >
        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {children}
        {footer && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
