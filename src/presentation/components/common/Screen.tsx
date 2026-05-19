import React, { type PropsWithChildren } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  type ScrollViewProps,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@presentation/theme";

interface ScreenProps {
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  scrollViewProps?: ScrollViewProps;
}

/**
 * Themed screen container. Wraps content in a `SafeAreaView` and applies
 * the active theme's `background` color. Use this as the root of every
 * screen so theming/safe-area behavior stays consistent.
 */
export const Screen = ({
  children,
  scroll = false,
  padded = true,
  style,
  scrollViewProps,
}: PropsWithChildren<ScreenProps>) => {
  const theme = useTheme();
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: padded ? theme.spacing.lg : 0,
  };

  if (scroll) {
    return (
      <SafeAreaView style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}>
        <StatusBar
          barStyle={theme.scheme === "dark" ? "light-content" : "dark-content"}
        />
        <ScrollView
          contentContainerStyle={[styles.scrollContent, containerStyle]}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[containerStyle, style]}>
      <StatusBar
        barStyle={theme.scheme === "dark" ? "light-content" : "dark-content"}
      />
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
});
