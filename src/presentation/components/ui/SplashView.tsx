import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Text } from "@presentation/components/common";
import { useTheme } from "@presentation/theme";

export const SplashView = () => {
  const theme = useTheme();
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.primary }]}
    >
      <Text variant="display" style={{ color: theme.colors.onPrimary }}>
        ListaPay
      </Text>
      <Text
        variant="bodyLg"
        style={{ color: theme.colors.onPrimary, opacity: 0.9, marginTop: 8 }}
      >
        Sari-sari POS & Utang
      </Text>
      <ActivityIndicator
        color={theme.colors.onPrimary}
        size="large"
        style={{ marginTop: 32 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
