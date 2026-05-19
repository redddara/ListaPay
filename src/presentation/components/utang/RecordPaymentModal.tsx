import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { formatMoney, fromMoney, toMoney } from "@core/utils";
import type { Money } from "@core/types";
import type { PaymentMethod } from "@domain/entities";

import { Button, Text } from "@presentation/components/common";
import { useTheme } from "@presentation/theme";

interface RecordPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  customerName: string;
  balance: Money;
  principal: Money;
  amountPaid: Money;
  submitting: boolean;
  error: string | null;
  onSubmit: (amount: Money, method: PaymentMethod, note?: string) => void;
}

const METHODS: { key: PaymentMethod; label: string }[] = [
  { key: "cash", label: "Cash" },
  { key: "gcash", label: "GCash" },
  { key: "bank_transfer", label: "Bank" },
  { key: "other", label: "Other" },
];

export const RecordPaymentModal = ({
  visible,
  onClose,
  customerName,
  balance,
  principal,
  amountPaid,
  submitting,
  error,
  onSubmit,
}: RecordPaymentModalProps) => {
  const theme = useTheme();
  const [amountPesos, setAmountPesos] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (visible) {
      setAmountPesos(fromMoney(balance).toFixed(2));
      setMethod("cash");
      setNote("");
    }
  }, [visible, balance]);

  const parsed = parseFloat(amountPesos) || 0;
  const amount = toMoney(parsed);
  const valid = parsed > 0 && amount <= balance;
  const remaining = (balance - amount) as Money;

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
          <Text variant="h2">Record payment</Text>
          <Text variant="body" color="textMuted">
            {customerName}
          </Text>

          <View
            style={[
              styles.summary,
              { backgroundColor: theme.colors.surfaceMuted },
            ]}
          >
            <Row label="Principal" value={formatMoney(principal)} />
            <Row label="Paid so far" value={formatMoney(amountPaid)} />
            <Row label="Balance due" value={formatMoney(balance)} bold />
          </View>

          <Text variant="bodyStrong" style={{ marginTop: theme.spacing.md }}>
            Amount (₱)
          </Text>
          <View style={styles.quickRow}>
            <Button
              label="Half"
              size="sm"
              variant="secondary"
              onPress={() =>
                setAmountPesos((fromMoney(balance) / 2).toFixed(2))
              }
            />
            <Button
              label="Full balance"
              size="sm"
              variant="secondary"
              onPress={() => setAmountPesos(fromMoney(balance).toFixed(2))}
            />
          </View>
          <TextInput
            value={amountPesos}
            onChangeText={setAmountPesos}
            keyboardType="decimal-pad"
            style={[
              styles.input,
              {
                borderColor: theme.colors.border,
                color: theme.colors.text,
                borderRadius: theme.radii.md,
              },
            ]}
          />
          {parsed > 0 && (
            <Text variant="caption" color="textMuted">
              {amount < balance
                ? `Partial — remaining ${formatMoney(remaining)}`
                : "Pays off this entry"}
            </Text>
          )}

          <Text variant="bodyStrong" style={{ marginTop: theme.spacing.md }}>
            Method
          </Text>
          <View style={styles.methodRow}>
            {METHODS.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => setMethod(m.key)}
                style={[
                  styles.methodChip,
                  {
                    borderColor:
                      method === m.key
                        ? theme.colors.primary
                        : theme.colors.border,
                    backgroundColor:
                      method === m.key
                        ? theme.colors.primaryMuted
                        : theme.colors.surface,
                    borderRadius: theme.radii.md,
                  },
                ]}
              >
                <Text
                  variant="bodyStrong"
                  color={method === m.key ? "primary" : "text"}
                >
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>

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
              label={submitting ? "Saving…" : "Record payment"}
              loading={submitting}
              disabled={!valid}
              onPress={() => onSubmit(amount, method, note.trim() || undefined)}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const Row = ({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <View style={styles.summaryRow}>
    <Text variant="body" color="textMuted">
      {label}
    </Text>
    <Text variant={bold ? "bodyStrong" : "body"}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: { padding: 20, paddingBottom: 32 },
  summary: { padding: 12, borderRadius: 12, gap: 6, marginTop: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  quickRow: { flexDirection: "row", gap: 8, marginTop: 8, marginBottom: 8 },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
  },
  methodRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  methodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
  },
  actions: { flexDirection: "row", gap: 12, alignItems: "center" },
});
