import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { LoginScreen } from "@presentation/screens";

import type { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);
