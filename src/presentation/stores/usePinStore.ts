import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const PIN_KEY = "listapay_app_pin";
const PIN_ENABLED_KEY = "listapay_pin_enabled";

interface PinState {
  enabled: boolean;
  unlocked: boolean;
  loaded: boolean;

  load: () => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  disablePin: () => Promise<void>;
  lock: () => void;
  unlock: () => void;
}

export const usePinStore = create<PinState>((set, get) => ({
  enabled: false,
  unlocked: true,
  loaded: false,

  load: async () => {
    const enabled = (await SecureStore.getItemAsync(PIN_ENABLED_KEY)) === "1";
    set({ enabled, unlocked: !enabled, loaded: true });
  },

  setPin: async (pin: string) => {
    if (pin.length < 4) throw new Error("PIN must be at least 4 digits");
    await SecureStore.setItemAsync(PIN_KEY, pin);
    await SecureStore.setItemAsync(PIN_ENABLED_KEY, "1");
    set({ enabled: true, unlocked: true });
  },

  verifyPin: async (pin: string) => {
    const stored = await SecureStore.getItemAsync(PIN_KEY);
    const ok = stored === pin;
    if (ok) set({ unlocked: true });
    return ok;
  },

  disablePin: async () => {
    await SecureStore.deleteItemAsync(PIN_KEY);
    await SecureStore.deleteItemAsync(PIN_ENABLED_KEY);
    set({ enabled: false, unlocked: true });
  },

  lock: () => {
    if (get().enabled) set({ unlocked: false });
  },

  unlock: () => set({ unlocked: true }),
}));
