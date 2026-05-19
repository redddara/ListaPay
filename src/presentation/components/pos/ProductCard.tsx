import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { formatMoney } from "@core/utils";
import type { Product } from "@domain/entities";

import { Text } from "@presentation/components/common";
import { useTheme } from "@presentation/theme";

interface ProductCardProps {
  product: Product;
  cartQty: number;
  onPress: () => void;
}

export const ProductCard = ({ product, cartQty, onPress }: ProductCardProps) => {
  const theme = useTheme();
  const outOfStock = product.stock <= 0;

  return (
    <Pressable
      onPress={onPress}
      disabled={outOfStock}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          opacity: outOfStock ? 0.45 : pressed ? 0.88 : 1,
        },
        theme.shadows.sm,
      ]}
    >
      <Text variant="bodyLg" numberOfLines={2}>
        {product.name}
      </Text>
      <Text variant="caption" color="textMuted">
        {product.unit} · Stock {product.stock}
      </Text>
      <View style={styles.footer}>
        <Text variant="bodyStrong" color="primary">
          {formatMoney(product.price)}
        </Text>
        {cartQty > 0 && (
          <View
            style={[
              styles.badge,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text variant="caption" color="textInverse">
              {cartQty}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
    minHeight: 112,
    minWidth: "46%",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
});
