import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  NavigationContainer,
  type Theme as NavTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useMemo } from "react";

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

  const navTheme = useMemo(
    () => buildNavTheme(theme.scheme, theme.colors),
    [theme.scheme, theme.colors],
  );

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {status === "authenticated" ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
