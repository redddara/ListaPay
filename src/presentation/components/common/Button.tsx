import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
} from "react-native";

import { useTheme } from "@presentation/theme";

import { Text } from "./Text";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "action" | "success";
type Size = "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button = ({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  style,
  disabled,
  ...rest
}: ButtonProps) => {
  const theme = useTheme();

  const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: theme.colors.primary, fg: theme.colors.onPrimary },
    secondary: {
      bg: theme.colors.surfaceMuted,
      fg: theme.colors.text,
      border: theme.colors.border,
    },
    ghost: { bg: "transparent", fg: theme.colors.primary },
    danger: { bg: theme.colors.danger, fg: theme.colors.onPrimary },
    action: { bg: theme.colors.action, fg: theme.colors.onAction },
    success: { bg: theme.colors.success, fg: theme.colors.onPrimary },
  };

  const sizes: Record<
    Size,
    { py: number; px: number; variant: "body" | "bodyStrong" | "bodyLg" }
  > = {
    sm: { py: theme.spacing.xs, px: theme.spacing.md, variant: "body" },
    md: { py: theme.spacing.sm + 2, px: theme.spacing.lg, variant: "bodyStrong" },
    lg: { py: theme.spacing.md, px: theme.spacing.xl, variant: "bodyStrong" },
    xl: { py: theme.spacing.lg, px: theme.spacing.xl, variant: "bodyLg" },
  };

  const s = sizes[size];
  const p = palette[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: p.bg,
          borderColor: p.border ?? "transparent",
          borderWidth: p.border ? StyleSheet.hairlineWidth : 0,
          borderRadius: theme.radii.md,
          paddingVertical: s.py,
          paddingHorizontal: s.px,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <Text
          variant={s.variant}
          style={{ color: p.fg, textAlign: "center" }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
});
