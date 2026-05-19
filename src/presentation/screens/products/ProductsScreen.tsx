import React from "react";
import { View } from "react-native";

import { Screen, Text } from "@presentation/components";
import { useTheme } from "@presentation/theme";

export const ProductsScreen = () => {
  const theme = useTheme();
  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="h1">Products</Text>
        <Text variant="body" color="textMuted">
          Inventory list, low-stock alerts, and barcode scanning go here.
        </Text>
      </View>
    </Screen>
  );
};
