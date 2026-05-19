import { isSupabaseConfigured } from "@core/config/env";
import { logger } from "@core/utils";
import type { ID } from "@core/types";

import { getDatabase } from "@data/datasources/local/database";
import { getSupabaseClient } from "@data/datasources/remote/supabaseClient";

import { SyncProcessor } from "./SyncProcessor";

const log = logger.scope("sync");

export interface SyncRunResult {
  ok: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  error?: string;
}

let _running = false;

/**
 * Process the offline `sync_queue` and push to Supabase.
 * Safe to call repeatedly; skips when already running or unconfigured.
 */
export const runSync = async (storeId: ID): Promise<SyncRunResult> => {
  if (!isSupabaseConfigured()) {
    return {
      ok: true,
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
    };
  }

  if (_running) {
    return {
      ok: true,
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
    };
  }

  _running = true;
  try {
    const db = await getDatabase();
    const supabase = getSupabaseClient();
    const processor = new SyncProcessor(db, supabase, storeId);
    const batch = await processor.processPending(50);
    log.info(
      `Sync batch: ${batch.succeeded} ok, ${batch.failed} failed, ${batch.skipped} skipped`,
    );
    return { ok: batch.failed === 0, ...batch };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log.error("Sync run failed.", e);
    return {
      ok: false,
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      error: msg,
    };
  } finally {
    _running = false;
  }
};

export const countPendingSync = async (): Promise<number> => {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM sync_queue
     WHERE status IN ('pending', 'failed') AND attempts < 8;`,
  );
  return row?.count ?? 0;
};
