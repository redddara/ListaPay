import React, { createContext, useContext, useMemo, type PropsWithChildren } from "react";

import type { ID } from "@core/types";
import { RecordSaleUseCase } from "@domain/usecases/pos";
import {
  CreateUtangUseCase,
  RecordPaymentUseCase,
} from "@domain/usecases/utang";
import type { IPosCheckoutService } from "@domain/services/IPosCheckoutService";
import type {
  ICustomerRepository,
  IDebtRepository,
  IPaymentRepository,
  IProductRepository,
  ISaleRepository,
} from "@domain/repositories";

import { createLocalRepositories, type LocalRepositories } from "@data/repositories";
import { PosCheckoutSqliteService } from "@data/services/PosCheckoutSqliteService";

export interface AppRepositories extends LocalRepositories {
  checkout: IPosCheckoutService;
  recordSale: RecordSaleUseCase;
  createUtang: CreateUtangUseCase;
  recordPayment: RecordPaymentUseCase;
}

const RepositoriesContext = createContext<AppRepositories | null>(null);

export const RepositoriesProvider = ({
  storeId,
  children,
}: PropsWithChildren<{ storeId: ID }>) => {
  const value = useMemo(() => {
    const local = createLocalRepositories(storeId);
    const checkout = new PosCheckoutSqliteService(storeId);
    const recordSale = new RecordSaleUseCase(local.products, checkout);
    const createUtang = new CreateUtangUseCase(
      local.customers,
      local.debts,
    );
    const recordPayment = new RecordPaymentUseCase(
      local.debts,
      local.payments,
    );
    return {
      ...local,
      checkout,
      recordSale,
      createUtang,
      recordPayment,
    };
  }, [storeId]);

  return (
    <RepositoriesContext.Provider value={value}>
      {children}
    </RepositoriesContext.Provider>
  );
};

export const useRepositories = (): AppRepositories => {
  const ctx = useContext(RepositoriesContext);
  if (!ctx) {
    throw new Error("useRepositories must be used within RepositoriesProvider");
  }
  return ctx;
};

export type {
  ICustomerRepository,
  IDebtRepository,
  IPaymentRepository,
  IProductRepository,
  ISaleRepository,
};
