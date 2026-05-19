import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { formatMoney } from "@core/utils";
import type { ID, Money } from "@core/types";
import type { PaymentMethod } from "@domain/entities";

import { Button, Screen, Text } from "@presentation/components";
import {
  PaymentHistoryRow,
  RecordPaymentModal,
  StatusBadge,
} from "@presentation/components/utang";
import { useRecordPayment, useUtangDetail } from "@presentation/hooks";
import type { DebtsStackParamList } from "@presentation/navigation/types";
import { useTheme } from "@presentation/theme";

type Props = NativeStackScreenProps<DebtsStackParamList, "UtangDetail">;

export const UtangDetailScreen = ({ route, navigation }: Props) => {
  const { debtEntryId, customerName } = route.params;
  const theme = useTheme();
  const { entry, paymentHistory, loading, error, reload } =
    useUtangDetail(debtEntryId as ID);
  const [payOpen, setPayOpen] = useState(false);

  const { pay, submitting, error: payError, clearError } = useRecordPayment(
    () => {
      setPayOpen(false);
      reload();
      navigation.getParent()?.setOptions?.({});
    },
  );

  const handlePayment = async (
    amount: Money,
    method: PaymentMethod,
    note?: string,
  ) => {
    if (!entry) return;
    const payment = await pay({
      customerId: entry.customerId,
      debtEntryId: entry.id,
      amount,
      method,
      note,
    });
    if (payment) {
      Alert.alert(
        "Payment recorded",
        `${formatMoney(amount)} received.\nRemaining balance updated offline.`,
      );
      reload();
    }
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={theme.colors.primary} />
      </Screen>
    );
  }

  if (error || !entry) {
    return (
      <Screen>
        <Text color="danger">{error ?? "Not found"}</Text>
        <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  const canPay = entry.status === "open" || entry.status === "partial";
  const created = new Date(entry.createdAt).toLocaleString("en-PH");

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: 16 }}>
        <View style={styles.header}>
          <Text variant="h2">{customerName}</Text>
          <StatusBadge status={entry.status} />
        </View>

        <Text variant="caption" color="textMuted">
          {entry.saleId ? `Linked to sale ${entry.saleId.slice(0, 8)}…` : "Manual utang"}
          {" · "}
          {created}
        </Text>

        {entry.note && (
          <Text variant="body" color="textMuted">
            {entry.note}
          </Text>
        )}

        <View
          style={[
            styles.grid,
            { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radii.md },
          ]}
        >
          <Stat label="Principal" value={formatMoney(entry.principal)} />
          <Stat label="Paid" value={formatMoney(entry.amountPaid)} />
          <Stat
            label="Balance"
            value={formatMoney(entry.balance)}
            highlight={entry.balance > 0}
          />
        </View>

        {canPay && (
          <Button
            label="Record payment"
            fullWidth
            onPress={() => {
              clearError();
              setPayOpen(true);
            }}
          />
        )}

        <Text variant="h3">Payment history ({paymentHistory.length})</Text>
        {paymentHistory.length === 0 ? (
          <Text color="textMuted">No payments yet.</Text>
        ) : (
          paymentHistory.map((p) => (
            <PaymentHistoryRow key={p.id} payment={p} />
          ))
        )}
      </ScrollView>

      <RecordPaymentModal
        visible={payOpen}
        onClose={() => setPayOpen(false)}
        customerName={customerName}
        balance={entry.balance}
        principal={entry.principal}
        amountPaid={entry.amountPaid}
        submitting={submitting}
        error={payError}
        onSubmit={handlePayment}
      />
    </Screen>
  );
};

const Stat = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={{ flex: 1, gap: 4, padding: 12 }}>
    <Text variant="caption" color="textMuted">
      {label}
    </Text>
    <Text variant="bodyStrong" color={highlight ? "danger" : "text"}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grid: { flexDirection: "row" },
});
