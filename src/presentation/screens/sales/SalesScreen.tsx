import React from "react";
import { View } from "react-native";

import { Screen, Text } from "@presentation/components";
import { useTheme } from "@presentation/theme";

export const SalesScreen = () => {
  const theme = useTheme();
  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="h1">Sales</Text>
        <Text variant="body" color="textMuted">
          Point-of-sale ticket builder and sales history go here.
        </Text>
      </View>
    </Screen>
  );
};
