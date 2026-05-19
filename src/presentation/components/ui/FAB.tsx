import React from "react";
import { Pressable, StyleSheet } from "react-native";

import { Text } from "@presentation/components/common";
import { useTheme } from "@presentation/theme";

interface FABProps {
  label?: string;
  onPress: () => void;
}

export const FAB = ({ label = "+", onPress }: FABProps) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: theme.colors.action,
          borderRadius: 28,
          opacity: pressed ? 0.9 : 1,
        },
        theme.shadows.md,
      ]}
    >
      <Text variant="h2" style={{ color: theme.colors.onAction }}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
});
