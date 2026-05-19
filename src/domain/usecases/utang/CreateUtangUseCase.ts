import { DomainError } from "@core/errors";
import type { ID, ISODateString, Money } from "@core/types";
import type { DebtEntry } from "@domain/entities";
import type { ICustomerRepository, IDebtRepository } from "@domain/repositories";
import { computeBalance, computeDebtStatus } from "@domain/utils/debtBalance";

export interface CreateUtangInput {
  storeId: ID;
  customerId: ID;
  principal: Money;
  saleId?: ID;
  note?: string;
  dueDate?: ISODateString;
}

/** Create a manual utang entry (not from POS checkout). */
export class CreateUtangUseCase {
  constructor(
    private readonly customers: ICustomerRepository,
    private readonly debts: IDebtRepository,
  ) {}

  async execute(input: CreateUtangInput): Promise<DebtEntry> {
    if (input.principal <= 0) {
      throw new DomainError(
        "Utang amount must be greater than zero.",
        "INVALID_PRINCIPAL",
      );
    }

    const customer = await this.customers.getById(input.customerId);
    if (!customer) {
      throw new DomainError("Customer not found.", "CUSTOMER_NOT_FOUND");
    }

    const amountPaid = 0 as Money;
    const balance = computeBalance(input.principal, amountPaid);
    const status = computeDebtStatus(input.principal, amountPaid);

    return this.debts.create({
      storeId: input.storeId,
      customerId: input.customerId,
      saleId: input.saleId,
      principal: input.principal,
      amountPaid,
      balance,
      status,
      note: input.note,
      dueDate: input.dueDate,
    });
  }
}
