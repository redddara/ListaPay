import type { SupabaseClient } from "@supabase/supabase-js";
import type { SQLiteDatabase } from "expo-sqlite";

import { isSupabaseConfigured } from "@core/config/env";
import type { ID } from "@core/types";
import {
  listPendingSync,
  markSyncDone,
  markSyncFailed,
  markSyncSyncing,
  type SyncQueueRow,
} from "@data/datasources/local/sync/syncQueue";
import {
  applySaleVoidPatch,
  customerRowToDto,
  paymentRowToDto,
  productRowToDto,
  saleItemRowToDto,
  saleRowToDto,
  utangRowToDto,
} from "@data/models/remote/mappers";

import { loadLocalEntity } from "./loadLocalEntity";

const MAX_ATTEMPTS = 8;

export interface SyncBatchResult {
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
}

export class SyncProcessor {
  constructor(
    private readonly db: SQLiteDatabase,
    private readonly supabase: SupabaseClient,
    private readonly storeId: ID,
  ) {}

  async processPending(limit = 50): Promise<SyncBatchResult> {
    if (!isSupabaseConfigured()) {
      return { processed: 0, succeeded: 0, failed: 0, skipped: 0 };
    }

    const rows = await listPendingSync(this.db, limit);
    const result: SyncBatchResult = {
      processed: rows.length,
      succeeded: 0,
      failed: 0,
      skipped: 0,
    };

    for (const row of rows) {
      if (row.attempts >= MAX_ATTEMPTS) {
        result.skipped++;
        continue;
      }

      try {
        await markSyncSyncing(this.db, row.id);
        await this.processRow(row);
        await markSyncDone(this.db, row.id);
        result.succeeded++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await markSyncFailed(this.db, row.id, msg);
        result.failed++;
      }
    }

    return result;
  }

  private async processRow(row: SyncQueueRow): Promise<void> {
    if (row.operation === "delete") {
      await this.deleteRemote(row.entity_type, row.entity_id);
      return;
    }

    const local = await loadLocalEntity(
      this.db,
      row.entity_type,
      row.entity_id,
      row.operation,
      row.payload,
    );

    if (!local) {
      throw new Error(`Local row missing for ${row.entity_type}:${row.entity_id}`);
    }

    switch (local.type) {
      case "product":
        await this.upsert("products", productRowToDto(local.row));
        break;
      case "customer":
        await this.upsert("customers", customerRowToDto(local.row));
        break;
      case "sale":
        await this.upsert("sales", saleRowToDto(local.row));
        for (const item of local.items) {
          await this.upsert("sale_items", saleItemRowToDto(item));
        }
        break;
      case "sale_void": {
        let dto = saleRowToDto(local.row);
        dto = applySaleVoidPatch(dto, local.patch);
        await this.upsert("sales", dto);
        break;
      }
      case "sale_item":
        await this.upsert("sale_items", saleItemRowToDto(local.row));
        break;
      case "utang":
        await this.upsert("utang", utangRowToDto(local.row));
        break;
      case "payment":
        await this.upsert("payments", paymentRowToDto(local.row));
        break;
    }
  }

  private async upsert(table: string, row: object): Promise<void> {
    const record = row as { store_id?: string };
    if (record.store_id && record.store_id !== this.storeId) {
      throw new Error(`Store mismatch for ${table}`);
    }
    const { error } = await this.supabase.from(table).upsert(row as Record<string, unknown>, {
      onConflict: "id",
    });
    if (error) throw new Error(`${table}: ${error.message}`);
  }

  private async deleteRemote(
    entityType: SyncQueueRow["entity_type"],
    entityId: ID,
  ): Promise<void> {
    const table = ENTITY_TABLE[entityType];
    if (!table) return;
    const { error } = await this.supabase.from(table).delete().eq("id", entityId);
    if (error) throw new Error(`${table} delete: ${error.message}`);
  }
}

const ENTITY_TABLE: Record<SyncQueueRow["entity_type"], string> = {
  product: "products",
  customer: "customers",
  sale: "sales",
  sale_item: "sale_items",
  utang: "utang",
  payment: "payments",
};
