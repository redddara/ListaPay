import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Text as RNText } from "react-native";

import { DashboardScreen } from "@presentation/screens/dashboard";
import { useTheme } from "@presentation/theme";

import { CustomersNavigator } from "./CustomersNavigator";
import { DebtsNavigator } from "./DebtsNavigator";
import { SalesNavigator } from "./SalesNavigator";
import { SettingsNavigator } from "./SettingsNavigator";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
  <RNText style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{label}</RNText>
);

export const MainTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon label="🏠" focused={focused} />,
          headerShown: true,
          headerTitle: "Home",
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.text, fontSize: 20 },
        }}
      />
      <Tab.Screen
        name="Sell"
        component={SalesNavigator}
        options={{
          title: "Sell",
          tabBarIcon: ({ focused }) => <TabIcon label="🛒" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Suki"
        component={CustomersNavigator}
        options={{
          title: "Suki",
          tabBarIcon: ({ focused }) => <TabIcon label="👥" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Utang"
        component={DebtsNavigator}
        options={{
          title: "Utang",
          tabBarIcon: ({ focused }) => <TabIcon label="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={SettingsNavigator}
        options={{
          title: "More",
          tabBarIcon: ({ focused }) => <TabIcon label="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};
