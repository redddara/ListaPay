import React, { type PropsWithChildren } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { useTheme } from "@presentation/theme";

interface CardProps {
  style?: ViewStyle;
  padded?: boolean;
  elevated?: boolean;
}

export const Card = ({
  children,
  style,
  padded = true,
  elevated = true,
}: PropsWithChildren<CardProps>) => {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          borderColor: theme.colors.border,
          padding: padded ? theme.spacing.lg : 0,
        },
        elevated && theme.shadows.sm,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
