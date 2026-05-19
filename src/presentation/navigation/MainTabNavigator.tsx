import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

import {
  DashboardScreen,
  DebtsScreen,
  ProductsScreen,
  SalesScreen,
  SettingsScreen,
} from "@presentation/screens";
import { useTheme } from "@presentation/theme";

import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.text },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Sales" component={SalesScreen} />
      <Tab.Screen name="Debts" component={DebtsScreen} options={{ title: "Lista" }} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};
