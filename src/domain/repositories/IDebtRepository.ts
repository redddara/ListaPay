import type { ID, Money, Page, PageParams } from "@core/types";
import type { DebtEntry } from "@domain/entities";

export interface IDebtRepository {
  list(params: PageParams): Promise<Page<DebtEntry>>;
  getById(id: ID): Promise<DebtEntry | null>;
  listByCustomer(customerId: ID): Promise<DebtEntry[]>;
  create(
    input: Omit<DebtEntry, "id" | "createdAt" | "updatedAt">,
  ): Promise<DebtEntry>;
  update(id: ID, patch: Partial<DebtEntry>): Promise<DebtEntry>;
  /** Sum of all open balances for a given customer. */
  totalOutstandingFor(customerId: ID): Promise<Money>;
}
