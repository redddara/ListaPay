import type { SQLiteDatabase } from "expo-sqlite";

import { DataError } from "@core/errors";
import type { ID, Money, Page, PageParams } from "@core/types";
import { generateId, nowISO } from "@core/utils/id";
import type { Customer } from "@domain/entities";
import type { ICustomerRepository } from "@domain/repositories";

import { getDatabase } from "@data/datasources/local/database";
import { fetchKeysetPage } from "@data/datasources/local/sql/helpers";
import { enqueueSync } from "@data/datasources/local/sync/syncQueue";
import {
  customerRowToEntity,
  customerToRow,
} from "@data/models/customer/mappers";
import type { CustomerRow } from "@data/models/customer/CustomerRow";

import { requireRow } from "./sqlite/requireRow";

export class CustomerSqliteRepository implements ICustomerRepository {
  constructor(
    private readonly storeId: ID,
    private readonly getDb: () => Promise<SQLiteDatabase> = getDatabase,
  ) {}

  async list(params: PageParams): Promise<Page<Customer>> {
    const db = await this.getDb();
    return fetchKeysetPage<CustomerRow, Customer>(
      db,
      {
        table: "customers",
        storeId: this.storeId,
        timeColumn: "created_at",
        params,
      },
      customerRowToEntity,
    );
  }

  async getById(id: ID): Promise<Customer | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<CustomerRow>(
      "SELECT * FROM customers WHERE id = ? AND store_id = ?;",
      id,
      this.storeId,
    );
    return row ? customerRowToEntity(row) : null;
  }

  async create(
    input: Omit<
      Customer,
      "id" | "createdAt" | "updatedAt" | "outstandingBalance"
    >,
  ): Promise<Customer> {
    const db = await this.getDb();
    const id = generateId();
    const ts = nowISO();
    const customer: Customer = {
      ...input,
      storeId: this.storeId,
      id,
      outstandingBalance: 0 as Money,
      createdAt: ts,
      updatedAt: ts,
    };

    try {
      await db.withTransactionAsync(async () => {
        const row = customerToRow(customer);
        await db.runAsync(
          `INSERT INTO customers (
            id, store_id, name, phone, notes,
            outstanding_balance, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          row.id,
          row.store_id,
          row.name,
          row.phone,
          row.notes,
          row.outstanding_balance,
          row.created_at,
          row.updated_at,
        );
        await enqueueSync(db, "customer", id, "create", customer);
      });
    } catch (cause) {
      throw new DataError("Failed to create customer.", "DB_WRITE", cause);
    }

    return customer;
  }

  async update(id: ID, patch: Partial<Customer>): Promise<Customer> {
    const existing = requireRow(await this.getById(id), "Customer", id);
    const updated: Customer = {
      ...existing,
      ...patch,
      id: existing.id,
      storeId: this.storeId,
      updatedAt: nowISO(),
    };

    const db = await this.getDb();
    const row = customerToRow(updated);

    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `UPDATE customers SET
            name = ?, phone = ?, notes = ?,
            outstanding_balance = ?, updated_at = ?
           WHERE id = ? AND store_id = ?;`,
          row.name,
          row.phone,
          row.notes,
          row.outstanding_balance,
          row.updated_at,
          id,
          this.storeId,
        );
        await enqueueSync(db, "customer", id, "update", updated);
      });
    } catch (cause) {
      throw new DataError("Failed to update customer.", "DB_WRITE", cause);
    }

    return updated;
  }

  async delete(id: ID): Promise<void> {
    requireRow(await this.getById(id), "Customer", id);
    const db = await this.getDb();

    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          "DELETE FROM customers WHERE id = ? AND store_id = ?;",
          id,
          this.storeId,
        );
        await enqueueSync(db, "customer", id, "delete", { id });
      });
    } catch (cause) {
      throw new DataError("Failed to delete customer.", "DB_WRITE", cause);
    }
  }

  async search(query: string): Promise<Customer[]> {
    const db = await this.getDb();
    const pattern = `%${query.trim()}%`;
    const rows = await db.getAllAsync<CustomerRow>(
      `SELECT * FROM customers
       WHERE store_id = ?
         AND (name LIKE ? COLLATE NOCASE OR phone LIKE ?)
       ORDER BY name COLLATE NOCASE
       LIMIT 50;`,
      this.storeId,
      pattern,
      pattern,
    );
    return rows.map(customerRowToEntity);
  }
}
