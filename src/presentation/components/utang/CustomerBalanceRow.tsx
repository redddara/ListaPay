import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { formatMoney } from "@core/utils";
import type { Money } from "@core/types";

import { Text } from "@presentation/components/common";
import { useTheme } from "@presentation/theme";

interface CustomerBalanceRowProps {
  name: string;
  phone?: string;
  outstanding: Money;
  onPress: () => void;
}

export const CustomerBalanceRow = ({
  name,
  phone,
  outstanding,
  onPress,
}: CustomerBalanceRowProps) => {
  const theme = useTheme();
  const hasDebt = outstanding > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.md,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong">{name}</Text>
        {phone && (
          <Text variant="caption" color="textMuted">
            {phone}
          </Text>
        )}
      </View>
      <Text
        variant="bodyStrong"
        color={hasDebt ? "danger" : "success"}
      >
        {hasDebt ? formatMoney(outstanding) : "Clear"}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
});
