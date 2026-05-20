import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

import { APP_CONSTANTS } from "@core/constants";
import { DataError } from "@core/errors";
import { logger } from "@core/utils";

import type { Migration } from "./migration";

export type { Migration } from "./migration";

const log = logger.scope("sqlite");

const WEB_VFS_RELOAD_KEY = "listapay.web.vfs-reload";

let _db: SQLite.SQLiteDatabase | null = null;
let _opening: Promise<SQLite.SQLiteDatabase> | null = null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const getErrorMessage = (cause: unknown): string =>
  cause instanceof Error ? cause.message : String(cause);

/** expo-sqlite web worker can get stuck after fast refresh (Invalid VFS state). */
const tryReloadWebOnInvalidVfs = (cause: unknown): boolean => {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;
  if (!/Invalid VFS state/i.test(getErrorMessage(cause))) return false;
  if (sessionStorage.getItem(WEB_VFS_RELOAD_KEY)) return false;
  sessionStorage.setItem(WEB_VFS_RELOAD_KEY, "1");
  log.warn("Resetting web SQLite worker (one-time reload)…");
  window.location.reload();
  return true;
};

const clearWebVfsReloadFlag = (): void => {
  if (Platform.OS === "web" && typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(WEB_VFS_RELOAD_KEY);
  }
};

const resolveDatabaseName = (): string => APP_CONSTANTS.DB_NAME;

const openDatabaseOnce = async (databaseName: string): Promise<SQLite.SQLiteDatabase> => {
  const openPromise = SQLite.openDatabaseAsync(databaseName);
  const db = await (Platform.OS === "web"
    ? withTimeout(
        openPromise,
        WEB_OPEN_TIMEOUT_MS,
        "SQLite worker did not respond. Hard-refresh the page (Ctrl+Shift+R) or use Expo Go on your phone.",
      )
    : openPromise);
  if (Platform.OS !== "web") {
    await db.execAsync("PRAGMA journal_mode = WAL;");
  }
  await db.execAsync("PRAGMA foreign_keys = ON;");
  return db;
};

const WEB_OPEN_TIMEOUT_MS = 45_000;

const withTimeout = async <T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

/**
 * Open (or return the cached) SQLite database connection.
 *
 * `expo-sqlite` opens the DB lazily and caches the handle for the lifetime
 * of the JS context, so this is safe to call from anywhere in the data
 * layer. Repositories should call this and never open their own connection.
 */
const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (Platform.OS === "web") {
    await sleep(150);
  }

  const attempts = Platform.OS === "web" ? 4 : 1;
  let lastCause: unknown;
  const primaryName = resolveDatabaseName();

  for (let i = 0; i < attempts; i++) {
    try {
      const db = await openDatabaseOnce(primaryName);
      clearWebVfsReloadFlag();
      log.info(`Opened database "${primaryName}".`);
      return db;
    } catch (cause) {
      lastCause = cause;
      if (tryReloadWebOnInvalidVfs(cause)) {
        await new Promise<void>(() => {});
      }
      if (_db) {
        try {
          await _db.closeAsync();
        } catch {
          /* ignore */
        }
        _db = null;
      }
      if (i < attempts - 1) {
        log.warn(`SQLite open attempt ${i + 1} failed; retrying…`, cause);
        await sleep(Platform.OS === "web" ? 500 * (i + 1) : 250 * (i + 1));
      }
    }
  }

  if (Platform.OS === "web") {
    try {
      log.warn("Persistent web DB failed; using in-memory SQLite for this session.", lastCause);
      const db = await openDatabaseOnce(":memory:");
      clearWebVfsReloadFlag();
      log.info('Opened database ":memory:" (web preview — data resets on refresh).');
      return db;
    } catch (memCause) {
      lastCause = memCause;
    }
  }

  throw new DataError("Failed to open local SQLite database.", "DB_OPEN", lastCause);
};

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (_db) return _db;
  if (_opening) return _opening;

  _opening = openDatabase()
    .then((db) => {
      _db = db;
      return db;
    })
    .finally(() => {
      _opening = null;
    });

  return _opening;
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
  if (_opening) {
    await _opening.catch(() => {});
    _opening = null;
  }
  if (_db) {
    await _db.closeAsync();
    _db = null;
  }
};
