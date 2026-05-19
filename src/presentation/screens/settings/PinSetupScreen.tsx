import React, { useState } from "react";
import { View } from "react-native";

import { Button, Text } from "@presentation/components/common";
import { Input, Screen } from "@presentation/components";
import { usePinStore } from "@presentation/stores/usePinStore";
import { useTheme } from "@presentation/theme";

export const PinSetupScreen = () => {
  const theme = useTheme();
  const { enabled, setPin, disablePin } = usePinStore();
  const [pin, setPinValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError(null);
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }
    if (pin !== confirm) {
      setError("PINs do not match");
      return;
    }
    setSaving(true);
    try {
      await setPin(pin);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save PIN");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View style={{ gap: theme.spacing.lg }}>
        <Text variant="body" color="textMuted">
          {enabled
            ? "PIN is on. Enter a new PIN to change it, or disable below."
            : "Lock the app with a 4-digit PIN when you step away."}
        </Text>
        <Input
          label="New PIN"
          value={pin}
          onChangeText={setPinValue}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
        />
        <Input
          label="Confirm PIN"
          value={confirm}
          onChangeText={setConfirm}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
        />
        {error && <Text color="danger">{error}</Text>}
        <Button
          label={saving ? "Saving…" : "Save PIN"}
          size="lg"
          fullWidth
          loading={saving}
          onPress={handleSave}
        />
        {enabled && (
          <Button
            label="Disable PIN"
            variant="danger"
            fullWidth
            onPress={disablePin}
          />
        )}
      </View>
    </Screen>
  );
};
