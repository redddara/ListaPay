import React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { useTheme, type TypographyVariant } from "@presentation/theme";

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  /** Use a semantic color token; defaults to `text`. */
  color?: "text" | "textMuted" | "textInverse" | "primary" | "danger" | "success";
}

/** Themed text. Always prefer this over the raw `react-native` `<Text/>`. */
export const Text = ({
  variant = "body",
  color = "text",
  style,
  ...rest
}: TextProps) => {
  const theme = useTheme();
  return (
    <RNText
      style={[
        theme.typography[variant],
        { color: theme.colors[color] },
        style,
      ]}
      {...rest}
    />
  );
};
