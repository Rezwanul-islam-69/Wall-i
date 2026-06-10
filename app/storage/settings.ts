import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentColor = 'purple' | 'cyan' | 'green';

export interface AppSettings {
  currencyCode: string;
  currencySymbol: string;
  theme: ThemeMode;
  accent: AccentColor;
  maxTransactionLimit: number;
  enableHints: boolean;
}

const SETTINGS_KEY = 'wallet_app_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  currencyCode: 'BDT',
  currencySymbol: '৳',
  theme: 'dark',
  accent: 'purple',
  maxTransactionLimit: 1000000,
  enableHints: true,
};

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const getSettings = async (): Promise<AppSettings> => {
  const raw = await SecureStore.getItemAsync(SETTINGS_KEY);
  return safeParse<AppSettings>(raw, DEFAULT_SETTINGS);
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(settings));
};