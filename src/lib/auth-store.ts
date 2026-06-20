import type { User } from "./api/types";

const TOKEN_KEY = "dromo.token";
const USER_KEY = "dromo.user";

type Listener = () => void;
const listeners = new Set<Listener>();

let token: string | null = null;
let user: User | null = null;

function load() {
  if (typeof window === "undefined") return;
  token = window.localStorage.getItem(TOKEN_KEY);
  const raw = window.localStorage.getItem(USER_KEY);
  user = raw ? (JSON.parse(raw) as User) : null;
}
load();

function emit() {
  listeners.forEach((l) => l());
}

export const authStore = {
  getToken: () => token,
  getUser: () => user,
  isAuthenticated: () => !!token,
  setSession(t: string, u: User) {
    token = t;
    user = u;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_KEY, t);
      window.localStorage.setItem(USER_KEY, JSON.stringify(u));
    }
    emit();
  },
  updateUser(u: User) {
    user = u;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(USER_KEY, JSON.stringify(u));
    }
    emit();
  },
  clear() {
    token = null;
    user = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    }
    emit();
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

import { useSyncExternalStore } from "react";

export function useAuth() {
  const snap = useSyncExternalStore(
    (cb) => authStore.subscribe(cb),
    () => token,
    () => null,
  );
  return {
    token: snap,
    user,
    isAuthenticated: !!snap,
  };
}
