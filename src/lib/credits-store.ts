import { useSyncExternalStore } from "react";
import { billing } from "@/lib/api";
import type { Plan } from "@/lib/api/types";

interface CreditsState {
  balance: number;
  plan: Plan;
  loaded: boolean;
}

let state: CreditsState = { balance: 0, plan: "free", loaded: false };
const listeners = new Set<() => void>();

function emit() {
  // new object identity so useSyncExternalStore re-renders
  state = { ...state };
  listeners.forEach((l) => l());
}

export const creditsStore = {
  get: () => state,
  async refresh() {
    try {
      const { balance, plan } = await billing.getBalance();
      state = { balance, plan, loaded: true };
      emit();
    } catch {
      /* ignore — header just shows last-known balance */
    }
  },
  reset() {
    state = { balance: 0, plan: "free", loaded: false };
    emit();
  },
};

export function useCredits(): CreditsState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}
