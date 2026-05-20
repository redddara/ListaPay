import { getWebDevUrl } from "@core/config/webDevUrl";

/** True when the URL hash is a Supabase email-confirm / magic-link callback. */
export const isSupabaseAuthCallbackHash = (hash: string): boolean => {
  const raw = hash.replace(/^#/, "");
  if (!raw) return false;
  const params = new URLSearchParams(raw);
  return (
    params.has("access_token") ||
    params.has("refresh_token") ||
    params.has("error") ||
    params.has("error_code")
  );
};

/**
 * Email links often point at Expo (:8081), which cannot run SQLite on web.
 * Bounce auth callbacks to the COEP proxy port before the app boots.
 */
export const ensureWebIsolatedPortForAuthCallback = (): void => {
  if (typeof window === "undefined") return;

  const hash = window.location.hash;
  if (!isSupabaseAuthCallbackHash(hash)) return;

  const devUrl = new URL(getWebDevUrl());
  const currentPort = window.location.port;

  if (currentPort === devUrl.port) return;

  // Typical mistake: Supabase / email link still uses :8081.
  if (currentPort === "8081" || currentPort === "") {
    const target = `${devUrl.origin}${window.location.pathname}${window.location.search}${hash}`;
    window.location.replace(target);
  }
};
