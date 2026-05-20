import * as Linking from "expo-linking";
import { Platform } from "react-native";

import { getWebDevUrl } from "@core/config/webDevUrl";

/** Redirect target for Supabase email confirmation / password reset links. */
export const getAuthRedirectUrl = (): string => {
  if (Platform.OS === "web") {
    return getWebDevUrl();
  }
  return Linking.createURL("/");
};
