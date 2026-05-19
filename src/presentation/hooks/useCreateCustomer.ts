import { useCallback, useState } from "react";

import type { Customer } from "@domain/entities";

import { useRepositories } from "@/composition/RepositoriesProvider";
import { useAuthStore } from "@presentation/stores";

export const useCreateCustomer = () => {
  const { customers } = useRepositories();
  const session = useAuthStore((s) => s.session);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (input: {
      name: string;
      phone?: string;
      notes?: string;
    }): Promise<Customer | null> => {
      if (!session) {
        setError("Not signed in.");
        return null;
      }
      setSubmitting(true);
      setError(null);
      try {
        const customer = await customers.create({
          storeId: session.user.storeId,
          name: input.name.trim(),
          phone: input.phone?.trim() || undefined,
          notes: input.notes?.trim() || undefined,
        });
        return customer;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save customer");
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [customers, session],
  );

  return { create, submitting, error, clearError: () => setError(null) };
};
