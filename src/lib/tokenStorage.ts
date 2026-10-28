import * as SecureStore from 'expo-secure-store';

// The employee JWT lives in the device keychain/keystore, never in plain storage.
const KEY = 'be-employee-token';

export const tokenStorage = {
  get: () => SecureStore.getItemAsync(KEY),
  set: (token: string) => SecureStore.setItemAsync(KEY, token),
  clear: () => SecureStore.deleteItemAsync(KEY),
};
