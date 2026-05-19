import { useThemeContext } from "./ThemeProvider";
import type { Theme } from "./tokens";

/** Convenience hook returning only the resolved `Theme` object. */
export const useTheme = (): Theme => useThemeContext().theme;
