import { Platform } from "react-native";
import type * as SQLite from "expo-sqlite";

import {
  clearWebAuthHash,
  consumeWebAuthRedirect,
} from "@core/auth";
import { isSupabaseConfigured } from "@core/config/env";
import { DataError } from "@core/errors";
import { getWebSqliteBlocker } from "@core/platform";
import { logger } from "@core/utils";
import { initializeDatabase } from "@data/datasources/local";
import { getSupabaseClient } from "@data/datasources/remote";
import { seedDevStoreIfEmpty } from "@data/services/seedDevStore";
import { useAuthStore } from "@presentation/stores";

const log = logger.scope("bootstrap");

let bootstrapPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Single-flight app bootstrap (SQLite + Supabase client).
 * Avoids duplicate work when React strict mode re-runs effects on web.
 */
export const runAppBootstrap = (): Promise<SQLite.SQLiteDatabase> => {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const supabase = getSupabaseClient();

    if (Platform.OS === "web") {
      if (isSupabaseConfigured()) {
        await supabase.auth.getSession();
      }

      const authMessage = consumeWebAuthRedirect();
      clearWebAuthHash();
      if (authMessage) {
        useAuthStore.getState().setPendingAuthMessage(authMessage);
      }

      const blocker = getWebSqliteBlocker();
      if (blocker) {
        throw new DataError(blocker, "WEB_SQLITE_UNSUPPORTED");
      }
    }

    log.info("Opening local database…");
    const db = await initializeDatabase();
    log.info("Local database ready.");

    if (!isSupabaseConfigured()) {
      await seedDevStoreIfEmpty(db);
    }

    return db;
  })();

  return bootstrapPromise;
};

/** Test helper — allow a fresh bootstrap attempt. */
export const __resetAppBootstrap = (): void => {
  bootstrapPromise = null;
};
