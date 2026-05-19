import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { formatMoney } from "@core/utils";

import { Text } from "@presentation/components/common";
import { ProductCard } from "@presentation/components/pos";
import {
  EmptyState,
  SearchBar,
  Screen,
} from "@presentation/components";
import { useCartTotals, useProducts } from "@presentation/hooks";
import type { SalesStackParamList } from "@presentation/navigation/types";
import { usePosCartStore } from "@presentation/stores/usePosCartStore";
import { useTheme } from "@presentation/theme";

type Nav = NativeStackNavigationProp<SalesStackParamList, "Pos">;

export const PosScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { products, loading, error, query, setQuery, reload } = useProducts();
  const addProduct = usePosCartStore((s) => s.addProduct);
  const lines = usePosCartStore((s) => s.lines);
  const { total, itemCount } = useCartTotals();

  const getCartQty = useCallback(
    (productId: string) =>
      lines.find((l) => l.productId === productId)?.quantity ?? 0,
    [lines],
  );

  return (
    <Screen padded={false}>
      <View style={{ padding: theme.spacing.md }}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search products…"
        />
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator
            style={{ marginTop: 48 }}
            color={theme.colors.primary}
          />
        ) : error ? (
          <EmptyState
            title="Could not load products"
            message={error}
            actionLabel="Retry"
            onAction={reload}
          />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(p) => p.id}
            numColumns={2}
            columnWrapperStyle={{ gap: theme.spacing.sm }}
            contentContainerStyle={{
              padding: theme.spacing.md,
              paddingBottom: 100,
              gap: theme.spacing.sm,
            }}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                cartQty={getCartQty(item.id)}
                onPress={() => addProduct(item)}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                title="No products"
                message="Add products in Settings → Products"
              />
            }
          />
        )}
      </View>

      {itemCount > 0 && (
        <Pressable
          onPress={() => navigation.navigate("Checkout")}
          style={({ pressed }) => [
            styles.checkoutBar,
            {
              backgroundColor: theme.colors.primary,
              opacity: pressed ? 0.92 : 1,
            },
            theme.shadows.md,
          ]}
        >
          <View>
            <Text variant="bodyStrong" style={{ color: theme.colors.onPrimary }}>
              View cart · {itemCount} items
            </Text>
            <Text variant="caption" style={{ color: theme.colors.onPrimary }}>
              Tap to checkout
            </Text>
          </View>
          <Text variant="h2" style={{ color: theme.colors.onPrimary }}>
            {formatMoney(total)}
          </Text>
        </Pressable>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  checkoutBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    margin: 12,
    borderRadius: 16,
  },
});
