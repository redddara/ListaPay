import type { ID } from "@core/types";

import { CustomerSqliteRepository } from "./CustomerSqliteRepository";
import { DebtSqliteRepository } from "./DebtSqliteRepository";
import { PaymentSqliteRepository } from "./PaymentSqliteRepository";
import { ProductSqliteRepository } from "./ProductSqliteRepository";
import { SaleSqliteRepository } from "./SaleSqliteRepository";
import { SyncQueueSqliteRepository } from "./SyncQueueSqliteRepository";

export { AuthSupabaseRepository } from "./AuthSupabaseRepository";
export { CustomerSqliteRepository } from "./CustomerSqliteRepository";
export { DebtSqliteRepository } from "./DebtSqliteRepository";
export { PaymentSqliteRepository } from "./PaymentSqliteRepository";
export { ProductSqliteRepository } from "./ProductSqliteRepository";
export { SaleSqliteRepository } from "./SaleSqliteRepository";
export { SyncQueueSqliteRepository } from "./SyncQueueSqliteRepository";

/** Factory for all local SQLite repositories scoped to one store. */
export const createLocalRepositories = (storeId: ID) => ({
  products: new ProductSqliteRepository(storeId),
  customers: new CustomerSqliteRepository(storeId),
  sales: new SaleSqliteRepository(storeId),
  debts: new DebtSqliteRepository(storeId),
  payments: new PaymentSqliteRepository(storeId),
  syncQueue: new SyncQueueSqliteRepository(),
});

export type LocalRepositories = ReturnType<typeof createLocalRepositories>;
