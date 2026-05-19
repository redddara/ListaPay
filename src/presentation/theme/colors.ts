/**
 * Brand palette + semantic color tokens for ListaPay.
 *
 * Brand color is a warm Filipino-sunset orange that pairs well with the
 * green "paid" status used throughout the app. Adjust freely — every screen
 * consumes colors via `useTheme()` so changes propagate automatically.
 */

const palette = {
  white: "#FFFFFF",
  black: "#000000",

  orange50: "#FFF4ED",
  orange100: "#FFE3CC",
  orange500: "#F26B1F",
  orange600: "#D85A14",
  orange700: "#B14710",

  green50: "#E8F7EE",
  green500: "#1FA968",
  green600: "#17875B",

  red50: "#FDECEC",
  red500: "#E5484D",
  red600: "#C62A2F",

  yellow50: "#FFF7E0",
  yellow500: "#F2B61F",

  neutral0: "#FFFFFF",
  neutral50: "#FAFAFA",
  neutral100: "#F2F2F3",
  neutral200: "#E5E5E7",
  neutral300: "#CFCFD4",
  neutral400: "#9C9CA4",
  neutral500: "#6B6B73",
  neutral600: "#4A4A52",
  neutral700: "#2F2F36",
  neutral800: "#1C1C21",
  neutral900: "#0E0E12",
} as const;

export interface ColorTokens {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  divider: string;

  text: string;
  textMuted: string;
  textInverse: string;

  primary: string;
  primaryMuted: string;
  onPrimary: string;

  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  danger: string;
  dangerMuted: string;
}

export const lightColors: ColorTokens = {
  background: palette.neutral50,
  surface: palette.neutral0,
  surfaceMuted: palette.neutral100,
  border: palette.neutral200,
  divider: palette.neutral200,

  text: palette.neutral900,
  textMuted: palette.neutral500,
  textInverse: palette.white,

  primary: palette.orange500,
  primaryMuted: palette.orange100,
  onPrimary: palette.white,

  success: palette.green500,
  successMuted: palette.green50,
  warning: palette.yellow500,
  warningMuted: palette.yellow50,
  danger: palette.red500,
  dangerMuted: palette.red50,
};

export const darkColors: ColorTokens = {
  background: palette.neutral900,
  surface: palette.neutral800,
  surfaceMuted: palette.neutral700,
  border: palette.neutral700,
  divider: palette.neutral700,

  text: palette.neutral0,
  textMuted: palette.neutral400,
  textInverse: palette.neutral900,

  primary: palette.orange500,
  primaryMuted: palette.orange700,
  onPrimary: palette.white,

  success: palette.green500,
  successMuted: palette.green600,
  warning: palette.yellow500,
  warningMuted: palette.neutral700,
  danger: palette.red500,
  dangerMuted: palette.red600,
};

export { palette };
