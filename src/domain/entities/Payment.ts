import type { ID, ISODateString, Money } from "@core/types";

export type PaymentMethod = "cash" | "gcash" | "bank_transfer" | "other";

/** A payment made by a customer against one or more `DebtEntry`s. */
export interface Payment {
  id: ID;
  storeId: ID;
  customerId: ID;
  debtEntryId: ID;
  amount: Money;
  method: PaymentMethod;
  note?: string;
  paidAt: ISODateString;
  recordedBy: ID;
}
