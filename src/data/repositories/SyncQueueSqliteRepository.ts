import type { SQLiteDatabase } from "expo-sqlite";

import type { ID } from "@core/types";

import { getDatabase } from "@data/datasources/local/database";
import {
  listPendingSync,
  markSyncDone,
  markSyncFailed,
  markSyncSyncing,
  type SyncQueueRow,
} from "@data/datasources/local/sync/syncQueue";

/**
 * Read/write access to the offline `sync_queue` table.
 * Used by a future sync worker — not part of the domain port layer.
 */
export class SyncQueueSqliteRepository {
  constructor(
    private readonly getDb: () => Promise<SQLiteDatabase> = getDatabase,
  ) {}

  listPending(limit = 50): Promise<SyncQueueRow[]> {
    return this.getDb().then((db) => listPendingSync(db, limit));
  }

  async markSyncing(id: ID): Promise<void> {
    const db = await this.getDb();
    await markSyncSyncing(db, id);
  }

  async markDone(id: ID): Promise<void> {
    const db = await this.getDb();
    await markSyncDone(db, id);
  }

  async markFailed(id: ID, error: string): Promise<void> {
    const db = await this.getDb();
    await markSyncFailed(db, id, error);
  }
}
