import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";

import { Text } from "@presentation/components/common";
import { useTheme } from "@presentation/theme";

type Props = {
  message: string;
  onRetry: () => void;
};

export const BootstrapErrorView = ({ message, onRetry }: Props) => {
  const theme = useTheme();
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text variant="h1" style={{ marginBottom: 8 }}>
        Could not start ListaPay
      </Text>
      <Text variant="body" color="textMuted" style={styles.message}>
        {message}
      </Text>
      {Platform.OS === "web" ? (
        <Text variant="caption" color="textMuted" style={styles.hint}>
          For web: run `npm run web`, open http://localhost:19006, then hard-refresh
          once (Ctrl+Shift+R) if you see a SQLite / VFS error after confirming email.
          Phone: Expo Go (QR in terminal) is the best experience for ListaPay.
        </Text>
      ) : null}
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: theme.colors.primary,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text variant="bodyStrong" style={{ color: theme.colors.onPrimary }}>
          Try again
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  message: {
    marginBottom: 12,
  },
  hint: {
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
