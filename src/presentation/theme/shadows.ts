import { Platform, type ViewStyle } from "react-native";

const shadow = (elevation: number, opacity: number, radius: number): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000",
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: elevation / 2 },
    },
    android: { elevation },
    default: {},
  })!;

export const shadows = {
  none: {},
  sm: shadow(2, 0.06, 4),
  md: shadow(4, 0.08, 8),
  lg: shadow(8, 0.12, 16),
} as const;

export type Shadows = typeof shadows;
export type ShadowKey = keyof Shadows;
