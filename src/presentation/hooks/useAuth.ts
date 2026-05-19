import { useCallback, useState } from "react";

import { isSupabaseConfigured } from "@core/config/env";
import type { AuthSession } from "@domain/repositories";

import { authRepo } from "@/composition/AuthProvider";
import { useAuthStore } from "@presentation/stores";

export const useAuth = () => {
  const { session, status, setSession, signOut: clearLocal } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthSession | null> => {
      setLoading(true);
      setError(null);
      try {
        const next = await authRepo.signInWithPassword(email, password);
        setSession(next);
        return next;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sign in failed");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setSession],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
    ): Promise<AuthSession | null> => {
      setLoading(true);
      setError(null);
      try {
        const next = await authRepo.signUpWithPassword(
          email,
          password,
          displayName,
        );
        setSession(next);
        return next;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sign up failed");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setSession],
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await authRepo.signOut();
    } finally {
      clearLocal();
      setLoading(false);
    }
  }, [clearLocal]);

  const devBypass = useCallback(() => {
    setSession({
      accessToken: "dev",
      refreshToken: "dev",
      expiresAt: Date.now() + 3600_000,
      user: {
        id: "dev-user" as never,
        email: "owner@listapay.test",
        displayName: "Store Owner",
        role: "owner",
        storeId: "dev-store" as never,
        createdAt: new Date().toISOString() as never,
      },
    });
  }, [setSession]);

  return {
    session,
    status,
    loading,
    error,
    clearError: () => setError(null),
    signIn,
    signUp,
    signOut,
    devBypass,
    isSupabaseConfigured: isSupabaseConfigured(),
  };
};
