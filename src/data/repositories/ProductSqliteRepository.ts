import type { SQLiteDatabase } from "expo-sqlite";

import { DataError } from "@core/errors";
import type { ID, Page, PageParams } from "@core/types";
import { generateId, nowISO } from "@core/utils/id";
import type { Product } from "@domain/entities";
import type { IProductRepository } from "@domain/repositories";

import { getDatabase } from "@data/datasources/local/database";
import { fetchKeysetPage } from "@data/datasources/local/sql/helpers";
import { enqueueSync } from "@data/datasources/local/sync/syncQueue";
import { productRowToEntity, productToRow } from "@data/models/product/mappers";
import type { ProductRow } from "@data/models/product/ProductRow";

import { requireRow } from "./sqlite/requireRow";

export class ProductSqliteRepository implements IProductRepository {
  constructor(
    private readonly storeId: ID,
    private readonly getDb: () => Promise<SQLiteDatabase> = getDatabase,
  ) {}

  async list(params: PageParams): Promise<Page<Product>> {
    const db = await this.getDb();
    return fetchKeysetPage<ProductRow, Product>(
      db,
      {
        table: "products",
        storeId: this.storeId,
        timeColumn: "created_at",
        params,
      },
      productRowToEntity,
    );
  }

  async getById(id: ID): Promise<Product | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<ProductRow>(
      "SELECT * FROM products WHERE id = ? AND store_id = ?;",
      id,
      this.storeId,
    );
    return row ? productRowToEntity(row) : null;
  }

  async getByBarcode(barcode: string): Promise<Product | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<ProductRow>(
      "SELECT * FROM products WHERE store_id = ? AND barcode = ?;",
      this.storeId,
      barcode,
    );
    return row ? productRowToEntity(row) : null;
  }

  async create(
    input: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ): Promise<Product> {
    const db = await this.getDb();
    const id = generateId();
    const ts = nowISO();
    const product: Product = {
      ...input,
      storeId: this.storeId,
      id,
      createdAt: ts,
      updatedAt: ts,
    };

    try {
      await db.withTransactionAsync(async () => {
        const row = productToRow(product);
        await db.runAsync(
          `INSERT INTO products (
            id, store_id, name, sku, barcode, unit, price, cost,
            stock, reorder_level, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          row.id,
          row.store_id,
          row.name,
          row.sku,
          row.barcode,
          row.unit,
          row.price,
          row.cost,
          row.stock,
          row.reorder_level,
          row.created_at,
          row.updated_at,
        );
        await enqueueSync(db, "product", id, "create", product);
      });
    } catch (cause) {
      throw new DataError("Failed to create product.", "DB_WRITE", cause);
    }

    return product;
  }

  async update(id: ID, patch: Partial<Product>): Promise<Product> {
    const existing = requireRow(await this.getById(id), "Product", id);
    const updated: Product = {
      ...existing,
      ...patch,
      id: existing.id,
      storeId: this.storeId,
      updatedAt: nowISO(),
    };

    const db = await this.getDb();
    const row = productToRow(updated);

    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `UPDATE products SET
            name = ?, sku = ?, barcode = ?, unit = ?,
            price = ?, cost = ?, stock = ?, reorder_level = ?,
            updated_at = ?
           WHERE id = ? AND store_id = ?;`,
          row.name,
          row.sku,
          row.barcode,
          row.unit,
          row.price,
          row.cost,
          row.stock,
          row.reorder_level,
          row.updated_at,
          id,
          this.storeId,
        );
        await enqueueSync(db, "product", id, "update", updated);
      });
    } catch (cause) {
      throw new DataError("Failed to update product.", "DB_WRITE", cause);
    }

    return updated;
  }

  async delete(id: ID): Promise<void> {
    requireRow(await this.getById(id), "Product", id);
    const db = await this.getDb();

    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          "DELETE FROM products WHERE id = ? AND store_id = ?;",
          id,
          this.storeId,
        );
        await enqueueSync(db, "product", id, "delete", { id });
      });
    } catch (cause) {
      throw new DataError("Failed to delete product.", "DB_WRITE", cause);
    }
  }

  async adjustStock(id: ID, delta: number): Promise<Product> {
    const existing = requireRow(await this.getById(id), "Product", id);
    return this.update(id, { stock: existing.stock + delta });
  }
}
