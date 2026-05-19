import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { formatMoney } from "@core/utils";
import type { DebtEntry } from "@domain/entities";

import { Text } from "@presentation/components/common";
import { StatusBadge } from "@presentation/components/utang/StatusBadge";
import { useTheme } from "@presentation/theme";

interface UtangEntryCardProps {
  entry: DebtEntry;
  onPress: () => void;
}

export const UtangEntryCard = ({ entry, onPress }: UtangEntryCardProps) => {
  const theme = useTheme();
  const date = new Date(entry.createdAt).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.md,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <Text variant="bodyStrong">
          {entry.saleId ? "From sale" : "Manual entry"}
        </Text>
        <StatusBadge status={entry.status} />
      </View>
      <Text variant="caption" color="textMuted">
        {date}
        {entry.note ? ` · ${entry.note}` : ""}
      </Text>
      <View style={styles.amounts}>
        <AmountCol label="Principal" value={formatMoney(entry.principal)} />
        <AmountCol label="Paid" value={formatMoney(entry.amountPaid)} />
        <AmountCol
          label="Balance"
          value={formatMoney(entry.balance)}
          highlight={entry.balance > 0}
        />
      </View>
    </Pressable>
  );
};

const AmountCol = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={{ flex: 1, gap: 2 }}>
    <Text variant="caption" color="textMuted">
      {label}
    </Text>
    <Text variant="bodyStrong" color={highlight ? "danger" : "text"}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amounts: { flexDirection: "row", gap: 8, marginTop: 4 },
});
