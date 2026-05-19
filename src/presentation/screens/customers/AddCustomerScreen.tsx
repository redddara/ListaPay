import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";

import { Button, Text } from "@presentation/components/common";
import { Input, Screen } from "@presentation/components";
import { useCreateCustomer } from "@presentation/hooks";
import { useTheme } from "@presentation/theme";

export const AddCustomerScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { create, submitting, error, clearError } = useCreateCustomer();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleSave = async () => {
    clearError();
    if (!name.trim()) return;
    const notes = address.trim()
      ? `Address: ${address.trim()}`
      : undefined;
    const customer = await create({
      name,
      phone: phone.trim() || undefined,
      notes,
    });
    if (customer) navigation.goBack();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: theme.spacing.lg }}>
        <Text variant="body" color="textMuted">
          Keep it simple — name is enough to start.
        </Text>
        <Input
          label="Name *"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Aling Maria"
          autoFocus
        />
        <Input
          label="Contact number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="09xx xxx xxxx"
        />
        <Input
          label="Address (optional)"
          value={address}
          onChangeText={setAddress}
          placeholder="Street / landmark"
        />
        {error && <Text color="danger">{error}</Text>}
        <Button
          label={submitting ? "Saving…" : "Save customer"}
          size="xl"
          fullWidth
          loading={submitting}
          disabled={!name.trim()}
          onPress={handleSave}
        />
      </ScrollView>
    </Screen>
  );
};
