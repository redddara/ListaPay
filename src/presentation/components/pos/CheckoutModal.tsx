import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { formatMoney, fromMoney, toMoney } from "@core/utils";
import type { ID, Money } from "@core/types";
import type { Customer } from "@domain/entities";
import type { CheckoutResult, PosPaymentMode } from "@domain/usecases/pos/types";

import { Button, Text } from "@presentation/components/common";
import { useTheme } from "@presentation/theme";

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  subtotal: Money;
  discount: Money;
  total: Money;
  customers: Customer[];
  customersLoading: boolean;
  submitting: boolean;
  error: string | null;
  onCheckout: (
    mode: PosPaymentMode,
    customerId?: ID,
    cashPaid?: Money,
  ) => Promise<CheckoutResult | null>;
  onSuccess: (result: CheckoutResult) => void;
}

const PAYMENT_MODES: { key: PosPaymentMode; label: string; hint: string }[] = [
  { key: "cash", label: "Cash", hint: "Full payment now" },
  { key: "utang", label: "Utang", hint: "Full amount on lista" },
  { key: "partial", label: "Partial", hint: "Cash now + utang balance" },
];

export const CheckoutModal = ({
  visible,
  onClose,
  subtotal,
  discount,
  total,
  customers,
  customersLoading,
  submitting,
  error,
  onCheckout,
  onSuccess,
}: CheckoutModalProps) => {
  const theme = useTheme();
  const [mode, setMode] = useState<PosPaymentMode>("cash");
  const [customerId, setCustomerId] = useState<ID | undefined>();
  const [cashPesos, setCashPesos] = useState("");

  useEffect(() => {
    if (!visible) {
      setMode("cash");
      setCustomerId(undefined);
      setCashPesos("");
    }
  }, [visible]);

  const needsCustomer = mode === "utang" || mode === "partial";
  const utangBalance =
    mode === "partial"
      ? (total - toMoney(parseFloat(cashPesos) || 0)) as Money
      : mode === "utang"
        ? total
        : (0 as Money);

  const handleConfirm = async () => {
    const cashPaid =
      mode === "partial" ? toMoney(parseFloat(cashPesos) || 0) : undefined;
    const result = await onCheckout(mode, customerId, cashPaid);
    if (result) {
      onSuccess(result);
      onClose();
    }
  };

  const canSubmit =
    !submitting &&
    (mode === "cash" || (needsCustomer && customerId)) &&
    (mode !== "partial" ||
      (parseFloat(cashPesos) > 0 && parseFloat(cashPesos) < fromMoney(total)));

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
          <View style={styles.handle} />
          <Text variant="h2">Checkout</Text>

          <View style={[styles.summary, { backgroundColor: theme.colors.surfaceMuted }]}>
            <Row label="Subtotal" value={formatMoney(subtotal)} />
            <Row label="Discount" value={`−${formatMoney(discount)}`} />
            <Row label="Total" value={formatMoney(total)} bold />
          </View>

          <Text variant="bodyStrong" style={{ marginTop: theme.spacing.md }}>
            Payment
          </Text>
          <View style={styles.modeRow}>
            {PAYMENT_MODES.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => setMode(m.key)}
                style={[
                  styles.modeChip,
                  {
                    borderColor:
                      mode === m.key ? theme.colors.primary : theme.colors.border,
                    backgroundColor:
                      mode === m.key
                        ? theme.colors.primaryMuted
                        : theme.colors.surface,
                    borderRadius: theme.radii.md,
                  },
                ]}
              >
                <Text
                  variant="bodyStrong"
                  color={mode === m.key ? "primary" : "text"}
                >
                  {m.label}
                </Text>
                <Text variant="caption" color="textMuted">
                  {m.hint}
                </Text>
              </Pressable>
            ))}
          </View>

          {mode === "partial" && (
            <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.md }}>
              <Text variant="bodyStrong">Cash received (₱)</Text>
              <TextInput
                value={cashPesos}
                onChangeText={setCashPesos}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.input,
                  {
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                    borderRadius: theme.radii.md,
                  },
                ]}
              />
              <Text variant="caption" color="textMuted">
                Utang balance: {formatMoney(utangBalance)}
              </Text>
            </View>
          )}

          {needsCustomer && (
            <View style={{ marginTop: theme.spacing.md, flex: 1 }}>
              <Text variant="bodyStrong">Customer (Suki)</Text>
              {customersLoading ? (
                <ActivityIndicator style={{ marginTop: theme.spacing.md }} />
              ) : (
                <ScrollView
                  style={{ maxHeight: 160, marginTop: theme.spacing.sm }}
                  nestedScrollEnabled
                >
                  {customers.map((c) => (
                    <Pressable
                      key={c.id}
                      onPress={() => setCustomerId(c.id)}
                      style={[
                        styles.customerRow,
                        {
                          backgroundColor:
                            customerId === c.id
                              ? theme.colors.primaryMuted
                              : "transparent",
                          borderRadius: theme.radii.sm,
                        },
                      ]}
                    >
                      <Text variant="bodyStrong">{c.name}</Text>
                      {c.phone && (
                        <Text variant="caption" color="textMuted">
                          {c.phone}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {error && (
            <Text variant="body" color="danger" style={{ marginTop: theme.spacing.sm }}>
              {error}
            </Text>
          )}

          <View style={[styles.actions, { gap: theme.spacing.sm }]}>
            <Button label="Cancel" variant="secondary" onPress={onClose} />
            <Button
              label={submitting ? "Processing…" : "Complete sale"}
              loading={submitting}
              disabled={!canSubmit}
              onPress={handleConfirm}
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
    <Text variant={bold ? "bodyStrong" : "body"} color="textMuted">
      {label}
    </Text>
    <Text variant={bold ? "h3" : "bodyStrong"}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    padding: 20,
    paddingBottom: 32,
    maxHeight: "90%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  summary: { padding: 12, borderRadius: 12, gap: 6, marginTop: 12 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modeRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  modeChip: {
    flex: 1,
    padding: 10,
    borderWidth: 1.5,
    gap: 2,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
  },
  customerRow: { padding: 10, gap: 2 },
  actions: { flexDirection: "row", marginTop: 16, alignItems: "center" },
});
