import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { formatMoney, toMoney } from "@core/utils";
import type { ID } from "@core/types";

import { Button, Screen, Text } from "@presentation/components";
import {
  CreateUtangModal,
  PaymentHistoryRow,
  UtangEntryCard,
} from "@presentation/components/utang";
import {
  useCreateUtang,
  useCustomerLedger,
} from "@presentation/hooks";
import { useCustomers } from "@presentation/hooks/useCustomers";
import type { DebtsStackParamList } from "@presentation/navigation/types";
import { useTheme } from "@presentation/theme";

type Props = NativeStackScreenProps<DebtsStackParamList, "CustomerLedger">;

export const CustomerLedgerScreen = ({ route, navigation }: Props) => {
  const { customerId, customerName } = route.params;
  const theme = useTheme();
  const {
    customer,
    activeEntries,
    settledEntries,
    recentPayments,
    outstanding,
    loading,
    error,
    reload,
  } = useCustomerLedger(customerId as ID);
  const { customers: allCustomers } = useCustomers();
  const [createOpen, setCreateOpen] = useState(false);

  const { create, submitting, error: createError, clearError } = useCreateUtang(
    () => {
      setCreateOpen(false);
      reload();
    },
  );

  const handleCreate = async (
    cid: string,
    principalPesos: number,
    note?: string,
  ) => {
    const entry = await create({
      customerId: cid as ID,
      principal: toMoney(principalPesos),
      note,
    });
    if (entry) {
      navigation.navigate("UtangDetail", {
        debtEntryId: entry.id,
        customerName,
      });
    }
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={theme.colors.primary} />
      </Screen>
    );
  }

  if (error || !customer) {
    return (
      <Screen>
        <Text color="danger">{error ?? "Customer not found"}</Text>
        <Button label="Go back" variant="secondary" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  return (
    <Screen padded={false} scroll>
      <View style={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <View>
          <Text variant="h1">{customerName}</Text>
          {customer.phone && (
            <Text variant="body" color="textMuted">
              {customer.phone}
            </Text>
          )}
        </View>

        <View
          style={[
            styles.balanceBox,
            { backgroundColor: theme.colors.dangerMuted },
          ]}
        >
          <Text variant="caption" color="textMuted">
            Outstanding balance
          </Text>
          <Text variant="h2" color="danger">
            {formatMoney(outstanding)}
          </Text>
          <Text variant="caption" color="textMuted">
            Computed from open utang entries (offline)
          </Text>
        </View>

        <Button
          label="+ Add utang"
          variant="secondary"
          fullWidth
          onPress={() => {
            clearError();
            setCreateOpen(true);
          }}
        />

        <Text variant="h3">Active utang ({activeEntries.length})</Text>
        {activeEntries.length === 0 ? (
          <Text color="textMuted">No open entries.</Text>
        ) : (
          activeEntries.map((entry) => (
            <UtangEntryCard
              key={entry.id}
              entry={entry}
              onPress={() =>
                navigation.navigate("UtangDetail", {
                  debtEntryId: entry.id,
                  customerName,
                })
              }
            />
          ))
        )}

        {settledEntries.length > 0 && (
          <>
            <Text variant="h3" style={{ marginTop: theme.spacing.md }}>
              Settled ({settledEntries.length})
            </Text>
            {settledEntries.slice(0, 5).map((entry) => (
              <UtangEntryCard
                key={entry.id}
                entry={entry}
                onPress={() =>
                  navigation.navigate("UtangDetail", {
                    debtEntryId: entry.id,
                    customerName,
                  })
                }
              />
            ))}
          </>
        )}

        <Text variant="h3" style={{ marginTop: theme.spacing.md }}>
          Recent payments
        </Text>
        {recentPayments.length === 0 ? (
          <Text color="textMuted">No payments recorded yet.</Text>
        ) : (
          recentPayments.map((p) => (
            <PaymentHistoryRow key={p.id} payment={p} />
          ))
        )}
      </View>

      <CreateUtangModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        customers={allCustomers}
        preselectedCustomerId={customerId}
        submitting={submitting}
        error={createError}
        onSubmit={handleCreate}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  balanceBox: {
    padding: 16,
    borderRadius: 12,
    gap: 4,
  },
});
