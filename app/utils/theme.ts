import { Appearance } from 'react-native';
import { AppSettings, AccentColor, ThemeMode } from '../storage/settings';

export const ACCENT_COLORS: Record<AccentColor, string> = {
  purple: '#6C63FF',
  cyan: '#57D1FF',
  green: '#4CAF50',
};

export const resolveThemeMode = (theme: ThemeMode): 'light' | 'dark' => {
  if (theme === 'system') {
    const scheme = Appearance.getColorScheme();
    return scheme === 'light' ? 'light' : 'dark';
  }
  return theme;
};

export const getThemeColors = (settings: AppSettings) => {
  const mode = resolveThemeMode(settings.theme);
  return {
    bg: mode === 'light' ? '#F5F7FF' : '#0F1023',
    surface: mode === 'light' ? '#FFFFFF' : '#1A1A2E',
    card: mode === 'light' ? '#F2F4FF' : '#141B3E',
    border: mode === 'light' ? '#E8EBFF' : '#262E52',
    text: mode === 'light' ? '#1F2C4C' : '#FFFFFF',
    sub: mode === 'light' ? '#606B8D' : '#A0A0B0',
    accent: ACCENT_COLORS[settings.accent],
    input: mode === 'light' ? '#EFF2FF' : '#0F152F',
    muted: mode === 'light' ? '#8E99B3' : '#6D78A6',
  };
};
