import type { ID, ISODateString, Money } from "@core/types";
import type { Customer } from "@domain/entities";

import type { CustomerRow } from "./CustomerRow";

export const customerRowToEntity = (row: CustomerRow): Customer => ({
  id: row.id as ID,
  storeId: row.store_id as ID,
  name: row.name,
  phone: row.phone ?? undefined,
  notes: row.notes ?? undefined,
  outstandingBalance: row.outstanding_balance as Money,
  createdAt: row.created_at as ISODateString,
  updatedAt: row.updated_at as ISODateString,
});

export const customerToRow = (customer: Customer): CustomerRow => ({
  id: customer.id,
  store_id: customer.storeId,
  name: customer.name,
  phone: customer.phone ?? null,
  notes: customer.notes ?? null,
  outstanding_balance: customer.outstandingBalance,
  created_at: customer.createdAt,
  updated_at: customer.updatedAt,
});
