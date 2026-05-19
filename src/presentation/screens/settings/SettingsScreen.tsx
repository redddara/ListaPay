import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { View } from "react-native";

import { isSupabaseConfigured } from "@core/config/env";

import { Button, Text } from "@presentation/components/common";
import { Card, Screen } from "@presentation/components";
import { useAuth, useSync } from "@presentation/hooks";
import type { SettingsStackParamList } from "@presentation/navigation/types";
import { usePinStore } from "@presentation/stores/usePinStore";
import { useTheme, useThemeContext } from "@presentation/theme";

type Nav = NativeStackNavigationProp<SettingsStackParamList, "SettingsHome">;

export const SettingsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { preference, setPreference } = useThemeContext();
  const { session, signOut, loading: authLoading } = useAuth();
  const {
    syncStatus,
    pendingCount,
    lastSyncAt,
    lastSyncError,
    syncNow,
    canSync,
  } = useSync();
  const { enabled: pinEnabled } = usePinStore();

  const online = isSupabaseConfigured() && canSync;

  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing.lg }}>
        <Text variant="h1">Settings</Text>

        {session && (
          <Card>
            <Text variant="h3">{session.user.displayName}</Text>
            <Text variant="body" color="textMuted">
              {session.user.email}
            </Text>
          </Card>
        )}

        <Card>
          <Text variant="h3">Sync</Text>
          <Text variant="bodyLg" color={online ? "success" : "textMuted"}>
            {online ? "● Online ready" : "● Offline / local only"}
          </Text>
          <Text variant="caption" color="textMuted" style={{ marginTop: 8 }}>
            Pending uploads: {pendingCount}
          </Text>
          {lastSyncAt && (
            <Text variant="caption" color="textMuted">
              Last sync: {new Date(lastSyncAt).toLocaleString("en-PH")}
            </Text>
          )}
          {lastSyncError && (
            <Text variant="caption" color="danger">
              {lastSyncError}
            </Text>
          )}
          <Button
            label={syncStatus === "syncing" ? "Syncing…" : "Backup / Sync now"}
            variant="action"
            fullWidth
            loading={syncStatus === "syncing"}
            disabled={!canSync}
            onPress={syncNow}
            style={{ marginTop: 12 }}
          />
        </Card>

        <Card>
          <Text variant="h3">Store</Text>
          <Button
            label="Manage products"
            variant="secondary"
            fullWidth
            onPress={() => navigation.navigate("Products")}
            style={{ marginTop: 8 }}
          />
        </Card>

        <Card>
          <Text variant="h3">Security</Text>
          <Text variant="caption" color="textMuted">
            PIN lock: {pinEnabled ? "On" : "Off"}
          </Text>
          <Button
            label={pinEnabled ? "Change PIN" : "Set up PIN"}
            variant="secondary"
            fullWidth
            onPress={() => navigation.navigate("PinSetup")}
            style={{ marginTop: 8 }}
          />
        </Card>

        <Card>
          <Text variant="h3">Appearance</Text>
          <View
            style={{
              flexDirection: "row",
              gap: theme.spacing.sm,
              marginTop: 8,
              flexWrap: "wrap",
            }}
          >
            <Button
              label="System"
              variant="secondary"
              size="sm"
              onPress={() => setPreference("system")}
            />
            <Button
              label="Light"
              variant="secondary"
              size="sm"
              onPress={() => setPreference("light")}
            />
            <Button
              label="Dark"
              variant="secondary"
              size="sm"
              onPress={() => setPreference("dark")}
            />
          </View>
          <Text variant="caption" color="textMuted" style={{ marginTop: 8 }}>
            Current: {preference}
          </Text>
        </Card>

        <Button
          label="Sign out"
          variant="danger"
          size="lg"
          fullWidth
          loading={authLoading}
          onPress={signOut}
        />
      </View>
    </Screen>
  );
};
