import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { CheckoutScreen, PosScreen } from "@presentation/screens/sales";
import { useTheme } from "@presentation/theme";

import type { SalesStackParamList } from "./types";

const Stack = createNativeStackNavigator<SalesStackParamList>();

export const SalesNavigator = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.text, fontSize: 20, fontWeight: "600" },
        headerTintColor: theme.colors.primary,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="Pos"
        component={PosScreen}
        options={{ title: "Sell", headerLargeTitle: false }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: "Checkout", presentation: "modal" }}
      />
    </Stack.Navigator>
  );
};
