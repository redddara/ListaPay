import type { SQLiteBindValue, SQLiteDatabase } from "expo-sqlite";

import type { ID, Page, PageParams } from "@core/types";

const CURSOR_SEP = "\x1f";

/** Encode a stable keyset cursor from a timestamp column and row id. */
export const encodeCursor = (timestamp: string, id: ID): string =>
  `${timestamp}${CURSOR_SEP}${id}`;

/** Decode a keyset cursor produced by {@link encodeCursor}. */
export const decodeCursor = (
  cursor: string,
): { timestamp: string; id: ID } => {
  const sep = cursor.indexOf(CURSOR_SEP);
  if (sep === -1) {
    throw new Error(`Invalid cursor: "${cursor}"`);
  }
  return {
    timestamp: cursor.slice(0, sep),
    id: cursor.slice(sep + 1) as ID,
  };
};

export interface KeysetPageOptions {
  table: string;
  storeId: ID;
  timeColumn: string;
  params: PageParams;
  /** Extra AND clauses, e.g. `customer_id = ?` — bind values go in `extraArgs`. */
  extraWhere?: string;
  extraArgs?: SQLiteBindValue[];
}

/**
 * Keyset pagination ordered by `(timeColumn DESC, id DESC)`.
 * `cursor` is optional; when absent the first page is returned.
 */
export const fetchKeysetPage = async <TRow extends { id: string }, TItem>(
  db: SQLiteDatabase,
  options: KeysetPageOptions,
  mapRow: (row: TRow) => TItem,
): Promise<Page<TItem>> => {
  const { table, storeId, timeColumn, params, extraWhere, extraArgs = [] } =
    options;
  const limit = params.limit + 1;

  const args: SQLiteBindValue[] = [storeId, ...extraArgs];
  let cursorClause = "";

  if (params.cursor) {
    const { timestamp, id } = decodeCursor(params.cursor);
    cursorClause = `AND (${timeColumn} < ? OR (${timeColumn} = ? AND id < ?))`;
    args.push(timestamp, timestamp, id);
  }

  const extra = extraWhere ? `AND ${extraWhere}` : "";
  const rows = await db.getAllAsync<TRow>(
    `SELECT * FROM ${table}
     WHERE store_id = ?
       ${extra}
       ${cursorClause}
     ORDER BY ${timeColumn} DESC, id DESC
     LIMIT ?;`,
    ...args,
    limit,
  );

  const hasMore = rows.length > params.limit;
  const slice = hasMore ? rows.slice(0, params.limit) : rows;
  const items = slice.map((row) => mapRow(row));
  const last = slice[slice.length - 1] as
    | (TRow & Record<string, string>)
    | undefined;

  return {
    items,
    nextCursor:
      hasMore && last
        ? encodeCursor(last[timeColumn] as string, last.id as ID)
        : undefined,
  };
};
