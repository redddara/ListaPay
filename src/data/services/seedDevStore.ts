import type { SQLiteDatabase } from "expo-sqlite";

import type { ID } from "@core/types";
import { generateId, nowISO } from "@core/utils/id";
import { toMoney } from "@core/utils";

const DEV_STORE_ID = "dev-store" as ID;

const SAMPLE_PRODUCTS = [
  { name: "Coke Mismo", unit: "bottle", price: 20, stock: 48, barcode: "4800000001" },
  { name: "Lucky Me Pancit Canton", unit: "pc", price: 15, stock: 36, barcode: "4800000002" },
  { name: "Piattos Cheese", unit: "pack", price: 25, stock: 24, barcode: "4800000003" },
  { name: "Bear Brand Swak", unit: "sachet", price: 12, stock: 60, barcode: "4800000004" },
  { name: "Rice 1kg", unit: "kg", price: 55, stock: 20, barcode: "4800000005" },
  { name: "Eggs (tray)", unit: "tray", price: 210, stock: 8, barcode: "4800000006" },
  { name: "Milo 22g", unit: "sachet", price: 18, stock: 40, barcode: "4800000007" },
  { name: "Surf Bar", unit: "pc", price: 8, stock: 50, barcode: "4800000008" },
] as const;

const SAMPLE_CUSTOMERS = [
  { name: "Aling Maria", phone: "09171234567" },
  { name: "Kuya Jun", phone: "09189876543" },
  { name: "Walk-in Suki", phone: null },
] as const;

/** Seed sample products/customers for the dev store when the DB is empty. */
export const seedDevStoreIfEmpty = async (
  db: SQLiteDatabase,
  storeId: ID = DEV_STORE_ID,
): Promise<void> => {
  const existing = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM products WHERE store_id = ?;",
    storeId,
  );
  if ((existing?.count ?? 0) > 0) return;

  const ts = nowISO();

  for (const p of SAMPLE_PRODUCTS) {
    await db.runAsync(
      `INSERT INTO products (
        id, store_id, name, barcode, unit, price, cost, stock,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      generateId(),
      storeId,
      p.name,
      p.barcode,
      p.unit,
      toMoney(p.price),
      toMoney(p.price * 0.7),
      p.stock,
      ts,
      ts,
    );
  }

  for (const c of SAMPLE_CUSTOMERS) {
    await db.runAsync(
      `INSERT INTO customers (
        id, store_id, name, phone, outstanding_balance, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 0, ?, ?);`,
      generateId(),
      storeId,
      c.name,
      c.phone,
      ts,
      ts,
    );
  }
};
