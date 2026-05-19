import React, { useEffect, type PropsWithChildren } from "react";

import { isSupabaseConfigured } from "@core/config/env";
import { logger } from "@core/utils";

import { AuthSupabaseRepository } from "@data/repositories/AuthSupabaseRepository";
import {
  countPendingSync,
  runSync,
} from "@data/services/sync/SyncOrchestrator";

import { useAppStore } from "@presentation/stores";
import { useAuthStore } from "@presentation/stores";

const log = logger.scope("auth");
const authRepo = new AuthSupabaseRepository();

/** Restore Supabase session and subscribe to auth changes. */
export const AuthProvider = ({ children }: PropsWithChildren) => {
  const setSession = useAuthStore((s) => s.setSession);
  const session = useAuthStore((s) => s.session);
  const { setSyncState } = useAppStore();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      useAuthStore.setState({ status: "unauthenticated" });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const existing = await authRepo.getCurrentSession();
        if (!cancelled) {
          setSession(existing);
        }
      } catch (e) {
        log.error("Session restore failed.", e);
        if (!cancelled) {
          useAuthStore.setState({ status: "unauthenticated" });
        }
      }
    })();

    const unsubscribe = authRepo.onAuthStateChange((next) => {
      if (!cancelled) setSession(next);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [setSession]);

  useEffect(() => {
    if (!session || !isSupabaseConfigured()) return;

    let cancelled = false;

    (async () => {
      setSyncState({ status: "syncing" });
      const result = await runSync(session.user.storeId);
      const pending = await countPendingSync();
      if (cancelled) return;
      setSyncState({
        status: result.ok ? "idle" : "error",
        lastSyncAt: new Date().toISOString(),
        lastError:
          result.error ??
          (result.failed > 0 ? `${result.failed} item(s) failed` : null),
        pendingCount: pending,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user.storeId, setSyncState]);

  return <>{children}</>;
};

export { authRepo };
