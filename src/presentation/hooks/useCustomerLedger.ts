import { useCallback, useEffect, useState } from "react";

import type { ID, Money } from "@core/types";
import type { Customer, DebtEntry, Payment } from "@domain/entities";

import { useRepositories } from "@/composition/RepositoriesProvider";

export const useCustomerLedger = (customerId: ID) => {
  const { customers, debts, payments } = useRepositories();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [entries, setEntries] = useState<DebtEntry[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [outstanding, setOutstanding] = useState(0 as Money);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, debtList, total, paymentList] = await Promise.all([
        customers.getById(customerId),
        debts.listByCustomer(customerId),
        debts.totalOutstandingFor(customerId),
        payments.listByCustomer(customerId),
      ]);
      setCustomer(c);
      setEntries(debtList);
      setOutstanding(total);
      setRecentPayments(paymentList.slice(0, 20));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load ledger");
    } finally {
      setLoading(false);
    }
  }, [customerId, customers, debts, payments]);

  useEffect(() => {
    load();
  }, [load]);

  const activeEntries = entries.filter(
    (e) => e.status === "open" || e.status === "partial",
  );
  const settledEntries = entries.filter(
    (e) => e.status === "paid" || e.status === "written_off",
  );

  return {
    customer,
    entries,
    activeEntries,
    settledEntries,
    recentPayments,
    outstanding,
    loading,
    error,
    reload: load,
  };
};
