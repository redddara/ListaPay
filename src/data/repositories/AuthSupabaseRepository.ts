import type { Session } from "@supabase/supabase-js";

import { getAuthRedirectUrl } from "@core/auth";
import { AuthError, DataError } from "@core/errors";
import { isSupabaseConfigured } from "@core/config/env";
import type { ID, ISODateString } from "@core/types";
import type { User, UserRole } from "@domain/entities";
import type { AuthSession, IAuthRepository } from "@domain/repositories";

import { getSupabaseClient } from "@data/datasources/remote/supabaseClient";
import type { ProfileDto } from "@data/models/remote/types";

const mapProfileToUser = (profile: ProfileDto): User => ({
  id: profile.id as ID,
  email: profile.email,
  displayName: profile.display_name,
  role: profile.role as UserRole,
  storeId: profile.store_id as ID,
  createdAt: profile.created_at as ISODateString,
});

const mapSession = (
  session: Session,
  profile: ProfileDto,
): AuthSession => ({
  accessToken: session.access_token,
  refreshToken: session.refresh_token,
  expiresAt: session.expires_at
    ? session.expires_at * 1000
    : Date.now() + 3600_000,
  user: mapProfileToUser(profile),
});

export class AuthSupabaseRepository implements IAuthRepository {
  private get client() {
    return getSupabaseClient();
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await this.client.auth.getSession();
    if (error) {
      throw new AuthError(error.message, "AUTH_SESSION", error);
    }
    if (!data.session?.user) return null;

    const profile = await this.fetchProfile(data.session.user.id);
    if (!profile) return null;

    return mapSession(data.session, profile);
  }

  async signInWithPassword(
    email: string,
    password: string,
  ): Promise<AuthSession> {
    this.ensureConfigured();

    const { data, error } = await this.client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw new AuthError(error.message, "AUTH_SIGN_IN", error);
    }
    if (!data.session) {
      throw new AuthError("No session returned.", "AUTH_NO_SESSION");
    }

    let profile = await this.fetchProfile(data.session.user.id);
    if (!profile) {
      await this.ensureStoreSetup("Store Owner");
      profile = await this.fetchProfile(data.session.user.id);
    }
    if (!profile) {
      throw new AuthError(
        "Profile not found. Complete store setup in Supabase.",
        "AUTH_NO_PROFILE",
      );
    }

    return mapSession(data.session, profile);
  }

  async signUpWithPassword(
    email: string,
    password: string,
    displayName: string,
  ): Promise<AuthSession> {
    this.ensureConfigured();

    const { data, error } = await this.client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });

    if (error) {
      throw new AuthError(error.message, "AUTH_SIGN_UP", error);
    }
    if (!data.session) {
      throw new AuthError(
        "Check your email to confirm your account, then sign in.",
        "AUTH_CONFIRM_EMAIL",
      );
    }

    await this.ensureStoreSetup(displayName);
    const profile = await this.fetchProfile(data.session.user.id);
    if (!profile) {
      throw new AuthError("Failed to create store profile.", "AUTH_NO_PROFILE");
    }

    return mapSession(data.session, profile);
  }

  async signOut(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const { error } = await this.client.auth.signOut();
    if (error) {
      throw new AuthError(error.message, "AUTH_SIGN_OUT", error);
    }
  }

  onAuthStateChange(
    callback: (session: AuthSession | null) => void,
  ): () => void {
    if (!isSupabaseConfigured()) {
      return () => {};
    }

    const { data } = this.client.auth.onAuthStateChange(async (_event, sess) => {
      if (!sess?.user) {
        callback(null);
        return;
      }
      try {
        const profile = await this.fetchProfile(sess.user.id);
        if (profile) {
          callback(mapSession(sess, profile));
        } else {
          callback(null);
        }
      } catch {
        callback(null);
      }
    });

    return () => data.subscription.unsubscribe();
  }

  private ensureConfigured(): void {
    if (!isSupabaseConfigured()) {
      throw new AuthError(
        "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env",
        "SUPABASE_NOT_CONFIGURED",
      );
    }
  }

  private async fetchProfile(userId: string): Promise<ProfileDto | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw new DataError(error.message, "PROFILE_FETCH", error);
    }
    return data as ProfileDto | null;
  }

  private async ensureStoreSetup(displayName: string): Promise<void> {
    const { error } = await this.client.rpc("setup_new_store", {
      p_display_name: displayName,
      p_store_name: `${displayName}'s Store`,
    });
    if (error) {
      throw new DataError(error.message, "STORE_SETUP", error);
    }
  }
}
