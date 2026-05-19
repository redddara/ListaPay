import type { ID, Page, PageParams } from "@core/types";
import type { Customer } from "@domain/entities";

export interface ICustomerRepository {
  list(params: PageParams): Promise<Page<Customer>>;
  getById(id: ID): Promise<Customer | null>;
  create(
    input: Omit<Customer, "id" | "createdAt" | "updatedAt" | "outstandingBalance">,
  ): Promise<Customer>;
  update(id: ID, patch: Partial<Customer>): Promise<Customer>;
  delete(id: ID): Promise<void>;
  search(query: string): Promise<Customer[]>;
}
