import type { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Login: undefined;
};

export type SalesStackParamList = {
  Pos: undefined;
  Checkout: undefined;
};

export type CustomersStackParamList = {
  CustomerList: undefined;
  CustomerDetail: { customerId: string; customerName: string };
  AddCustomer: undefined;
};

export type DebtsStackParamList = {
  DebtsHome: undefined;
  CustomerLedger: { customerId: string; customerName: string };
  UtangDetail: { debtEntryId: string; customerName: string };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  Products: undefined;
  PinSetup: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Sell: NavigatorScreenParams<SalesStackParamList>;
  Suki: NavigatorScreenParams<CustomersStackParamList>;
  Utang: NavigatorScreenParams<DebtsStackParamList>;
  More: NavigatorScreenParams<SettingsStackParamList>;
};

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
