import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  View,
} from "react-native";

import { formatMoney, toMoney } from "@core/utils";
import type { ID } from "@core/types";

import { Button, Text } from "@presentation/components/common";
import { Card, Screen, StatCard } from "@presentation/components";
import {
  CreateUtangModal,
  PaymentHistoryRow,
  UtangEntryCard,
} from "@presentation/components/utang";
import {
  useCreateUtang,
  useCustomerLedger,
} from "@presentation/hooks";
import type { CustomersStackParamList } from "@presentation/navigation/types";
import { useTheme } from "@presentation/theme";

type Props = NativeStackScreenProps<CustomersStackParamList, "CustomerDetail">;

export const CustomerDetailScreen = ({ route, navigation }: Props) => {
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

  const [createOpen, setCreateOpen] = useState(false);
  const { create, submitting, error: createError, clearError } = useCreateUtang(
    () => {
      setCreateOpen(false);
      reload();
    },
  );

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
        <Text color="danger">{error ?? "Not found"}</Text>
        <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  return (
    <Screen padded={false} scroll>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: 16 }}>
        {customer.phone && (
          <Text variant="body" color="textMuted">
            {customer.phone}
          </Text>
        )}

        <StatCard
          label="Total utang"
          value={formatMoney(outstanding)}
          tone={outstanding > 0 ? "danger" : "success"}
        />

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button
            label="Add payment"
            variant="success"
            style={{ flex: 1 }}
            onPress={() =>
              navigation.getParent()?.navigate("Utang", {
                screen: "CustomerLedger",
                params: { customerId, customerName },
              })
            }
          />
          <Button
            label="Add utang"
            variant="action"
            style={{ flex: 1 }}
            onPress={() => {
              clearError();
              setCreateOpen(true);
            }}
          />
        </View>

        <Text variant="h3">Active utang</Text>
        {activeEntries.length === 0 ? (
          <Text color="textMuted">No open utang.</Text>
        ) : (
          activeEntries.map((e) => (
            <UtangEntryCard
              key={e.id}
              entry={e}
              onPress={() =>
                navigation.getParent()?.navigate("Utang", {
                  screen: "UtangDetail",
                  params: { debtEntryId: e.id, customerName },
                })
              }
            />
          ))
        )}

        <Text variant="h3">Payment history</Text>
        {recentPayments.length === 0 ? (
          <Text color="textMuted">No payments yet.</Text>
        ) : (
          <Card padded>
            {recentPayments.map((p) => (
              <PaymentHistoryRow key={p.id} payment={p} />
            ))}
          </Card>
        )}

        {settledEntries.length > 0 && (
          <>
            <Text variant="h3">Settled</Text>
            {settledEntries.slice(0, 3).map((e) => (
              <UtangEntryCard
                key={e.id}
                entry={e}
                onPress={() =>
                  navigation.getParent()?.navigate("Utang", {
                    screen: "UtangDetail",
                    params: { debtEntryId: e.id, customerName },
                  })
                }
              />
            ))}
          </>
        )}
      </ScrollView>

      <CreateUtangModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        customers={[customer]}
        preselectedCustomerId={customerId}
        submitting={submitting}
        error={createError}
        onSubmit={async (_id, pesos, note) => {
          await create({
            customerId: customerId as ID,
            principal: toMoney(pesos),
            note,
          });
        }}
      />
    </Screen>
  );
};
