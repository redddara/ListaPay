import React from "react";
import { StyleSheet, View } from "react-native";

import type { Money } from "@core/types";
import { formatMoney } from "@core/utils";
import { Text } from "@presentation/components/common";
import {
  getBalanceLevel,
  type BalanceLevel,
} from "@presentation/utils/balanceStatus";
import { useTheme } from "@presentation/theme";

interface BalanceIndicatorProps {
  balance: Money;
  showAmount?: boolean;
}

const DOT_SIZE = 12;

export const BalanceIndicator = ({
  balance,
  showAmount = true,
}: BalanceIndicatorProps) => {
  const theme = useTheme();
  const level = getBalanceLevel(balance);
  const dotColor = levelColor(level, theme.colors);

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      {showAmount && (
        <Text
          variant="bodyStrong"
          style={{ color: dotColor }}
        >
          {balance <= 0 ? "Clear" : formatMoney(balance)}
        </Text>
      )}
    </View>
  );
};

const levelColor = (
  level: BalanceLevel,
  colors: ReturnType<typeof useTheme>["colors"],
) => {
  switch (level) {
    case "paid":
      return colors.success;
    case "partial":
      return colors.warning;
    case "high":
      return colors.danger;
  }
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});
