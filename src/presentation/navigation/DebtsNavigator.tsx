import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import {
  CustomerLedgerScreen,
  DebtsHomeScreen,
  UtangDetailScreen,
} from "@presentation/screens/debts";
import { useTheme } from "@presentation/theme";

import type { DebtsStackParamList } from "./types";

const Stack = createNativeStackNavigator<DebtsStackParamList>();

export const DebtsNavigator = () => {
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
        name="DebtsHome"
        component={DebtsHomeScreen}
        options={{ title: "Lista (Utang)" }}
      />
      <Stack.Screen
        name="CustomerLedger"
        component={CustomerLedgerScreen}
        options={({ route }) => ({ title: route.params.customerName })}
      />
      <Stack.Screen
        name="UtangDetail"
        component={UtangDetailScreen}
        options={{ title: "Utang detail" }}
      />
    </Stack.Navigator>
  );
};
