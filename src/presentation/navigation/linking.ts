import type { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";

import type { RootStackParamList } from "./types";

/**
 * Deep-linking config. Uses the `listapay://` scheme declared in `app.json`.
 * Extend as new screens come online.
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/"), "listapay://"],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: "login",
        },
      },
      Main: {
        screens: {
          Dashboard: "",
          Sales: "sales",
          Debts: "debts",
          Products: "products",
          Settings: "settings",
        },
      },
    },
  },
};
