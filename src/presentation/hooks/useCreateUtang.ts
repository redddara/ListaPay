import { useCallback, useState } from "react";

import type { Money } from "@core/types";
import type { DebtEntry } from "@domain/entities";
import type { CreateUtangInput } from "@domain/usecases/utang/CreateUtangUseCase";

import { useRepositories } from "@/composition/RepositoriesProvider";
import { useAuthStore } from "@presentation/stores";

export const useCreateUtang = (onSuccess?: () => void) => {
  const { createUtang } = useRepositories();
  const session = useAuthStore((s) => s.session);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (
      input: Omit<CreateUtangInput, "storeId">,
    ): Promise<DebtEntry | null> => {
      if (!session) {
        setError("Not signed in.");
        return null;
      }
      setSubmitting(true);
      setError(null);
      try {
        const entry = await createUtang.execute({
          ...input,
          storeId: session.user.storeId,
        });
        onSuccess?.();
        return entry;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create utang");
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [session, createUtang, onSuccess],
  );

  return { create, submitting, error, clearError: () => setError(null) };
};

export type { Money };
