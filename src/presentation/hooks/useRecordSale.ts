import { useCallback, useState } from "react";

import type { ID, Money } from "@core/types";
import type { CheckoutResult, PosPaymentMode } from "@domain/usecases/pos";

import { useRepositories } from "@/composition/RepositoriesProvider";
import { useAuthStore } from "@presentation/stores";
import { usePosCartStore } from "@presentation/stores/usePosCartStore";

import { useCartTotals } from "./useCartTotals";

export const useRecordSale = () => {
  const { recordSale } = useRepositories();
  const session = useAuthStore((s) => s.session);
  const lines = usePosCartStore((s) => s.lines);
  const clear = usePosCartStore((s) => s.clear);
  const { discount, total } = useCartTotals();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = useCallback(
    async (
      paymentMode: PosPaymentMode,
      customerId?: ID,
      cashPaid?: Money,
    ): Promise<CheckoutResult | null> => {
      if (!session) {
        setError("Not signed in.");
        return null;
      }
      setSubmitting(true);
      setError(null);
      try {
        const result = await recordSale.execute({
          storeId: session.user.storeId,
          createdBy: session.user.id,
          lines: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
          })),
          discount,
          paymentMode,
          customerId,
          cashPaid,
        });
        clear();
        return result;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Checkout failed");
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [session, recordSale, lines, discount, clear],
  );

  return { checkout, submitting, error, total, clearError: () => setError(null) };
};
