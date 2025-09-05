import React, { createContext, useState, useEffect, useContext } from 'react';
import type { AllSettings, ModeSettings } from '../types';

// A custom hook to manage state in localStorage
function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const valueToStore = JSON.stringify(storedValue);
      window.localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}


const defaultSettings: AllSettings = {
  rainbow: {
    prompt: '在第一张人物图像中，让他们像拿着卡片一样拿着第二张图像中的物体。保持人物和背景不变。',
    referenceImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDI1NSwwLDApO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjE2LjYlIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMjU1LDI1NSwwKTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIzMy4zJSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDAsMjU1LDApO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjUwJSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDAsMjU1LDI1NSk7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iNjYuNiUiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigwLDAsMjU1KTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSI4My4zJSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDI1NSwwLDI1NSk7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDI1NSwwLDApO3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3QgeD0iNSIgeT0iNSIgcng9IjEwIiByeT0iMTAiIHdpZHRoPSI5MCIgaGVpZ2h0PSIxNDAiIHN0eWxlPSJmaWxsOndoaXRlO3N0cm9rZTp1cmwoI2dyYWQxKTtzdHJva2Utd2lkdGg6MTAiIC8+CiAgPHRleHQgeD0iNTAiIHk9Ijg1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIyMCIgZmlsbD0iYmxhY2siIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFJIENhcmQ8L3RleHQ+Cjwvc3ZnPg==',
  },
};

interface SettingsContextType {
  settings: AllSettings;
  updateSettings: (modeName: string, newSettings: Partial<ModeSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<AllSettings>('nano-banana-settings', defaultSettings);

  const updateSettings = (modeName: string, newSettings: Partial<ModeSettings>) => {
    setSettings(prev => ({
      ...prev,
      [modeName]: {
        ...(prev[modeName] || { prompt: '', referenceImage: null }),
        ...newSettings,
      },
    }));
  };

  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};