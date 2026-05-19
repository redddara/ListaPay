import type { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";

import type { RootStackParamList } from "./types";

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
          Home: "home",
          Sell: "sell",
          Suki: "suki",
          Utang: "utang",
          More: "more",
        },
      },
    },
  },
};
