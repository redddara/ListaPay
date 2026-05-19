import { useCallback, useEffect, useState } from "react";

import { isSupabaseConfigured } from "@core/config/env";

import { countPendingSync, runSync } from "@data/services/sync/SyncOrchestrator";

import { useAuthStore, useAppStore } from "@presentation/stores";

export const useSync = () => {
  const session = useAuthStore((s) => s.session);
  const { syncStatus, lastSyncAt, lastSyncError, setSyncState } = useAppStore();
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = useCallback(async () => {
    const count = await countPendingSync();
    setPendingCount(count);
    setSyncState({ pendingCount: count });
  }, [setSyncState]);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount, syncStatus]);

  const syncNow = useCallback(async () => {
    if (!session || !isSupabaseConfigured()) return false;

    setSyncState({ status: "syncing", lastError: null });
    const result = await runSync(session.user.storeId);
    await refreshPendingCount();
    setSyncState({
      status: result.ok ? "idle" : "error",
      lastSyncAt: new Date().toISOString(),
      lastError:
        result.error ??
        (result.failed > 0 ? `${result.failed} item(s) failed to sync` : null),
    });
    return result.ok;
  }, [session, setSyncState, refreshPendingCount]);

  return {
    syncStatus,
    pendingCount,
    lastSyncAt,
    lastSyncError,
    syncNow,
    refreshPendingCount,
    canSync: Boolean(session) && isSupabaseConfigured(),
  };
};
