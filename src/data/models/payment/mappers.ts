import type { ID, ISODateString, Money } from "@core/types";
import type { Payment, PaymentMethod } from "@domain/entities";

import type { PaymentRow } from "./PaymentRow";

export const paymentRowToEntity = (row: PaymentRow): Payment => ({
  id: row.id as ID,
  storeId: row.store_id as ID,
  customerId: row.customer_id as ID,
  debtEntryId: row.debt_entry_id as ID,
  amount: row.amount as Money,
  method: row.method as PaymentMethod,
  note: row.note ?? undefined,
  paidAt: row.paid_at as ISODateString,
  recordedBy: row.recorded_by as ID,
});

export const paymentToRow = (payment: Payment): PaymentRow => ({
  id: payment.id,
  store_id: payment.storeId,
  customer_id: payment.customerId,
  debt_entry_id: payment.debtEntryId,
  amount: payment.amount,
  method: payment.method,
  note: payment.note ?? null,
  paid_at: payment.paidAt,
  recorded_by: payment.recordedBy,
});
