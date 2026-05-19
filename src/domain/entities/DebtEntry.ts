import type { ID, ISODateString, Money } from "@core/types";

export type DebtStatus = "open" | "partial" | "paid" | "written_off";

/**
 * A `DebtEntry` is a single entry in the customer's "lista" (utang list).
 * It represents the original amount owed for a given sale or manual entry.
 */
export interface DebtEntry {
  id: ID;
  storeId: ID;
  customerId: ID;
  saleId?: ID;
  principal: Money;
  amountPaid: Money;
  balance: Money;
  status: DebtStatus;
  note?: string;
  dueDate?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
