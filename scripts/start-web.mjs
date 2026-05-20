/**
 * Starts Expo and the COEP proxy so web SQLite (SharedArrayBuffer) works.
 */
import { spawn } from "node:child_process";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const targetPort = Number(process.env.EXPO_DEV_SERVER_PORT ?? "8081");
const proxyPort = Number(process.env.COEP_PROXY_PORT ?? "19006");

const waitForPort = (port, timeoutMs = 120_000) =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      const req = http.get(`http://127.0.0.1:${port}/status`, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode < 500) resolve();
        else retry();
      });
      req.on("error", retry);
    };
    const retry = () => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timed out waiting for Expo on port ${port}`));
        return;
      }
      setTimeout(tick, 500);
    };
    tick();
  });

const expo = spawn("npx", ["expo", "start"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: { ...process.env },
});

expo.on("exit", (code) => process.exit(code ?? 0));

process.on("SIGINT", () => {
  expo.kill("SIGINT");
  process.exit(0);
});

try {
  await waitForPort(targetPort);
} catch (e) {
  console.error(e);
  expo.kill();
  process.exit(1);
}

const proxy = spawn("node", ["scripts/coep-proxy.mjs"], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    COEP_PROXY_TARGET: `http://127.0.0.1:${targetPort}`,
    COEP_PROXY_PORT: String(proxyPort),
  },
});

proxy.on("exit", (code) => {
  if (code && code !== 0) {
    console.warn(
      `[ListaPay] COEP proxy exited (${code}). If port ${proxyPort} is in use, open http://localhost:${proxyPort}`,
    );
  }
});

console.log(
  `\n→ Open ListaPay on web at http://localhost:${proxyPort} (SQLite enabled)\n`,
);
