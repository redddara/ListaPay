/** Returns a user-facing message when the browser cannot run expo-sqlite on web. */
export const getWebSqliteBlocker = (): string | null => {
  if (typeof window === "undefined") return null;

  if (!window.isSecureContext) {
    return "Open ListaPay at http://localhost:8081 (secure context required). Do not use a file:// URL.";
  }

  if (
    typeof SharedArrayBuffer === "undefined" ||
    (typeof window.crossOriginIsolated === "boolean" &&
      !window.crossOriginIsolated)
  ) {
    const port =
      typeof window.location?.port === "string" ? window.location.port : "";
    const onExpoDirect = port === "8081" || port === "";

    return onExpoDirect
      ? "Web SQLite needs an isolated page. Stop Expo, then run `npm run web` and open http://localhost:19006 (not :8081). Or use Expo Go on your phone (QR code in the terminal)."
      : "This browser tab cannot run local SQLite (cross-origin isolation is off). Use Chrome or Edge, run `npm run web`, open http://localhost:19006, or use Expo Go on your phone.";
  }

  if (typeof Worker === "undefined") {
    return "Web Workers are not available in this browser.";
  }

  if (!navigator.storage?.getDirectory) {
    return "This browser does not support the storage API needed for SQLite on web. Try Chrome, Edge, or Expo Go on a phone.";
  }

  return null;
};
