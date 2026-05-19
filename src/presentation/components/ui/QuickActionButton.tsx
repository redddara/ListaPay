import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@presentation/components/common";
import { useTheme } from "@presentation/theme";

interface QuickActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  variant?: "primary" | "action" | "success";
}

export const QuickActionButton = ({
  icon,
  label,
  onPress,
  variant = "primary",
}: QuickActionButtonProps) => {
  const theme = useTheme();
  const bg =
    variant === "action"
      ? theme.colors.action
      : variant === "success"
        ? theme.colors.success
        : theme.colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderRadius: theme.radii.lg,
          opacity: pressed ? 0.9 : 1,
        },
        theme.shadows.md,
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text variant="bodyStrong" style={{ color: theme.colors.onPrimary }}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    minHeight: 88,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
  },
  icon: { fontSize: 28 },
});
