import React from "react";
import { View } from "react-native";

import { Button, Screen, Text } from "@presentation/components";
import { useAuthStore } from "@presentation/stores";
import { useTheme, useThemeContext } from "@presentation/theme";

export const SettingsScreen = () => {
  const theme = useTheme();
  const { preference, setPreference } = useThemeContext();
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing.lg }}>
        <Text variant="h1">Settings</Text>

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="h3">Appearance</Text>
          <Text variant="caption" color="textMuted">
            Current preference: {preference}
          </Text>
          <View style={{ flexDirection: "row", gap: theme.spacing.sm, flexWrap: "wrap" }}>
            <Button label="System" variant="secondary" onPress={() => setPreference("system")} />
            <Button label="Light" variant="secondary" onPress={() => setPreference("light")} />
            <Button label="Dark" variant="secondary" onPress={() => setPreference("dark")} />
          </View>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="h3">Account</Text>
          <Button label="Sign out" variant="danger" onPress={signOut} />
        </View>
      </View>
    </Screen>
  );
};
