export const APP_CONSTANTS = {
  /** Default fiat currency for a Philippine sari-sari store. */
  CURRENCY_CODE: "PHP",
  CURRENCY_SYMBOL: "₱",
  LOCALE: "en-PH",

  /** Local SQLite database file name (lives in the app sandbox). */
  DB_NAME: "listapay.db",

  /** Storage keys used by the auth/session layer. */
  STORAGE_KEYS: {
    AUTH_SESSION: "listapay.auth.session",
    THEME_PREFERENCE: "listapay.preferences.theme",
    ONBOARDING_COMPLETE: "listapay.preferences.onboarded",
  },
} as const;

export type AppConstants = typeof APP_CONSTANTS;
