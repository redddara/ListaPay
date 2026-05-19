import React from "react";
import { StyleSheet, View } from "react-native";

import { Button, Text } from "@presentation/components/common";
import { useTheme } from "@presentation/theme";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon = "📦",
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  const theme = useTheme();
  return (
    <View style={[styles.wrap, { padding: theme.spacing.xl }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text variant="h3" style={{ textAlign: "center" }}>
        {title}
      </Text>
      {message && (
        <Text variant="body" color="textMuted" style={{ textAlign: "center" }}>
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} fullWidth />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 12 },
  icon: { fontSize: 48 },
});
