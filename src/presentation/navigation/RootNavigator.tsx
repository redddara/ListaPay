import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  NavigationContainer,
  type Theme as NavTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";

import { isSupabaseConfigured } from "@core/config/env";

import { RepositoriesProvider } from "@/composition/RepositoriesProvider";
import { useAuthStore } from "@presentation/stores";
import { useTheme } from "@presentation/theme";

import { AuthNavigator } from "./AuthNavigator";
import { linking } from "./linking";
import { MainTabNavigator } from "./MainTabNavigator";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const buildNavTheme = (
  scheme: "light" | "dark",
  colors: ReturnType<typeof useTheme>["colors"],
): NavTheme => {
  const base = scheme === "dark" ? NavDarkTheme : NavLightTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
      notification: colors.danger,
    },
  };
};

export const RootNavigator = () => {
  const theme = useTheme();
  const status = useAuthStore((s) => s.status);
  const session = useAuthStore((s) => s.session);

  const navTheme = useMemo(
    () => buildNavTheme(theme.scheme, theme.colors),
    [theme.scheme, theme.colors],
  );

  if (status === "unknown" && isSupabaseConfigured()) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {status === "authenticated" && session ? (
          <Stack.Screen name="Main">
            {() => (
              <RepositoriesProvider storeId={session.user.storeId}>
                <MainTabNavigator />
              </RepositoriesProvider>
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
