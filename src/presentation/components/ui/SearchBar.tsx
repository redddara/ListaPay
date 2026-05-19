import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useTheme } from "@presentation/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Search…",
}: SearchBarProps) => {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
        },
      ]}
    >
      <Text style={[styles.icon, { color: theme.colors.textMuted }]}>{"🔍"}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, { color: theme.colors.text }]}
        clearButtonMode="while-editing"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 52,
  },
  icon: { fontSize: 18, marginRight: 8 },
  input: { flex: 1, fontSize: 17, paddingVertical: 12 },
});
