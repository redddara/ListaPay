import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

import { env, isSupabaseConfigured } from "@core/config/env";
import { logger } from "@core/utils";

const log = logger.scope("supabase");

let _client: SupabaseClient | null = null;

/**
 * Lazily-constructed Supabase client.
 *
 * The URL and anon key come from `EXPO_PUBLIC_SUPABASE_*` env vars. If they
 * are not configured the client is still created with empty values so the
 * app boots in "offline" mode — repository implementations should guard
 * against this via `isSupabaseConfigured()` before issuing network calls.
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (_client) return _client;

  if (!isSupabaseConfigured()) {
    log.warn(
      "Supabase env vars are missing. Set EXPO_PUBLIC_SUPABASE_URL and " +
        "EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.",
    );
  }

  _client = createClient(env.supabase.url, env.supabase.anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Web email-confirm links return tokens in the URL hash.
      detectSessionInUrl: Platform.OS === "web",
    },
  });

  return _client;
};

/** Test/teardown helper. */
export const __resetSupabaseClient = (): void => {
  _client = null;
};
