import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { toMoney } from "@core/utils";
import type { Customer } from "@domain/entities";

import { Button, Text } from "@presentation/components/common";
import { useTheme } from "@presentation/theme";

interface CreateUtangModalProps {
  visible: boolean;
  onClose: () => void;
  customers: Customer[];
  preselectedCustomerId?: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (customerId: string, principalPesos: number, note?: string) => void;
}

export const CreateUtangModal = ({
  visible,
  onClose,
  customers,
  preselectedCustomerId,
  submitting,
  error,
  onSubmit,
}: CreateUtangModalProps) => {
  const theme = useTheme();
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [amountPesos, setAmountPesos] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (visible) {
      setCustomerId(preselectedCustomerId);
      setAmountPesos("");
      setNote("");
    }
  }, [visible, preselectedCustomerId]);

  const parsed = parseFloat(amountPesos) || 0;
  const valid = !!customerId && parsed > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radii.lg,
              borderTopRightRadius: theme.radii.lg,
            },
          ]}
        >
          <Text variant="h2">New utang</Text>
          <Text variant="body" color="textMuted">
            Add a manual lista entry for a customer.
          </Text>

          <Text variant="bodyStrong" style={{ marginTop: theme.spacing.md }}>
            Customer
          </Text>
          <ScrollView style={{ maxHeight: 120, marginTop: 8 }} nestedScrollEnabled>
            {customers.map((c) => (
              <Button
                key={c.id}
                label={c.name}
                variant={customerId === c.id ? "primary" : "secondary"}
                size="sm"
                onPress={() => setCustomerId(c.id)}
                style={{ marginBottom: 6 }}
                fullWidth
              />
            ))}
          </ScrollView>

          <Text variant="bodyStrong" style={{ marginTop: theme.spacing.md }}>
            Amount (₱)
          </Text>
          <TextInput
            value={amountPesos}
            onChangeText={setAmountPesos}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={theme.colors.textMuted}
            style={[
              styles.input,
              {
                borderColor: theme.colors.border,
                color: theme.colors.text,
                borderRadius: theme.radii.md,
                marginTop: 8,
              },
            ]}
          />

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Note (optional)"
            placeholderTextColor={theme.colors.textMuted}
            style={[
              styles.input,
              {
                borderColor: theme.colors.border,
                color: theme.colors.text,
                borderRadius: theme.radii.md,
                marginTop: theme.spacing.sm,
              },
            ]}
          />

          {error && (
            <Text variant="body" color="danger" style={{ marginTop: 8 }}>
              {error}
            </Text>
          )}

          <View style={[styles.actions, { marginTop: theme.spacing.lg }]}>
            <Button label="Cancel" variant="secondary" onPress={onClose} />
            <Button
              label={submitting ? "Saving…" : "Create utang"}
              loading={submitting}
              disabled={!valid}
              onPress={() =>
                customerId &&
                onSubmit(customerId, parsed, note.trim() || undefined)
              }
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: { padding: 20, paddingBottom: 32, maxHeight: "85%" },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
  },
  actions: { flexDirection: "row", gap: 12, alignItems: "center" },
});
