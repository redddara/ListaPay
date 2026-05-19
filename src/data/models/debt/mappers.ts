import type { ID, ISODateString, Money } from "@core/types";
import type { DebtEntry, DebtStatus } from "@domain/entities";
import {
  computeBalance,
  computeDebtStatus,
} from "@domain/utils/debtBalance";

import type { UtangRow } from "./UtangRow";

export { computeBalance, computeDebtStatus } from "@domain/utils/debtBalance";

export const utangRowToEntity = (row: UtangRow): DebtEntry => ({
  id: row.id as ID,
  storeId: row.store_id as ID,
  customerId: row.customer_id as ID,
  saleId: (row.sale_id as ID) ?? undefined,
  principal: row.principal as Money,
  amountPaid: row.amount_paid as Money,
  balance: row.balance as Money,
  status: row.status as DebtStatus,
  note: row.note ?? undefined,
  dueDate: (row.due_date as ISODateString) ?? undefined,
  createdAt: row.created_at as ISODateString,
  updatedAt: row.updated_at as ISODateString,
});

export const debtEntryToRow = (entry: DebtEntry): UtangRow => ({
  id: entry.id,
  store_id: entry.storeId,
  customer_id: entry.customerId,
  sale_id: entry.saleId ?? null,
  principal: entry.principal,
  amount_paid: entry.amountPaid,
  balance: entry.balance,
  status: entry.status,
  note: entry.note ?? null,
  due_date: entry.dueDate ?? null,
  created_at: entry.createdAt,
  updated_at: entry.updatedAt,
});
