import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { formatMoney } from "@core/utils";
import type { ID, Money } from "@core/types";

import { Text } from "@presentation/components/common";
import { QuantityStepper } from "@presentation/components/pos/QuantityStepper";
import { useTheme } from "@presentation/theme";

interface CartLineRowProps {
  name: string;
  unitPrice: Money;
  quantity: number;
  stock: number;
  productId: ID;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export const CartLineRow = ({
  name,
  unitPrice,
  quantity,
  stock,
  onIncrement,
  onDecrement,
  onRemove,
}: CartLineRowProps) => {
  const theme = useTheme();
  const lineTotal = (unitPrice * quantity) as Money;

  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: theme.colors.divider },
      ]}
    >
      <View style={styles.info}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {name}
        </Text>
        <Text variant="caption" color="textMuted">
          {formatMoney(unitPrice)} × {quantity} = {formatMoney(lineTotal)}
        </Text>
      </View>
      <QuantityStepper
        compact
        value={quantity}
        max={stock}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
      />
      <Pressable onPress={onRemove} hitSlop={8}>
        <Text variant="caption" color="danger">
          Remove
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  info: { flex: 1, gap: 2 },
});
