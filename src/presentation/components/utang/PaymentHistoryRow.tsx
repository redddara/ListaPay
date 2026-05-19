import React from "react";
import { StyleSheet, View } from "react-native";

import { formatMoney } from "@core/utils";
import type { Payment } from "@domain/entities";

import { Text } from "@presentation/components/common";
import { useTheme } from "@presentation/theme";

const METHOD_LABELS: Record<Payment["method"], string> = {
  cash: "Cash",
  gcash: "GCash",
  bank_transfer: "Bank",
  other: "Other",
};

export const PaymentHistoryRow = ({ payment }: { payment: Payment }) => {
  const theme = useTheme();
  const date = new Date(payment.paidAt).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: theme.colors.divider },
      ]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong">{formatMoney(payment.amount)}</Text>
        <Text variant="caption" color="textMuted">
          {METHOD_LABELS[payment.method]} · {date}
        </Text>
        {payment.note && (
          <Text variant="caption" color="textMuted">
            {payment.note}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
