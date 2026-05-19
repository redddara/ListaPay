import type { SQLiteDatabase } from "expo-sqlite";

import type { ID } from "@core/types";
import type { SyncEntityType, SyncOperation } from "@data/datasources/local/sync/syncQueue";
import type { CustomerRow } from "@data/models/customer/CustomerRow";
import type { UtangRow } from "@data/models/debt/UtangRow";
import type { PaymentRow } from "@data/models/payment/PaymentRow";
import type { ProductRow } from "@data/models/product/ProductRow";
import type { SaleItemRow } from "@data/models/sale/SaleItemRow";
import type { SaleRow } from "@data/models/sale/SaleRow";

export type LocalSyncPayload =
  | { type: "product"; row: ProductRow }
  | { type: "customer"; row: CustomerRow }
  | { type: "sale"; row: SaleRow; items: SaleItemRow[] }
  | { type: "sale_item"; row: SaleItemRow }
  | { type: "utang"; row: UtangRow }
  | { type: "payment"; row: PaymentRow }
  | { type: "sale_void"; row: SaleRow; patch: { voidedAt?: string; voidReason?: string } };

/**
 * Load the authoritative local row(s) for a sync queue entry.
 * Offline-first: Supabase receives what's in SQLite, not stale payload JSON.
 */
export const loadLocalEntity = async (
  db: SQLiteDatabase,
  entityType: SyncEntityType,
  entityId: ID,
  operation: SyncOperation,
  payloadJson: string,
): Promise<LocalSyncPayload | null> => {
  switch (entityType) {
    case "product": {
      const row = await db.getFirstAsync<ProductRow>(
        "SELECT * FROM products WHERE id = ?;",
        entityId,
      );
      if (!row && operation === "delete") return null;
      if (!row) return null;
      return { type: "product", row };
    }
    case "customer": {
      const row = await db.getFirstAsync<CustomerRow>(
        "SELECT * FROM customers WHERE id = ?;",
        entityId,
      );
      if (!row && operation === "delete") return null;
      if (!row) return null;
      return { type: "customer", row };
    }
    case "sale": {
      const row = await db.getFirstAsync<SaleRow>(
        "SELECT * FROM sales WHERE id = ?;",
        entityId,
      );
      if (!row && operation === "delete") return null;
      if (!row) return null;

      const patch = safeParse(payloadJson);
      if (patch?.voidedAt || patch?.voidReason) {
        return {
          type: "sale_void",
          row,
          patch: {
            voidedAt: patch.voidedAt as string | undefined,
            voidReason: patch.voidReason as string | undefined,
          },
        };
      }

      const items = await db.getAllAsync<SaleItemRow>(
        "SELECT * FROM sale_items WHERE sale_id = ? ORDER BY sort_order;",
        entityId,
      );
      return { type: "sale", row, items };
    }
    case "sale_item": {
      const row = await db.getFirstAsync<SaleItemRow>(
        "SELECT * FROM sale_items WHERE id = ?;",
        entityId,
      );
      if (!row && operation === "delete") return null;
      if (!row) return null;
      return { type: "sale_item", row };
    }
    case "utang": {
      const row = await db.getFirstAsync<UtangRow>(
        "SELECT * FROM utang WHERE id = ?;",
        entityId,
      );
      if (!row && operation === "delete") return null;
      if (!row) return null;
      return { type: "utang", row };
    }
    case "payment": {
      const row = await db.getFirstAsync<PaymentRow>(
        "SELECT * FROM payments WHERE id = ?;",
        entityId,
      );
      if (!row && operation === "delete") return null;
      if (!row) return null;
      return { type: "payment", row };
    }
    default:
      return null;
  }
};

const safeParse = (json: string): Record<string, unknown> | null => {
  try {
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
};
