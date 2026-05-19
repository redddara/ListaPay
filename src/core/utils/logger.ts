/* eslint-disable no-console */
type Level = "debug" | "info" | "warn" | "error";

const isDev = __DEV__;

const log = (level: Level, scope: string, msg: string, meta?: unknown) => {
  if (!isDev && level === "debug") return;
  const line = `[ListaPay:${scope}] ${msg}`;
  if (meta !== undefined) console[level](line, meta);
  else console[level](line);
};

export const logger = {
  scope: (scope: string) => ({
    debug: (msg: string, meta?: unknown) => log("debug", scope, msg, meta),
    info: (msg: string, meta?: unknown) => log("info", scope, msg, meta),
    warn: (msg: string, meta?: unknown) => log("warn", scope, msg, meta),
    error: (msg: string, meta?: unknown) => log("error", scope, msg, meta),
  }),
};

export type Logger = ReturnType<typeof logger.scope>;
