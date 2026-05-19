import type { ID, Page, PageParams } from "@core/types";
import type { Sale } from "@domain/entities";

export interface ISaleRepository {
  list(params: PageParams): Promise<Page<Sale>>;
  getById(id: ID): Promise<Sale | null>;
  listByCustomer(customerId: ID, params: PageParams): Promise<Page<Sale>>;
  create(input: Omit<Sale, "id">): Promise<Sale>;
  void(id: ID, reason: string): Promise<void>;
}
