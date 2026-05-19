import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { formatMoney, toMoney } from "@core/utils";
import type { ID } from "@core/types";

import { Button, Text } from "@presentation/components/common";
import {
  Card,
  CreateUtangModal,
  EmptyState,
  FAB,
  Screen,
  SearchBar,
} from "@presentation/components";
import { CustomerBalanceRow } from "@presentation/components/utang";
import {
  useCreateUtang,
  useCustomersWithBalances,
} from "@presentation/hooks";
import { useCustomers } from "@presentation/hooks/useCustomers";
import type { DebtsStackParamList } from "@presentation/navigation/types";
import { useTheme } from "@presentation/theme";

type Props = NativeStackScreenProps<DebtsStackParamList, "DebtsHome">;

export const DebtsHomeScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const {
    customers,
    totalOutstanding,
    loading,
    error,
    query,
    setQuery,
    reload,
  } = useCustomersWithBalances();
  const { customers: allCustomers } = useCustomers();
  const [createOpen, setCreateOpen] = useState(false);

  const { create, submitting, error: createError, clearError } = useCreateUtang(
    () => {
      setCreateOpen(false);
      reload();
    },
  );

  return (
    <Screen padded={false}>
      <View style={{ padding: theme.spacing.md, gap: theme.spacing.sm }}>
        <Card>
          <Text variant="overline" color="textMuted">
            Total utang
          </Text>
          <Text variant="stat" color="danger">
            {formatMoney(totalOutstanding)}
          </Text>
        </Card>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search suki…"
        />
      </View>

      {loading ? (
        <ActivityIndicator
          color={theme.colors.primary}
          style={{ marginTop: 32 }}
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
            <CustomerBalanceRow
              name={item.name}
              phone={item.phone}
              outstanding={item.computedOutstanding}
              onPress={() =>
                navigation.navigate("CustomerLedger", {
                  customerId: item.id,
                  customerName: item.name,
                })
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState title="No utang records" message="All clear!" />
          }
        />
      )}

      <FAB
        label="+"
        onPress={() => {
          clearError();
          setCreateOpen(true);
        }}
      />

      <CreateUtangModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        customers={allCustomers}
        submitting={submitting}
        error={createError}
        onSubmit={(customerId, pesos, note) =>
          create({
            customerId: customerId as ID,
            principal: toMoney(pesos),
            note,
          })
        }
      />
    </Screen>
  );
};
