import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppError } from "@core/errors";
import { logger } from "@core/utils";
import { AuthProvider } from "@/composition/AuthProvider";
import {
  __resetAppBootstrap,
  runAppBootstrap,
} from "@/composition/bootstrapApp";
import { RootNavigator } from "@presentation/navigation";
import { useAppStore } from "@presentation/stores";
import { usePinStore } from "@presentation/stores/usePinStore";
import {
  BootstrapErrorView,
  PinLockOverlay,
  SplashView,
} from "@presentation/components";
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

    runAppBootstrap()
      .then(() => {
        if (!cancelled) {
          setInitialized(true);
          log.info("Bootstrap complete.");
        }
      })
      .catch((e) => {
        const msg =
          e instanceof AppError && e.cause instanceof Error
            ? `${e.message} (${e.cause.message})`
            : e instanceof Error
              ? e.message
              : String(e);
        log.error("Bootstrap failed.", e);
        if (!cancelled) setInitError(msg);
      });

    return () => {
      cancelled = true;
    };
  }, [setInitialized, setInitError]);
};

type AppShellProps = {
  onRetryNative: () => void;
};

const AppShell = ({ onRetryNative }: AppShellProps) => {
  const { isInitialized, initError, reset } = useAppStore();
  const loadPin = usePinStore((s) => s.load);
  useBootstrap();

  React.useEffect(() => {
    loadPin();
  }, [loadPin]);

  const handleRetry = () => {
    reset();
    __resetAppBootstrap();
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.location.reload();
      return;
    }
    onRetryNative();
  };

  if (initError) {
    return <BootstrapErrorView message={initError} onRetry={handleRetry} />;
  }

  if (!isInitialized) {
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
  const [shellKey, setShellKey] = useState(0);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider initialPreference="system">
          <AppShell
            key={shellKey}
            onRetryNative={() => {
              useAppStore.getState().reset();
              setShellKey((k) => k + 1);
            }}
          />
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
