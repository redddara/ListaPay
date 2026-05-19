import { useCallback, useEffect, useState } from "react";

import type { ID } from "@core/types";
import type { Customer, DebtEntry, Payment } from "@domain/entities";

import { useRepositories } from "@/composition/RepositoriesProvider";

export const useUtangDetail = (debtEntryId: ID) => {
  const { debts, payments, customers } = useRepositories();
  const [entry, setEntry] = useState<DebtEntry | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const debt = await debts.getById(debtEntryId);
      if (!debt) {
        setError("Utang entry not found.");
        setEntry(null);
        return;
      }
      const [c, history] = await Promise.all([
        customers.getById(debt.customerId),
        payments.listByDebt(debtEntryId),
      ]);
      setEntry(debt);
      setCustomer(c);
      setPaymentHistory(history);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load utang");
    } finally {
      setLoading(false);
    }
  }, [debtEntryId, debts, payments, customers]);

  useEffect(() => {
    load();
  }, [load]);

  return { entry, customer, paymentHistory, loading, error, reload: load };
};
