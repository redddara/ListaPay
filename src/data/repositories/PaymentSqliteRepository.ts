import type { SQLiteDatabase } from "expo-sqlite";

import { DataError } from "@core/errors";
import type { ID, Money, Page, PageParams } from "@core/types";
import { generateId, nowISO } from "@core/utils/id";
import type { Payment } from "@domain/entities";
import type { IPaymentRepository } from "@domain/repositories";

import { getDatabase } from "@data/datasources/local/database";
import { fetchKeysetPage } from "@data/datasources/local/sql/helpers";
import { enqueueSync } from "@data/datasources/local/sync/syncQueue";
import {
  computeDebtStatus,
  utangRowToEntity,
} from "@data/models/debt/mappers";
import type { UtangRow } from "@data/models/debt/UtangRow";
import {
  paymentRowToEntity,
  paymentToRow,
} from "@data/models/payment/mappers";
import type { PaymentRow } from "@data/models/payment/PaymentRow";

import { requireRow } from "./sqlite/requireRow";

export class PaymentSqliteRepository implements IPaymentRepository {
  constructor(
    private readonly storeId: ID,
    private readonly getDb: () => Promise<SQLiteDatabase> = getDatabase,
  ) {}

  async list(params: PageParams): Promise<Page<Payment>> {
    const db = await this.getDb();
    return fetchKeysetPage<PaymentRow, Payment>(
      db,
      {
        table: "payments",
        storeId: this.storeId,
        timeColumn: "paid_at",
        params,
      },
      paymentRowToEntity,
    );
  }

  async getById(id: ID): Promise<Payment | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<PaymentRow>(
      "SELECT * FROM payments WHERE id = ? AND store_id = ?;",
      id,
      this.storeId,
    );
    return row ? paymentRowToEntity(row) : null;
  }

  async listByCustomer(customerId: ID): Promise<Payment[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<PaymentRow>(
      `SELECT * FROM payments
       WHERE store_id = ? AND customer_id = ?
       ORDER BY paid_at DESC;`,
      this.storeId,
      customerId,
    );
    return rows.map(paymentRowToEntity);
  }

  async listByDebt(debtEntryId: ID): Promise<Payment[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<PaymentRow>(
      `SELECT * FROM payments
       WHERE store_id = ? AND debt_entry_id = ?
       ORDER BY paid_at DESC;`,
      this.storeId,
      debtEntryId,
    );
    return rows.map(paymentRowToEntity);
  }

  async create(input: Omit<Payment, "id">): Promise<Payment> {
    const db = await this.getDb();
    const id = generateId();
    const payment: Payment = { ...input, id, storeId: this.storeId };

    try {
      await db.withTransactionAsync(async () => {
        const row = paymentToRow(payment);
        await db.runAsync(
          `INSERT INTO payments (
            id, store_id, customer_id, debt_entry_id, amount,
            method, note, paid_at, recorded_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          row.id,
          row.store_id,
          row.customer_id,
          row.debt_entry_id,
          row.amount,
          row.method,
          row.note,
          row.paid_at,
          row.recorded_by,
        );

        const utang = requireRow(
          await db.getFirstAsync<UtangRow>(
            "SELECT * FROM utang WHERE id = ? AND store_id = ?;",
            payment.debtEntryId,
            this.storeId,
          ),
          "DebtEntry",
          payment.debtEntryId,
        );

        const amountPaid = (utang.amount_paid + payment.amount) as Money;
        const balance = (utang.principal - amountPaid) as Money;
        const status = computeDebtStatus(
          utang.principal as Money,
          amountPaid,
        );
        const ts = nowISO();

        await db.runAsync(
          `UPDATE utang SET
            amount_paid = ?, balance = ?, status = ?, updated_at = ?
           WHERE id = ?;`,
          amountPaid,
          balance,
          status,
          ts,
          payment.debtEntryId,
        );

        await db.runAsync(
          `UPDATE customers
           SET outstanding_balance = MAX(0, outstanding_balance - ?),
               updated_at = ?
           WHERE id = ? AND store_id = ?;`,
          payment.amount,
          ts,
          payment.customerId,
          this.storeId,
        );

        await enqueueSync(db, "payment", id, "create", payment);
        await enqueueSync(db, "utang", payment.debtEntryId, "update", {
          id: payment.debtEntryId,
          amountPaid,
          balance,
          status,
        });
        await enqueueSync(db, "customer", payment.customerId, "update", {
          customerId: payment.customerId,
          outstandingDelta: -payment.amount,
        });
      });
    } catch (cause) {
      throw new DataError("Failed to create payment.", "DB_WRITE", cause);
    }

    return payment;
  }

  async delete(id: ID): Promise<void> {
    const payment = requireRow(await this.getById(id), "Payment", id);
    const db = await this.getDb();

    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          "DELETE FROM payments WHERE id = ? AND store_id = ?;",
          id,
          this.storeId,
        );

        const utang = requireRow(
          await db.getFirstAsync<UtangRow>(
            "SELECT * FROM utang WHERE id = ? AND store_id = ?;",
            payment.debtEntryId,
            this.storeId,
          ),
          "DebtEntry",
          payment.debtEntryId,
        );

        const amountPaid = Math.max(
          0,
          utang.amount_paid - payment.amount,
        ) as Money;
        const balance = (utang.principal - amountPaid) as Money;
        const status = computeDebtStatus(
          utang.principal as Money,
          amountPaid,
        );
        const ts = nowISO();

        await db.runAsync(
          `UPDATE utang SET
            amount_paid = ?, balance = ?, status = ?, updated_at = ?
           WHERE id = ?;`,
          amountPaid,
          balance,
          status,
          ts,
          payment.debtEntryId,
        );

        await db.runAsync(
          `UPDATE customers
           SET outstanding_balance = outstanding_balance + ?,
               updated_at = ?
           WHERE id = ? AND store_id = ?;`,
          payment.amount,
          ts,
          payment.customerId,
          this.storeId,
        );

        await enqueueSync(db, "payment", id, "delete", { id });
      });
    } catch (cause) {
      throw new DataError("Failed to delete payment.", "DB_WRITE", cause);
    }
  }
}
