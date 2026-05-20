/** Remove the auth hash after Supabase has read tokens from the URL. */
export const clearWebAuthHash = (): void => {
  if (typeof window === "undefined") return;
  if (!window.location.hash) return;
  window.history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search,
  );
};

/**
 * Reads Supabase auth **error** params from the URL hash (expired confirm link, etc.).
 * Does not clear the hash when tokens are present — call `clearWebAuthHash` after
 * `getSession()` so email confirmation can complete.
 */
export const consumeWebAuthRedirect = (): string | null => {
  if (typeof window === "undefined") return null;

  const raw = window.location.hash?.replace(/^#/, "");
  if (!raw) return null;

  const params = new URLSearchParams(raw);
  const error = params.get("error");
  const errorCode = params.get("error_code");
  const description = params.get("error_description")?.replace(/\+/g, " ");

  if (!error) return null;

  clearWebAuthHash();

  if (errorCode === "otp_expired") {
    return "That confirmation link has expired. Sign in with your email and password, or create a new account to get another email.";
  }

  return (
    description ??
    "Sign-in link could not be used. Try signing in with your email and password."
  );
};
