import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@presentation/components/common";
import { useTheme } from "@presentation/theme";

interface QuantityStepperProps {
  value: number;
  max?: number;
  onIncrement: () => void;
  onDecrement: () => void;
  compact?: boolean;
}

export const QuantityStepper = ({
  value,
  max,
  onIncrement,
  onDecrement,
  compact = false,
}: QuantityStepperProps) => {
  const theme = useTheme();
  const atMax = max !== undefined && value >= max;
  const size = compact ? 28 : 36;

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onDecrement}
        style={[
          styles.btn,
          {
            width: size,
            height: size,
            borderRadius: theme.radii.sm,
            backgroundColor: theme.colors.surfaceMuted,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text variant="bodyStrong">−</Text>
      </Pressable>
      <Text
        variant={compact ? "bodyStrong" : "h3"}
        style={{ minWidth: compact ? 24 : 32, textAlign: "center" }}
      >
        {value}
      </Text>
      <Pressable
        onPress={onIncrement}
        disabled={atMax}
        style={[
          styles.btn,
          {
            width: size,
            height: size,
            borderRadius: theme.radii.sm,
            backgroundColor: theme.colors.primaryMuted,
            opacity: atMax ? 0.4 : 1,
          },
        ]}
      >
        <Text variant="bodyStrong" color="primary">
          +
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  btn: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
