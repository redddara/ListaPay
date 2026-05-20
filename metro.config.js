const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Required for expo-sqlite on web (wa-sqlite.wasm).
config.resolver.assetExts.push("wasm");

// SharedArrayBuffer needs cross-origin isolation headers in dev.
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    // expo-sqlite web (wa-sqlite + OPFS) needs cross-origin isolation.
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    return middleware(req, res, next);
  };
};

module.exports = config;
