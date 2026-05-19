import type { SQLiteDatabase } from "expo-sqlite";

import type { Migration } from "../migration";

const migration: Migration = {
  version: 1,
  name: "001_init",
  async up(db: SQLiteDatabase) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY NOT NULL,
        store_id TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        notes TEXT,
        outstanding_balance INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY NOT NULL,
        store_id TEXT NOT NULL,
        name TEXT NOT NULL,
        sku TEXT,
        barcode TEXT,
        unit TEXT NOT NULL,
        price INTEGER NOT NULL,
        cost INTEGER NOT NULL,
        stock REAL NOT NULL DEFAULT 0,
        reorder_level REAL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY NOT NULL,
        store_id TEXT NOT NULL,
        customer_id TEXT REFERENCES customers(id),
        subtotal INTEGER NOT NULL,
        discount INTEGER NOT NULL DEFAULT 0,
        total INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        debt_entry_id TEXT,
        sold_at TEXT NOT NULL,
        created_by TEXT NOT NULL,
        voided_at TEXT,
        void_reason TEXT
      );

      CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY NOT NULL,
        sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL REFERENCES products(id),
        name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit_price INTEGER NOT NULL,
        line_total INTEGER NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS utang (
        id TEXT PRIMARY KEY NOT NULL,
        store_id TEXT NOT NULL,
        customer_id TEXT NOT NULL REFERENCES customers(id),
        sale_id TEXT REFERENCES sales(id),
        principal INTEGER NOT NULL,
        amount_paid INTEGER NOT NULL DEFAULT 0,
        balance INTEGER NOT NULL,
        status TEXT NOT NULL,
        note TEXT,
        due_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY NOT NULL,
        store_id TEXT NOT NULL,
        customer_id TEXT NOT NULL REFERENCES customers(id),
        debt_entry_id TEXT NOT NULL REFERENCES utang(id),
        amount INTEGER NOT NULL,
        method TEXT NOT NULL,
        note TEXT,
        paid_at TEXT NOT NULL,
        recorded_by TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TEXT NOT NULL,
        synced_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_customers_store
        ON customers(store_id, created_at DESC, id DESC);
      CREATE INDEX IF NOT EXISTS idx_customers_name
        ON customers(store_id, name COLLATE NOCASE);

      CREATE INDEX IF NOT EXISTS idx_products_store
        ON products(store_id, created_at DESC, id DESC);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode
        ON products(store_id, barcode)
        WHERE barcode IS NOT NULL;

      CREATE INDEX IF NOT EXISTS idx_sales_store
        ON sales(store_id, sold_at DESC, id DESC);
      CREATE INDEX IF NOT EXISTS idx_sales_customer
        ON sales(customer_id, sold_at DESC);

      CREATE INDEX IF NOT EXISTS idx_sale_items_sale
        ON sale_items(sale_id, sort_order);

      CREATE INDEX IF NOT EXISTS idx_utang_store
        ON utang(store_id, created_at DESC, id DESC);
      CREATE INDEX IF NOT EXISTS idx_utang_customer
        ON utang(customer_id, status);

      CREATE INDEX IF NOT EXISTS idx_payments_store
        ON payments(store_id, paid_at DESC, id DESC);
      CREATE INDEX IF NOT EXISTS idx_payments_debt
        ON payments(debt_entry_id, paid_at DESC);
      CREATE INDEX IF NOT EXISTS idx_payments_customer
        ON payments(customer_id, paid_at DESC);

      CREATE INDEX IF NOT EXISTS idx_sync_queue_pending
        ON sync_queue(status, created_at)
        WHERE status IN ('pending', 'failed');
    `);
  },
};

export default migration;
