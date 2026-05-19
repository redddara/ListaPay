import type { SQLiteDatabase } from "expo-sqlite";

import { DataError } from "@core/errors";
import type { ID, ISODateString, Money } from "@core/types";
import { generateId, nowISO } from "@core/utils/id";
import type {
  Sale,
  SaleLineItem,
  SalePaymentMethod,
} from "@domain/entities";
import type { IPosCheckoutService } from "@domain/services/IPosCheckoutService";
import type {
  CheckoutInput,
  CheckoutResult,
} from "@domain/usecases/pos/types";

import { getDatabase } from "@data/datasources/local/database";
import { enqueueSync } from "@data/datasources/local/sync/syncQueue";
import { computeDebtStatus } from "@data/models/debt/mappers";
import { lineItemToRow, saleToRow } from "@data/models/sale/mappers";
import type { ProductRow } from "@data/models/product/ProductRow";

export class PosCheckoutSqliteService implements IPosCheckoutService {
  constructor(
    private readonly storeId: ID,
    private readonly getDb: () => Promise<SQLiteDatabase> = getDatabase,
  ) {}

  async checkout(input: CheckoutInput): Promise<CheckoutResult> {
    const db = await this.getDb();
    const soldAt = nowISO();
    const saleId = generateId();

    let result: CheckoutResult | undefined;

    try {
      await db.withTransactionAsync(async () => {
        const lineItems: SaleLineItem[] = [];
        let subtotal = 0 as Money;

        for (const line of input.lines) {
          const product = await db.getFirstAsync<ProductRow>(
            "SELECT * FROM products WHERE id = ? AND store_id = ?;",
            line.productId,
            this.storeId,
          );
          if (!product) {
            throw new DataError(
              `Product ${line.productId} not found.`,
              "PRODUCT_NOT_FOUND",
            );
          }

          const unitPrice = product.price as Money;
          const lineTotal = (unitPrice * line.quantity) as Money;
          subtotal = (subtotal + lineTotal) as Money;

          lineItems.push({
            productId: line.productId,
            name: product.name,
            quantity: line.quantity,
            unitPrice,
            lineTotal,
          });

          await db.runAsync(
            "UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ?;",
            line.quantity,
            soldAt,
            line.productId,
          );
          await enqueueSync(db, "product", line.productId, "update", {
            id: line.productId,
            stockDelta: -line.quantity,
          });
        }

        const total = (subtotal - input.discount) as Money;
        const cashPaid = input.cashPaid ?? (0 as Money);
        let paymentMethod: SalePaymentMethod = "cash";
        let debtEntryId: ID | undefined;
        let utangAmount = 0 as Money;

        if (input.paymentMode === "cash") {
          paymentMethod = "cash";
        } else {
          paymentMethod = "utang";
          utangAmount = (total - cashPaid) as Money;
          debtEntryId = generateId();

          const amountPaidOnDebt = cashPaid;
          const balance = utangAmount;
          const status = computeDebtStatus(total, amountPaidOnDebt);

          await db.runAsync(
            `INSERT INTO utang (
              id, store_id, customer_id, sale_id, principal,
              amount_paid, balance, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            debtEntryId,
            this.storeId,
            input.customerId!,
            saleId,
            total,
            amountPaidOnDebt,
            balance,
            status,
            soldAt,
            soldAt,
          );

          await db.runAsync(
            `UPDATE customers
             SET outstanding_balance = outstanding_balance + ?,
                 updated_at = ?
             WHERE id = ? AND store_id = ?;`,
            balance,
            soldAt,
            input.customerId!,
            this.storeId,
          );

          await enqueueSync(db, "utang", debtEntryId, "create", {
            id: debtEntryId,
            customerId: input.customerId,
            saleId,
            principal: total,
            amountPaid: amountPaidOnDebt,
            balance,
            status,
          });

          if (cashPaid > 0 && input.customerId) {
            const paymentId = generateId();
            await db.runAsync(
              `INSERT INTO payments (
                id, store_id, customer_id, debt_entry_id, amount,
                method, paid_at, recorded_by
              ) VALUES (?, ?, ?, ?, ?, 'cash', ?, ?);`,
              paymentId,
              this.storeId,
              input.customerId,
              debtEntryId,
              cashPaid,
              soldAt,
              input.createdBy,
            );
            await enqueueSync(db, "payment", paymentId, "create", {
              id: paymentId,
              debtEntryId,
              amount: cashPaid,
            });
          }
        }

        const sale: Sale = {
          id: saleId,
          storeId: this.storeId,
          customerId: input.customerId,
          items: lineItems,
          subtotal,
          discount: input.discount,
          total,
          paymentMethod,
          debtEntryId,
          soldAt: soldAt as ISODateString,
          createdBy: input.createdBy,
        };

        const saleRow = saleToRow(sale);
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

        for (let i = 0; i < lineItems.length; i++) {
          const item = lineItems[i]!;
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
        }

        await enqueueSync(db, "sale", saleId, "create", sale);

        result = {
          sale,
          debtEntryId,
          cashCollected:
            input.paymentMode === "cash" ? total : cashPaid,
          utangAmount,
        };
      });

      if (!result) {
        throw new DataError("Checkout produced no result.", "CHECKOUT_FAILED");
      }
      return result;
    } catch (cause) {
      if (cause instanceof DataError) throw cause;
      throw new DataError("Checkout failed.", "CHECKOUT_FAILED", cause);
    }
  }
}
