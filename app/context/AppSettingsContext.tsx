import React from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../storage/settings';

export interface AppSettingsContextValue {
  settings: AppSettings;
  refreshSettings: () => Promise<void>;
}

export const AppSettingsContext = React.createContext<AppSettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  refreshSettings: async () => {},
});
