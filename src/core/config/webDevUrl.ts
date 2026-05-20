/** Web dev URL with COEP headers (see `npm run web` / scripts/coep-proxy.mjs). */
export const getWebDevUrl = (): string =>
  process.env.EXPO_PUBLIC_WEB_URL ?? "http://localhost:19006";
