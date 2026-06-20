import { createFileRoute, redirect } from "@tanstack/react-router";
import { authStore } from "@/lib/auth-store";

export const Route = createFileRoute("/")({
  // Runs on the server AND on client navigations. On the server there is no
  // localStorage, so unauthenticated visitors are redirected to /login during
  // SSR (no blank screen). Authenticated client navigations go to /dashboard.
  beforeLoad: () => {
    throw redirect({ to: authStore.isAuthenticated() ? "/dashboard" : "/login" });
  },
  component: () => null,
});
