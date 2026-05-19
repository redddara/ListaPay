import type { SQLiteDatabase } from "expo-sqlite";

import { DataError } from "@core/errors";
import type { ID, Page, PageParams } from "@core/types";
import { generateId, nowISO } from "@core/utils/id";
import type { Sale } from "@domain/entities";
import type { ISaleRepository } from "@domain/repositories";

import { getDatabase } from "@data/datasources/local/database";
import { fetchKeysetPage } from "@data/datasources/local/sql/helpers";
import { enqueueSync } from "@data/datasources/local/sync/syncQueue";
import {
  lineItemToRow,
  saleItemRowToLineItem,
  saleRowToEntity,
  saleToRow,
} from "@data/models/sale/mappers";
import type { SaleItemRow } from "@data/models/sale/SaleItemRow";
import type { SaleRow } from "@data/models/sale/SaleRow";

import { requireRow } from "./sqlite/requireRow";

const ACTIVE_SALE = "voided_at IS NULL";

export class SaleSqliteRepository implements ISaleRepository {
  constructor(
    private readonly storeId: ID,
    private readonly getDb: () => Promise<SQLiteDatabase> = getDatabase,
  ) {}

  async list(params: PageParams): Promise<Page<Sale>> {
    const db = await this.getDb();
    const page = await fetchKeysetPage<SaleRow, SaleRow>(
      db,
      {
        table: "sales",
        storeId: this.storeId,
        timeColumn: "sold_at",
        params,
        extraWhere: ACTIVE_SALE,
      },
      (row) => row,
    );
    const items = await Promise.all(
      page.items.map((row) => this.hydrateSale(db, row)),
    );
    return { items, nextCursor: page.nextCursor };
  }

  async getById(id: ID): Promise<Sale | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<SaleRow>(
      `SELECT * FROM sales WHERE id = ? AND store_id = ? AND ${ACTIVE_SALE};`,
      id,
      this.storeId,
    );
    return row ? this.hydrateSale(db, row) : null;
  }

  async listByCustomer(
    customerId: ID,
    params: PageParams,
  ): Promise<Page<Sale>> {
    const db = await this.getDb();
    const page = await fetchKeysetPage<SaleRow, SaleRow>(
      db,
      {
        table: "sales",
        storeId: this.storeId,
        timeColumn: "sold_at",
        params,
        extraWhere: `customer_id = ? AND ${ACTIVE_SALE}`,
        extraArgs: [customerId],
      },
      (row) => row,
    );
    const items = await Promise.all(
      page.items.map((row) => this.hydrateSale(db, row)),
    );
    return { items, nextCursor: page.nextCursor };
  }

  async create(input: Omit<Sale, "id">): Promise<Sale> {
    const db = await this.getDb();
    const id = generateId();
    const sale: Sale = { ...input, id, storeId: this.storeId };
    const saleRow = saleToRow(sale);

    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO sales (
            id, store_id, customer_id, subtotal, discount, total,
            payment_method, debt_entry_id, sold_at, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          saleRow.id,
          saleRow.store_id,
          saleRow.customer_id,
          saleRow.subtotal,
          saleRow.discount,
          saleRow.total,
          saleRow.payment_method,
          saleRow.debt_entry_id,
          saleRow.sold_at,
          saleRow.created_by,
        );

        for (let i = 0; i < sale.items.length; i++) {
          const item = sale.items[i]!;
          const itemRow = lineItemToRow(sale.id, item, i, generateId());
          await db.runAsync(
            `INSERT INTO sale_items (
              id, sale_id, product_id, name, quantity,
              unit_price, line_total, sort_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            itemRow.id,
            itemRow.sale_id,
            itemRow.product_id,
            itemRow.name,
            itemRow.quantity,
            itemRow.unit_price,
            itemRow.line_total,
            itemRow.sort_order,
          );
          await enqueueSync(db, "sale_item", itemRow.id as ID, "create", {
            ...item,
            saleId: sale.id,
          });
        }

        await enqueueSync(db, "sale", id, "create", sale);
      });
    } catch (cause) {
      throw new DataError("Failed to create sale.", "DB_WRITE", cause);
    }

    return sale;
  }

  async void(id: ID, reason: string): Promise<void> {
    requireRow(await this.getById(id), "Sale", id);
    const db = await this.getDb();
    const voidedAt = nowISO();

    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `UPDATE sales SET voided_at = ?, void_reason = ?
           WHERE id = ? AND store_id = ?;`,
          voidedAt,
          reason,
          id,
          this.storeId,
        );
        await enqueueSync(db, "sale", id, "update", {
          id,
          voidedAt,
          voidReason: reason,
        });
      });
    } catch (cause) {
      throw new DataError("Failed to void sale.", "DB_WRITE", cause);
    }
  }

  private async hydrateSale(db: SQLiteDatabase, row: SaleRow): Promise<Sale> {
    const itemRows = await db.getAllAsync<SaleItemRow>(
      `SELECT * FROM sale_items WHERE sale_id = ? ORDER BY sort_order;`,
      row.id,
    );
    return saleRowToEntity(row, itemRows.map(saleItemRowToLineItem));
  }
}
