/**
 * Public runtime configuration.
 *
 * Values are sourced from `EXPO_PUBLIC_*` environment variables, which Expo
 * inlines into the JS bundle at build time. NEVER put service-role keys here —
 * only public/anon credentials that are safe to ship in a mobile client.
 *
 * Configure these in a local `.env` file (see `.env.example`).
 */
export const env = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  },
  app: {
    name: "ListaPay",
    env: (process.env.EXPO_PUBLIC_APP_ENV ?? "development") as
      | "development"
      | "staging"
      | "production",
  },
} as const;

export type AppEnv = typeof env;

export const isSupabaseConfigured = (): boolean =>
  Boolean(env.supabase.url) && Boolean(env.supabase.anonKey);
