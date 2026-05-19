import React from "react";
import { StyleSheet, View } from "react-native";

import type { DebtStatus } from "@domain/entities";

import { Text } from "@presentation/components/common";
import { useTheme } from "@presentation/theme";

const LABELS: Record<DebtStatus, string> = {
  open: "Open",
  partial: "Partial",
  paid: "Paid",
  written_off: "Written off",
};

export const StatusBadge = ({ status }: { status: DebtStatus }) => {
  const theme = useTheme();

  const colors: Record<
    DebtStatus,
    {
      bg: string;
      fg: "text" | "textMuted" | "textInverse" | "primary" | "success" | "danger";
    }
  > = {
    open: { bg: theme.colors.warningMuted, fg: "text" },
    partial: { bg: theme.colors.primaryMuted, fg: "primary" },
    paid: { bg: theme.colors.successMuted, fg: "success" },
    written_off: { bg: theme.colors.surfaceMuted, fg: "textMuted" },
  };

  const c = colors[status];

  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderRadius: theme.radii.sm }]}>
      <Text variant="caption" color={c.fg}>
        {LABELS[status]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
});
