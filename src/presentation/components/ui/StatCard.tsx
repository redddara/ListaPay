import React from "react";
import { StyleSheet } from "react-native";

import { Text } from "@presentation/components/common";
import { Card } from "@presentation/components/ui/Card";
import { useTheme } from "@presentation/theme";

interface StatCardProps {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger" | "action";
}

export const StatCard = ({
  label,
  value,
  tone = "default",
}: StatCardProps) => {
  const theme = useTheme();
  const valueColor =
    tone === "success"
      ? theme.colors.success
      : tone === "warning"
        ? theme.colors.warning
        : tone === "danger"
          ? theme.colors.danger
          : tone === "action"
            ? theme.colors.action
            : theme.colors.text;

  return (
    <Card style={styles.card}>
      <Text variant="overline" color="textMuted">
        {label}
      </Text>
      <Text variant="stat" style={{ color: valueColor, marginTop: 4 }}>
        {value}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: "45%" },
});
