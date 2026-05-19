import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { ProductsScreen } from "@presentation/screens/products";
import { PinSetupScreen, SettingsScreen } from "@presentation/screens/settings";
import { useTheme } from "@presentation/theme";

import type { SettingsStackParamList } from "./types";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsNavigator = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.text },
        headerTintColor: theme.colors.primary,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
      <Stack.Screen
        name="Products"
        component={ProductsScreen}
        options={{ title: "Products" }}
      />
      <Stack.Screen
        name="PinSetup"
        component={PinSetupScreen}
        options={{ title: "App PIN", presentation: "modal" }}
      />
    </Stack.Navigator>
  );
};
