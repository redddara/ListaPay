import type { NavigatorScreenParams } from "@react-navigation/native";

/** Stack for unauthenticated flows (login, signup, recovery). */
export type AuthStackParamList = {
  Login: undefined;
};

/** Bottom-tab navigator for the main authenticated app shell. */
export type MainTabParamList = {
  Dashboard: undefined;
  Products: undefined;
  Sales: undefined;
  Debts: undefined;
  Settings: undefined;
};

/** Root stack. Picks between auth flow and main app shell. */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
