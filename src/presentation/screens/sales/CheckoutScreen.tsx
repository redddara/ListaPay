import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { formatMoney, fromMoney, toMoney } from "@core/utils";
import type { ID, Money } from "@core/types";
import type { Customer } from "@domain/entities";
import type { PosPaymentMode } from "@domain/usecases/pos/types";

import { Button, Text } from "@presentation/components/common";
import { CartLineRow } from "@presentation/components/pos";
import { Card, Input, Screen } from "@presentation/components";
import {
  useCartTotals,
  useCustomers,
  useRecordSale,
} from "@presentation/hooks";
import type { SalesStackParamList } from "@presentation/navigation/types";
import { usePosCartStore } from "@presentation/stores/usePosCartStore";
import { useTheme } from "@presentation/theme";

type Nav = NativeStackNavigationProp<SalesStackParamList, "Checkout">;

const PAYMENT_OPTIONS: {
  mode: PosPaymentMode;
  label: string;
  icon: string;
  color: "primary" | "action" | "success";
}[] = [
  { mode: "cash", label: "Cash", icon: "💵", color: "primary" },
  { mode: "utang", label: "Utang", icon: "📋", color: "action" },
  { mode: "partial", label: "Partial", icon: "💰", color: "success" },
];

export const CheckoutScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const lines = usePosCartStore((s) => s.lines);
  const increment = usePosCartStore((s) => s.increment);
  const decrement = usePosCartStore((s) => s.decrement);
  const removeLine = usePosCartStore((s) => s.removeLine);
  const discountPesos = usePosCartStore((s) => s.discountPesos);
  const setDiscountPesos = usePosCartStore((s) => s.setDiscountPesos);
  const clearCart = usePosCartStore((s) => s.clear);

  const { subtotal, discount, total } = useCartTotals();
  const { customers, loading: customersLoading } = useCustomers();
  const { checkout, submitting, error, clearError } = useRecordSale();

  const [mode, setMode] = useState<PosPaymentMode>("cash");
  const [customerId, setCustomerId] = useState<ID | undefined>();
  const [cashPesos, setCashPesos] = useState("");

  const needsCustomer = mode === "utang" || mode === "partial";

  const handleConfirm = async () => {
    clearError();
    const cashPaid =
      mode === "partial" ? toMoney(parseFloat(cashPesos) || 0) : undefined;
    const result = await checkout(mode, customerId, cashPaid);
    if (result) {
      Alert.alert(
        "Done!",
        `Sale total ${formatMoney(result.sale.total)}`,
        [{ text: "OK", onPress: () => navigation.popToTop() }],
      );
    }
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: 16 }}>
        <Card>
          <Text variant="overline" color="textMuted">
            Total to pay
          </Text>
          <Text variant="stat" color="primary">
            {formatMoney(total)}
          </Text>
          <Text variant="caption" color="textMuted">
            Subtotal {formatMoney(subtotal)}
            {discount > 0 ? ` · Discount ${formatMoney(discount)}` : ""}
          </Text>
        </Card>

        <Text variant="h3">Items</Text>
        {lines.map((item) => (
          <CartLineRow
            key={item.productId}
            name={item.name}
            unitPrice={item.unitPrice}
            quantity={item.quantity}
            stock={item.stock}
            productId={item.productId}
            onIncrement={() => increment(item.productId)}
            onDecrement={() => decrement(item.productId)}
            onRemove={() => removeLine(item.productId)}
          />
        ))}

        <Input
          label="Discount (₱)"
          value={discountPesos}
          onChangeText={setDiscountPesos}
          keyboardType="decimal-pad"
        />

        <Text variant="h3">Payment</Text>
        <View style={styles.payRow}>
          {PAYMENT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.mode}
              onPress={() => setMode(opt.mode)}
              style={[
                styles.payBtn,
                {
                  borderColor:
                    mode === opt.mode
                      ? theme.colors[opt.color]
                      : theme.colors.border,
                  backgroundColor:
                    mode === opt.mode
                      ? theme.colors.surfaceMuted
                      : theme.colors.surface,
                  borderRadius: theme.radii.lg,
                },
              ]}
            >
              <Text style={styles.payIcon}>{opt.icon}</Text>
              <Text
                variant="bodyStrong"
                color={mode === opt.mode ? opt.color : "text"}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {mode === "partial" && (
          <Input
            label="Cash received now (₱)"
            value={cashPesos}
            onChangeText={setCashPesos}
            keyboardType="decimal-pad"
            placeholder={fromMoney(total).toFixed(2)}
          />
        )}

        {needsCustomer && (
          <>
            <Text variant="h3">Select suki</Text>
            {customersLoading ? (
              <Text color="textMuted">Loading…</Text>
            ) : (
              <FlatList
                data={customers}
                scrollEnabled={false}
                keyExtractor={(c) => c.id}
                renderItem={({ item }) => (
                  <CustomerChip
                    customer={item}
                    selected={customerId === item.id}
                    onPress={() => setCustomerId(item.id)}
                  />
                )}
              />
            )}
          </>
        )}

        {error && <Text color="danger">{error}</Text>}

        <Button
          label={submitting ? "Processing…" : `Confirm · ${formatMoney(total)}`}
          size="xl"
          fullWidth
          loading={submitting}
          disabled={
            lines.length === 0 ||
            (needsCustomer && !customerId) ||
            (mode === "partial" &&
              (parseFloat(cashPesos) <= 0 ||
                parseFloat(cashPesos) >= fromMoney(total)))
          }
          onPress={handleConfirm}
        />

        <Button
          label="Clear cart"
          variant="ghost"
          fullWidth
          onPress={() => {
            clearCart();
            navigation.goBack();
          }}
        />
      </ScrollView>
    </Screen>
  );
};

const CustomerChip = ({
  customer,
  selected,
  onPress,
}: {
  customer: Customer;
  selected: boolean;
  onPress: () => void;
}) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 14,
        marginBottom: 8,
        borderRadius: theme.radii.md,
        backgroundColor: selected
          ? theme.colors.primaryMuted
          : theme.colors.surface,
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
      }}
    >
      <Text variant="bodyStrong">{customer.name}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  payRow: { flexDirection: "row", gap: 10 },
  payBtn: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderWidth: 2,
    gap: 4,
  },
  payIcon: { fontSize: 28 },
});
