import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const isWeb =
  Platform.OS === 'web' &&
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as unknown as { localStorage?: Storage }).localStorage !== 'undefined';

const TOKEN_KEYS = new Set(['accessToken', 'refreshToken']);

function isTokenKey(key: string): boolean {
  return TOKEN_KEYS.has(key);
}

/** Expo Go / native: auth tokens use SecureStore (always available). Other keys use AsyncStorage. */
async function nativeGet(key: string): Promise<string | null> {
  if (isTokenKey(key)) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  }
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function nativeSet(key: string, value: string): Promise<void> {
  if (isTokenKey(key)) {
    await SecureStore.setItemAsync(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
}

async function nativeRemove(key: string): Promise<void> {
  if (isTokenKey(key)) {
    await SecureStore.deleteItemAsync(key);
    return;
  }
  await AsyncStorage.removeItem(key);
}

/**
 * Web: localStorage. Native: SecureStore for session tokens (Expo Go–safe); AsyncStorage for other keys.
 */
export const appStorage = {
  getItem(key: string): Promise<string | null> {
    if (isWeb) {
      try {
        return Promise.resolve((globalThis as unknown as { localStorage: Storage }).localStorage.getItem(key));
      } catch {
        return Promise.resolve(null);
      }
    }
    return nativeGet(key);
  },

  setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      try {
        (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(key, value);
      } catch {
        /* quota / private mode */
      }
      return Promise.resolve();
    }
    return nativeSet(key, value);
  },

  removeItem(key: string): Promise<void> {
    if (isWeb) {
      try {
        (globalThis as unknown as { localStorage: Storage }).localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      return Promise.resolve();
    }
    return nativeRemove(key);
  },

  getAllKeys(): Promise<string[]> {
    if (isWeb) {
      try {
        return Promise.resolve(
          Object.keys((globalThis as unknown as { localStorage: Storage }).localStorage)
        );
      } catch {
        return Promise.resolve([]);
      }
    }
    return AsyncStorage.getAllKeys()
      .then((keys) => [...keys])
      .catch(() => [] as string[]);
  },

  multiRemove(keys: string[]): Promise<void> {
    if (isWeb) {
      const ls = (globalThis as unknown as { localStorage: Storage }).localStorage;
      try {
        keys.forEach((k) => ls.removeItem(k));
      } catch {
        /* ignore */
      }
      return Promise.resolve();
    }
    return (async () => {
      for (const k of keys) {
        try {
          await nativeRemove(k);
        } catch {
          /* ignore */
        }
      }
    })();
  },
};

/** Dev API host: LAN IP from Metro (Expo Go on device); localhost for simulators when unset. */
export function getDevLanHost(): string {
  const expoGo = Constants.expoGoConfig as { debuggerHost?: string } | null;
  const dbg =
    expoGo?.debuggerHost ??
    (Constants.expoConfig as { hostUri?: string } | null)?.hostUri ??
    (Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost;
  if (typeof dbg === 'string' && dbg.length > 0) {
    return dbg.split(':')[0] || 'localhost';
  }
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }
  return 'localhost';
}
