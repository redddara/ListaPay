import { DomainError } from "@core/errors";
import type { ID, ISODateString, Money } from "@core/types";
import type { Payment, PaymentMethod } from "@domain/entities";
import type {
  IDebtRepository,
  IPaymentRepository,
} from "@domain/repositories";

export interface RecordPaymentInput {
  storeId: ID;
  customerId: ID;
  debtEntryId: ID;
  amount: Money;
  method: PaymentMethod;
  note?: string;
  paidAt?: ISODateString;
  recordedBy: ID;
}

/**
 * Record a payment against an utang entry. Supports partial payments;
 * balance and status are recalculated in SQLite by the payment repository.
 */
export class RecordPaymentUseCase {
  constructor(
    private readonly debts: IDebtRepository,
    private readonly payments: IPaymentRepository,
  ) {}

  async execute(input: RecordPaymentInput): Promise<Payment> {
    if (input.amount <= 0) {
      throw new DomainError(
        "Payment amount must be greater than zero.",
        "INVALID_AMOUNT",
      );
    }

    const debt = await this.debts.getById(input.debtEntryId);
    if (!debt) {
      throw new DomainError("Utang entry not found.", "DEBT_NOT_FOUND");
    }

    if (debt.customerId !== input.customerId) {
      throw new DomainError(
        "Customer does not match this utang entry.",
        "CUSTOMER_MISMATCH",
      );
    }

    if (debt.status === "paid" || debt.status === "written_off") {
      throw new DomainError(
        "This utang entry is already settled.",
        "DEBT_CLOSED",
      );
    }

    if (input.amount > debt.balance) {
      throw new DomainError(
        `Payment cannot exceed remaining balance (${debt.balance} centavos).`,
        "OVERPAYMENT",
      );
    }

    return this.payments.create({
      storeId: input.storeId,
      customerId: input.customerId,
      debtEntryId: input.debtEntryId,
      amount: input.amount,
      method: input.method,
      note: input.note,
      paidAt: input.paidAt ?? (new Date().toISOString() as ISODateString),
      recordedBy: input.recordedBy,
    });
  }
}
