import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import {
  AddCustomerScreen,
  CustomerDetailScreen,
  CustomerListScreen,
} from "@presentation/screens/customers";
import { useTheme } from "@presentation/theme";

import type { CustomersStackParamList } from "./types";

const Stack = createNativeStackNavigator<CustomersStackParamList>();

export const CustomersNavigator = () => {
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
        name="CustomerList"
        component={CustomerListScreen}
        options={{ title: "Suki (Customers)" }}
      />
      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
        options={({ route }) => ({ title: route.params.customerName })}
      />
      <Stack.Screen
        name="AddCustomer"
        component={AddCustomerScreen}
        options={{ title: "Add Customer", presentation: "modal" }}
      />
    </Stack.Navigator>
  );
};
