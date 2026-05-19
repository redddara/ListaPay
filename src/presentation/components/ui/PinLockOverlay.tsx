import React, { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";

import { Button, Text } from "@presentation/components/common";
import { Input } from "@presentation/components/ui/Input";
import { usePinStore } from "@presentation/stores/usePinStore";
import { useTheme } from "@presentation/theme";

export const PinLockOverlay = () => {
  const theme = useTheme();
  const { enabled, unlocked, verifyPin } = usePinStore();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const visible = enabled && !unlocked;

  const handleUnlock = async () => {
    const ok = await verifyPin(pin);
    if (ok) {
      setPin("");
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <Modal visible={visible} animationType="fade">
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text variant="h1">Enter PIN</Text>
        <Text variant="body" color="textMuted" style={{ marginBottom: 16 }}>
          ListaPay is locked
        </Text>
        <Input
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          placeholder="••••"
        />
        {error && (
          <Text color="danger" style={{ marginTop: 8 }}>
            Wrong PIN
          </Text>
        )}
        <Button
          label="Unlock"
          size="xl"
          fullWidth
          onPress={handleUnlock}
          style={{ marginTop: 24 }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
});
