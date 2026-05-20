import { registerRootComponent } from "expo";
import { Platform } from "react-native";

import { ensureWebIsolatedPortForAuthCallback } from "@core/auth";
import App from "./App";

if (Platform.OS === "web") {
  // Email confirm links must land on the COEP proxy port, not :8081.
  ensureWebIsolatedPortForAuthCallback();
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
