import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { initializeDatabase } from "@data/datasources/local";
import { getSupabaseClient } from "@data/datasources/remote";
import { logger } from "@core/utils";
import { RootNavigator } from "@presentation/navigation";
import { useAppStore } from "@presentation/stores";
import { ThemeProvider, useTheme } from "@presentation/theme";

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
        await initializeDatabase();
        getSupabaseClient();
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
  const theme = useTheme();
  const { isInitialized, initError } = useAppStore();
  useBootstrap();

  if (initError) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.danger} />
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return <RootNavigator />;
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

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
