import { create } from "zustand";

import type { ThemePreference } from "@presentation/theme";

interface AppState {
  /** True once SQLite migrations + Supabase client have been initialized. */
  isInitialized: boolean;
  /** Last bootstrap error, if any. */
  initError: string | null;
  themePreference: ThemePreference;

  setInitialized: (value: boolean) => void;
  setInitError: (msg: string | null) => void;
  setThemePreference: (pref: ThemePreference) => void;
  reset: () => void;
}

const initialState = {
  isInitialized: false,
  initError: null,
  themePreference: "system" as ThemePreference,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  setInitialized: (value) => set({ isInitialized: value }),
  setInitError: (msg) => set({ initError: msg }),
  setThemePreference: (pref) => set({ themePreference: pref }),
  reset: () => set(initialState),
}));
