import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { isSupabaseConfigured } from "@core/config/env";
import { logger } from "@core/utils";
import { AuthProvider } from "@/composition/AuthProvider";
import { initializeDatabase } from "@data/datasources/local";
import { getSupabaseClient } from "@data/datasources/remote";
import { seedDevStoreIfEmpty } from "@data/services/seedDevStore";
import { RootNavigator } from "@presentation/navigation";
import { useAppStore } from "@presentation/stores";
import { usePinStore } from "@presentation/stores/usePinStore";
import { PinLockOverlay, SplashView } from "@presentation/components";
import { ThemeProvider } from "@presentation/theme";

const log = logger.scope("app");

/**
 * App-wide bootstrap: open the local SQLite DB + run migrations, then warm
 * up the Supabase client. Auth/session restoration will be wired in here
 * once the auth feature is built.
 */
const useBootstrap = () => {
  const { setInitialized, setInitError } = useAppStore();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const db = await initializeDatabase();
        getSupabaseClient();
        if (!isSupabaseConfigured()) {
          await seedDevStoreIfEmpty(db);
        }
        if (!cancelled) {
          setInitialized(true);
          log.info("Bootstrap complete.");
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        log.error("Bootstrap failed.", e);
        if (!cancelled) setInitError(msg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setInitialized, setInitError]);
};

const AppShell = () => {
  const { isInitialized, initError } = useAppStore();
  const loadPin = usePinStore((s) => s.load);
  useBootstrap();

  React.useEffect(() => {
    loadPin();
  }, [loadPin]);

  if (!isInitialized) {
    return <SplashView />;
  }

  if (initError) {
    return <SplashView />;
  }

  return (
    <AuthProvider>
      <RootNavigator />
      <PinLockOverlay />
    </AuthProvider>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider initialPreference="system">
          <AppShell />
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
