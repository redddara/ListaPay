import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from "react-native";

import { Text } from "@presentation/components/common";
import {
  BalanceIndicator,
  Card,
  EmptyState,
  FAB,
  Screen,
  SearchBar,
} from "@presentation/components";
import { useCustomersWithBalances } from "@presentation/hooks";
import type { CustomersStackParamList } from "@presentation/navigation/types";
import { useTheme } from "@presentation/theme";

type Nav = NativeStackNavigationProp<CustomersStackParamList, "CustomerList">;

export const CustomerListScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { customers, loading, error, query, setQuery, reload } =
    useCustomersWithBalances();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return (
    <Screen padded={false}>
      <View style={{ padding: theme.spacing.md }}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search suki…"
        />
      </View>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 48 }}
          color={theme.colors.primary}
        />
      ) : error ? (
        <EmptyState title="Error" message={error} actionLabel="Retry" onAction={reload} />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{
            padding: theme.spacing.md,
            paddingBottom: 88,
            gap: theme.spacing.sm,
          }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate("CustomerDetail", {
                  customerId: item.id,
                  customerName: item.name,
                })
              }
            >
              <Card>
                <View style={styles.row}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text variant="bodyLg">{item.name}</Text>
                    {item.phone && (
                      <Text variant="caption" color="textMuted">
                        {item.phone}
                      </Text>
                    )}
                  </View>
                  <BalanceIndicator balance={item.computedOutstanding} />
                </View>
              </Card>
            </Pressable>
          )}
          ListEmptyComponent={
            <EmptyState
              title="No customers yet"
              message="Add your first suki"
              actionLabel="Add customer"
              onAction={() => navigation.navigate("AddCustomer")}
            />
          }
        />
      )}

      <FAB onPress={() => navigation.navigate("AddCustomer")} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
