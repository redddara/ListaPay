import { create } from "zustand";

import type { ThemePreference } from "@presentation/theme";

export type SyncStatus = "idle" | "syncing" | "error";

interface AppState {
  /** True once SQLite migrations + Supabase client have been initialized. */
  isInitialized: boolean;
  /** Last bootstrap error, if any. */
  initError: string | null;
  themePreference: ThemePreference;

  syncStatus: SyncStatus;
  pendingSyncCount: number;
  lastSyncAt: string | null;
  lastSyncError: string | null;

  setInitialized: (value: boolean) => void;
  setInitError: (msg: string | null) => void;
  setThemePreference: (pref: ThemePreference) => void;
  setSyncState: (patch: {
    status?: SyncStatus;
    pendingCount?: number;
    lastSyncAt?: string | null;
    lastError?: string | null;
  }) => void;
  reset: () => void;
}

const initialState = {
  isInitialized: false,
  initError: null,
  themePreference: "system" as ThemePreference,
  syncStatus: "idle" as SyncStatus,
  pendingSyncCount: 0,
  lastSyncAt: null as string | null,
  lastSyncError: null as string | null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  setInitialized: (value) => set({ isInitialized: value }),
  setInitError: (msg) => set({ initError: msg }),
  setThemePreference: (pref) => set({ themePreference: pref }),
  setSyncState: (patch) =>
    set((s) => ({
      syncStatus: patch.status ?? s.syncStatus,
      pendingSyncCount: patch.pendingCount ?? s.pendingSyncCount,
      lastSyncAt: patch.lastSyncAt !== undefined ? patch.lastSyncAt : s.lastSyncAt,
      lastSyncError:
        patch.lastError !== undefined ? patch.lastError : s.lastSyncError,
    })),
  reset: () => set(initialState),
}));
