import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authStore, useAuth } from "@/lib/auth-store";
import { AppShell } from "@/components/app-shell";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check the live store, not the snapshot. During hydration the external-store
  // snapshot is briefly null (to match SSR), which would otherwise trigger a
  // spurious redirect to /login on a hard refresh of an authed route.
  useEffect(() => {
    if (!authStore.isAuthenticated()) navigate({ to: "/login" });
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;
  return <AppShell>{children}</AppShell>;
}
