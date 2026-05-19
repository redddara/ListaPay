import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

import { Button, Text } from "@presentation/components/common";
import { Card, Input, Screen } from "@presentation/components";
import { useAuth } from "@presentation/hooks";
import { useTheme } from "@presentation/theme";

export const LoginScreen = () => {
  const theme = useTheme();
  const {
    signIn,
    signUp,
    devBypass,
    loading,
    error,
    clearError,
    isSupabaseConfigured,
  } = useAuth();

  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleSubmit = async () => {
    clearError();
    if (mode === "signIn") await signIn(email, password);
    else await signUp(email, password, displayName || "Store Owner");
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            gap: theme.spacing.lg,
            paddingVertical: theme.spacing.xl,
          }}
        >
          <Text variant="display" color="primary" style={{ textAlign: "center" }}>
            ListaPay
          </Text>
          <Text variant="bodyLg" color="textMuted" style={{ textAlign: "center" }}>
            Simple POS & utang for your store
          </Text>

          {!isSupabaseConfigured ? (
            <Card>
              <Text variant="body" color="textMuted" style={{ marginBottom: 12 }}>
                Running in offline mode. Add Supabase keys to `.env` for cloud
                backup.
              </Text>
              <Button
                label="Start offline"
                size="xl"
                fullWidth
                onPress={devBypass}
              />
            </Card>
          ) : (
            <Card>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {mode === "signUp" && (
                <Input
                  label="Your name"
                  value={displayName}
                  onChangeText={setDisplayName}
                />
              )}
              {error && (
                <Text color="danger" style={{ marginTop: 8 }}>
                  {error}
                </Text>
              )}
              <Button
                label={mode === "signIn" ? "Sign in" : "Create account"}
                size="xl"
                fullWidth
                loading={loading}
                onPress={handleSubmit}
                style={{ marginTop: 12 }}
              />
              <Button
                label={
                  mode === "signIn" ? "New store? Sign up" : "Back to sign in"
                }
                variant="ghost"
                fullWidth
                onPress={() => {
                  clearError();
                  setMode(mode === "signIn" ? "signUp" : "signIn");
                }}
              />
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};
