import * as SQLite from "expo-sqlite";

import { APP_CONSTANTS } from "@core/constants";
import { DataError } from "@core/errors";
import { logger } from "@core/utils";

import type { Migration } from "./migration";

export type { Migration } from "./migration";

const log = logger.scope("sqlite");

let _db: SQLite.SQLiteDatabase | null = null;

/**
 * Open (or return the cached) SQLite database connection.
 *
 * `expo-sqlite` opens the DB lazily and caches the handle for the lifetime
 * of the JS context, so this is safe to call from anywhere in the data
 * layer. Repositories should call this and never open their own connection.
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (_db) return _db;
  try {
    _db = await SQLite.openDatabaseAsync(APP_CONSTANTS.DB_NAME);
    await _db.execAsync("PRAGMA journal_mode = WAL;");
    await _db.execAsync("PRAGMA foreign_keys = ON;");
    log.info(`Opened database "${APP_CONSTANTS.DB_NAME}".`);
    return _db;
  } catch (cause) {
    throw new DataError("Failed to open local SQLite database.", "DB_OPEN", cause);
  }
};

/**
 * Run any pending migrations in order. Tracks the current schema version in
 * a private `_migrations` table.
 */
export const runMigrations = async (
  db: SQLite.SQLiteDatabase,
  migrations: Migration[],
): Promise<void> => {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
  );

  const row = await db.getFirstAsync<{ version: number | null }>(
    "SELECT MAX(version) as version FROM _migrations;",
  );
  const current = row?.version ?? 0;

  const pending = migrations
    .slice()
    .sort((a, b) => a.version - b.version)
    .filter((m) => m.version > current);

  if (pending.length === 0) {
    log.debug(`Schema up to date (v${current}).`);
    return;
  }

  for (const m of pending) {
    log.info(`Applying migration v${m.version} (${m.name})`);
    try {
      await db.withTransactionAsync(async () => {
        await m.up(db);
        await db.runAsync(
          "INSERT INTO _migrations (version, name) VALUES (?, ?);",
          m.version,
          m.name,
        );
      });
    } catch (cause) {
      throw new DataError(
        `Migration v${m.version} (${m.name}) failed.`,
        "DB_MIGRATION",
        cause,
      );
    }
  }
};

/**
 * Convenience initializer to be called once at app startup. Opens the DB
 * and applies any pending migrations.
 */
export const initializeDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  const db = await getDatabase();
  const { migrations } = await import("./migrations");
  await runMigrations(db, migrations);
  return db;
};

/** Test/teardown helper. */
export const __resetDatabase = async (): Promise<void> => {
  if (_db) {
    await _db.closeAsync();
    _db = null;
  }
};
