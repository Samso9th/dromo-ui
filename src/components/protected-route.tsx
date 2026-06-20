import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { AppShell } from "@/components/app-shell";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "ready" && !isAuthenticated) navigate({ to: "/login" });
  }, [status, isAuthenticated, navigate]);

  // Confirming the cookie session (or SSR) — show a neutral loader, no premature redirect.
  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <AppShell>{children}</AppShell>;
}
