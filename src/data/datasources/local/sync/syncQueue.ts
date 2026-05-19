import type { SQLiteDatabase } from "expo-sqlite";

import type { ID } from "@core/types";
import { generateId, nowISO } from "@core/utils/id";

export type SyncEntityType =
  | "product"
  | "customer"
  | "sale"
  | "sale_item"
  | "utang"
  | "payment";

export type SyncOperation = "create" | "update" | "delete";

export type SyncQueueStatus = "pending" | "syncing" | "failed" | "done";

export interface SyncQueueRow {
  id: ID;
  entity_type: SyncEntityType;
  entity_id: ID;
  operation: SyncOperation;
  payload: string;
  status: SyncQueueStatus;
  attempts: number;
  last_error: string | null;
  created_at: string;
  synced_at: string | null;
}

/** Record an offline mutation for later upload to the remote backend. */
export const enqueueSync = async (
  db: SQLiteDatabase,
  entityType: SyncEntityType,
  entityId: ID,
  operation: SyncOperation,
  payload: unknown,
): Promise<ID> => {
  const id = generateId();
  await db.runAsync(
    `INSERT INTO sync_queue (
      id, entity_type, entity_id, operation, payload, status, created_at
    ) VALUES (?, ?, ?, ?, ?, 'pending', ?);`,
    id,
    entityType,
    entityId,
    operation,
    JSON.stringify(payload),
    nowISO(),
  );
  return id;
};

export const listPendingSync = async (
  db: SQLiteDatabase,
  limit = 50,
): Promise<SyncQueueRow[]> =>
  db.getAllAsync<SyncQueueRow>(
    `SELECT * FROM sync_queue
     WHERE status IN ('pending', 'failed')
     ORDER BY created_at ASC
     LIMIT ?;`,
    limit,
  );

export const markSyncSyncing = async (
  db: SQLiteDatabase,
  id: ID,
): Promise<void> => {
  await db.runAsync(
    `UPDATE sync_queue SET status = 'syncing' WHERE id = ?;`,
    id,
  );
};

export const markSyncDone = async (
  db: SQLiteDatabase,
  id: ID,
): Promise<void> => {
  await db.runAsync(
    `UPDATE sync_queue
     SET status = 'done', synced_at = ?, last_error = NULL
     WHERE id = ?;`,
    nowISO(),
    id,
  );
};

export const markSyncFailed = async (
  db: SQLiteDatabase,
  id: ID,
  error: string,
): Promise<void> => {
  await db.runAsync(
    `UPDATE sync_queue
     SET status = 'failed',
         attempts = attempts + 1,
         last_error = ?
     WHERE id = ?;`,
    error,
    id,
  );
};
