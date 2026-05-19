import React from "react";
import { View } from "react-native";

import { Screen, Text } from "@presentation/components";
import { useTheme } from "@presentation/theme";

export const DashboardScreen = () => {
  const theme = useTheme();
  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="overline" color="textMuted">
          Today
        </Text>
        <Text variant="h1">Dashboard</Text>
        <Text variant="body" color="textMuted">
          KPIs (sales, outstanding utang, low stock) will live here.
        </Text>
      </View>
    </Screen>
  );
};
