import type { ID, ISODateString, Money } from "@core/types";

/** A `Suki` — a regular customer of the sari-sari store. */
export interface Customer {
  id: ID;
  storeId: ID;
  name: string;
  phone?: string;
  notes?: string;
  /** Cached outstanding debt for fast list rendering. */
  outstandingBalance: Money;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
