import type { SQLiteDatabase } from "expo-sqlite";

import { DataError } from "@core/errors";
import type { ID, Money, Page, PageParams } from "@core/types";
import { generateId, nowISO } from "@core/utils/id";
import type { DebtEntry } from "@domain/entities";
import type { IDebtRepository } from "@domain/repositories";

import { getDatabase } from "@data/datasources/local/database";
import { fetchKeysetPage } from "@data/datasources/local/sql/helpers";
import { enqueueSync } from "@data/datasources/local/sync/syncQueue";
import {
  computeDebtStatus,
  debtEntryToRow,
  utangRowToEntity,
} from "@data/models/debt/mappers";
import type { UtangRow } from "@data/models/debt/UtangRow";

import { requireRow } from "./sqlite/requireRow";

export class DebtSqliteRepository implements IDebtRepository {
  constructor(
    private readonly storeId: ID,
    private readonly getDb: () => Promise<SQLiteDatabase> = getDatabase,
  ) {}

  async list(params: PageParams): Promise<Page<DebtEntry>> {
    const db = await this.getDb();
    return fetchKeysetPage<UtangRow, DebtEntry>(
      db,
      {
        table: "utang",
        storeId: this.storeId,
        timeColumn: "created_at",
        params,
      },
      utangRowToEntity,
    );
  }

  async getById(id: ID): Promise<DebtEntry | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<UtangRow>(
      "SELECT * FROM utang WHERE id = ? AND store_id = ?;",
      id,
      this.storeId,
    );
    return row ? utangRowToEntity(row) : null;
  }

  async listByCustomer(customerId: ID): Promise<DebtEntry[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<UtangRow>(
      `SELECT * FROM utang
       WHERE store_id = ? AND customer_id = ?
       ORDER BY created_at DESC;`,
      this.storeId,
      customerId,
    );
    return rows.map(utangRowToEntity);
  }

  async create(
    input: Omit<DebtEntry, "id" | "createdAt" | "updatedAt">,
  ): Promise<DebtEntry> {
    const db = await this.getDb();
    const id = generateId();
    const ts = nowISO();
    const entry: DebtEntry = {
      ...input,
      storeId: this.storeId,
      id,
      createdAt: ts,
      updatedAt: ts,
    };

    try {
      await db.withTransactionAsync(async () => {
        const row = debtEntryToRow(entry);
        await db.runAsync(
          `INSERT INTO utang (
            id, store_id, customer_id, sale_id, principal,
            amount_paid, balance, status, note, due_date,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          row.id,
          row.store_id,
          row.customer_id,
          row.sale_id,
          row.principal,
          row.amount_paid,
          row.balance,
          row.status,
          row.note,
          row.due_date,
          row.created_at,
          row.updated_at,
        );
        await db.runAsync(
          `UPDATE customers
           SET outstanding_balance = outstanding_balance + ?,
               updated_at = ?
           WHERE id = ? AND store_id = ?;`,
          entry.balance,
          ts,
          entry.customerId,
          this.storeId,
        );
        await enqueueSync(db, "utang", id, "create", entry);
        await enqueueSync(db, "customer", entry.customerId, "update", {
          customerId: entry.customerId,
          outstandingDelta: entry.balance,
        });
      });
    } catch (cause) {
      throw new DataError("Failed to create debt entry.", "DB_WRITE", cause);
    }

    return entry;
  }

  async update(id: ID, patch: Partial<DebtEntry>): Promise<DebtEntry> {
    const existing = requireRow(await this.getById(id), "DebtEntry", id);
    const updated: DebtEntry = {
      ...existing,
      ...patch,
      id: existing.id,
      storeId: this.storeId,
      updatedAt: nowISO(),
    };
    updated.status = computeDebtStatus(updated.principal, updated.amountPaid);
    updated.balance = (updated.principal - updated.amountPaid) as Money;

    const db = await this.getDb();
    const row = debtEntryToRow(updated);

    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `UPDATE utang SET
            sale_id = ?, principal = ?, amount_paid = ?, balance = ?,
            status = ?, note = ?, due_date = ?, updated_at = ?
           WHERE id = ? AND store_id = ?;`,
          row.sale_id,
          row.principal,
          row.amount_paid,
          row.balance,
          row.status,
          row.note,
          row.due_date,
          row.updated_at,
          id,
          this.storeId,
        );
        await enqueueSync(db, "utang", id, "update", updated);
      });
    } catch (cause) {
      throw new DataError("Failed to update debt entry.", "DB_WRITE", cause);
    }

    return updated;
  }

  async totalOutstandingFor(customerId: ID): Promise<Money> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<{ total: number | null }>(
      `SELECT COALESCE(SUM(balance), 0) as total FROM utang
       WHERE store_id = ? AND customer_id = ?
         AND status IN ('open', 'partial');`,
      this.storeId,
      customerId,
    );
    return (row?.total ?? 0) as Money;
  }
}
