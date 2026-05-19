import type { ID, Page, PageParams } from "@core/types";
import type { Payment } from "@domain/entities";

export interface IPaymentRepository {
  list(params: PageParams): Promise<Page<Payment>>;
  getById(id: ID): Promise<Payment | null>;
  listByCustomer(customerId: ID): Promise<Payment[]>;
  listByDebt(debtEntryId: ID): Promise<Payment[]>;
  create(input: Omit<Payment, "id">): Promise<Payment>;
  delete(id: ID): Promise<void>;
}
