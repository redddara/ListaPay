import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import { Text } from "@presentation/components/common";
import {
  QuickActionButton,
  Screen,
  StatCard,
} from "@presentation/components";
import { useDashboardStats } from "@presentation/hooks";
import type { MainTabParamList } from "@presentation/navigation/types";
import { useTheme } from "@presentation/theme";

type TabNav = BottomTabNavigationProp<MainTabParamList, "Home">;

export const DashboardScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<TabNav>();
  const { stats, loading, reload } = useDashboardStats();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return (
    <Screen padded={false} scroll>
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          gap: theme.spacing.lg,
        }}
      >
        <View>
          <Text variant="overline" color="textMuted">
            Today
          </Text>
          <Text variant="h1">ListaPay</Text>
        </View>

        {loading || !stats ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <View style={styles.statsRow}>
            <StatCard
              label="Sales today"
              value={stats.salesTodayFormatted}
              tone="action"
            />
            <StatCard
              label="Unpaid utang"
              value={stats.totalUtangFormatted}
              tone={stats.totalUtang > 0 ? "danger" : "success"}
            />
          </View>
        )}

        {stats && (
          <StatCard
            label="Customers with debt"
            value={String(stats.customersWithDebt)}
            tone={stats.customersWithDebt > 0 ? "warning" : "success"}
          />
        )}

        <Text variant="h3">Quick actions</Text>
        <View style={styles.actions}>
          <QuickActionButton
            icon="🛒"
            label="New Sale"
            variant="primary"
            onPress={() => navigation.navigate("Sell", { screen: "Pos" })}
          />
          <QuickActionButton
            icon="👤"
            label="Add Customer"
            variant="action"
            onPress={() =>
              navigation.navigate("Suki", { screen: "AddCustomer" })
            }
          />
        </View>
        <QuickActionButton
          icon="📋"
          label="View Utang"
          variant="success"
          onPress={() =>
            navigation.navigate("Utang", { screen: "DebtsHome" })
          }
        />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  statsRow: { flexDirection: "row", gap: 12 },
  actions: { flexDirection: "row", gap: 12 },
});
