import { darkColors, lightColors, type ColorTokens } from "./colors";
import { radii, type Radii } from "./radii";
import { shadows, type Shadows } from "./shadows";
import { spacing, type Spacing } from "./spacing";
import { typography, type Typography } from "./typography";

export type ColorScheme = "light" | "dark";

export interface Theme {
  scheme: ColorScheme;
  colors: ColorTokens;
  spacing: Spacing;
  radii: Radii;
  typography: Typography;
  shadows: Shadows;
}

export const lightTheme: Theme = {
  scheme: "light",
  colors: lightColors,
  spacing,
  radii,
  typography,
  shadows,
};

export const darkTheme: Theme = {
  scheme: "dark",
  colors: darkColors,
  spacing,
  radii,
  typography,
  shadows,
};

export const themes = { light: lightTheme, dark: darkTheme } as const;
