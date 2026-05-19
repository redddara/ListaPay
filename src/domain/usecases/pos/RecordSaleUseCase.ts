import { DomainError } from "@core/errors";
import type { Money } from "@core/types";
import { toMoney } from "@core/utils";
import type { IProductRepository } from "@domain/repositories";
import type { IPosCheckoutService } from "@domain/services/IPosCheckoutService";

import type { CheckoutInput, CheckoutResult } from "./types";

export class RecordSaleUseCase {
  constructor(
    private readonly products: IProductRepository,
    private readonly checkout: IPosCheckoutService,
  ) {}

  async execute(input: CheckoutInput): Promise<CheckoutResult> {
    if (input.lines.length === 0) {
      throw new DomainError("Cart is empty.", "CART_EMPTY");
    }

    if (
      (input.paymentMode === "utang" || input.paymentMode === "partial") &&
      !input.customerId
    ) {
      throw new DomainError(
        "Select a customer for utang or partial payment.",
        "CUSTOMER_REQUIRED",
      );
    }

    const productIds = input.lines.map((l) => l.productId);
    const products = await Promise.all(
      productIds.map((id) => this.products.getById(id)),
    );

    let subtotal = 0 as Money;
    for (let i = 0; i < input.lines.length; i++) {
      const line = input.lines[i]!;
      const product = products[i];
      if (!product) {
        throw new DomainError(
          `Product not found.`,
          "PRODUCT_NOT_FOUND",
        );
      }
      if (line.quantity <= 0) {
        throw new DomainError(
          `Invalid quantity for ${product.name}.`,
          "INVALID_QUANTITY",
        );
      }
      if (product.stock < line.quantity) {
        throw new DomainError(
          `Insufficient stock for ${product.name} (${product.stock} left).`,
          "INSUFFICIENT_STOCK",
        );
      }
      subtotal = (subtotal + product.price * line.quantity) as Money;
    }

    const total = (subtotal - input.discount) as Money;
    if (total < 0) {
      throw new DomainError(
        "Discount cannot exceed subtotal.",
        "INVALID_DISCOUNT",
      );
    }

    const cashPaid = input.cashPaid ?? (0 as Money);

    if (input.paymentMode === "cash" && cashPaid > 0 && cashPaid !== total) {
      throw new DomainError(
        "Cash sales should not specify a separate cash amount.",
        "INVALID_CASH",
      );
    }

    if (input.paymentMode === "utang" && cashPaid > 0) {
      throw new DomainError(
        "Full utang sales cannot include a cash payment.",
        "INVALID_UTANG",
      );
    }

    if (input.paymentMode === "partial") {
      if (cashPaid <= 0) {
        throw new DomainError(
          "Enter the cash amount for a partial payment.",
          "CASH_REQUIRED",
        );
      }
      if (cashPaid >= total) {
        throw new DomainError(
          "Partial cash must be less than the total. Use cash payment instead.",
          "USE_CASH",
        );
      }
    }

    return this.checkout.checkout({
      ...input,
      discount: input.discount,
    });
  }
}

/** Helper for UI: compute cart subtotal from line unit prices (centavos). */
export const computeCartSubtotal = (
  lines: Array<{ unitPrice: Money; quantity: number }>,
): Money =>
  lines.reduce(
    (sum, l) => (sum + l.unitPrice * l.quantity) as Money,
    0 as Money,
  );

export const computeCartTotal = (
  subtotal: Money,
  discount: Money,
): Money => Math.max(0, subtotal - discount) as Money;

export { toMoney };
