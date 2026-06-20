import { useSyncExternalStore } from "react";
import type { User } from "./api/types";

// Cookie-session auth: there is no token in JS. Session lives in an httpOnly cookie; the client's
// source of truth is GET /auth/me (hydrate). `status` gates ProtectedRoute so a hard refresh of an
// authed route doesn't flash a redirect before we've confirmed the session.

type Status = "loading" | "ready";

let user: User | null = null;
let status: Status = "loading";
let snapshot: { user: User | null; status: Status } = { user, status };

const listeners = new Set<() => void>();
function emit() {
  snapshot = { user, status };
  listeners.forEach((l) => l());
}

export const authStore = {
  getUser: () => user,
  getStatus: () => status,
  isAuthenticated: () => !!user,
  setUser(u: User) {
    user = u;
    status = "ready";
    emit();
  },
  clear() {
    user = null;
    status = "ready";
    emit();
  },
  /** Confirm the cookie session via /auth/me. Client-only; called once on app boot. */
  async hydrate() {
    if (typeof window === "undefined") return;
    try {
      const { auth } = await import("./api");
      user = await auth.me();
    } catch {
      user = null;
    } finally {
      status = "ready";
      emit();
    }
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useAuth() {
  const snap = useSyncExternalStore(
    authStore.subscribe,
    () => snapshot,
    () => snapshot,
  );
  return { user: snap.user, status: snap.status, isAuthenticated: !!snap.user };
}
