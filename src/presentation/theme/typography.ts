import type { TextStyle } from "react-native";

export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: "700" },
  /** Large numbers on dashboard / totals */
  stat: { fontSize: 36, lineHeight: 42, fontWeight: "700" },
  h1: { fontSize: 26, lineHeight: 32, fontWeight: "700" },
  h2: { fontSize: 20, lineHeight: 28, fontWeight: "600" },
  h3: { fontSize: 17, lineHeight: 24, fontWeight: "600" },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
  bodyLg: { fontSize: 18, lineHeight: 26, fontWeight: "500" },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: "600" },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
} satisfies Record<string, TextStyle>;

export type Typography = typeof typography;
export type TypographyVariant = keyof Typography;
