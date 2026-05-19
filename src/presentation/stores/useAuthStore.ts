import { create } from "zustand";

import type { AuthSession } from "@domain/repositories";

type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  session: AuthSession | null;

  setSession: (session: AuthSession | null) => void;
  signOut: () => void;
  reset: () => void;
}

const initialState = {
  status: "unknown" as AuthStatus,
  session: null,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setSession: (session) =>
    set({
      session,
      status: session ? "authenticated" : "unauthenticated",
    }),
  signOut: () => set({ session: null, status: "unauthenticated" }),
  reset: () => set(initialState),
}));
