/**
 * Dev-only proxy that adds cross-origin isolation headers to every response.
 * Expo serves HTML from ManifestMiddleware without COEP; bundles get COEP from
 * Metro. expo-sqlite on web needs the document response isolated too.
 */
import http from "node:http";
import { URL } from "node:url";

const TARGET = process.env.COEP_PROXY_TARGET ?? "http://127.0.0.1:8081";
const LISTEN_PORT = Number(process.env.COEP_PROXY_PORT ?? "19006");

const isolationHeaders = {
  "Cross-Origin-Embedder-Policy": "credentialless",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "cross-origin",
};

const targetUrl = new URL(TARGET);

const server = http.createServer((clientReq, clientRes) => {
  const proxyOpts = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || (targetUrl.protocol === "https:" ? 443 : 80),
    path: clientReq.url,
    method: clientReq.method,
    headers: { ...clientReq.headers, host: targetUrl.host },
  };

  const proxyReq = http.request(proxyOpts, (proxyRes) => {
    const headers = { ...proxyRes.headers, ...isolationHeaders };
    clientRes.writeHead(proxyRes.statusCode ?? 502, headers);
    proxyRes.pipe(clientRes);
  });

  proxyReq.on("error", (err) => {
    clientRes.writeHead(502, { "Content-Type": "text/plain", ...isolationHeaders });
    clientRes.end(
      `ListaPay COEP proxy could not reach ${TARGET}.\n` +
        `Start Expo first (npx expo start), then run: npm run web\n\n` +
        String(err),
    );
  });

  clientReq.pipe(proxyReq);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(
      `[ListaPay] COEP proxy already on http://localhost:${LISTEN_PORT}  →  ${TARGET}`,
    );
    return;
  }
  console.error("[ListaPay] COEP proxy error:", err);
  process.exit(1);
});

server.listen(LISTEN_PORT, "127.0.0.1", () => {
  console.log(
    `[ListaPay] Web with SQLite: http://localhost:${LISTEN_PORT}  →  ${TARGET}`,
  );
});
