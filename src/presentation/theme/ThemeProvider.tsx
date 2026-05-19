import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { Appearance, type ColorSchemeName } from "react-native";

import { darkTheme, lightTheme, type ColorScheme, type Theme } from "./tokens";

export type ThemePreference = ColorScheme | "system";

interface ThemeContextValue {
  theme: Theme;
  scheme: ColorScheme;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const resolveScheme = (
  preference: ThemePreference,
  system: ColorSchemeName,
): ColorScheme => {
  if (preference === "system") return system === "dark" ? "dark" : "light";
  return preference;
};

interface ThemeProviderProps {
  /** Initial preference. Defaults to `"system"`. */
  initialPreference?: ThemePreference;
}

export const ThemeProvider = ({
  children,
  initialPreference = "system",
}: PropsWithChildren<ThemeProviderProps>) => {
  const [preference, setPreference] = useState<ThemePreference>(initialPreference);
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) =>
      setSystemScheme(colorScheme),
    );
    return () => sub.remove();
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const scheme = resolveScheme(preference, systemScheme);
    return {
      theme: scheme === "dark" ? darkTheme : lightTheme,
      scheme,
      preference,
      setPreference,
    };
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used inside <ThemeProvider />");
  }
  return ctx;
};
