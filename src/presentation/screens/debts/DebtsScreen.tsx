import React from "react";
import { View } from "react-native";

import { Screen, Text } from "@presentation/components";
import { useTheme } from "@presentation/theme";

export const DebtsScreen = () => {
  const theme = useTheme();
  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="h1">Lista (Utang)</Text>
        <Text variant="body" color="textMuted">
          Customer ledgers, debt entries, and payment recording go here.
        </Text>
      </View>
    </Screen>
  );
};
