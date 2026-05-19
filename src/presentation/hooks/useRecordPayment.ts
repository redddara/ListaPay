import { useCallback, useState } from "react";

import type { ID, Money } from "@core/types";
import type { Payment, PaymentMethod } from "@domain/entities";

import { useRepositories } from "@/composition/RepositoriesProvider";
import { useAuthStore } from "@presentation/stores";

export const useRecordPayment = (onSuccess?: () => void) => {
  const { recordPayment } = useRepositories();
  const session = useAuthStore((s) => s.session);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = useCallback(
    async (input: {
      customerId: ID;
      debtEntryId: ID;
      amount: Money;
      method: PaymentMethod;
      note?: string;
    }): Promise<Payment | null> => {
      if (!session) {
        setError("Not signed in.");
        return null;
      }
      setSubmitting(true);
      setError(null);
      try {
        const payment = await recordPayment.execute({
          ...input,
          storeId: session.user.storeId,
          recordedBy: session.user.id,
        });
        onSuccess?.();
        return payment;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Payment failed");
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [session, recordPayment, onSuccess],
  );

  return { pay, submitting, error, clearError: () => setError(null) };
};
