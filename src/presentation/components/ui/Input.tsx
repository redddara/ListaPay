import React from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { Text } from "@presentation/components/common";
import { useTheme } from "@presentation/theme";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, style, ...rest }: InputProps) => {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      {label && <Text variant="bodyStrong">{label}</Text>}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            color: theme.colors.text,
            borderRadius: theme.radii.md,
            fontSize: 18,
          },
          style,
        ]}
        {...rest}
      />
      {error && (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
});
