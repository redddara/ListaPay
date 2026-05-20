import { create } from "zustand";

import type { AuthSession } from "@domain/repositories";

type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  session: AuthSession | null;
  /** One-shot message from email-confirm / magic-link redirect (web). */
  pendingAuthMessage: string | null;

  setSession: (session: AuthSession | null) => void;
  setPendingAuthMessage: (message: string | null) => void;
  signOut: () => void;
  reset: () => void;
}

const initialState = {
  status: "unknown" as AuthStatus,
  session: null,
  pendingAuthMessage: null as string | null,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setSession: (session) =>
    set({
      session,
      status: session ? "authenticated" : "unauthenticated",
    }),
  setPendingAuthMessage: (message) => set({ pendingAuthMessage: message }),
  signOut: () => set({ session: null, status: "unauthenticated" }),
  reset: () => set(initialState),
}));
