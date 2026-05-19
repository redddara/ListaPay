import React from "react";
import { View } from "react-native";

import { Button, Screen, Text } from "@presentation/components";
import { useAuthStore } from "@presentation/stores";
import { useTheme } from "@presentation/theme";

export const LoginScreen = () => {
  const theme = useTheme();
  const setSession = useAuthStore((s) => s.setSession);

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", gap: theme.spacing.lg }}>
        <Text variant="display" color="primary">
          ListaPay
        </Text>
        <Text variant="body" color="textMuted">
          Sari-sari store, debt-tracking, and payments — all in your pocket.
        </Text>

        <Button
          label="Continue (placeholder)"
          fullWidth
          onPress={() =>
            setSession({
              accessToken: "dev",
              refreshToken: "dev",
              expiresAt: Date.now() + 3600_000,
              user: {
                id: "dev-user" as never,
                email: "owner@listapay.test",
                displayName: "Store Owner",
                role: "owner",
                storeId: "dev-store" as never,
                createdAt: new Date().toISOString() as never,
              },
            })
          }
        />

        <Text variant="caption" color="textMuted">
          Login UI is intentionally stubbed. Replace with the real auth use
          case in `domain/usecases/auth/` once that feature is built.
        </Text>
      </View>
    </Screen>
  );
};
